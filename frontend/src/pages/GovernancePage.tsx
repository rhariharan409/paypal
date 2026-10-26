import React, { useState, useEffect } from 'react';
import { 
  Sliders, Shield, AlertOctagon, CheckCircle2, AlertTriangle, 
  DollarSign, Lock, Play, RefreshCw, Save 
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { FinancialPolicy, Agent } from '../types';

export const GovernancePage: React.FC = () => {
  const { emergencyStopActive, openEmergencyModal } = useApp();
  const [policy, setPolicy] = useState<FinancialPolicy | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Policy Form State
  const [monthlyLimit, setMonthlyLimit] = useState('100000');
  const [dailyLimit, setDailyLimit] = useState('25000');
  const [singleLimit, setSingleLimit] = useState('15000');
  const [highRiskPolicy, setHighRiskPolicy] = useState<'require_biometric_approval' | 'auto_block' | 'double_sign'>('require_biometric_approval');

  // Simulator State
  const [simAmount, setSimAmount] = useState('25000');
  const [simAgent, setSimAgent] = useState('shopping_agent');
  const [simDecision, setSimDecision] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const loadPolicyData = async () => {
    try {
      const data = await api.getFinancialPolicies();
      if (data?.policy) {
        setPolicy(data.policy);
        setMonthlyLimit(String(data.policy.monthly_spending_limit));
        setDailyLimit(String(data.policy.daily_spending_limit));
        setSingleLimit(String(data.policy.max_single_transaction_limit));
        setHighRiskPolicy(data.policy.high_risk_policy);
      }
      if (data?.agents) setAgents(data.agents);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPolicyData();
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateFinancialPolicy({
        monthly_spending_limit: parseFloat(monthlyLimit),
        daily_spending_limit: parseFloat(dailyLimit),
        max_single_transaction_limit: parseFloat(singleLimit),
        high_risk_policy: highRiskPolicy
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    setSimDecision(null);
    try {
      const res = await api.evaluateGovernance({
        agentCode: simAgent,
        category: 'computers',
        merchantName: 'Official TechRetail Direct',
        amount: parseFloat(simAmount),
        currency: 'USD',
        securityDecision: 'SAFE',
        trustScore: 94
      });
      setSimDecision(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Emergency Stop Trigger */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Financial Controls & Permission Governance
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Deterministic spending boundaries, category blacklists, and authorization pipeline parameters.
          </p>
        </div>

        <button
          onClick={openEmergencyModal}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            emergencyStopActive
              ? 'bg-status-danger text-white border-2 border-status-danger shadow-neu-danger animate-pulse'
              : 'bg-status-danger-soft text-status-danger border border-status-danger/30 hover:bg-status-danger hover:text-white'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>{emergencyStopActive ? 'RESUME AGENT OPERATIONS' : 'STOP ALL AGENTS (EMERGENCY)'}</span>
        </button>
      </div>

      {/* Global Spending Rules Form */}
      <form onSubmit={handleSavePolicy} className="neu-card p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Global Spending Caps & Governance Policies
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">
            Hard constraints override soft preferences
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Monthly Global Pool ($ USD)
            </label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary tabular-nums"
              required
            />
            <span className="text-[10px] text-text-muted mt-1 block">Maximum permissible monthly spend across all agents</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Daily Spending Velocity ($ USD)
            </label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary tabular-nums"
              required
            />
            <span className="text-[10px] text-text-muted mt-1 block">24-hour rate limit across autonomous agents</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">
              Single Transaction Limit ($ USD)
            </label>
            <input
              type="number"
              value={singleLimit}
              onChange={(e) => setSingleLimit(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary tabular-nums"
              required
            />
            <span className="text-[10px] text-text-muted mt-1 block">Any transaction above requires human authorization</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-primary block mb-2">
            High-Risk Transaction Policy
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <label className={`p-3 rounded-xl border cursor-pointer ${
              highRiskPolicy === 'require_biometric_approval' ? 'border-primary bg-primary-soft/40' : 'border-[#E5EAF2]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-text-primary block">Human Authorization</span>
                  <span className="text-[10px] text-text-secondary">Mandate human cryptographic sign-off</span>
                </div>
                <input
                  type="radio"
                  name="riskPolicy"
                  checked={highRiskPolicy === 'require_biometric_approval'}
                  onChange={() => setHighRiskPolicy('require_biometric_approval')}
                />
              </div>
            </label>

            <label className={`p-3 rounded-xl border cursor-pointer ${
              highRiskPolicy === 'auto_block' ? 'border-primary bg-primary-soft/40' : 'border-[#E5EAF2]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-text-primary block">Immediate Auto-Block</span>
                  <span className="text-[10px] text-text-secondary">Hard stop without human review</span>
                </div>
                <input
                  type="radio"
                  name="riskPolicy"
                  checked={highRiskPolicy === 'auto_block'}
                  onChange={() => setHighRiskPolicy('auto_block')}
                />
              </div>
            </label>

            <label className={`p-3 rounded-xl border cursor-pointer ${
              highRiskPolicy === 'double_sign' ? 'border-primary bg-primary-soft/40' : 'border-[#E5EAF2]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-text-primary block">Executive Double-Sign</span>
                  <span className="text-[10px] text-text-secondary">Two authorized administrators required</span>
                </div>
                <input
                  type="radio"
                  name="riskPolicy"
                  checked={highRiskPolicy === 'double_sign'}
                  onChange={() => setHighRiskPolicy('double_sign')}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs font-semibold text-status-success flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Policies successfully updated in deterministic engine.</span>
            </span>
          )}
          <div className="ml-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold neu-button disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Financial Rules'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 10-Point Deterministic Policy Simulator */}
      <div className="neu-card p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-text-primary">
            10-Point Deterministic Authorization Pipeline Simulator
          </h3>
          <p className="text-xs text-text-secondary">
            Test how the backend governance engine evaluates an incoming transaction request in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Initiating Agent</label>
            <select
              value={simAgent}
              onChange={(e) => setSimAgent(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary font-medium"
            >
              <option value="shopping_agent">Shopping Agent</option>
              <option value="security_agent">Security Agent</option>
              <option value="finance_agent">Finance Agent</option>
              <option value="business_agent">Business Agent</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1">Proposed Transaction Amount ($ USD)</label>
            <input
              type="number"
              value={simAmount}
              onChange={(e) => setSimAmount(e.target.value)}
              className="w-full p-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary tabular-nums"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold neu-button flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isEvaluating ? 'Evaluating Pipeline...' : 'Run Deterministic Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Simulator Results */}
        {simDecision && (
          <div className="p-4 rounded-2xl bg-[#F0F4FA] border border-[#E5EAF2] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-text-primary">Decision:</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  simDecision.decision === 'BLOCK'
                    ? 'bg-status-danger text-white'
                    : simDecision.decision === 'REVIEW'
                    ? 'bg-status-warning text-white'
                    : 'bg-status-success text-white'
                }`}>
                  {simDecision.decision}
                </span>
              </div>
              <span className="text-xs text-text-secondary font-mono">{simDecision.decisionId}</span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {simDecision.explanation}
            </p>

            {/* 10 Checkpoints Checklist Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
              {Object.entries(simDecision.checklist || {}).map(([key, val], idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#E5EAF2] text-[11px] space-y-1">
                  <span className="text-text-muted capitalize block truncate">{key.replace(/_/g, ' ')}</span>
                  <div className="flex items-center space-x-1 font-bold">
                    {val ? (
                      <span className="text-status-success flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </span>
                    ) : (
                      <span className="text-status-danger flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Fail</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
