import { Phlebotomist, Order, SlotAvailability, BookingSlot, ALLOWED_BOOKING_SLOTS } from '../types';

export const OPERATING_SLOTS: { slot: BookingSlot; startTime: string; endTime: string }[] = [
  { slot: '06:00 - 07:00', startTime: '06:00', endTime: '07:00' },
  { slot: '07:00 - 08:00', startTime: '07:00', endTime: '08:00' },
  { slot: '08:00 - 09:00', startTime: '08:00', endTime: '09:00' },
  { slot: '09:00 - 10:00', startTime: '09:00', endTime: '10:00' },
  { slot: '10:00 - 11:00', startTime: '10:00', endTime: '11:00' }
];

// Each phlebotomist can fulfill up to 2 orders per 1-hour window (including 20-min travel & sterile draw buffer)
export const MAX_ORDERS_PER_PHLEBO_PER_HOUR = 2;

/**
 * Computes live slot capacity for a given zone on a specific date.
 * Available window is strictly 06:00 AM – 11:00 AM
 */
export function computeZoneSlotAvailability(
  zoneId: string,
  targetDate: string,
  phlebotomists: Phlebotomist[],
  orders: Order[]
): SlotAvailability[] {
  // 1. Get phlebotomists who are ON-DUTY and mapped to this zone (or nearby)
  const onDutyInZone = phlebotomists.filter(
    p => p.onDuty && (p.homeZoneId === zoneId || zoneId === '')
  );

  const activePhleboCount = onDutyInZone.length > 0 ? onDutyInZone.length : 1;

  return OPERATING_SLOTS.map(({ slot, startTime, endTime }) => {
    // 2. Count non-cancelled orders booked in this zone for this date & slot
    const bookedOrders = orders.filter(o => {
      const isSameDate = o.requestedDate === targetDate;
      const isSameZone = !zoneId || o.zoneId === zoneId;
      const isSameSlot = o.requestedSlot === slot;
      const isActive = o.status !== 'Cancelled';
      return isSameDate && isSameZone && isSameSlot && isActive;
    });

    const bookedCount = bookedOrders.length;
    // Total slot capacity in this hour = on-duty phlebos * 2
    const totalCapacity = activePhleboCount * MAX_ORDERS_PER_PHLEBO_PER_HOUR;
    const availableCount = Math.max(0, totalCapacity - bookedCount);

    let status: SlotAvailability['status'] = 'available';
    let reason: string | undefined;

    if (availableCount === 0) {
      status = 'full';
      reason = 'Fully booked — please select another time slot.';
    } else if (availableCount === 1) {
      status = 'fast_filling';
      reason = '1 slot left';
    }

    return {
      slot,
      startTime,
      endTime,
      totalCapacity,
      bookedCount,
      availableCount,
      onDutyPhlebosCount: activePhleboCount,
      status,
      reason
    };
  });
}

/**
 * Computes a matrix of Zone x Time Slots for the Admin Capacity Heatmap Dashboard.
 */
export function getZoneCapacityMatrix(
  zones: { id: string; name: string }[],
  targetDate: string,
  phlebotomists: Phlebotomist[],
  orders: Order[]
) {
  return zones.map(zone => {
    const onDutyPhlebos = phlebotomists.filter(p => p.onDuty && p.homeZoneId === zone.id);
    const slots = computeZoneSlotAvailability(zone.id, targetDate, phlebotomists, orders);
    const totalOrdersInZoneToday = orders.filter(
      o => o.zoneId === zone.id && o.requestedDate === targetDate && o.status !== 'Cancelled'
    ).length;

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      onDutyPhlebosCount: onDutyPhlebos.length,
      onDutyPhlebosNames: onDutyPhlebos.map(p => p.name),
      totalOrdersInZoneToday,
      slots
    };
  });
}
