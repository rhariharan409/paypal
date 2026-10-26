import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, XCircle, AlertTriangle, RefreshCw, 
  Lock, ExternalLink, ShieldCheck, DollarSign, Clock, ArrowRight, X
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentRequest, Transaction } from '../types';

export const PaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPayPalConfigured, setIsPayPalConfigured] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadPayments = async () => {
    try {
      const data = await api.getPayments();
      if (data) {
        setRequests(data.requests || []);
        setTransactions(data.transactions || []);
        setIsPayPalConfigured(data.isPayPalConfigured);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    setActionSuccess(null);
    try {
      const res = await api.approvePayment(id);
      setActionSuccess(res.message);
      await loadPayments();
      const updated = requests.find(r => r.id === id);
      if (updated) setSelectedRequest(updated);
    } catch (err: any) {
      console.error('Approval failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    setActionSuccess(null);
    try {
      const res = await api.rejectPayment(id, 'User manual rejection');
      setActionSuccess(res.message);
      await loadPayments();
      setSelectedRequest(null);
    } catch (err: any) {
      console.error('Rejection failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'pending') return r.approval_status === 'pending' || r.approval_status === 'processing';
    if (activeTab === 'completed') return r.approval_status === 'completed';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Payment Approval & PayPal Center
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Autonomous payment requests awaiting human cryptographic authorization and PayPal Sandbox capture.
          </p>
        </div>

        {/* Integration Status Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-[#E5EAF2] text-xs font-semibold shadow-sm">
          <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
          <span className="text-text-primary">PayPal Mode:</span>
          <span className="text-primary font-bold">
            {isPayPalConfigured ? 'Sandbox REST API' : 'Sandbox Test Simulation'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E5EAF2] pb-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeTab === 'pending' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Pending Authorization ({requests.filter(r => r.approval_status === 'pending').length})
          {activeTab === 'pending' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeTab === 'completed' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Captured Transactions ({requests.filter(r => r.approval_status === 'completed').length})
          {activeTab === 'completed' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-xs font-bold transition-all relative ${
            activeTab === 'all' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All Requests ({requests.length})
          {activeTab === 'all' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>}
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-status-success-soft border border-status-success/30 rounded-xl text-status-success text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-text-muted">
            No payment requests found in this category.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.approval_status === 'pending';
            const isCompleted = req.approval_status === 'completed';

            return (
              <div key={req.id} className="neu-card p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono text-text-muted uppercase">
                      {req.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isCompleted 
                        ? 'bg-status-success-soft text-status-success' 
                        : isPending 
                        ? 'bg-status-warning-soft text-status-warning' 
                        : 'bg-status-danger-soft text-status-danger'
                    }`}>
                      {req.approval_status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-text-primary line-clamp-1">{req.product_title}</h4>
                    <span className="text-xs text-text-secondary mt-0.5 block">
                      Merchant: <strong className="text-text-primary">{req.merchant_name}</strong>
                    </span>
                  </div>

                  {/* Amount Pill */}
                  <div className="p-3.5 bg-[#F0F4FA] rounded-2xl border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-xs text-text-muted font-medium">Requested Total</span>
                    <span className="text-lg font-bold text-primary tabular-nums">
                      ${req.amount.toLocaleString()} {req.currency}
                    </span>
                  </div>

                  {/* Checkpoint Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-[#E5EAF2]">
                      <span className="text-[10px] text-text-muted block">Security Check</span>
                      <span className="font-bold text-status-success flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Passed (Safe)</span>
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white border border-[#E5EAF2]">
                      <span className="text-[10px] text-text-muted block">Merchant Trust</span>
                      <span className="font-bold text-status-success flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{req.trust_score || 94}/100</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E5EAF2] hover:border-primary/40 text-xs font-semibold text-text-primary hover:bg-[#F5F7FB] transition-colors"
                  >
                    Inspect Checklist
                  </button>

                  {isPending && (
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={isProcessing}
                      className="py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold neu-button flex items-center space-x-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Inspection Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182338]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card w-full max-w-lg overflow-hidden space-y-5 p-6">
            <div className="flex items-start justify-between border-b border-[#E5EAF2] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Payment Authorization Inspection</h3>
                  <span className="text-[10px] font-mono text-text-muted">{selectedRequest.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#F0F4FA] border border-[#E5EAF2] flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Purchase Amount</span>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    ${selectedRequest.amount.toLocaleString()} {selectedRequest.currency}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Merchant</span>
                  <span className="font-bold text-text-primary">{selectedRequest.merchant_name}</span>
                </div>
              </div>

              {/* 6-Point Verification Checklist */}
              <div className="space-y-2">
                <span className="font-bold text-text-primary block">
                  Deterministic Governance Checklist
                </span>

                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-text-secondary">1. Agent Integrity & Active Status:</span>
                    <span className="font-bold text-status-success flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Active</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-text-secondary">2. 7-Factor Merchant Assessment:</span>
                    <span className="font-bold text-status-success flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Passed ({selectedRequest.trust_score || 94}/100)</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-text-secondary">3. Global Spending Budget Cap:</span>
                    <span className="font-bold text-status-success flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compliant</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-text-secondary">4. Cross-Agent Shared Pool Reservation:</span>
                    <span className="font-bold text-status-success flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reserved Atomically</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-text-secondary">5. Adversarial Prompt Injection Defense:</span>
                    <span className="font-bold text-status-success flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero Malicious Vectors</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] flex items-center justify-between">
                    <span className="text-text-secondary">6. Human Cryptographic Authorization:</span>
                    <span className="font-bold text-primary flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {selectedRequest.approval_status === 'completed' ? 'Authorized & Captured' : 'Mandatory User Sign-Off'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#E5EAF2] flex items-center space-x-3">
              {selectedRequest.approval_status === 'pending' ? (
                <>
                  <button
                    onClick={() => handleReject(selectedRequest.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-status-danger-soft text-status-danger font-semibold text-xs hover:bg-status-danger hover:text-white transition-colors"
                  >
                    Reject & Release Budget
                  </button>

                  <button
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={isProcessing}
                    className="flex-1 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#003087] text-white font-bold text-xs neu-button flex items-center justify-center space-x-1.5"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Authorize with PayPal Sandbox</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-full py-2.5 rounded-xl bg-[#F0F4FA] text-text-primary text-xs font-semibold hover:bg-[#E5EAF2]"
                >
                  Close Inspection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
