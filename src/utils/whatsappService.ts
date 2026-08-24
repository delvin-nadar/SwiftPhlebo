import { Order, WhatsAppLogEntry, OrderStatus } from '../types';

export type WhatsAppEventType =
  | 'ORDER_PLACED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'SAMPLE_COLLECTED'
  | 'HANDED_TO_LAB'
  | 'CANCELLED';

export interface AuthkeyPayload {
  authkey_template_id: string;
  recipient_phone: string;
  variables: Record<string, string | number>;
  meta: {
    order_id: string;
    city: string;
    channel: string;
    environment: string;
  };
}

/**
 * Sends a structured WhatsApp message notification via Authkey.io template stub.
 * Logs full JSON payload and returns formatted WhatsAppLogEntry.
 */
export function sendWhatsAppNotification(
  order: Order,
  eventType: WhatsAppEventType,
  customData?: Record<string, any>
): WhatsAppLogEntry {
  const timestamp = new Date().toISOString();
  let recipientPhone = order.patientPhone;
  let recipientRole: 'patient' | 'phlebotomist' | 'lab' = 'patient';
  let templateName = '';
  let payloadVariables: Record<string, string | number> = {};
  let messageText = '';

  switch (eventType) {
    case 'ORDER_PLACED':
      templateName = 'swiftphlebo_patient_order_confirmed_v2';
      recipientRole = 'patient';
      payloadVariables = {
        patient_name: order.patientName,
        order_id: order.id,
        slot_time: `${order.requestedSlot}, ${order.requestedDate}`,
        lab_partner: order.labName,
        locality: order.locality,
        vials_count: order.requiredVials.length
      };
      messageText = `✅ *Specimen Collection Booked (Order #${order.id})*\nHello ${order.patientName}, your home blood collection for *${order.labName}* is confirmed for *${order.requestedSlot} (${order.requestedDate})* at ${order.address}.\n\nSterilized, vacuum-sealed tubes will be used by our certified technician. Track: https://swiftphlebo.vizag/track/${order.id}`;
      break;

    case 'ASSIGNED':
      templateName = 'swiftphlebo_phlebo_duty_assigned_v2';
      recipientPhone = order.assignedPhlebotomistPhone || '+91 98480 23145';
      recipientRole = 'phlebotomist';
      payloadVariables = {
        phlebo_name: order.assignedPhlebotomistName || 'Technician',
        order_id: order.id,
        patient_name: order.patientName,
        patient_phone: order.patientPhone,
        address: `${order.address}, ${order.locality}`,
        slot: order.requestedSlot,
        lab_name: order.labName,
        vials_needed: order.requiredVials.join(', ')
      };
      messageText = `🚨 *New Collection Request (#${order.id})*\nHi ${order.assignedPhlebotomistName}, new order assigned in *${order.zoneName}*.\nPatient: ${order.patientName} (${order.patientPhone})\nSlot: ${order.requestedSlot}\nAddress: ${order.address}\nLab: ${order.labName}\nVials: ${order.requiredVials.join(', ')}\n\n👉 *Reply 'ACCEPT' to confirm or 'DECLINE' if unable.*`;
      break;

    case 'ACCEPTED':
      templateName = 'swiftphlebo_patient_phlebo_matched_v2';
      recipientRole = 'patient';
      payloadVariables = {
        patient_name: order.patientName,
        phlebo_name: order.assignedPhlebotomistName || 'Technician',
        phlebo_phone: order.assignedPhlebotomistPhone || '',
        slot: order.requestedSlot
      };
      messageText = `👨‍⚕️ *Technician Assigned: ${order.assignedPhlebotomistName}*\nYour phlebotomist ${order.assignedPhlebotomistName} (DMLT Certified) has accepted your visit for *${order.requestedSlot}*.\nContact: ${order.assignedPhlebotomistPhone}. You will receive live GPS notice when they start traveling.`;
      break;

    case 'EN_ROUTE':
      templateName = 'swiftphlebo_patient_phlebo_enroute_v2';
      recipientRole = 'patient';
      payloadVariables = {
        patient_name: order.patientName,
        phlebo_name: order.assignedPhlebotomistName || 'Technician',
        phlebo_phone: order.assignedPhlebotomistPhone || '',
        eta_minutes: '15 mins'
      };
      messageText = `🛵 *Phlebotomist is En Route!*\n${order.assignedPhlebotomistName} is heading towards your location in ${order.locality}. Estimated Arrival: ~15 mins.\nPlease keep a clean table ready with adequate light. Direct phone: ${order.assignedPhlebotomistPhone}.`;
      break;

    case 'SAMPLE_COLLECTED':
      templateName = 'swiftphlebo_sample_collected_v2';
      recipientRole = 'patient';
      payloadVariables = {
        patient_name: order.patientName,
        order_id: order.id,
        lab_name: order.labName,
        vials_count: order.requiredVials.length,
        cold_box_temp: order.temperatureBoxRecorded || '3.8°C'
      };
      messageText = `🧪 *Sample Collected Successfully*\nYour blood samples have been safely drawn and sealed in barcoded vacuum vials (${order.requiredVials.join(', ')}). Stored in certified 4°C cold transport and dispatched to *${order.labName}*. You will get another notice when handed to the lab!`;
      break;

    case 'HANDED_TO_LAB':
      templateName = 'swiftphlebo_sample_handed_to_lab_v2';
      recipientRole = 'patient';
      payloadVariables = {
        patient_name: order.patientName,
        order_id: order.id,
        lab_name: order.labName
      };
      messageText = `🏥 *Sample Received by Laboratory*\nYour specimen has been safely handed over to the receiving desk at *${order.labName}* with temperature and barcode log chain-of-custody verified.`;
      break;

    case 'CANCELLED':
      templateName = 'swiftphlebo_order_cancelled_v2';
      recipientRole = 'patient';
      payloadVariables = {
        patient_name: order.patientName,
        order_id: order.id,
        reason: customData?.reason || 'Booking cancelled by user request'
      };
      messageText = `❌ *Booking Cancelled (Order #${order.id})*\nHello ${order.patientName}, your collection visit has been cancelled. Reason: ${customData?.reason || 'Cancelled'}.`;
      break;
  }

  const payload: AuthkeyPayload = {
    authkey_template_id: templateName,
    recipient_phone: recipientPhone,
    variables: payloadVariables,
    meta: {
      order_id: order.id,
      city: 'Visakhapatnam',
      channel: 'whatsapp_business_api',
      environment: 'production'
    }
  };

  return {
    id: `wa-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    orderId: order.id,
    timestamp,
    recipientPhone,
    recipientRole,
    templateName,
    eventType,
    messageText,
    payload,
    status: 'delivered'
  };
}

export function receiveWhatsAppWebhook(payload: {
  from: string;
  message: string;
  message_id: string;
  timestamp: string;
}) {
  return {
    status: 'success',
    event: 'inbound_whatsapp_received',
    processed_at: new Date().toISOString(),
    parsed_command: payload.message.trim().toUpperCase(),
    response_sent: `Echoing: ${payload.message}`
  };
}
