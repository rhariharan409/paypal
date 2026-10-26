import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Bot, ShieldAlert, CreditCard, CheckCircle2, 
  ArrowUpRight, AlertTriangle, Play, Plus, Sliders, Shield, 
  ChevronRight, ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';
import { Agent, SecurityEvent, Transaction } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { openMasterDemo, openNewTask, activeWorkspace } = useApp();

  const [metrics, setMetrics] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<SecurityEvent[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [activeWorkflowNode, setActiveWorkflowNode] = useState<string>('orchestrator');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getDashboardOverview();
      if (data) {
        setMetrics(data.metrics);
        setAgents(data.agents || []);
        setRecentAlerts(data.recentAlerts || []);
        setRecentTransactions(data.recentTransactions || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const workflowNodes = [
    {
      id: 'task',
      label: '1. User Task',
      subtitle: 'Natural Language Intent',
      status: 'Active',
      desc: 'Users formulate goals with spending caps and mandatory approval constraints. The raw intent is hashed and preserved immutably.'
    },
    {
      id: 'orchestrator',
      label: '2. AI Orchestrator',
      subtitle: 'Multi-Agent Director',
      status: 'Active',
      desc: 'Decomposes intent into structured JSON task graphs. Delegates procurement to Shopping Agent and sanitization to Security Agent.'
    },
    {
      id: 'specialized',
      label: '3. Specialized Agents',
      subtitle: 'Shopping & Intelligence',
      status: 'Protected',
      desc: 'Shopping Agent discovers catalog offerings. Merchant Intelligence Agent scores 7-factor seller trust. Untrusted descriptions are quarantined.'
    },
    {
      id: 'governance',
      label: '4. Governance Engine',
      subtitle: '10-Point Deterministic Filter',
      status: 'Guarded',
      desc: 'Deterministic backend policy pipeline evaluates spending caps, agent limits, shared pool locks, and generates ALLOW / REVIEW / BLOCK decisions.'
    },
    {
      id: 'paypal',
      label: '5. PayPal Sandbox Approval',
      subtitle: 'Human Cryptographic Sign-Off',
      status: 'Gated',
      desc: 'Final financial capture executed strictly via PayPal REST API Sandbox after explicit user sign-off. LLMs never possess payment credentials.'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Financial Command Center Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Financial Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1FF] text-primary">
              Live Governance
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Monitor your autonomous agents, financial activity and security in one place.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={openMasterDemo}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-[#E5EAF2] hover:border-primary/40 text-text-primary text-xs font-semibold shadow-sm transition-all group"
          >
            <Play className="w-3.5 h-3.5 text-primary fill-current transition-transform group-hover:scale-110" />
            <span>Run Master Demo (Section 21)</span>
          </button>

          <button
            onClick={openNewTask}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold neu-button"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Available Demo Budget */}
        <div className="neu-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available Demo Budget</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-text-primary tabular-nums">
            ${(metrics?.availableDemoBudget || 87550).toLocaleString()}
          </div>
          <span className="text-[10px] text-text-secondary block">
            From ${metrics?.totalMonthlyLimit?.toLocaleString() || '100,000'} monthly pool
          </span>
        </div>

        {/* Card 2: Active AI Agents */}
        <div className="neu-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active AI Agents</span>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-text-primary tabular-nums">
            {metrics?.activeAgentsCount || 5} / {metrics?.totalAgentsCount || 5}
          </div>
          <span className="text-[10px] text-status-success font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success"></span>
            <span>All Agents Operational</span>
          </span>
        </div>

        {/* Card 3: Security Threats Detected */}
        <div className="neu-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Security Threats</span>
            <ShieldAlert className="w-4 h-4 text-status-danger" />
          </div>
          <div className="text-xl font-bold text-status-danger tabular-nums">
            {metrics?.securityThreatsDetected || 1}
          </div>
          <span className="text-[10px] text-text-secondary block">
            Adversarial injections blocked
          </span>
        </div>

        {/* Card 4: Pending Approvals */}
        <div className="neu-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Approvals</span>
            <CreditCard className="w-4 h-4 text-status-warning" />
          </div>
          <div className="text-xl font-bold text-status-warning tabular-nums">
            {metrics?.pendingApprovals || 1}
          </div>
          <span className="text-[10px] text-text-secondary block">
            Awaiting user sign-off
          </span>
        </div>

        {/* Card 5: Completed Transactions */}
        <div className="neu-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Captured Payments</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-xl font-bold text-text-primary tabular-nums">
            {metrics?.completedTransactionsCount || 1}
          </div>
          <span className="text-[10px] text-text-secondary block">
            PayPal Sandbox captured
          </span>
        </div>

        {/* Card 6: Remaining Monthly Budget */}
        <div className="neu-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Remaining Budget</span>
            <Sliders className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-text-primary tabular-nums">
            {Math.round(((metrics?.availableDemoBudget || 87550) / (metrics?.totalMonthlyLimit || 100000)) * 100)}%
          </div>
          <span className="text-[10px] text-text-secondary block">
            Discretionary capacity
          </span>
        </div>
      </div>

      {/* Interactive Workflow Node Visualization */}
      <div className="neu-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Autonomous Transaction Lifecycle Pipeline
            </h3>
            <p className="text-xs text-text-secondary">
              End-to-end event sequence: User Task → AI Orchestration → Threat Sanitization → Governance → PayPal Sandbox
            </p>
          </div>
          <span className="text-xs font-semibold text-primary">
            Click node to view details
          </span>
        </div>

        {/* Visual Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {workflowNodes.map((node) => {
            const isSelected = activeWorkflowNode === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setActiveWorkflowNode(node.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary-soft/50 shadow-neu-primary/20 ring-2 ring-primary/20'
                    : 'border-[#E5EAF2] hover:border-primary/40 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-text-primary">{node.label}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white border border-[#E5EAF2] text-primary">
                    {node.status}
                  </span>
                </div>
                <span className="text-[11px] text-text-secondary block truncate">
                  {node.subtitle}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Bar */}
        {activeWorkflowNode && (
          <div className="p-4 rounded-xl bg-[#F0F4FA] border border-[#E5EAF2] text-xs text-text-primary flex items-start space-x-3">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">
                {workflowNodes.find(n => n.id === activeWorkflowNode)?.label}:
              </strong>
              <p className="text-text-secondary leading-relaxed">
                {workflowNodes.find(n => n.id === activeWorkflowNode)?.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active AI Agents & Security Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: AI Agent Activity */}
        <div className="lg:col-span-2 neu-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Active AI Agents</h3>
              <p className="text-xs text-text-secondary">Predefined specialized agent roster with assigned budgets</p>
            </div>
            <button
              onClick={() => navigate('/agents')}
              className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1"
            >
              <span>Manage All Agents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E5EAF2]">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                onClick={() => navigate('/agents')}
                className="py-3.5 flex items-center justify-between hover:bg-[#F0F4FA] -mx-2 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF1FF] text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-text-primary">{agent.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        agent.status === 'active' ? 'bg-status-success-soft text-status-success' : 'bg-status-danger-soft text-status-danger'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-secondary block mt-0.5 line-clamp-1">
                      {agent.current_task || agent.role}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-text-primary tabular-nums block">
                    ${agent.assigned_budget?.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted block">
                    Allocated Limit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Latest Security Alerts */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Adversarial Interventions</h3>
              <p className="text-xs text-text-secondary">Recent prompt injection events</p>
            </div>
            <button
              onClick={() => navigate('/security')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Security Lab →
            </button>
          </div>

          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No active security threats detected
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-status-danger-soft/50 border border-status-danger/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-status-danger px-2 py-0.5 rounded-full bg-status-danger/10 uppercase tracking-wider">
                      {alert.threat_type}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-text-primary font-medium line-clamp-2">
                    {alert.detected_manipulation}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-status-danger/10">
                    <span className="text-text-secondary font-mono text-[10px]">
                      Agent: {alert.agent_code}
                    </span>
                    <span className="font-bold text-status-danger">
                      Action: {alert.action_taken}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Financial Activity */}
        <div className="lg:col-span-2 neu-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Recent Transactions & Requests</h3>
              <p className="text-xs text-text-secondary">Autonomous procurement ledger</p>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Payment Center →
            </button>
          </div>

          <div className="divide-y divide-[#E5EAF2]">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No transactions recorded yet
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary block">
                      {tx.merchant_name}
                    </span>
                    <span className="text-[10px] text-text-secondary block mt-0.5">
                      Initiated by {tx.initiating_agent_code} • {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-text-primary tabular-nums block">
                      ${tx.amount?.toLocaleString()} {tx.currency}
                    </span>
                    <span className="text-[10px] font-bold text-status-success block">
                      {tx.lifecycle_state}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions */}
        <div className="neu-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Quick Navigation</h3>
            <p className="text-xs text-text-secondary">Core governance operations</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/security')}
              className="w-full p-3 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] text-left transition-colors flex items-center justify-between text-xs font-semibold text-text-primary"
            >
              <span>Test Prompt Injection Lab</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>

            <button
              onClick={() => navigate('/trust')}
              className="w-full p-3 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] text-left transition-colors flex items-center justify-between text-xs font-semibold text-text-primary"
            >
              <span>Evaluate Merchant Trust Scores</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>

            <button
              onClick={() => navigate('/governance')}
              className="w-full p-3 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] text-left transition-colors flex items-center justify-between text-xs font-semibold text-text-primary"
            >
              <span>Configure Spending Thresholds</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>

            <button
              onClick={() => navigate('/business')}
              className="w-full p-3 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] text-left transition-colors flex items-center justify-between text-xs font-semibold text-text-primary"
            >
              <span>Ask AI CFO Assistant</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
