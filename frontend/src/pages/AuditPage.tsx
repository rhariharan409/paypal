import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, ShieldCheck, ShieldAlert, CreditCard, 
  Bot, Lock, CheckCircle2, XCircle, ArrowRight, ExternalLink, X 
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    try {
      const data = await api.getAuditLogs({
        search,
        eventType: eventTypeFilter || undefined,
        agentCode: agentFilter || undefined
      });
      if (data?.logs) setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [search, eventTypeFilter, agentFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Immutable Activity & Audit Center
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Cryptographically referenced append-only ledger tracking all agent actions, prompt security interventions, and payment captures.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="neu-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Event ID, intent keywords, or outcome..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F0F4FA] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="p-2 text-xs bg-[#F0F4FA] border border-[#E5EAF2] rounded-xl text-text-primary font-medium"
          >
            <option value="">All Event Types</option>
            <option value="PAYPAL_PAYMENT_CAPTURED">Payment Captured</option>
            <option value="SECURITY_MANIPULATION_BLOCKED">Manipulation Blocked</option>
            <option value="PAYMENT_AUTHORIZATION_REJECTED">Authorization Rejected</option>
            <option value="AGENT_PAUSED">Agent Paused</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="p-2 text-xs bg-[#F0F4FA] border border-[#E5EAF2] rounded-xl text-text-primary font-medium"
          >
            <option value="">All Agents</option>
            <option value="shopping_agent">Shopping Agent</option>
            <option value="security_agent">Security Agent</option>
            <option value="merchant_intel_agent">Merchant Intel</option>
            <option value="finance_agent">Finance Agent</option>
            <option value="business_agent">Business Agent</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">
            Verified Event Records ({logs.length})
          </h3>
          <span className="text-xs text-text-muted font-medium">
            Append-only: Agents cannot modify this history
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5EAF2] text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <th className="pb-3">Event ID</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Agent</th>
                <th className="pb-3">Security & Policy Trace</th>
                <th className="pb-3">Outcome</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF2]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isBlocked = log.final_outcome.includes('BLOCKED') || log.final_outcome.includes('PREVENTED');
                  const isSuccess = log.final_outcome.includes('SUCCESS');

                  return (
                    <tr key={log.id} className="hover:bg-[#F0F4FA] transition-colors">
                      <td className="py-3 font-mono text-[11px] font-bold text-text-primary">
                        {log.event_id}
                      </td>
                      <td className="py-3 text-text-secondary whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 font-semibold text-text-primary">
                        {log.event_type}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-text-secondary">
                        {log.agent_code || 'governance'}
                      </td>
                      <td className="py-3 text-text-secondary line-clamp-1 max-w-xs">
                        {log.security_result || log.policy_result || 'Verified compliant'}
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isBlocked 
                            ? 'bg-status-danger-soft text-status-danger' 
                            : isSuccess 
                            ? 'bg-status-success-soft text-status-success' 
                            : 'bg-status-info-soft text-status-info'
                        }`}>
                          {log.final_outcome}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          Deep Trace
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Event Trace Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182338]/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card w-full max-w-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-start justify-between border-b border-[#E5EAF2] pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">Audit Log Forensic Trace</h3>
                <span className="text-[10px] font-mono text-text-muted">{selectedLog.event_id} • {selectedLog.id}</span>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Event Type</span>
                  <span className="font-bold text-text-primary mt-0.5 block">{selectedLog.event_type}</span>
                </div>
                <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2]">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Outcome</span>
                  <span className="font-bold text-primary mt-0.5 block">{selectedLog.final_outcome}</span>
                </div>
              </div>

              {selectedLog.intent_reference && (
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Intent Reference</span>
                  <p className="bg-[#F0F4FA] p-3 rounded-xl border border-[#E5EAF2] text-text-primary font-medium">
                    {selectedLog.intent_reference}
                  </p>
                </div>
              )}

              {(selectedLog.paypal_order_id || selectedLog.paypal_capture_id) && (
                <div className="p-3 bg-[#EAF1FF] rounded-xl border border-primary/20 space-y-1">
                  <span className="text-[10px] text-primary uppercase font-bold block">PayPal Transaction References</span>
                  <div className="font-mono text-xs text-text-primary">
                    {selectedLog.paypal_order_id && <div>Order ID: {selectedLog.paypal_order_id}</div>}
                    {selectedLog.paypal_capture_id && <div>Capture ID: {selectedLog.paypal_capture_id}</div>}
                  </div>
                </div>
              )}

              {/* JSON Metadata Payload */}
              <div>
                <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Payload Metadata</span>
                <pre className="p-3 bg-[#182338] text-white rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-[#E5EAF2]">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-[#F0F4FA] text-text-primary text-xs font-semibold hover:bg-[#E5EAF2]"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
