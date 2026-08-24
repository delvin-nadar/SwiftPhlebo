import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderConfirmationTracker } from './OrderConfirmationTracker';
import { LabPortal } from '../lab/LabPortal';

interface PatientBookingFlowProps {
  onOpenSecurityModal?: () => void;
}

export const PatientBookingFlow: React.FC<PatientBookingFlowProps> = ({
  onOpenSecurityModal = () => {}
}) => {
  const { activeTrackingOrderId, setActiveTrackingOrderId } = useApp();

  if (activeTrackingOrderId) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <OrderConfirmationTracker
          orderId={activeTrackingOrderId}
          onBookAnother={() => setActiveTrackingOrderId(null)}
        />
      </div>
    );
  }

  return <LabPortal onOpenSecurityModal={onOpenSecurityModal} />;
};
