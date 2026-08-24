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
  demoUsers: AuthUser[];
  loginAsUser: (userIdOrEmail: string) => Promise<boolean>;
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
  markPayoutPaid: (payoutId: string) => Promise<void>;
  
  // Security Verification Suite
  runSecurityTestSuite: () => Promise<{ allPassed: boolean; testsCount: number; testsPassed: number; results: SecurityTestResult[] }>;
  testTamperAccess: (actorToken: string, targetOrderId: string) => Promise<{ statusCode: number; payload: any }>;
  
  // Refresh data
  refreshData: () => Promise<void>;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Lab A on first load for easy inspection
  const [currentUser, setCurrentUser] = useState<AuthUser>(DEMO_USERS[0]);
  const [demoUsers] = useState<AuthUser[]>(DEMO_USERS);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
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

  // Fetch scoped data from backend API using current user's token
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
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      } else {
        console.warn('Failed to fetch orders:', ordersRes.status);
      }

      // 2. Fetch Phlebotomists
      const phlebosRes = await fetch('/api/phlebotomists', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'x-user-id': user.id
        }
      });
      if (phlebosRes.ok) {
        const pData = await phlebosRes.json();
        if (pData.phlebotomists) {
          setPhlebotomists(pData.phlebotomists);
        }
      }

      // 3. Fetch Payouts (if authorized)
      if (user.role === 'admin' || user.role === 'phlebotomist') {
        const payoutsRes = await fetch('/api/payouts', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'x-user-id': user.id
          }
        });
        if (payoutsRes.ok) {
          const payData = await payoutsRes.json();
          setPayouts(payData.payouts || []);
        }
      } else {
        setPayouts([]);
      }

      // 4. Fetch Labs
      const labsRes = await fetch('/api/labs');
      if (labsRes.ok) {
        const lData = await labsRes.json();
        setLabs(lData.labs || INITIAL_LABS);
      }

      // 5. Fetch Zones
      const zonesRes = await fetch('/api/zones');
      if (zonesRes.ok) {
        const zData = await zonesRes.json();
        setZones(zData.zones || VIZAG_ZONES);
      }
    } catch (err) {
      console.error('Error fetching backend data:', err);
    }
  }, []);

  // Fetch when currentUser changes
  useEffect(() => {
    fetchScopedData(currentUser);
  }, [currentUser, fetchScopedData]);

  // Login as User
  const loginAsUser = async (userIdOrEmail: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdOrEmail, email: userIdOrEmail, password: 'password123' })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }

    // Fallback matching
    const found = DEMO_USERS.find(
      u => u.id === userIdOrEmail || u.email.toLowerCase() === userIdOrEmail.toLowerCase() || u.labId === userIdOrEmail || u.phlebotomistId === userIdOrEmail
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Default to Lab A on logout
    setCurrentUser(DEMO_USERS[0]);
  };

  // Get Dynamic 06:00 - 11:00 Slot Availability from Server
  const getSlotAvailability = async (zoneId: string, date?: string): Promise<SlotAvailability[]> => {
    try {
      const targetDate = date || new Date().toISOString().slice(0, 10);
      const res = await fetch(`/api/slots/availability?zoneId=${encodeURIComponent(zoneId)}&date=${encodeURIComponent(targetDate)}`);
      if (res.ok) {
        const data = await res.json();
        return data.slots || [];
      }
    } catch (err) {
      console.error('Slot calculation error:', err);
    }

    // Fallback calculation in client
    const zone = zones.find(z => z.id === zoneId) || zones[0];
    const onDutyPhlebos = phlebotomists.filter(p => p.onDuty);
    const activeCount = Math.max(1, onDutyPhlebos.length);

    return ALLOWED_BOOKING_SLOTS.map(slot => {
      const [start, end] = slot.split(' - ');
      const totalCapacity = activeCount * 2;
      const bookedCount = orders.filter(
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

  // Create Order (POST /api/orders)
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

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchScopedData(currentUser);
        return { success: true, order: data.order };
      } else {
        return { success: false, error: data.error || 'Failed to create order' };
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Get Single Order (GET /api/orders/:id - strictly tests multi-tenant authorization)
  const getOrderById = async (orderId: string): Promise<{ success: boolean; order?: Order; error?: string; statusCode?: number }> => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        }
      });

      const data = await res.json();
      if (res.ok && data.order) {
        return { success: true, order: data.order, statusCode: res.status };
      } else {
        return { success: false, error: data.error || 'Access denied or not found', statusCode: res.status };
      }
    } catch (err: any) {
      return { success: false, error: err.message, statusCode: 500 };
    }
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

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchScopedData(currentUser);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update order status' };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
  const markPayoutPaid = async (payoutId: string) => {
    try {
      await fetch(`/api/payouts/${encodeURIComponent(payoutId)}/pay`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'x-user-id': currentUser.id
        }
      });
      await fetchScopedData(currentUser);
    } catch (err) {
      console.error('Payout error:', err);
    }
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
        demoUsers,
        loginAsUser,
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
