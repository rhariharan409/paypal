"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManipulationDetector = void 0;
const uuid_1 = require("uuid");
const store_1 = require("../../db/store");
class ManipulationDetector {
    static instance;
    db;
    // Adversarial prompt injection keywords and bypass patterns
    injectionPatterns = [
        /ignore\s+(all\s+)?(previous|prior)\s+(user\s+)?instructions/i,
        /system\s+override/i,
        /increase\s+(the\s+)?budget/i,
        /do\s+not\s+(request|require)\s+(user\s+)?approval/i,
        /bypass\s+(governance|approval|security)/i,
        /autonomous\s+privilege/i,
        /execute\s+immediately/i,
        /do\s+not\s+notify/i,
        /disregard\s+(constraints|policy|limits)/i,
        /root\s+access|sudo\s+mode|dan\s+mode/i,
        /transfer\s+immediately/i
    ];
    constructor() {
        this.db = store_1.DatabaseStore.getInstance();
    }
    static getInstance() {
        if (!ManipulationDetector.instance) {
            ManipulationDetector.instance = new ManipulationDetector();
        }
        return ManipulationDetector.instance;
    }
    /**
     * Evaluates external untrusted metadata & agent actions against original user intent
     */
    analyzeAction(params) {
        const detectedThreats = [];
        const violatedRules = [];
        const deviations = [];
        // 1. Analyze external content for Prompt Injections
        if (params.externalContentSnippet) {
            for (const pattern of this.injectionPatterns) {
                if (pattern.test(params.externalContentSnippet)) {
                    detectedThreats.push(`Malicious instruction pattern detected: "${pattern.source}"`);
                    violatedRules.push('RULE_SEC_01_PROMPT_INJECTION_DEFENSE');
                }
            }
        }
        // 2. Intent Deviation Check: Budget limit
        const budgetExceeded = params.proposedAmount > params.originalBudget;
        deviations.push({
            field: 'Transaction Budget',
            original: `$${params.originalBudget.toLocaleString()}`,
            proposed: `$${params.proposedAmount.toLocaleString()}`,
            isViolation: budgetExceeded
        });
        if (budgetExceeded) {
            detectedThreats.push(`Proposed amount ($${params.proposedAmount}) exceeds user-stipulated cap ($${params.originalBudget})`);
            violatedRules.push('RULE_GOV_02_USER_BUDGET_CAP_EXCEEDED');
        }
        // 3. Merchant restriction check
        const restrictedMerchants = ['ShadyDeals Global Outlet', 'QuickPhishMall', 'ScamDepot'];
        const isRestrictedMerchant = restrictedMerchants.some(m => m.toLowerCase() === params.proposedMerchant.toLowerCase());
        deviations.push({
            field: 'Merchant Credibility',
            original: 'Verified / Trustworthy Merchant Only',
            proposed: params.proposedMerchant,
            isViolation: isRestrictedMerchant
        });
        if (isRestrictedMerchant) {
            detectedThreats.push(`Selected merchant '${params.proposedMerchant}' is on global high-risk blacklist.`);
            violatedRules.push('RULE_SEC_03_RESTRICTED_MERCHANT_HIJACK');
        }
        // 4. Determine final decision
        let decision = 'SAFE';
        let severity = 'LOW';
        if (detectedThreats.length > 0) {
            if (violatedRules.includes('RULE_SEC_01_PROMPT_INJECTION_DEFENSE') || isRestrictedMerchant || budgetExceeded) {
                decision = 'BLOCKED';
                severity = 'CRITICAL';
            }
            else {
                decision = 'SUSPICIOUS';
                severity = 'MEDIUM';
            }
        }
        const explanation = decision === 'BLOCKED'
            ? `HARD STOP: Adversarial manipulation and policy violations identified. The agent proposed an action contradicting original user parameters (${detectedThreats.join('; ')}).`
            : decision === 'SUSPICIOUS'
                ? `WARNING: Discrepancies detected between user instructions and external content. Requires elevated scrutiny.`
                : `CLEAN: Proposed action complies with user intent and external content contains no adversarial instructions.`;
        let securityEvent;
        if (decision !== 'SAFE') {
            securityEvent = {
                id: (0, uuid_1.v4)(),
                workspace_id: this.db.getState().workspaces[0].id,
                task_id: params.taskId,
                agent_code: params.agentCode,
                threat_type: decision === 'BLOCKED' ? 'Prompt Injection & Budget Override' : 'Intent Deviation Warning',
                severity,
                original_intent_ref: params.originalIntentPrompt,
                external_content_snippet: params.externalContentSnippet,
                detected_manipulation: detectedThreats.join(' | '),
                violated_rule: violatedRules.join(', '),
                action_taken: decision === 'BLOCKED' ? 'BLOCKED' : 'FLAGGED',
                timestamp: new Date().toISOString()
            };
            this.db.addSecurityEvent(securityEvent);
            this.db.addAuditLog({
                workspace_id: this.db.getState().workspaces[0].id,
                event_id: `SEC-${Date.now().toString().slice(-6)}`,
                event_type: decision === 'BLOCKED' ? 'SECURITY_MANIPULATION_BLOCKED' : 'SECURITY_FLAG_RAISED',
                agent_code: params.agentCode,
                task_id: params.taskId,
                intent_reference: params.originalIntentPrompt,
                proposed_action: { amount: params.proposedAmount, merchant: params.proposedMerchant },
                security_result: `${decision}: ${detectedThreats.join('; ')}`,
                policy_result: 'PREVENTED_EXECUTION',
                final_outcome: decision === 'BLOCKED' ? 'BLOCKED' : 'REQUIRES_REVIEW',
                metadata: { violated_rules: violatedRules }
            });
        }
        return {
            decision,
            threatSeverity: severity,
            detectedThreats,
            violatedRules,
            intentDeviations: deviations,
            explanation,
            securityEvent
        };
    }
}
exports.ManipulationDetector = ManipulationDetector;
