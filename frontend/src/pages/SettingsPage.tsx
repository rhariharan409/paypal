import React, { useState, useEffect } from 'react';
import { 
  Settings, User, Shield, Bot, CreditCard, Database, 
  RotateCcw, CheckCircle2, AlertTriangle, ExternalLink, Save, Lock
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { user } = useApp();
  const [settings, setSettings] = useState<any>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleResetDemo = async () => {
    if (!window.confirm('Restore demo dataset? This will reset all tasks, reservations, and security events to the fresh hackathon starting state.')) {
      return;
    }
    setIsResetting(true);
    setResetSuccess(false);
    try {
      await api.resetDemoData();
      setResetSuccess(true);
      await loadSettings();
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          System Settings & Integrations
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Configure AI intelligence providers, PayPal Sandbox API credentials, database sync, and demo data state.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-status-success-soft border border-status-success/30 rounded-xl text-status-success text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Demo dataset successfully reset to initial starting state!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Enterprise Identity */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5EAF2]">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Admin Identity & Preferences</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Authorized User</span>
              <span className="font-semibold text-text-primary text-sm">{user?.full_name || 'Alex Vance'}</span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Email</span>
              <span className="text-text-primary">{user?.email || 'alex.vance@aegispay.fintech'}</span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Security Role</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF1FF] text-primary">
                {user?.role || 'Enterprise Admin'}
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Default Currency</span>
              <span className="font-semibold text-text-primary">USD ($) - Official PayPal Demo Standard</span>
            </div>
          </div>
        </div>

        {/* AI Orchestrator Settings */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5EAF2]">
            <Bot className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">AI Provider & Orchestrator</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Provider</span>
                <span className="font-semibold text-text-primary">Google Gemini API</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF1FF] text-primary">
                {settings?.ai?.status === 'connected' ? 'Connected' : 'Deterministic Hybrid Mode'}
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Active Model</span>
              <span className="font-mono text-text-primary">{settings?.ai?.model || 'gemini-1.5-flash'}</span>
            </div>

            <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2] text-[11px] text-text-secondary leading-relaxed">
              When an API key is not supplied in backend <code className="text-primary font-mono">.env</code>, AEGIS PAY automatically executes in high-fidelity deterministic simulation mode with zero runtime disruptions.
            </div>
          </div>
        </div>

        {/* PayPal Sandbox Integration Card */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5EAF2]">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">PayPal Sandbox Integration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Mode</span>
                <span className="font-bold text-text-primary">Sandbox Testing Environment</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-status-success-soft text-status-success">
                {settings?.paypal?.isConfigured ? 'Live Sandbox API' : 'Sandbox Test Simulation'}
              </span>
            </div>

            <div>
              <span className="text-text-muted block text-[10px] uppercase font-bold">Client ID Status</span>
              <span className="font-mono text-text-secondary text-[11px]">
                {settings?.paypal?.clientIdMasked || 'Configured via backend .env'}
              </span>
            </div>

            <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2] text-[11px] text-text-secondary leading-relaxed">
              To test with your own PayPal Sandbox merchant account, insert <code className="text-primary font-mono">PAYPAL_CLIENT_ID</code> and <code className="text-primary font-mono">PAYPAL_CLIENT_SECRET</code> into <code className="text-primary font-mono">backend/.env</code>.
            </div>
          </div>
        </div>

        {/* Database & Persistence Health */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E5EAF2]">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Database & Ledger Health</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold">Database Engine</span>
                <span className="font-semibold text-text-primary">Atomic Ledger & Supabase SQL Ready</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-success-soft text-status-success">
                Healthy
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                <span className="text-text-muted text-[10px] block">Agents</span>
                <span className="font-bold text-text-primary">{settings?.database?.totalRecords?.agents || 5}</span>
              </div>
              <div className="p-2 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                <span className="text-text-muted text-[10px] block">Transactions</span>
                <span className="font-bold text-text-primary">{settings?.database?.totalRecords?.transactions || 1}</span>
              </div>
              <div className="p-2 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                <span className="text-text-muted text-[10px] block">Audit Records</span>
                <span className="font-bold text-text-primary">{settings?.database?.totalRecords?.auditLogs || 2}</span>
              </div>
            </div>

            <div className="text-[11px] text-text-muted">
              Supabase SQL migration file located at: <code className="text-primary font-mono">database/migrations/001_initial_schema.sql</code>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Data Reset Control */}
      <div className="neu-card p-6 border-2 border-[#E5EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Demo State Management</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Reset all agent tasks, temporary budget reservations, and security events back to the clean seed state for new evaluation runs.
          </p>
        </div>

        <button
          onClick={handleResetDemo}
          disabled={isResetting}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border border-[#E5EAF2] hover:border-status-danger text-status-danger text-xs font-bold shadow-sm transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isResetting ? 'Restoring...' : 'Reset Demo Data to Initial State'}</span>
        </button>
      </div>
    </div>
  );
};
