import React, { useState } from 'react';
import { X, Send, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { api } from '../../services/api';

export const NewTaskModal: React.FC = () => {
  const { isNewTaskOpen, closeNewTask, refreshAgents, refreshNotifications } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isNewTaskOpen) return null;

  const quickPrompts = [
    "Find the best programming laptop under $60,000. Only use trustworthy merchants. Do not purchase without my approval.",
    "Order dual-monitor ergonomic desk arm for workstation upgrade under $15,000.",
    "Evaluate suppliers for developer workstation monitors and check return policies.",
    "Forecast 30-day cash flow and alert me on overdue invoices."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      await api.executeMasterDemo(prompt);
      await refreshAgents();
      await refreshNotifications();
      setSuccessMessage('Task dispatched to AI Orchestrator. Security & policy inspection completed!');
      setTimeout(() => {
        closeNewTask();
        setSuccessMessage(null);
        setPrompt('');
      }, 1800);
    } catch (err: any) {
      console.error('Task execution error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#182338]/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5EAF2] flex items-center justify-between bg-[#F0F4FA]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Dispatch New AI Task</h3>
              <p className="text-[11px] text-text-secondary">All actions pass through independent security & policy governance</p>
            </div>
          </div>
          <button onClick={closeNewTask} className="text-text-muted hover:text-text-primary p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-primary block mb-2">
              Natural Language Intent & Constraints
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Find the best developer workstation under $60,000. Check vendor trust ratings and require my explicit approval..."
              className="w-full p-3.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-2xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white transition-all leading-relaxed"
              required
            />
          </div>

          {/* Quick Prompt Chips */}
          <div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">
              Sample Demonstration Prompts
            </span>
            <div className="space-y-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(qp)}
                  className="w-full text-left p-2.5 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] border border-[#E5EAF2] text-[11px] text-text-primary hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{qp}</span>
                  <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {successMessage && (
            <div className="p-3 bg-status-success-soft border border-status-success/30 rounded-xl text-status-success text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeNewTask}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-[#F0F4FA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold neu-button disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Evaluating Intent...' : 'Submit Intent'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
