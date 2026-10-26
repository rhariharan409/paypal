-- ====================================================================
-- AEGIS PAY - Autonomous AI Financial Trust, Security & Payment Governance
-- Supabase PostgreSQL Migration Script: 001_initial_schema.sql
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'admin',
    preferred_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'business')),
    currency TEXT DEFAULT 'USD',
    monthly_budget NUMERIC(15, 2) DEFAULT 100000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AGENTS
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'revoked')),
    current_task TEXT,
    assigned_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENT_PERMISSIONS
CREATE TABLE IF NOT EXISTS agent_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    max_single_transaction NUMERIC(15, 2) NOT NULL DEFAULT 5000.00,
    requires_approval_above NUMERIC(15, 2) NOT NULL DEFAULT 2000.00,
    allowed_categories JSONB DEFAULT '["electronics", "software", "office_supplies", "groceries", "travel"]',
    blocked_categories JSONB DEFAULT '["cryptocurrency", "gambling", "adult_services"]',
    restricted_merchants JSONB DEFAULT '["ShadyGadgets", "QuickPhishMall", "ScamDepot"]',
    can_reserve_budget BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FINANCIAL_POLICIES
CREATE TABLE IF NOT EXISTS financial_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    monthly_spending_limit NUMERIC(15, 2) DEFAULT 100000.00,
    daily_spending_limit NUMERIC(15, 2) DEFAULT 25000.00,
    max_single_transaction_limit NUMERIC(15, 2) DEFAULT 15000.00,
    high_risk_policy TEXT DEFAULT 'require_biometric_approval' CHECK (high_risk_policy IN ('auto_block', 'require_biometric_approval', 'double_sign')),
    emergency_stop_active BOOLEAN DEFAULT FALSE,
    emergency_stop_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. USER_INTENTS
CREATE TABLE IF NOT EXISTS user_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    raw_prompt TEXT NOT NULL,
    parsed_intent JSONB NOT NULL,
    max_budget NUMERIC(15, 2) NOT NULL,
    category TEXT,
    mandatory_approval BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'violated', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AGENT_TASKS
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    intent_id UUID REFERENCES user_intents(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    initiating_agent_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'failed')),
    orchestration_steps JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AGENT_ACTIONS
CREATE TABLE IF NOT EXISTS agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    proposed_payload JSONB NOT NULL,
    governance_decision TEXT CHECK (governance_decision IN ('ALLOW', 'REVIEW', 'BLOCK')),
    justification TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SECURITY_EVENTS
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
    agent_code TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    original_intent_ref TEXT,
    external_content_snippet TEXT,
    detected_manipulation TEXT NOT NULL,
    violated_rule TEXT NOT NULL,
    action_taken TEXT NOT NULL CHECK (action_taken IN ('FLAGGED', 'BLOCKED', 'QUARANTINED', 'MITIGATED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PRODUCT_CATALOG
CREATE TABLE IF NOT EXISTS product_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    merchant_name TEXT NOT NULL,
    specifications JSONB NOT NULL,
    warranty_info TEXT,
    refund_policy TEXT,
    is_safe_candidate BOOLEAN DEFAULT TRUE,
    injected_prompt_payload TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MERCHANT_ASSESSMENTS
CREATE TABLE IF NOT EXISTS merchant_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_name TEXT NOT NULL,
    trust_score INT NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
    identity_consistency_score INT,
    description_consistency_score INT,
    price_anomaly_score INT,
    review_credibility_score INT,
    refund_clarity_score INT,
    reputation_score INT,
    verified_evidence JSONB DEFAULT '[]',
    risk_factors JSONB DEFAULT '[]',
    recommendation TEXT NOT NULL,
    confidence_level TEXT DEFAULT 'HIGH',
    assessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BUDGET_RESERVATIONS
CREATE TABLE IF NOT EXISTS budget_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'consumed', 'released')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PAYMENT_REQUESTS
CREATE TABLE IF NOT EXISTS payment_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    governance_decision TEXT NOT NULL CHECK (governance_decision IN ('ALLOW', 'REVIEW', 'BLOCK')),
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
    trust_assessment_ref UUID REFERENCES merchant_assessments(id) ON DELETE SET NULL,
    security_event_ref UUID REFERENCES security_events(id) ON DELETE SET NULL,
    reservation_ref UUID REFERENCES budget_reservations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PAYMENT_APPROVALS
CREATE TABLE IF NOT EXISTS payment_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_request_id UUID REFERENCES payment_requests(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('APPROVED', 'REJECTED')),
    notes TEXT,
    ip_address TEXT,
    approved_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    payment_request_id UUID REFERENCES payment_requests(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    merchant_name TEXT NOT NULL,
    initiating_agent_code TEXT NOT NULL,
    lifecycle_state TEXT NOT NULL DEFAULT 'CREATED' CHECK (
        lifecycle_state IN (
            'CREATED', 'ANALYZING', 'VERIFIED', 'AUTHORIZATION_REQUIRED',
            'APPROVED', 'PAYPAL_ORDER_CREATED', 'PAYPAL_APPROVAL_PENDING',
            'CAPTURE_PENDING', 'COMPLETED', 'BLOCKED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'FAILED'
        )
    ),
    paypal_order_id TEXT,
    paypal_capture_id TEXT,
    paypal_payer_id TEXT,
    is_simulated_sandbox BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. BUSINESS_FINANCIALS
CREATE TABLE IF NOT EXISTS business_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    period_date DATE NOT NULL,
    expected_receivables NUMERIC(15, 2) DEFAULT 0.00,
    upcoming_liabilities NUMERIC(15, 2) DEFAULT 0.00,
    projected_balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
    paypal_invoice_id TEXT,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AUDIT_LOGS (Immutable Append-Only Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID,
    event_id TEXT UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event_type TEXT NOT NULL,
    agent_code TEXT,
    task_id UUID,
    intent_reference TEXT,
    proposed_action JSONB,
    security_result TEXT,
    policy_result TEXT,
    approval_reference TEXT,
    paypal_order_id TEXT,
    paypal_capture_id TEXT,
    final_outcome TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('security_alert', 'approval_required', 'agent_status', 'payment_success', 'payment_failed', 'budget_warning', 'business_alert')),
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'danger')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. INTEGRATION_SETTINGS
CREATE TABLE IF NOT EXISTS integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    ai_provider TEXT DEFAULT 'gemini',
    ai_model TEXT DEFAULT 'gemini-1.5-flash',
    ai_status TEXT DEFAULT 'demo_mode',
    paypal_mode TEXT DEFAULT 'sandbox',
    paypal_client_id_configured BOOLEAN DEFAULT FALSE,
    paypal_status TEXT DEFAULT 'ready_sandbox',
    db_status TEXT DEFAULT 'connected',
    last_health_check TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Configuration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Public read for product catalog
ALTER TABLE product_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product catalog" ON product_catalog FOR SELECT USING (true);
CREATE POLICY "Public read merchant assessments" ON merchant_assessments FOR SELECT USING (true);
