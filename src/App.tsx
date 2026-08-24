import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LabPortal } from './components/lab/LabPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PhlebotomistPortal } from './components/phlebotomist/PhlebotomistPortal';
import { SecurityVerifierModal } from './components/security/SecurityVerifierModal';
import { TrackOrderModal } from './components/patient/TrackOrderModal';
import { LoginScreen } from './components/auth/LoginScreen';
import { LandingPage } from './components/landing/LandingPage';

const MainContent: React.FC = () => {
  const { currentRole, isAuthenticated, setActiveTrackingOrderId } = useApp();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  
  // Navigation view state when unauthenticated
  const [viewMode, setViewMode] = useState<'landing' | 'login'>('landing');
  const [loginCategory, setLoginCategory] = useState<'lab' | 'phlebotomist' | 'admin'>('lab');

  // Auto-detect direct portal parameter in URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const portalParam = urlParams.get('portal') || urlParams.get('user') || urlParams.get('role') || urlParams.get('login');
      if (portalParam) {
        if (portalParam.toLowerCase().includes('phlebo') || portalParam.toLowerCase().startsWith('phl')) {
          setLoginCategory('phlebotomist');
        } else if (portalParam.toLowerCase().includes('admin') || portalParam.toLowerCase().includes('ops')) {
          setLoginCategory('admin');
        } else {
          setLoginCategory('lab');
        }
        setViewMode('login');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSelectTrackedOrder = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
  };

  const handleOpenClientLogin = () => {
    setLoginCategory('lab');
    setViewMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPhlebotomistLogin = () => {
    setLoginCategory('phlebotomist');
    setViewMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdminLogin = () => {
    setLoginCategory('admin');
    setViewMode('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not authenticated:
  if (!isAuthenticated) {
    if (viewMode === 'login') {
      return (
        <LoginScreen
          initialCategory={loginCategory}
          onBackToLanding={() => {
            setViewMode('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
    }

    // Main landing page (Default root screen /)
    return (
      <LandingPage
        onClientLogin={handleOpenClientLogin}
        onPhlebotomistLogin={handleOpenPhlebotomistLogin}
        onAdminLogin={handleOpenAdminLogin}
      />
    );
  }

  // If authenticated, show respective internal workspace
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-[#087ea4] selection:text-white">
      {/* Universal Multi-Tenant Header */}
      <Header
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
      />

      {/* Main View Area based on authenticated user role */}
      <main className="flex-1 pb-16">
        {currentRole === 'lab' && (
          <LabPortal onOpenSecurityModal={() => setIsSecurityModalOpen(true)} />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard onOpenSecurityModal={() => setIsSecurityModalOpen(true)} />
        )}

        {currentRole === 'phlebotomist' && (
          <PhlebotomistPortal onOpenSecurityModal={() => setIsSecurityModalOpen(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">SecondMedic (SwiftPhlebo) Vizag</span>
            <span>•</span>
            <span>Multi-Tenant Phlebotomy Fulfillment Marketplace</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Isolated partitions for Lab A (Vijaya), Lab B (Apollo), Lab C (Sterling) in Visakhapatnam
          </div>
        </div>
      </footer>

      {/* Interactive Security & Multi-Tenant Authorization Verifier Modal */}
      <SecurityVerifierModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      {/* Order Tracking Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        onSelectOrder={handleSelectTrackedOrder}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
