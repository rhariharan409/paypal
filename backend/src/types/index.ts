// TypeScript Definitions for AEGIS PAY

export type LifecycleState = 
  | 'CREATED'
  | 'ANALYZING'
  | 'VERIFIED'
  | 'AUTHORIZATION_REQUIRED'
  | 'APPROVED'
  | 'PAYPAL_ORDER_CREATED'
  | 'PAYPAL_APPROVAL_PENDING'
  | 'CAPTURE_PENDING'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED';

export type GovernanceDecision = 'ALLOW' | 'REVIEW' | 'BLOCK';

export type AgentStatus = 'active' | 'paused' | 'revoked';

export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  preferred_currency: 'USD' | 'INR';
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  type: 'personal' | 'business';
  currency: 'USD' | 'INR';
  monthly_budget: number;
  created_at: string;
}

export interface Agent {
  id: string;
  workspace_id: string;
  name: string;
  code: string;
  role: string;
  description: string;
  status: AgentStatus;
  current_task: string;
  assigned_budget: number;
  permissions?: AgentPermission;
  created_at: string;
}

export interface AgentPermission {
  id: string;
  agent_id: string;
  max_single_transaction: number;
  requires_approval_above: number;
  allowed_categories: string[];
  blocked_categories: string[];
  restricted_merchants: string[];
  can_reserve_budget: boolean;
}

export interface FinancialPolicy {
  id: string;
  workspace_id: string;
  monthly_spending_limit: number;
  daily_spending_limit: number;
  max_single_transaction_limit: number;
  high_risk_policy: 'auto_block' | 'require_biometric_approval' | 'double_sign';
  emergency_stop_active: boolean;
  emergency_stop_timestamp?: string;
}

export interface UserIntent {
  id: string;
  workspace_id: string;
  raw_prompt: string;
  parsed_intent: {
    product_category?: string;
    max_budget: number;
    mandatory_approval: boolean;
    trusted_merchants_only: boolean;
    target_specs?: Record<string, any>;
  };
  max_budget: number;
  category?: string;
  mandatory_approval: boolean;
  status: 'active' | 'fulfilled' | 'violated' | 'cancelled';
  created_at: string;
}

export interface AgentTask {
  id: string;
  workspace_id: string;
  intent_id?: string;
  title: string;
  description?: string;
  initiating_agent_code: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  orchestration_steps: OrchestrationStep[];
  created_at: string;
  updated_at: string;
}

export interface OrchestrationStep {
  step_number: number;
  agent_code: string;
  agent_name: string;
  action_name: string;
  status: 'pending' | 'running' | 'completed' | 'blocked' | 'failed';
  timestamp: string;
  detail?: string;
  payload?: any;
}

export interface SecurityEvent {
  id: string;
  workspace_id: string;
  task_id?: string;
  agent_code: string;
  threat_type: string;
  severity: ThreatSeverity;
  original_intent_ref?: string;
  external_content_snippet?: string;
  detected_manipulation: string;
  violated_rule: string;
  action_taken: 'FLAGGED' | 'BLOCKED' | 'QUARANTINED' | 'MITIGATED';
  timestamp: string;
}

export interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  merchant_name: string;
  specifications: Record<string, any>;
  warranty_info?: string;
  refund_policy?: string;
  is_safe_candidate: boolean;
  injected_prompt_payload?: string;
}

export interface MerchantAssessment {
  id: string;
  merchant_name: string;
  trust_score: number;
  identity_consistency_score: number;
  description_consistency_score: number;
  price_anomaly_score: number;
  review_credibility_score: number;
  refund_clarity_score: number;
  reputation_score: number;
  verified_evidence: string[];
  risk_factors: string[];
  recommendation: string;
  confidence_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  assessed_at: string;
}

export interface BudgetReservation {
  id: string;
  workspace_id: string;
  agent_id: string;
  task_id: string;
  amount: number;
  currency: string;
  status: 'reserved' | 'consumed' | 'released';
  created_at: string;
}

export interface PaymentRequest {
  id: string;
  workspace_id: string;
  task_id?: string;
  agent_id?: string;
  initiating_agent_code: string;
  product_title: string;
  merchant_name: string;
  amount: number;
  currency: string;
  governance_decision: GovernanceDecision;
  approval_status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed';
  trust_score?: number;
  security_status?: string;
  reservation_ref?: string;
  policy_checklist?: {
    agent_integrity: boolean;
    merchant_assessment: boolean;
    budget_validation: boolean;
    shared_budget: boolean;
    security_verification: boolean;
    user_authorization_required: boolean;
  };
  paypal_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  payment_request_id?: string;
  amount: number;
  currency: string;
  merchant_name: string;
  initiating_agent_code: string;
  lifecycle_state: LifecycleState;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  paypal_payer_id?: string;
  is_simulated_sandbox: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  workspace_id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  currency: string;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paypal_invoice_id?: string;
  reminder_sent_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  workspace_id?: string;
  event_id: string;
  timestamp: string;
  event_type: string;
  agent_code?: string;
  task_id?: string;
  intent_reference?: string;
  proposed_action?: any;
  security_result?: string;
  policy_result?: string;
  approval_reference?: string;
  paypal_order_id?: string;
  paypal_capture_id?: string;
  final_outcome: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  workspace_id: string;
  title: string;
  message: string;
  type: 'security_alert' | 'approval_required' | 'agent_status' | 'payment_success' | 'payment_failed' | 'budget_warning' | 'business_alert';
  severity: 'info' | 'success' | 'warning' | 'danger';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}
