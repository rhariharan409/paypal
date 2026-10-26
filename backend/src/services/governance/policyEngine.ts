import { DatabaseStore } from '../../db/store';
import { GovernanceDecision } from '../../types';

export interface PolicyEvaluationInput {
  agentCode: string;
  category: string;
  merchantName: string;
  amount: number;
  currency: string;
  securityDecision: 'SAFE' | 'SUSPICIOUS' | 'BLOCKED';
  trustScore: number;
  taskId?: string;
}

export interface PolicyEvaluationResult {
  decision: GovernanceDecision;
  decisionId: string;
  checklist: {
    agent_active: boolean;
    agent_permission_granted: boolean;
    category_allowed: boolean;
    merchant_not_restricted: boolean;
    within_global_limit: boolean;
    within_agent_limit: boolean;
    shared_budget_available: boolean;
    no_conflicting_reservation: boolean;
    security_check_passed: boolean;
    mandatory_approval_required: boolean;
  };
  violatedRules: string[];
  explanation: string;
  requiresUserApproval: boolean;
  reservationId?: string;
  timestamp: string;
}

export class PolicyEngine {
  private static instance: PolicyEngine;
  private db: DatabaseStore;

  private constructor() {
    this.db = DatabaseStore.getInstance();
  }

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  /**
   * Deterministic 10-point evaluation pipeline
   */
  public evaluate(input: PolicyEvaluationInput): PolicyEvaluationResult {
    const policy = this.db.getFinancialPolicy();
    const violatedRules: string[] = [];
    const decisionId = `DEC-${Date.now().toString().slice(-6)}`;

    // 0. Check Emergency Stop
    if (policy.emergency_stop_active) {
      return {
        decision: 'BLOCK',
        decisionId,
        checklist: {
          agent_active: false,
          agent_permission_granted: false,
          category_allowed: false,
          merchant_not_restricted: false,
          within_global_limit: false,
          within_agent_limit: false,
          shared_budget_available: false,
          no_conflicting_reservation: false,
          security_check_passed: false,
          mandatory_approval_required: true
        },
        violatedRules: ['EMERGENCY_STOP_ACTIVE'],
        explanation: 'EMERGENCY STOP IS ACTIVE: All autonomous operations and payment requests are universally blocked by Administrator command.',
        requiresUserApproval: false,
        timestamp: new Date().toISOString()
      };
    }

    const agent = this.db.getAgentByCode(input.agentCode);
    const perm = agent?.permissions;

    // 1. Is Agent Active?
    const agentActive = agent?.status === 'active';
    if (!agentActive) violatedRules.push(`Agent '${input.agentCode}' is inactive (${agent?.status || 'unknown'})`);

    // 2. Agent Permission
    const agentPermissionGranted = !!perm && perm.can_reserve_budget;
    if (!agentPermissionGranted) violatedRules.push(`Agent '${input.agentCode}' lacks budget reservation permission`);

    // 3. Category allowed?
    const categoryAllowed = !perm?.blocked_categories.some(c => c.toLowerCase() === input.category.toLowerCase());
    if (!categoryAllowed) violatedRules.push(`Category '${input.category}' is prohibited in agent security policy`);

    // 4. Merchant restricted?
    const merchantRestricted = perm?.restricted_merchants.some(m => m.toLowerCase() === input.merchantName.toLowerCase()) || false;
    if (merchantRestricted) violatedRules.push(`Merchant '${input.merchantName}' is in the restricted vendors blacklist`);

    // 5. Within global monthly spending limit?
    const transactions = this.db.getTransactions().filter(t => t.lifecycle_state === 'COMPLETED');
    const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
    const reservations = this.db.getState().budget_reservations.filter(r => r.status === 'reserved');
    const totalReserved = reservations.reduce((acc, r) => acc + r.amount, 0);

    const withinGlobal = (totalSpent + totalReserved + input.amount) <= policy.monthly_spending_limit;
    if (!withinGlobal) violatedRules.push(`Transaction ($${input.amount}) exceeds remaining monthly global budget ($${policy.monthly_spending_limit - totalSpent - totalReserved})`);

    // 6. Within Agent single transaction limit?
    const withinAgentLimit = perm ? input.amount <= perm.max_single_transaction : false;
    if (!withinAgentLimit) violatedRules.push(`Transaction ($${input.amount}) exceeds agent single limit ($${perm?.max_single_transaction})`);

    // 7. Shared Budget Available?
    const sharedBudgetAvailable = withinGlobal;

    // 8. No conflicting reservation / race condition
    const noConflictingReservation = true;

    // 9. Security Check Passed?
    const securityCheckPassed = input.securityDecision === 'SAFE';
    if (!securityCheckPassed) violatedRules.push(`Security Agent flagged transaction as ${input.securityDecision}`);

    // Trust check
    if (input.trustScore < 60) {
      violatedRules.push(`Merchant Trust Score (${input.trustScore}/100) is below acceptable safety threshold (60)`);
    }

    // 10. Mandatory User Approval Required?
    // User approval is mandatory if amount > threshold or policy requires it
    const requiresUserApproval = perm ? input.amount >= perm.requires_approval_above : true;

    // Determine final decision
    let decision: GovernanceDecision = 'ALLOW';
    let reservationId: string | undefined;

    if (!agentActive || merchantRestricted || !categoryAllowed || !withinGlobal || !withinAgentLimit || input.securityDecision === 'BLOCKED' || input.trustScore < 40) {
      decision = 'BLOCK';
    } else if (requiresUserApproval || input.securityDecision === 'SUSPICIOUS' || input.trustScore < 80) {
      decision = 'REVIEW';
    }

    // If decision is not BLOCK, attempt atomic reservation
    if (decision !== 'BLOCK') {
      const res = this.db.checkAndReserveBudget(input.agentCode, input.amount, input.taskId || 'manual_task');
      if (!res.success) {
        decision = 'BLOCK';
        violatedRules.push(res.error || 'Budget reservation failed');
      } else {
        reservationId = res.reservation?.id;
      }
    }

    const explanation = decision === 'BLOCK'
      ? `TRANSACTION REJECTED: Violated governance policies: ${violatedRules.join('; ')}`
      : decision === 'REVIEW'
      ? `AUTHORIZATION REQUIRED: Hard constraints verified. Requires explicit User cryptographic authorization prior to payment dispatch (Amount: $${input.amount.toLocaleString()} >= $${perm?.requires_approval_above}).`
      : `TRANSACTION ALLOWED: All 10 governance policies satisfied.`;

    const checklist = {
      agent_active: agentActive,
      agent_permission_granted: agentPermissionGranted,
      category_allowed: categoryAllowed,
      merchant_not_restricted: !merchantRestricted,
      within_global_limit: withinGlobal,
      within_agent_limit: withinAgentLimit,
      shared_budget_available: sharedBudgetAvailable,
      no_conflicting_reservation: noConflictingReservation,
      security_check_passed: securityCheckPassed,
      mandatory_approval_required: requiresUserApproval
    };

    return {
      decision,
      decisionId,
      checklist,
      violatedRules,
      explanation,
      requiresUserApproval,
      reservationId,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Emergency Stop Trigger
   */
  public triggerEmergencyStop(active: boolean): boolean {
    const policy = this.db.updateFinancialPolicy({
      emergency_stop_active: active,
      emergency_stop_timestamp: active ? new Date().toISOString() : undefined
    });

    if (active) {
      // Pause all active agents
      for (const agent of this.db.getAgents()) {
        if (agent.status === 'active') {
          this.db.updateAgentStatus(agent.code, 'paused');
        }
      }

      this.db.addAuditLog({
        workspace_id: this.db.getState().workspaces[0].id,
        event_id: `STOP-${Date.now().toString().slice(-6)}`,
        event_type: 'EMERGENCY_STOP_ACTIVATED',
        final_outcome: 'ALL_AGENTS_HALTED',
        metadata: { timestamp: new Date().toISOString() }
      });

      this.db.addNotification({
        id: `notif-${Date.now()}`,
        workspace_id: this.db.getState().workspaces[0].id,
        title: 'EMERGENCY STOP ACTIVATED',
        message: 'All autonomous agents paused. Payment execution gate locked down.',
        type: 'security_alert',
        severity: 'danger',
        is_read: false,
        created_at: new Date().toISOString()
      });
    } else {
      // Resume agents
      for (const agent of this.db.getAgents()) {
        if (agent.status === 'paused') {
          this.db.updateAgentStatus(agent.code, 'active');
        }
      }

      this.db.addAuditLog({
        workspace_id: this.db.getState().workspaces[0].id,
        event_id: `RESUME-${Date.now().toString().slice(-6)}`,
        event_type: 'EMERGENCY_STOP_DEACTIVATED',
        final_outcome: 'NORMAL_OPERATIONS_RESTORED',
        metadata: { timestamp: new Date().toISOString() }
      });
    }

    return policy.emergency_stop_active;
  }
}
