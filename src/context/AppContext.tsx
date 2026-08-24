import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  UserRole,
  Order,
  Lab,
  Phlebotomist,
  Zone,
  PayoutRecord,
  SlotAvailability,
  AllowedVialType,
  BookingSlot,
  SecurityTestResult,
  WhatsAppLogEntry,
  ALLOWED_BOOKING_SLOTS,
  ALLOWED_VIAL_TYPES
} from '../types';
import { DEMO_USERS, VIZAG_ZONES, INITIAL_LABS, INITIAL_PHLEBOTOMISTS, INITIAL_ORDERS, INITIAL_PAYOUTS } from '../data/mockData';
import { sendWhatsAppNotification, WhatsAppEventType } from '../utils/whatsappService';

interface AppContextType {
  // Authentication & Tenant Identity
  currentUser: AuthUser;
  currentRole: UserRole;
  isAuthenticated: boolean;
  demoUsers: AuthUser[];
  loginAsUser: (userIdOrEmail: string) => Promise<boolean>;
  loginWithPassword: (userIdOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  switchRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  logout: () => void;
  
  // Tracking
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (orderId: string | null) => void;

  // Data
  orders: Order[];
  labs: Lab[];
  zones: Zone[];
  phlebotomists: Phlebotomist[];
  payouts: PayoutRecord[];
  whatsappLogs: WhatsAppLogEntry[];
  
  // Lab / Zone / Phlebotomist Admin Handlers
  addLab: (labData: Partial<Lab>) => void;
  updateLab: (id: string, labData: Partial<Lab>) => void;
  addZone: (zoneData: Partial<Zone>) => void;
  updateZone: (id: string, zoneData: Partial<Zone>) => void;
  addPhlebotomist: (phleboData: Partial<Phlebotomist>) => void;
  updatePhlebotomist: (id: string, phleboData: Partial<Phlebotomist>) => void;

  // Dynamic 06:00 - 11:00 Slot Capacity
  getSlotAvailability: (zoneId: string, date?: string) => Promise<SlotAvailability[]>;
  
  // Order Actions (Server-authenticated)
  createOrder: (orderData: Partial<Order>) => Promise<{ success: boolean; order?: Order; error?: string }>;
  getOrderById: (orderId: string) => Promise<{ success: boolean; order?: Order; error?: string; statusCode?: number }>;
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    details?: {
      scanned_barcodes?: string[];
      sample_photo_url?: string;
      handover_photo_url?: string;
      sampleVialsBarcodes?: string[];
      temperatureBoxRecorded?: string;
      notes?: string;
      locationNote?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  assignPhlebotomist: (orderId: string, phlebotomistId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Phlebotomist Duty & Actions
  togglePhlebotomistDuty: (phleboId: string, onDuty: boolean) => Promise<void>;
  
  // Payout Actions
  markPayoutPaid: (payoutId: string, paymentRef?: string) => Promise<void>;
  
  // Security Verification Suite
  runSecurityTestSuite: () => Promise<{ allPassed: boolean; testsCount: number; testsPassed: number; results: SecurityTestResult[] }>;
  testTamperAccess: (actorToken: string, targetOrderId: string) => Promise<{ statusCode: number; payload: any }>;
  
  // Refresh data
  refreshData: () => Promise<void>;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine if already authenticated in this browser session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('swiftphlebo_authenticated_id') || sessionStorage.getItem('swiftphlebo_authenticated_id');
      if (saved) return true;
    } catch {
      // Ignore
    }
    return false;
  });

