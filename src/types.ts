export type UserRole = 'lab' | 'phlebotomist' | 'admin';

export type AllowedVialType = 'Urine' | 'Serum' | 'EDTA' | 'Fluoride' | 'Fluoride PP';

export const ALLOWED_VIAL_TYPES: { id: AllowedVialType; label: string; description: string; color: string; textColor: string }[] = [
  { id: 'Urine', label: 'Urine', description: 'Sterile specimen container', color: 'bg-amber-100 border-amber-300 text-amber-900', textColor: 'text-amber-800' },
  { id: 'Serum', label: 'Serum', description: 'Clot activator / SST Gold top', color: 'bg-yellow-100 border-yellow-300 text-yellow-900', textColor: 'text-yellow-800' },
  { id: 'EDTA', label: 'EDTA', description: 'K2/K3 EDTA Purple/Lavender top', color: 'bg-purple-100 border-purple-300 text-purple-900', textColor: 'text-purple-800' },
  { id: 'Fluoride', label: 'Fluoride', description: 'Sodium Fluoride Grey top (Fasting)', color: 'bg-slate-200 border-slate-400 text-slate-900', textColor: 'text-slate-800' },
  { id: 'Fluoride PP', label: 'Fluoride PP', description: 'Sodium Fluoride Grey top (Post-Prandial)', color: 'bg-stone-200 border-stone-400 text-stone-900', textColor: 'text-stone-800' },
];

export type BookingSlot =
  | '06:00 - 07:00'
  | '07:00 - 08:00'
  | '08:00 - 09:00'
  | '09:00 - 10:00'
  | '10:00 - 11:00';

export const ALLOWED_BOOKING_SLOTS: BookingSlot[] = [
  '06:00 - 07:00',
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00'
];

export type OrderStatus =
  | 'Pending'
  | 'Assigned'
  | 'Accepted'
  | 'En Route'
  | 'Sample Collected'
  | 'Handed to Lab'
  | 'Cancelled';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  labId?: string; // Set when role === 'lab'
  labName?: string;
  phlebotomistId?: string; // Set when role === 'phlebotomist'
  token: string;
}

export interface Lab {
  id: string;
  name: string;
  code: string; // e.g. "LAB-A", "LAB-B", "LAB-C"
  badge: string;
  address: string;
  locality: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  rating: number;
  totalOrders: number;
}

export interface Zone {
  id: string;
  name: string;
  pincodes: string[];
  description: string;
  centerCoordinates?: { lat: number; lng: number };
}

export interface Phlebotomist {
  id: string; // e.g. "PHL-1"
  name: string;
  phone: string;
  email: string;
  photo: string;
  certification: string; // e.g. "DMLT - Andhra Medical College"
  homeZoneId: string;
  onDuty: boolean;
  currentLoadToday: number;
  rating: number;
  ratingCount: number;
  travelRadiusKm: number;
  completedOrdersCount: number;
  earningsToday: number;
  totalEarnings: number;
  vehicleType: 'Bike' | 'Scooter';
  vehicleNumber: string;
}

export interface TimelineEvent {
  status: OrderStatus;
  timestamp: string;
  description: string;
  actor: string;
  locationNote?: string;
}

export interface WhatsAppLogEntry {
  id: string;
  orderId: string;
  timestamp: string;
  recipientPhone: string;
  recipientRole: 'lab' | 'phlebotomist' | 'patient';
  eventType: string;
  templateName: string;
  payload: Record<string, any>;
  status: 'sent' | 'delivered' | 'read';
  messageText: string;
}

export interface Order {
  id: string; // e.g. "SWP-A01"
  labId: string; // Associated Lab ID (Multi-tenant partition)
  labName: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  address: string;
  landmark?: string;
  locality: string;
  pincode: string;
  zoneId: string;
  zoneName: string;
  requestedDate: string; // YYYY-MM-DD
  requestedSlot: BookingSlot; // Strictly 06:00 to 11:00
  requiredVials: AllowedVialType[]; // Selected vial types (No diagnostic tests)
  assignedPhlebotomistId?: string;
  assignedPhlebotomistName?: string;
  assignedPhlebotomistPhone?: string;
  status: OrderStatus;
  notes?: string;
  specialInstructions?: string;
  scanned_barcodes?: string[]; // Array of strings representing scanned vial barcodes
  sample_photo_url?: string; // String/Text for the sample proof image path
  handover_photo_url?: string; // String/Text for the lab handover proof image path
  sampleVialsBarcodes?: string[];
  temperatureBoxRecorded?: string; // e.g. "3.8°C Cold Box"
  createdTimestamp: string;
  updatedTimestamp: string;
  timeline: TimelineEvent[];
  whatsappNotifications?: WhatsAppLogEntry[];
}

export interface SlotAvailability {
  slot: BookingSlot;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedCount: number;
  availableCount: number;
  onDutyPhlebosCount: number;
  status: 'available' | 'fast_filling' | 'full';
  reason?: string;
}

export interface PayoutRecord {
  id: string;
  phlebotomistId: string;
  phlebotomistName: string;
  orderId: string;
  date: string;
  basePay: number;
  morningIncentive: number;
  distanceBonus: number;
  totalPay: number;
  status: 'Pending' | 'Paid';
  paymentRef?: string;
}

export interface SecurityTestResult {
  id: string;
  testName: string;
  description: string;
  authenticatedAs: string;
  targetResource: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  details: string;
  responsePayloadPreview?: any;
}

export interface InboundWhatsAppWebhookPayload {
  from: string;
  message: string;
  message_id?: string;
  timestamp?: string;
}
