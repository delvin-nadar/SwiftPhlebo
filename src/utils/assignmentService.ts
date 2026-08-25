import { Phlebotomist, Order, BookingSlot } from '../types';

export interface AutoAssignmentResult {
  phlebotomist: Phlebotomist | null;
  status: 'Assigned' | 'Pending';
  reason?: string;
  evaluatedCandidatesCount: number;
}

/**
 * Backend & Client Auto-Assignment Algorithm for Specimen Collection Orders
 * 
 * Rules:
 * 1. Query the Phlebotomist database for users who are 'on-duty' AND assigned to the exact 'zone' requested in the order.
 * 2. Check the existing order load for those phlebotomists during the requested 1-hour time slot.
 * 3. Assign the order to an available phlebotomist (preferably the one with the lowest current load for the day).
 * 4. Save that phlebotomist's ID to the order's assignedPhlebotomistId field and set order status from PENDING to ASSIGNED.
 * 5. If no match is found, return status: 'Pending' with no assigned phlebotomist.
 */
export function autoAssignPhlebotomist(
  zoneId: string,
  requestedDate: string,
  requestedSlot: BookingSlot,
  phlebotomists: Phlebotomist[],
  existingOrders: Order[]
): AutoAssignmentResult {
  // Step 1: Query phlebotomists who are 'on-duty' AND assigned to the exact 'zone' requested in the order
  const zoneOnDutyPhlebotomists = phlebotomists.filter(
    p => p.onDuty && p.homeZoneId === zoneId
  );

  if (zoneOnDutyPhlebotomists.length === 0) {
    return {
      phlebotomist: null,
      status: 'Pending',
      reason: 'No on-duty phlebotomists found assigned to this exact zone.',
      evaluatedCandidatesCount: 0
    };
  }

  // Step 2: Check the existing order load for those phlebotomists during the requested 1-hour time slot
  // A phlebotomist can handle at most 1 active home collection per 1-hour window to maintain strict cold-chain SLAs.
  const scoredCandidates = zoneOnDutyPhlebotomists.map(phlebo => {
    // Check orders already assigned to this phlebotomist in the exact same 1-hour slot on requestedDate
    const slotOrders = existingOrders.filter(
      o =>
        o.assignedPhlebotomistId === phlebo.id &&
        o.requestedDate === requestedDate &&
        o.requestedSlot === requestedSlot &&
        o.status !== 'Cancelled'
    );

    // Check all active orders assigned to this phlebotomist on this date
    const dayOrders = existingOrders.filter(
      o =>
        o.assignedPhlebotomistId === phlebo.id &&
        o.requestedDate === requestedDate &&
        o.status !== 'Cancelled'
    );

    const slotLoad = slotOrders.length;
    // Total load for the day: max of counted orders for today or technician's stored daily counter
    const dayLoad = Math.max(dayOrders.length, phlebo.currentLoadToday || 0);

    return {
      phlebotomist: phlebo,
      slotLoad,
      dayLoad,
      // Available if no existing order is booked in this exact 1-hour time slot
      isAvailableInSlot: slotLoad === 0
    };
  });

  // Filter down to only those available during this 1-hour slot
  const availableCandidates = scoredCandidates.filter(c => c.isAvailableInSlot);

  if (availableCandidates.length === 0) {
    return {
      phlebotomist: null,
      status: 'Pending',
      reason: 'All on-duty phlebotomists in this zone are currently booked for the requested 1-hour slot.',
      evaluatedCandidatesCount: zoneOnDutyPhlebotomists.length
    };
  }

  // Step 3: Assign the order to an available phlebotomist (preferably the one with the lowest current load for the day)
  availableCandidates.sort((a, b) => {
    // Priority 1: Lowest current load for the day
    if (a.dayLoad !== b.dayLoad) {
      return a.dayLoad - b.dayLoad;
    }
    // Priority 2: Highest customer satisfaction rating
    return (b.phlebotomist.rating || 0) - (a.phlebotomist.rating || 0);
  });

  const chosenPhlebotomist = availableCandidates[0].phlebotomist;

  return {
    phlebotomist: chosenPhlebotomist,
    status: 'Assigned',
    evaluatedCandidatesCount: zoneOnDutyPhlebotomists.length
  };
}
