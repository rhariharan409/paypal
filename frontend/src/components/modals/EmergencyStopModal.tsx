import React, { useState } from 'react';
import { X, AlertOctagon, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const EmergencyStopModal: React.FC = () => {
  const { 
    isEmergencyModalOpen, 
    closeEmergencyModal, 
    emergencyStopActive, 
    toggleEmergencyStop 
  } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isEmergencyModalOpen) return null;

  const handleToggle = async () => {
    setIsProcessing(true);
    try {
      await toggleEmergencyStop(!emergencyStopActive);
      closeEmergencyModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182338]/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card w-full max-w-md overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-status-danger-soft text-status-danger flex items-center justify-center mx-auto shadow-neu-danger">
            <AlertOctagon className="w-8 h-8 stroke-[2.5] animate-pulse" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {emergencyStopActive ? 'Resume Autonomous AI Operations?' : 'Trigger Autonomous Emergency Stop?'}
            </h3>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {emergencyStopActive 
                ? 'Deactivating emergency stop will restore all active AI agents to operational status and re-open the financial authorization gate.'
                : 'Activating emergency stop immediately pauses all 5 autonomous AI agents, blocks new financial execution requests, and locks down the payment authorization engine.'}
            </p>
          </div>

          <div className="p-3 bg-[#F0F4FA] rounded-2xl border border-[#E5EAF2] text-[11px] text-left text-text-secondary space-y-1">
            <span className="font-semibold text-text-primary block">Protocol Impact:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Immediate halt of Shopping, Merchant & Finance Agents</li>
              <li>Rejection of in-flight payment approval requests</li>
              <li>Preservation of complete append-only audit trail</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={closeEmergencyModal}
              className="flex-1 py-2.5 rounded-xl border border-[#E5EAF2] text-xs font-semibold text-text-secondary hover:bg-[#F0F4FA] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleToggle}
              disabled={isProcessing}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all ${
                emergencyStopActive
                  ? 'bg-primary hover:bg-primary-hover shadow-neu-primary'
                  : 'bg-status-danger hover:bg-red-700 shadow-neu-danger'
              }`}
            >
              {isProcessing ? 'Processing...' : emergencyStopActive ? 'Restore Operations' : 'ENGAGE HARD STOP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
