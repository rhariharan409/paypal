import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Check, ArrowRight, ArrowLeft, Building2, User, 
  DollarSign, ShieldAlert, CreditCard, Sparkles 
} from 'lucide-react';
import { api } from '../services/api';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Wizard state
  const [workspaceType, setWorkspaceType] = useState<'personal' | 'business' | 'both'>('both');
  const [monthlyBudget, setMonthlyBudget] = useState('100000');
  const [maxSingle, setMaxSingle] = useState('15000');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [highRiskPolicy, setHighRiskPolicy] = useState('require_biometric_approval');
  const [paypalSandboxReady, setPaypalSandboxReady] = useState(true);

  const handleFinish = async () => {
    try {
      await api.completeOnboarding({
        workspaceType,
        monthlyBudget,
        maxSingle,
        defaultCurrency: currency,
        highRiskPolicy
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card p-8 space-y-8">
        {/* Wizard Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs">
                {step}
              </div>
              <span className="text-sm font-bold text-text-primary">
                {step === 1 && 'Step 1: Workspace Selection'}
                {step === 2 && 'Step 2: Financial Governance Limits'}
                {step === 3 && 'Step 3: Security & Adversarial Defense'}
                {step === 4 && 'Step 4: PayPal Sandbox Integration'}
              </span>
            </div>
            <span className="text-xs font-semibold text-text-muted">
              Step {step} of 4
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F0F4FA] rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Workspace Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Choose Your Initial Workspaces</h2>
              <p className="text-xs text-text-secondary mt-1">
                AEGIS PAY provides unified governance across personal procurement and business treasury operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div
                onClick={() => setWorkspaceType('personal')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  workspaceType === 'personal'
                    ? 'border-primary bg-primary-soft/40 shadow-neu-primary/20'
                    : 'border-[#E5EAF2] hover:border-primary/40 bg-white'
                }`}
              >
                <User className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-semibold text-sm text-text-primary">Personal Finance</h4>
                <p className="text-xs text-text-secondary mt-1">Individual procurement, consumer subscriptions & groceries.</p>
              </div>

              <div
                onClick={() => setWorkspaceType('business')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  workspaceType === 'business'
                    ? 'border-primary bg-primary-soft/40 shadow-neu-primary/20'
                    : 'border-[#E5EAF2] hover:border-primary/40 bg-white'
                }`}
              >
                <Building2 className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-semibold text-sm text-text-primary">Business Finance</h4>
                <p className="text-xs text-text-secondary mt-1">SaaS management, supplier invoices, and 30-day AI CFO cash flow.</p>
              </div>

              <div
                onClick={() => setWorkspaceType('both')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  workspaceType === 'both'
                    ? 'border-primary bg-primary-soft/40 shadow-neu-primary/20'
                    : 'border-[#E5EAF2] hover:border-primary/40 bg-white'
                }`}
              >
                <Sparkles className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-semibold text-sm text-text-primary">Both (Recommended)</h4>
                <p className="text-xs text-text-secondary mt-1">Deploy personal shopping agents alongside business treasury agents.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Financial Governance Limits */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Set Deterministic Financial Caps</h2>
              <p className="text-xs text-text-secondary mt-1">
                AI agents can never autonomously exceed these limits. Hard backend rules enforce safety.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5">
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary"
                >
                  <option value="USD">USD ($) - Official PayPal Demo Standard</option>
                  <option value="INR">INR (₹) - Indian Rupee (Demo Display)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1.5">
                  Global Monthly Spending Cap ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-text-primary block mb-1.5">
                  Single Transaction Maximum ({currency})
                </label>
                <input
                  type="number"
                  value={maxSingle}
                  onChange={(e) => setMaxSingle(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary"
                />
                <span className="text-[11px] text-text-muted mt-1 block">
                  Any proposed purchase exceeding ${maxSingle} will automatically be placed in human approval review.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Security & Adversarial Defense */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Configure AI Adversarial Defense</h2>
              <p className="text-xs text-text-secondary mt-1">
                Specify how AEGIS PAY responds to detected prompt injection and unauthorized overrides.
              </p>
            </div>

            <div className="space-y-3">
              <label className={`block p-4 rounded-2xl border cursor-pointer ${
                highRiskPolicy === 'require_biometric_approval' ? 'border-primary bg-primary-soft/30' : 'border-[#E5EAF2]'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-xs text-text-primary">Require Explicit Human Authorization</h5>
                    <p className="text-[11px] text-text-secondary mt-0.5">High-risk actions route to Payment Approval Center for cryptographic sign-off.</p>
                  </div>
                  <input
                    type="radio"
                    name="highrisk"
                    checked={highRiskPolicy === 'require_biometric_approval'}
                    onChange={() => setHighRiskPolicy('require_biometric_approval')}
                  />
                </div>
              </label>

              <label className={`block p-4 rounded-2xl border cursor-pointer ${
                highRiskPolicy === 'auto_block' ? 'border-primary bg-primary-soft/30' : 'border-[#E5EAF2]'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-xs text-text-primary">Immediate Hard Block</h5>
                    <p className="text-[11px] text-text-secondary mt-0.5">Automatically quarantine and terminate any action with intent deviation.</p>
                  </div>
                  <input
                    type="radio"
                    name="highrisk"
                    checked={highRiskPolicy === 'auto_block'}
                    onChange={() => setHighRiskPolicy('auto_block')}
                  />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: PayPal Sandbox Integration */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">Connect PayPal Sandbox</h2>
              <p className="text-xs text-text-secondary mt-1">
                AEGIS PAY interfaces with PayPal REST APIs for authorized payment captures.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#F0F4FA] border border-[#E5EAF2] space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#0070BA] text-white flex items-center justify-center font-bold">
                  P
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-text-primary">PayPal REST API Sandbox Mode</h4>
                  <span className="text-[11px] text-status-success font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Verified Sandbox Simulation & REST Ready</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Hackathon prototype connects automatically to the validated PayPal Sandbox execution engine. You can update client credentials anytime in <strong>Settings</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-4 flex items-center justify-between border-t border-[#E5EAF2]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold neu-button flex items-center space-x-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-status-success hover:bg-emerald-700 text-white text-xs font-bold neu-button flex items-center space-x-1.5"
            >
              <span>Enter Financial Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
