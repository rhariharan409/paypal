import React, { useState, useEffect } from 'react';
import { 
  Bot, ShieldCheck, ShieldAlert, CreditCard, TrendingUp, 
  Pause, Play, AlertTriangle, CheckCircle2, Sliders, ArrowRight,
  Lock, RefreshCw, X
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Agent } from '../types';

export const AgentsPage: React.FC = () => {
  const { agents, refreshAgents } = useApp();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [budgetLedger, setBudgetLedger] = useState<any>(null);
  const [conflictResult, setConflictResult] = useState<any>(null);
  const [isSimulatingConflict, setIsSimulatingConflict] = useState(false);

  const loadLedger = async () => {
    try {
      const data = await api.getBudgetLedger();
      setBudgetLedger(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleStatusChange = async (code: string, action: 'pause' | 'resume' | 'revoke') => {
    setIsUpdating(true);
    try {
      if (action === 'pause') await api.pauseAgent(code);
      else if (action === 'resume') await api.resumeAgent(code);
      else if (action === 'revoke') await api.revokeAgent(code);

      await refreshAgents();
      const updated = agents.find((a: Agent) => a.code === code);
      if (updated) setSelectedAgent(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBudgetConflictDemo = async () => {
    setIsSimulatingConflict(true);
    setConflictResult(null);
    try {
      const res = await api.executeBudgetConflictDemo();
      setConflictResult(res);
      await loadLedger();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingConflict(false);
    }
  };

  const collaborationFlow = [
    { name: 'Shopping Agent', role: 'Discovery', icon: Bot, color: 'text-primary' },
    { name: 'Merchant Intel', role: '7-Factor Trust', icon: ShieldCheck, color: 'text-emerald-600' },
    { name: 'Security Agent', role: 'Prompt Defense', icon: ShieldAlert, color: 'text-rose-600' },
    { name: 'Finance Agent', role: 'Policy & Ledger', icon: CreditCard, color: 'text-amber-600' },
    { name: 'Governance Engine', role: 'Authorization', icon: Lock, color: 'text-indigo-600' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            AI Agent Control Center
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage multi-agent operational parameters, permissions, shared budgets, and coordination policies.
          </p>
        </div>

        <button
          onClick={handleBudgetConflictDemo}
          disabled={isSimulatingConflict}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5EAF2] hover:border-primary/40 text-text-primary text-xs font-semibold shadow-sm transition-all"
        >
          {isSimulatingConflict ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-status-warning" />
          )}
          <span>Simulate Shared Budget Conflict</span>
        </button>
      </div>

      {/* Conflict Result Alert */}
      {conflictResult && (
        <div className="p-4 rounded-2xl bg-[#FEF7EB] border border-status-warning/40 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-status-warning flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Cross-Agent Budget Contention Simulation Result</span>
            </span>
            <button onClick={() => setConflictResult(null)} className="text-text-muted hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-text-primary">{conflictResult.conflictScenario}</p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2]">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Agent 1 (Shopping Agent - $65,000)</span>
              <span className="font-bold text-status-success">
                {conflictResult.agent1_reservation?.success ? 'Reserved Successfully' : 'Reservation Blocked'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF2]">
              <span className="text-[10px] text-text-muted uppercase font-bold block">Agent 2 (Finance Agent - $50,000)</span>
              <span className="font-bold text-status-danger">
                {conflictResult.agent2_reservation?.success ? 'Accommodated' : 'BLOCKED: Shared Pool Exhaustion'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Flow Visualization */}
      <div className="neu-card p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary">
          Cross-Agent Inter-Service Collaboration Pipeline
        </h3>
        <p className="text-xs text-text-secondary">
          No individual AI agent possesses the authority to independently execute payments. Proposals pass through strict linear verification.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          {collaborationFlow.map((node, index) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={index}>
                <div className="flex-1 w-full md:w-auto p-4 rounded-2xl bg-[#F0F4FA] border border-[#E5EAF2] text-center space-y-1.5">
                  <div className={`w-8 h-8 rounded-xl bg-white mx-auto flex items-center justify-center shadow-sm ${node.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-text-primary block">{node.name}</span>
                  <span className="text-[10px] text-text-secondary block">{node.role}</span>
                </div>
                {index < collaborationFlow.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-text-muted hidden md:block shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 5 Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent: Agent) => {
          const isActive = agent.status === 'active';
          return (
            <div key={agent.id} className="neu-card p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF1FF] text-primary flex items-center justify-center shadow-sm">
                    <Bot className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    isActive ? 'bg-status-success-soft text-status-success' : 'bg-status-danger-soft text-status-danger'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-text-primary">{agent.name}</h4>
                  <span className="text-xs font-medium text-primary block mt-0.5">{agent.role}</span>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-3">
                    {agent.description}
                  </p>
                </div>

                <div className="p-3 bg-[#F0F4FA] rounded-2xl border border-[#E5EAF2] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Assigned Budget</span>
                    <span className="font-bold text-text-primary tabular-nums">
                      ${agent.assigned_budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Approval Above</span>
                    <span className="font-semibold text-text-primary tabular-nums">
                      ${agent.permissions?.requires_approval_above?.toLocaleString() || '5,000'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedAgent(agent)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#E5EAF2] hover:border-primary/40 text-xs font-semibold text-text-primary hover:bg-[#F5F7FB] transition-colors"
                >
                  View Details & Rules
                </button>

                {isActive ? (
                  <button
                    onClick={() => handleStatusChange(agent.code, 'pause')}
                    disabled={isUpdating}
                    className="p-2 rounded-xl bg-status-warning-soft text-status-warning hover:bg-status-warning hover:text-white transition-colors"
                    title="Pause Agent"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(agent.code, 'resume')}
                    disabled={isUpdating}
                    className="p-2 rounded-xl bg-status-success-soft text-status-success hover:bg-status-success hover:text-white transition-colors"
                    title="Resume Agent"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared Budget Ledger Manager */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Global Shared Budget & Reservation Ledger
            </h3>
            <p className="text-xs text-text-secondary">
              Central atomic ledger preventing double-spend and race conditions across autonomous agents
            </p>
          </div>
          <button
            onClick={loadLedger}
            className="text-xs text-primary font-semibold hover:underline flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Ledger</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F0F4FA] border border-[#E5EAF2]">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Allocated</span>
            <span className="text-lg font-bold text-text-primary tabular-nums block mt-1">
              ${(budgetLedger?.totalAllocated || 100000).toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FEF7EB] border border-status-warning/30">
            <span className="text-[10px] text-status-warning font-bold uppercase tracking-wider block">Actively Reserved</span>
            <span className="text-lg font-bold text-status-warning tabular-nums block mt-1">
              ${(budgetLedger?.totalReserved || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E6F7EF] border border-status-success/30">
            <span className="text-[10px] text-status-success font-bold uppercase tracking-wider block">Captured / Consumed</span>
            <span className="text-lg font-bold text-status-success tabular-nums block mt-1">
              ${(budgetLedger?.totalConsumed || 12450).toLocaleString()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#EAF1FF] border border-primary/20">
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Available Shared Capacity</span>
            <span className="text-lg font-bold text-primary tabular-nums block mt-1">
              ${(budgetLedger?.remainingAvailable || 87550).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182338]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card w-full max-w-lg overflow-hidden space-y-5 p-6">
            <div className="flex items-start justify-between border-b border-[#E5EAF2] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{selectedAgent.name}</h3>
                  <span className="text-xs text-primary font-medium">{selectedAgent.role}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-text-primary block mb-1">Operational Description:</span>
                <p className="text-text-secondary leading-relaxed bg-[#F0F4FA] p-3 rounded-xl border border-[#E5EAF2]">
                  {selectedAgent.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Max Single Spend</span>
                  <span className="font-bold text-text-primary tabular-nums mt-0.5 block">
                    ${selectedAgent.permissions?.max_single_transaction?.toLocaleString() || '20,000'}
                  </span>
                </div>
                <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Approval Trigger Above</span>
                  <span className="font-bold text-text-primary tabular-nums mt-0.5 block">
                    ${selectedAgent.permissions?.requires_approval_above?.toLocaleString() || '5,000'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-text-primary block mb-1">Allowed Procurement Categories:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.permissions?.allowed_categories?.map((cat: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#EAF1FF] text-primary font-semibold text-[10px]">
                      {cat}
                    </span>
                  )) || <span className="text-text-muted">Standard enterprise categories</span>}
                </div>
              </div>

              <div>
                <span className="font-semibold text-text-primary block mb-1">Restricted Merchants:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAgent.permissions?.restricted_merchants?.length ? (
                    selectedAgent.permissions.restricted_merchants.map((m: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-status-danger-soft text-status-danger font-semibold text-[10px]">
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-muted">No custom overrides (inherits global blacklist)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="pt-2 flex items-center space-x-3 border-t border-[#E5EAF2]">
              {selectedAgent.status === 'active' ? (
                <button
                  onClick={() => handleStatusChange(selectedAgent.code, 'pause')}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-status-warning-soft text-status-warning font-semibold text-xs hover:bg-status-warning hover:text-white transition-colors"
                >
                  Pause Agent Activity
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(selectedAgent.code, 'resume')}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-status-success-soft text-status-success font-semibold text-xs hover:bg-status-success hover:text-white transition-colors"
                >
                  Resume Agent Operations
                </button>
              )}

              <button
                onClick={() => handleStatusChange(selectedAgent.code, 'revoke')}
                disabled={isUpdating}
                className="py-2.5 px-4 rounded-xl bg-status-danger-soft text-status-danger font-semibold text-xs hover:bg-status-danger hover:text-white transition-colors"
              >
                Revoke Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
