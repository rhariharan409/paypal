import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, Bot, Send, Sparkles, 
  AlertTriangle, CheckCircle2, FileText, Bell, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { api } from '../services/api';
import { Invoice } from '../types';

export const BusinessPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [forecastDays, setForecastDays] = useState<7 | 30>(7);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // AI CFO Chat State
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'cfo'; text: string; metrics?: any }[]>([
    {
      sender: 'cfo',
      text: 'Good day, Alex. I am your autonomous AI CFO. I continuously monitor Vance Corp receivables, liabilities, and projected cash runway. How can I assist your treasury operations today?'
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  const loadBusinessData = async () => {
    try {
      const ov = await api.getBusinessOverview();
      setOverview(ov);
      const cf = await api.getCashFlow(forecastDays);
      setCashFlowData(cf.forecast || []);
      const inv = await api.getInvoices();
      setInvoices(inv.invoices || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBusinessData();
  }, [forecastDays]);

  const handleAskCFO = async (qText?: string) => {
    const promptToAsk = qText || question;
    if (!promptToAsk.trim()) return;

    setChatHistory(prev => [...prev, { sender: 'user', text: promptToAsk }]);
    setQuestion('');
    setIsAsking(true);

    try {
      const res = await api.askCFO(promptToAsk);
      setChatHistory(prev => [...prev, { sender: 'cfo', text: res.answer, metrics: res.metrics }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'cfo', text: 'Error connecting to financial forecasting engine.' }]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await api.sendInvoiceReminder(invoiceId);
      setReminderMessage(res.message);
      await loadBusinessData();
      setTimeout(() => setReminderMessage(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const cfoChips = [
    "Can I afford a $30,000 inventory purchase?",
    "Which invoices are overdue?",
    "How much money do I expect this week?",
    "Show upcoming cash-flow risks"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Business Financial Intelligence (AI CFO)
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Predictive treasury analytics, 7-day and 30-day cash flow projections, and conversational corporate finance intelligence.
        </p>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neu-card p-5 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Estimated Cash Position</span>
          <div className="text-xl font-bold text-text-primary tabular-nums">
            ${(overview?.estimatedCashPosition || 142500).toLocaleString()}
          </div>
          <span className="text-[10px] text-text-secondary block">Verified business reserves</span>
        </div>

        <div className="neu-card p-5 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Expected Receivables</span>
          <div className="text-xl font-bold text-status-success tabular-nums">
            ${(overview?.totalReceivables || 34500).toLocaleString()}
          </div>
          <span className="text-[10px] text-text-secondary block">Due across next 7-14 days</span>
        </div>

        <div className="neu-card p-5 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Upcoming Liabilities</span>
          <div className="text-xl font-bold text-status-warning tabular-nums">
            ${(overview?.upcomingLiabilities || 48500).toLocaleString()}
          </div>
          <span className="text-[10px] text-text-secondary block">Payroll & SaaS commitments</span>
        </div>

        <div className="neu-card p-5 space-y-1">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Overdue Invoices</span>
          <div className="text-xl font-bold text-status-danger tabular-nums">
            ${(overview?.totalOverdue || 18200).toLocaleString()}
          </div>
          <span className="text-[10px] text-status-danger font-semibold flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Requires Collection</span>
          </span>
        </div>
      </div>

      {/* Cash Flow Projection Chart */}
      <div className="neu-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Projected Corporate Cash Runway
            </h3>
            <p className="text-xs text-text-secondary">
              Predictive simulation combining scheduled accounts receivable inflows against operating liabilities
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#F0F4FA] p-1.5 rounded-xl border border-[#E5EAF2] shrink-0">
            <button
              onClick={() => setForecastDays(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                forecastDays === 7 ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              7-Day Forecast
            </button>
            <button
              onClick={() => setForecastDays(30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                forecastDays === 30 ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              30-Day Model
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2864E8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2864E8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAF2" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#718096' }} stroke="#E5EAF2" />
              <YAxis 
                tick={{ fontSize: 11, fill: '#718096' }} 
                stroke="#E5EAF2" 
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`} 
              />
              <Tooltip 
                formatter={(val: any) => [`$${val?.toLocaleString()}`, 'Projected Balance']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5EAF2', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="projectedBalance" 
                stroke="#2864E8" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#balanceGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI CFO Conversational Assistant & Invoice Manager Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: AI CFO Conversational Assistant */}
        <div className="neu-card p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Autonomous AI CFO Assistant</h3>
                <span className="text-[10px] text-text-secondary">Trained on real-time corporate ledger & commitments</span>
              </div>
            </div>

            {/* Chat Stream Box */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {chatHistory.map((msg, index) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-[#F0F4FA] border border-[#E5EAF2] text-text-primary rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-[#F0F4FA] text-xs text-text-muted flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    <span>AI CFO analyzing liquidity model...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {cfoChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskCFO(chip)}
                  className="px-2.5 py-1 rounded-lg bg-[#EAF1FF] text-primary hover:bg-primary hover:text-white transition-colors text-[10px] font-semibold"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="pt-3 border-t border-[#E5EAF2] flex items-center space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskCFO()}
              placeholder="Ask AI CFO regarding corporate liquidity or supplier expenses..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-white"
            />
            <button
              onClick={() => handleAskCFO()}
              disabled={isAsking || !question.trim()}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Col: Corporate Invoice & Receivables Center */}
        <div className="neu-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-text-primary">Corporate Invoice Management</h3>
              <p className="text-xs text-text-secondary">Accounts receivable & PayPal payment collection</p>
            </div>
          </div>

          {reminderMessage && (
            <div className="p-2.5 bg-status-success-soft border border-status-success/30 rounded-xl text-status-success text-xs font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{reminderMessage}</span>
            </div>
          )}

          <div className="divide-y divide-[#E5EAF2]">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-text-primary">{inv.invoice_number}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      inv.status === 'paid'
                        ? 'bg-status-success-soft text-status-success'
                        : inv.status === 'overdue'
                        ? 'bg-status-danger-soft text-status-danger'
                        : 'bg-status-warning-soft text-status-warning'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary block mt-0.5">
                    {inv.client_name} • Due: {inv.due_date}
                  </span>
                </div>

                <div className="text-right flex items-center space-x-3">
                  <span className="text-xs font-bold text-text-primary tabular-nums">
                    ${inv.amount.toLocaleString()} {inv.currency}
                  </span>

                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => handleSendReminder(inv.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#EAF1FF] text-primary hover:bg-primary hover:text-white transition-colors text-[10px] font-semibold flex items-center space-x-1"
                      title="Send Automated PayPal Reminder"
                    >
                      <Bell className="w-3 h-3" />
                      <span>Remind</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