  // Default to Lab A on first load, or detect from ?portal= / ?user= / ?role= query parameters or stored session
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const savedId = localStorage.getItem('swiftphlebo_authenticated_id') || sessionStorage.getItem('swiftphlebo_authenticated_id');
      if (savedId) {
        const savedUser = DEMO_USERS.find(u => u.id === savedId);
        if (savedUser) return savedUser;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const portalParam = urlParams.get('portal') || urlParams.get('user') || urlParams.get('role');
      if (portalParam) {
        const found = DEMO_USERS.find(
          u =>
            u.id === portalParam ||
            u.role === portalParam ||
            u.labId?.toLowerCase() === portalParam.toLowerCase() ||
            u.phlebotomistId?.toLowerCase() === portalParam.toLowerCase() ||
            u.email.toLowerCase() === portalParam.toLowerCase()
        );
        if (found) return found;
      }
    } catch {
      // Ignore
    }
    return DEMO_USERS[0];
  });

  const [demoUsers] = useState<AuthUser[]>(DEMO_USERS);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const trackParam = urlParams.get('track') || urlParams.get('order');
      if (trackParam) return trackParam;
    } catch {
      // Ignore
    }
    return null;
  });

  // Master local store for orders to support static / GitHub Pages deployment
  const [allOrdersStore, setAllOrdersStore] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem('swiftphlebo_orders');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore localStorage errors
    }
    return JSON.parse(JSON.stringify(INITIAL_ORDERS));
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const initialLab = DEMO_USERS[0].labId;
    return INITIAL_ORDERS.filter(o => o.labId === initialLab);
  });
  const [labs, setLabs] = useState<Lab[]>(INITIAL_LABS);
  const [zones, setZones] = useState<Zone[]>(VIZAG_ZONES);
  const [phlebotomists, setPhlebotomists] = useState<Phlebotomist[]>(INITIAL_PHLEBOTOMISTS);
  const [payouts, setPayouts] = useState<PayoutRecord[]>(INITIAL_PAYOUTS);
  
  // Collect all initial whatsapp notifications
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLogEntry[]>(() => {
    const logs: WhatsAppLogEntry[] = [];
    INITIAL_ORDERS.forEach(order => {
      if (order.whatsappNotifications) {
        logs.push(...order.whatsappNotifications);
      }
    });
    return logs;
  });

  const currentRole: UserRole = currentUser.role;

  // Sync allOrdersStore with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('swiftphlebo_orders', JSON.stringify(allOrdersStore));
    } catch {
      // Ignore
    }
  }, [allOrdersStore]);

  // Filter local store by role if backend is not available
  const getScopedLocalOrders = useCallback((user: AuthUser, store: Order[]) => {
    if (user.role === 'admin') {
      return store;
    } else if (user.role === 'lab' && user.labId) {
      return store.filter(o => o.labId === user.labId);
    } else if (user.role === 'phlebotomist' && user.phlebotomistId) {
      return store.filter(o => o.assignedPhlebotomistId === user.phlebotomistId || o.status === 'Pending');
    }
    return store;
  }, []);

  // Switch role handler: switches to the first demo user with that role
  const switchRole = (role: UserRole) => {
    const targetUser = demoUsers.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Switch user handler: switches to a specific demo user by ID
  const switchUser = (userId: string) => {
    const targetUser = demoUsers.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Fetch scoped data from backend API using current user's token (with fallback for GitHub Pages / static hosting)
  const fetchScopedData = useCallback(async (user: AuthUser) => {
    try {
      // 1. Fetch Orders (strictly scoped server-side to user.role and user.labId / user.phlebotomistId)
      const ordersRes = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'x-user-id': user.id
        }
      });
      if (ordersRes.ok) {
        const contentType = ordersRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await ordersRes.json();
          if (data && Array.isArray(data.orders)) {
            setOrders(data.orders);
            return;
          }
        }
      }
    } catch (err) {
      // Backend not reachable, fall back to local store
    }

    // Client-side fallback for static deployment (GitHub Pages)
    setOrders(getScopedLocalOrders(user, allOrdersStore));
  }, [allOrdersStore, getScopedLocalOrders]);

  // Fetch when currentUser or allOrdersStore changes
  useEffect(() => {
    fetchScopedData(currentUser);
  }, [currentUser, fetchScopedData]);

  // Login with Password / PIN Verification
  const loginWithPassword = async (userIdOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdOrEmail, email: userIdOrEmail, password })
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            try {
              localStorage.setItem('swiftphlebo_authenticated_id', data.user.id);
            } catch {
              // ignore
            }
            return { success: true };
          }
        }
      }
    } catch {
      // ignore backend error for client-side fallback
    }

    // Client-side credentials check (for static / GitHub Pages deployment)
    const normalizedInput = userIdOrEmail.trim().toLowerCase();
    const found = DEMO_USERS.find(
      u =>
        u.id.toLowerCase() === normalizedInput ||
        u.email.toLowerCase() === normalizedInput ||
        u.labId?.toLowerCase() === normalizedInput ||
        u.phlebotomistId?.toLowerCase() === normalizedInput ||
        (normalizedInput === 'admin' && u.role === 'admin')
    );

    if (!found) {
      return { success: false, error: 'Account or Tenant ID not recognized. Please check your credentials.' };
    }

    const validPasswords = ['password123', '1234', 'admin123', '1122', found.password];
    if (!validPasswords.includes(password.trim())) {
      return { success: false, error: 'Invalid Password / PIN. Use "password123" or "1234".' };
    }

    setCurrentUser(found);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('swiftphlebo_authenticated_id', found.id);
    } catch {
      // ignore
    }
    return { success: true };
  };

  // Login as User
  const loginAsUser = async (userIdOrEmail: string): Promise<boolean> => {
    const res = await loginWithPassword(userIdOrEmail, 'password123');
    return res.success;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('swiftphlebo_authenticated_id');
      sessionStorage.removeItem('swiftphlebo_authenticated_id');
    } catch {
      // ignore
    }
    // Clean URL params if any
    try {
      if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore
    }
  };

  // Get Dynamic 06:00 - 11:00 Slot Availability from Server
  const getSlotAvailability = async (zoneId: string, date?: string): Promise<SlotAvailability[]> => {
    try {
      const targetDate = date || new Date().toISOString().slice(0, 10);
      const res = await fetch(`/api/slots/availability?zoneId=${encodeURIComponent(zoneId)}&date=${encodeURIComponent(targetDate)}`);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.slots)) return data.slots;
        }
      }
    } catch (err) {
      // Fallback calculation in client
    }

    // Fallback calculation in client
    const zone = zones.find(z => z.id === zoneId) || zones[0];
    const onDutyPhlebos = phlebotomists.filter(p => p.onDuty);
    const activeCount = Math.max(1, onDutyPhlebos.length);

    return ALLOWED_BOOKING_SLOTS.map(slot => {
      const [start, end] = slot.split(' - ');
      const totalCapacity = activeCount * 2;
      const bookedCount = (allOrdersStore || orders).filter(
        o => o.zoneId === zone.id && o.requestedSlot === slot && o.status !== 'Cancelled'
      ).length;
      const availableCount = Math.max(0, totalCapacity - bookedCount);
      const status = availableCount === 0 ? 'full' : availableCount === 1 ? 'fast_filling' : 'available';

      return {
        slot,
        startTime: start,
        endTime: end,
        totalCapacity,
        bookedCount,
        availableCount,
        onDutyPhlebosCount: activeCount,
        status,
        reason: status === 'full' ? 'Fully booked — please select another time slot.' : undefined
      };
    });
  };

  // Create Order (POST /api/orders with client fallback)
  const createOrder = async (orderData: Partial<Order>): Promise<{ success: boolean; order?: Order; error?: string }> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          ...orderData,
          labId: currentUser.role === 'lab' ? currentUser.labId : orderData.labId
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          await fetchScopedData(currentUser);
          return { success: true, order: data.order };
        }
      }
    } catch (err: any) {
      // Backend not reachable, continue to client-side creation
    }

    // Client-side fallback creation for static deployment (GitHub Pages)
    const newOrderId = `SWP-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      id: newOrderId,
      labId: currentUser.role === 'lab' && currentUser.labId ? currentUser.labId : (orderData.labId || 'LAB-001'),
      labName: labs.find(l => l.id === (orderData.labId || currentUser.labId))?.name || 'Sunrise Diagnostics',
      patientName: orderData.patientName || 'Patient',
      patientAge: orderData.patientAge || 30,
      patientGender: orderData.patientGender || 'Other',
      patientPhone: orderData.patientPhone || '+91 98480 12345',
      address: orderData.address || 'Visakhapatnam',
      locality: orderData.locality || 'MVP Colony',
      pincode: orderData.pincode || '530017',
      zoneId: orderData.zoneId || 'zone-mvp',
      zoneName: zones.find(z => z.id === orderData.zoneId)?.name || 'MVP Colony Zone',
      requiredVials: orderData.requiredVials && orderData.requiredVials.length > 0 ? orderData.requiredVials : ['EDTA', 'Serum'],
      requestedDate: orderData.requestedDate || new Date().toISOString().slice(0, 10),
      requestedSlot: orderData.requestedSlot || '07:00 - 08:00',
      status: 'Pending',
      specialInstructions: orderData.specialInstructions || '',
      timeline: [
        {
          status: 'Pending',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: 'Order placed by diagnostic lab',
          actor: currentUser.name || 'Lab User'
        }
      ],
      createdTimestamp: nowIso,
      updatedTimestamp: nowIso
    };

    setAllOrdersStore(prev => [newOrder, ...prev]);
    return { success: true, order: newOrder };
  };

  // Get Single Order (GET /api/orders/:id)
  const getOrderById = async (orderId: string): Promise<{ success: boolean; order?: Order; error?: string; statusCode?: number }> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        }
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.order) {
          return { success: true, order: data.order, statusCode: res.status };
        }
      }
    } catch (err: any) {
      // Backend not reachable, fall back to local store
    }

    const found = allOrdersStore.find(o => o.id === orderId);
    if (!found) {
      return { success: false, error: 'Order not found', statusCode: 404 };
    }

    // Role-based check
    if (currentUser.role === 'lab' && found.labId !== currentUser.labId) {
      return { success: false, error: 'Access denied: You can only view orders for your lab.', statusCode: 403 };
    }
    if (currentUser.role === 'phlebotomist' && found.assignedPhlebotomistId !== currentUser.phlebotomistId && found.status !== 'Pending') {
      return { success: false, error: 'Access denied: You are not assigned to this sample collection.', statusCode: 403 };
    }

    return { success: true, order: found, statusCode: 200 };
  };

  // Update Order Status (PATCH /api/orders/:id/status)
  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    details?: {
      scanned_barcodes?: string[];
      sample_photo_url?: string;
      handover_photo_url?: string;
      sampleVialsBarcodes?: string[];
      temperatureBoxRecorded?: string;
      notes?: string;
      locationNote?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          status,
          ...details
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          await fetchScopedData(currentUser);
          return { success: true };
        }
      }
    } catch (err: any) {
      // Fallback
    }

    // Local fallback update
    setAllOrdersStore(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const newTimelineItem = {
        status,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: details?.notes || `Status updated to ${status}`,
        actor: currentUser.name || currentUser.role,
        locationNote: details?.locationNote
      };

      return {
        ...order,
        status,
        scanned_barcodes: details?.scanned_barcodes || order.scanned_barcodes,
        sample_photo_url: details?.sample_photo_url || order.sample_photo_url,
        handover_photo_url: details?.handover_photo_url || order.handover_photo_url,
        sampleVialsBarcodes: details?.sampleVialsBarcodes || order.sampleVialsBarcodes,
        temperatureBoxRecorded: details?.temperatureBoxRecorded || order.temperatureBoxRecorded,
        timeline: [...(order.timeline || []), newTimelineItem],
        updatedTimestamp: new Date().toISOString()
      };
    }));

    return { success: true };
  };

  // Assign Phlebotomist (Admin action)
  const assignPhlebotomist = async (orderId: string, phlebotomistId: string): Promise<{ success: boolean; error?: string }> => {
    const phlebo = phlebotomists.find(p => p.id === phlebotomistId);
    return updateOrderStatus(orderId, 'Assigned', {
      notes: `Phlebotomist assigned: ${phlebo?.name || phlebotomistId}`
    });
  };

  // Toggle Phlebotomist Duty (PATCH /api/phlebotomists/:id/duty)
  const togglePhlebotomistDuty = async (phleboId: string, onDuty: boolean) => {
    try {
      await fetch(`/api/phlebotomists/${encodeURIComponent(phleboId)}/duty`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ onDuty })
      });
      await fetchScopedData(currentUser);
    } catch (err) {
      console.error('Duty toggle error:', err);
    }
  };

  // Mark Payout Paid (PATCH /api/payouts/:id/pay)
  const markPayoutPaid = async (payoutId: string, paymentRef?: string) => {
    try {
      await fetch(`/api/payouts/${encodeURIComponent(payoutId)}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({ paymentRef })
      });
      await fetchScopedData(currentUser);
    } catch (err) {
      console.error('Payout error:', err);
    }
    setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: 'Paid', paymentRef: paymentRef || 'UPI-REF' } : p));
  };

  // Run Backend Security Verification Suite (GET /api/security/test-suite)
  const runSecurityTestSuite = async () => {
    try {
      const res = await fetch('/api/security/test-suite');
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Security test suite error:', err);
    }

    return {
      allPassed: false,
      testsCount: 0,
      testsPassed: 0,
      results: []
    };
  };

  // Test Tamper Access with Custom Token & Target Order ID
  const testTamperAccess = async (actorToken: string, targetOrderId: string): Promise<{ statusCode: number; payload: any }> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(targetOrderId)}`, {
        headers: {
          'Authorization': `Bearer ${actorToken}`
        }
      });
      const payload = await res.json();
      return { statusCode: res.status, payload };
    } catch (err: any) {
      return { statusCode: 500, payload: { error: err.message } };
    }
  };

  // Lab CRUD Handlers
  const addLab = (labData: Partial<Lab>) => {
    const newLab: Lab = {
      id: `LAB-${Date.now()}`,
      name: labData.name || 'New Diagnostic Lab',
      code: labData.code || `LAB-${Math.floor(Math.random() * 900 + 100)}`,
      badge: labData.badge || 'NABL Accredited',
      address: labData.address || 'Visakhapatnam',
      locality: labData.locality || 'Central Vizag',
      phone: labData.phone || '+91 891 000000',
      email: labData.email || 'contact@lab.in',
      status: 'active',
      rating: 4.8,
      totalOrders: 0,
      ...labData
    };
    setLabs(prev => [newLab, ...prev]);
  };

  const updateLab = (id: string, labData: Partial<Lab>) => {
    setLabs(prev => prev.map(l => l.id === id ? { ...l, ...labData } : l));
  };

  // Zone CRUD Handlers
  const addZone = (zoneData: Partial<Zone>) => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: zoneData.name || 'New Zone',
      pincodes: zoneData.pincodes || ['530001'],
      description: zoneData.description || 'Coverage area in Visakhapatnam',
      ...zoneData
    };
    setZones(prev => [...prev, newZone]);
  };

  const updateZone = (id: string, zoneData: Partial<Zone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...zoneData } : z));
  };

  // Phlebotomist CRUD Handlers
  const addPhlebotomist = (phleboData: Partial<Phlebotomist>) => {
    const newPhlebo: Phlebotomist = {
      id: `PHL-${Date.now()}`,
      name: phleboData.name || 'New Technician',
      phone: phleboData.phone || '+91 98480 00000',
      email: phleboData.email || 'tech@swiftphlebo.in',
      photo: phleboData.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80',
      certification: phleboData.certification || 'DMLT Certified',
      homeZoneId: phleboData.homeZoneId || zones[0]?.id || 'zone-mvp',
      onDuty: phleboData.onDuty !== undefined ? phleboData.onDuty : true,
      currentLoadToday: 0,
      rating: 4.9,
      ratingCount: 1,
      travelRadiusKm: phleboData.travelRadiusKm || 8,
      completedOrdersCount: 0,
      earningsToday: 0,
      totalEarnings: 0,
      vehicleType: phleboData.vehicleType || 'Bike',
      vehicleNumber: phleboData.vehicleNumber || 'AP 31 AB 1234',
      ...phleboData
    };
    setPhlebotomists(prev => [...prev, newPhlebo]);
  };

  const updatePhlebotomist = (id: string, phleboData: Partial<Phlebotomist>) => {
    setPhlebotomists(prev => prev.map(p => p.id === id ? { ...p, ...phleboData } : p));
  };

  const refreshData = async () => {
    await fetchScopedData(currentUser);
  };

  const resetToDefaultData = () => {
    setOrders(JSON.parse(JSON.stringify(INITIAL_ORDERS)));
    setPhlebotomists(INITIAL_PHLEBOTOMISTS);
    setPayouts(INITIAL_PAYOUTS);
    setLabs(INITIAL_LABS);
    setZones(VIZAG_ZONES);
    fetchScopedData(currentUser);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        demoUsers,
        loginAsUser,
        loginWithPassword,
        switchRole,
        switchUser,
        logout,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        orders,
        labs,
        zones,
        phlebotomists,
        payouts,
        whatsappLogs,
        addLab,
        updateLab,
        addZone,
        updateZone,
        addPhlebotomist,
        updatePhlebotomist,
        getSlotAvailability,
        createOrder,
        getOrderById,
        updateOrderStatus,
        assignPhlebotomist,
        togglePhlebotomistDuty,
        markPayoutPaid,
        runSecurityTestSuite,
        testTamperAccess,
        refreshData,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
