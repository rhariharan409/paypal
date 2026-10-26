import React, { useState } from 'react';
import { 
  X, Play, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, 
  CreditCard, ExternalLink, RefreshCw, Lock, Sparkles, Check
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';
import { OrchestrationStep } from '../../types';

export const MasterDemoModal: React.FC = () => {
  const { isMasterDemoOpen, closeMasterDemo, refreshAgents, refreshNotifications } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<OrchestrationStep[]>([]);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [captureData, setCaptureData] = useState<any>(null);

  if (!isMasterDemoOpen) return null;

  const defaultPrompt = "Find the best programming laptop under $60,000. Only use trustworthy merchants. Do not purchase without my approval.";

  const handleRunDemo = async () => {
    setIsRunning(true);
    setCaptureSuccess(false);
    setCaptureData(null);
    setSteps([]);
    setDemoResult(null);

    try {
      const res = await api.executeMasterDemo(defaultPrompt);
      setDemoResult(res);
      setSteps(res.steps || []);
      await refreshAgents();
      await refreshNotifications();
    } catch (err: any) {
      console.error('Failed to run demo:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveAndCapture = async () => {
    if (!demoResult?.paymentRequest?.id) return;
    setIsCapturing(true);
    try {
      const res = await api.approvePayment(demoResult.paymentRequest.id);
      setCaptureSuccess(true);
      setCaptureData(res);
      await refreshNotifications();
    } catch (err: any) {
      console.error('Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182338]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#E5EAF2] flex items-center justify-between bg-[#F0F4FA]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-neu-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                End-to-End Master Demonstration (Section 21)
              </h3>
              <p className="text-xs text-text-secondary">
                AI Manipulation Detection • Trust Intelligence • Shared Budget • PayPal Sandbox Capture
              </p>
            </div>
          </div>
          <button
            onClick={closeMasterDemo}
            className="text-text-muted hover:text-text-primary p-2 rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Scenario Overview Box */}
          <div className="p-4 rounded-2xl bg-[#EAF1FF] border border-primary/20">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                  Active Demonstration Scenario
                </span>
                <p className="text-sm font-semibold text-text-primary italic">
                  "{defaultPrompt}"
                </p>
              </div>
              <button
                onClick={handleRunDemo}
                disabled={isRunning}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold neu-button disabled:opacity-50 shrink-0 ml-4"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Full Workflow</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workflow Stepper Visualization */}
          {steps.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Autonomous Execution Trace & Security Interventions
              </h4>

              <div className="space-y-3">
                {steps.map((s, index) => {
                  const isBlocked = s.status === 'blocked';
                  const isComplete = s.status === 'completed';

                  return (
                    <div 
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        isBlocked 
                          ? 'bg-status-danger-soft border-status-danger/40 text-text-primary' 
                          : 'bg-white border-[#E5EAF2] hover:border-primary/40 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="mt-0.5 shrink-0">
                          {isBlocked ? (
                            <div className="w-7 h-7 rounded-xl bg-status-danger text-white flex items-center justify-center font-bold text-xs shadow-neu-danger">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-xl bg-status-success text-white flex items-center justify-center font-bold text-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-text-primary">
                              Step {s.step_number}: {s.action_name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isBlocked 
                                ? 'bg-status-danger text-white' 
                                : 'bg-status-success-soft text-status-success'
                            }`}>
                              {s.agent_name} • {s.status}
                            </span>
                          </div>

                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                            {s.detail}
                          </p>

                          {/* Side by side intent diff if this is security check */}
                          {s.payload?.intentDeviations && (
                            <div className="mt-3 p-3 bg-white/80 rounded-xl border border-status-danger/20 space-y-2">
                              <span className="text-[10px] font-bold text-status-danger uppercase tracking-wider block">
                                Adversarial Deviation Breakdown
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {s.payload.intentDeviations.map((d: any, dIdx: number) => (
                                  <div key={dIdx} className="p-2 rounded-lg bg-[#F5F7FB] border border-[#E5EAF2]">
                                    <span className="text-[10px] text-text-muted block">{d.field}</span>
                                    <div className="flex items-center justify-between mt-0.5">
                                      <span className="text-text-secondary font-medium">Intent: {d.original}</span>
                                      <span className="text-status-danger font-bold">Attempted: {d.proposed}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Request & Sandbox Checkout Action */}
          {demoResult?.paymentRequest && (
            <div className="p-5 rounded-2xl bg-white border-2 border-primary/30 shadow-neu-elevated space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-text-primary">
                      Ready for PayPal Sandbox Checkout
                    </h5>
                    <p className="text-xs text-text-secondary">
                      All governance and security thresholds satisfied. User cryptographic sign-off required.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-text-muted block">Total Authorized</span>
                  <span className="text-lg font-bold text-primary tabular-nums">
                    ${demoResult.paymentRequest.amount.toLocaleString()} USD
                  </span>
                </div>
              </div>

              {!captureSuccess ? (
                <div className="pt-2 flex items-center justify-between border-t border-[#E5EAF2]">
                  <div className="text-xs text-text-secondary">
                    Merchant: <strong className="text-text-primary">{demoResult.paymentRequest.merchant_name}</strong> • Trust: <strong className="text-status-success">{demoResult.paymentRequest.trust_score}/100</strong>
                  </div>
                  <button
                    onClick={handleApproveAndCapture}
                    disabled={isCapturing}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#003087] text-white text-xs font-bold neu-button disabled:opacity-50"
                  >
                    {isCapturing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Communicating with PayPal...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Authorize & Capture via PayPal Sandbox</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-status-success-soft border border-status-success/30 text-status-success flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">
                        Payment Successfully Captured via PayPal Sandbox!
                      </span>
                      <span className="text-[11px] text-text-secondary font-mono">
                        PayPal Order ID: {captureData?.paypalOrderId} • Capture ID: {captureData?.paypalCaptureId}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success text-white">
                    COMPLETED
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F0F4FA] border-t border-[#E5EAF2] flex items-center justify-between">
          <span className="text-xs text-text-muted">
            Governance Rule: LLMs never execute payments independently. All transactions require deterministic policy approval.
          </span>
          <button
            onClick={closeMasterDemo}
            className="px-4 py-2 rounded-xl bg-white border border-[#E5EAF2] text-xs font-semibold text-text-primary hover:bg-[#F5F7FB] transition-colors"
          >
            Close Demonstration
          </button>
        </div>
      </div>
    </div>
  );
};
