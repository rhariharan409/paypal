// API Service for AEGIS PAY
import { 
  Agent, FinancialPolicy, PaymentRequest, 
  ProductItem, SecurityEvent, AuditLog, 
  NotificationItem, OrchestrationStep, UserProfile, Workspace
} from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || 'alex.vance@aegispay.fintech' })
    });
    return res.json();
  },

  async signup(data: any) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async completeOnboarding(data: any) {
    const res = await fetch(`${API_BASE}/auth/onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Dashboard
  async getDashboardOverview() {
    const res = await fetch(`${API_BASE}/dashboard/overview`);
    return res.json();
  },

  async getDashboardActivity() {
    const res = await fetch(`${API_BASE}/dashboard/activity`);
    return res.json();
  },

  // Agents
  async getAgents(): Promise<{ agents: Agent[] }> {
    const res = await fetch(`${API_BASE}/agents`);
    return res.json();
  },

  async getAgent(code: string) {
    const res = await fetch(`${API_BASE}/agents/${code}`);
    return res.json();
  },

  async pauseAgent(code: string) {
    const res = await fetch(`${API_BASE}/agents/${code}/pause`, { method: 'POST' });
    return res.json();
  },

  async resumeAgent(code: string) {
    const res = await fetch(`${API_BASE}/agents/${code}/resume`, { method: 'POST' });
    return res.json();
  },

  async revokeAgent(code: string) {
    const res = await fetch(`${API_BASE}/agents/${code}/revoke`, { method: 'POST' });
    return res.json();
  },

  // Tasks & Master Demo
  async executeMasterDemo(prompt?: string): Promise<{
    success: boolean;
    task: any;
    intent: any;
    securityCheck: any;
    merchantAssessment: any;
    policyResult: any;
    paymentRequest?: PaymentRequest;
    steps: OrchestrationStep[];
  }> {
    const res = await fetch(`${API_BASE}/tasks/execute-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    return res.json();
  },

  async executeBudgetConflictDemo() {
    const res = await fetch(`${API_BASE}/tasks/budget-conflict-demo`, {
      method: 'POST'
    });
    return res.json();
  },

  // Security
  async getSecurityOverview() {
    const res = await fetch(`${API_BASE}/security/overview`);
    return res.json();
  },

  async getSecurityEvents(): Promise<{ events: SecurityEvent[] }> {
    const res = await fetch(`${API_BASE}/security/events`);
    return res.json();
  },

  async analyzeSecurityLab(payload: {
    scenario?: string;
    customPrompt?: string;
    customSnippet?: string;
    proposedAmount?: number;
    proposedMerchant?: string;
  }) {
    const res = await fetch(`${API_BASE}/security/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Trust Engine
  async getProductCatalog(): Promise<{ products: ProductItem[] }> {
    const res = await fetch(`${API_BASE}/trust/catalog`);
    return res.json();
  },

  async assessProduct(payload: { productId?: string; merchantName?: string }) {
    const res = await fetch(`${API_BASE}/trust/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Governance & Policies
  async getFinancialPolicies(): Promise<{ policy: FinancialPolicy; agents: Agent[] }> {
    const res = await fetch(`${API_BASE}/governance`);
    return res.json();
  },

  async updateFinancialPolicy(updates: Partial<FinancialPolicy>) {
    const res = await fetch(`${API_BASE}/governance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async evaluateGovernance(payload: any) {
    const res = await fetch(`${API_BASE}/governance/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async triggerEmergencyStop(active: boolean) {
    const res = await fetch(`${API_BASE}/governance/emergency-stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
    return res.json();
  },

  async getBudgetLedger() {
    const res = await fetch(`${API_BASE}/governance/budget-ledger`);
    return res.json();
  },

  // Payments & PayPal
  async getPayments() {
    const res = await fetch(`${API_BASE}/payments`);
    return res.json();
  },

  async getPayment(id: string) {
    const res = await fetch(`${API_BASE}/payments/${id}`);
    return res.json();
  },

  async approvePayment(id: string) {
    const res = await fetch(`${API_BASE}/payments/${id}/approve`, {
      method: 'POST'
    });
    return res.json();
  },

  async rejectPayment(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/payments/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  // Business / AI CFO
  async getBusinessOverview() {
    const res = await fetch(`${API_BASE}/business/overview`);
    return res.json();
  },

  async getCashFlow(days: 7 | 30 = 7) {
    const res = await fetch(`${API_BASE}/business/cashflow?days=${days}`);
    return res.json();
  },

  async askCFO(question: string) {
    const res = await fetch(`${API_BASE}/business/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    return res.json();
  },

  async getInvoices() {
    const res = await fetch(`${API_BASE}/business/invoices`);
    return res.json();
  },

  async sendInvoiceReminder(id: string) {
    const res = await fetch(`${API_BASE}/business/invoices/${id}/remind`, {
      method: 'POST'
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params?: { eventType?: string; agentCode?: string; search?: string }): Promise<{ logs: AuditLog[]; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/audit?${query}`);
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/settings/reset-demo`, {
      method: 'POST'
    });
    return res.json();
  }
};
