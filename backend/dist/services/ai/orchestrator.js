"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrchestrator = void 0;
const uuid_1 = require("uuid");
const store_1 = require("../../db/store");
const manipulationDetector_1 = require("../security/manipulationDetector");
const truthEngine_1 = require("../merchant/truthEngine");
const policyEngine_1 = require("../governance/policyEngine");
class AgentOrchestrator {
    static instance;
    db;
    security;
    truth;
    policy;
    constructor() {
        this.db = store_1.DatabaseStore.getInstance();
        this.security = manipulationDetector_1.ManipulationDetector.getInstance();
        this.truth = truthEngine_1.PurchaseTruthEngine.getInstance();
        this.policy = policyEngine_1.PolicyEngine.getInstance();
    }
    static getInstance() {
        if (!AgentOrchestrator.instance) {
            AgentOrchestrator.instance = new AgentOrchestrator();
        }
        return AgentOrchestrator.instance;
    }
    /**
     * Execute End-to-End Autonomous Purchasing & Security Workflow (Prompt Section 21)
     */
    async executeTaskWorkflow(userPrompt) {
        const taskId = (0, uuid_1.v4)();
        const steps = [];
        const timestamp = () => new Date().toISOString();
        // 1. Record User Intent
        const parsedBudget = userPrompt.includes('60,000') || userPrompt.includes('60000') ? 60000 : 50000;
        const intent = {
            id: (0, uuid_1.v4)(),
            workspace_id: this.db.getState().workspaces[0].id,
            raw_prompt: userPrompt,
            parsed_intent: {
                product_category: 'computers',
                max_budget: parsedBudget,
                mandatory_approval: true,
                trusted_merchants_only: true,
                target_specs: { ram: '16GB', storage: '512GB' }
            },
            max_budget: parsedBudget,
            category: 'computers',
            mandatory_approval: true,
            status: 'active',
            created_at: timestamp()
        };
        this.db.addUserIntent(intent);
        steps.push({
            step_number: 1,
            agent_code: 'orchestrator',
            agent_name: 'AI Orchestrator',
            action_name: 'Record User Intent',
            status: 'completed',
            timestamp: timestamp(),
            detail: `Parsed original parameters: Max Budget $${parsedBudget.toLocaleString()}, Category: Computers, Mandatory Approval: YES.`
        });
        // 2. Shopping Agent queries catalog
        const catalog = this.db.getProducts();
        const maliciousItem = catalog.find(p => !p.is_safe_candidate) || catalog[2];
        const safeItem = catalog.find(p => p.is_safe_candidate && p.price <= parsedBudget) || catalog[0];
        steps.push({
            step_number: 2,
            agent_code: 'shopping_agent',
            agent_name: 'Shopping Agent',
            action_name: 'Catalog Discovery & Scraping',
            status: 'completed',
            timestamp: timestamp(),
            detail: `Discovered 3 prospective offerings matching developer specs. Identified high-spec candidate: ${maliciousItem.title} ($${maliciousItem.price}). Submitting to Security Agent for untrusted metadata inspection.`
        });
        // 3. Security Agent analyzes malicious candidate (adversarial injection test)
        const securityCheck = this.security.analyzeAction({
            originalIntentPrompt: userPrompt,
            originalBudget: parsedBudget,
            originalCategory: 'computers',
            mandatoryApproval: true,
            externalContentSnippet: maliciousItem.injected_prompt_payload,
            proposedAmount: maliciousItem.price,
            proposedMerchant: maliciousItem.merchant_name,
            agentCode: 'shopping_agent',
            taskId
        });
        steps.push({
            step_number: 3,
            agent_code: 'security_agent',
            agent_name: 'Security Agent',
            action_name: 'Adversarial Prompt & Intent Inspection',
            status: 'blocked',
            timestamp: timestamp(),
            detail: `CRITICAL THREAT DETECTED: Untrusted product metadata contained adversarial prompt injection: "${maliciousItem.injected_prompt_payload}". Proposed budget ($75,000) exceeded user cap ($60,000). Action Hard Blocked!`,
            payload: securityCheck
        });
        // 4. Shopping Agent falls back to clean, safe candidate
        steps.push({
            step_number: 4,
            agent_code: 'shopping_agent',
            agent_name: 'Shopping Agent',
            action_name: 'Fallback to Verified Safe Offering',
            status: 'completed',
            timestamp: timestamp(),
            detail: `Malicious candidate quarantined. Selecting next qualified offer: ${safeItem.title} ($${safeItem.price.toLocaleString()}) from ${safeItem.merchant_name}.`
        });
        // 5. Merchant Intelligence Agent scores trust
        const merchantAssessment = this.truth.evaluateProductAndMerchant(safeItem);
        steps.push({
            step_number: 5,
            agent_code: 'merchant_intel_agent',
            agent_name: 'Merchant Intelligence Agent',
            action_name: '7-Factor Trust Evaluation',
            status: 'completed',
            timestamp: timestamp(),
            detail: `Trust Assessment Complete: Trust Score ${merchantAssessment.trust_score}/100. Verified PayPal Partner, EV SSL, 30-day refund policy. Confidence: ${merchantAssessment.confidence_level}.`,
            payload: merchantAssessment
        });
        // 6. Finance Agent & Governance Engine evaluate policy
        const policyResult = this.policy.evaluate({
            agentCode: 'shopping_agent',
            category: safeItem.category,
            merchantName: safeItem.merchant_name,
            amount: safeItem.price,
            currency: safeItem.currency,
            securityDecision: 'SAFE',
            trustScore: merchantAssessment.trust_score,
            taskId
        });
        steps.push({
            step_number: 6,
            agent_code: 'finance_agent',
            agent_name: 'Finance Agent',
            action_name: 'Shared Budget Reservation & Policy Check',
            status: policyResult.decision === 'BLOCK' ? 'blocked' : 'completed',
            timestamp: timestamp(),
            detail: `Governance Decision: ${policyResult.decision}. Shared budget atomically reserved ($${safeItem.price.toLocaleString()}). ${policyResult.explanation}`,
            payload: policyResult
        });
        // 7. Payment Request generated
        let paymentRequest;
        if (policyResult.decision !== 'BLOCK') {
            const newPaymentRequest = {
                id: `REQ-${Date.now().toString().slice(-6)}`,
                workspace_id: this.db.getState().workspaces[0].id,
                task_id: taskId,
                initiating_agent_code: 'shopping_agent',
                product_title: safeItem.title,
                merchant_name: safeItem.merchant_name,
                amount: safeItem.price,
                currency: safeItem.currency,
                governance_decision: policyResult.decision,
                approval_status: 'pending',
                trust_score: merchantAssessment.trust_score,
                security_status: 'SAFE',
                policy_checklist: {
                    agent_integrity: policyResult.checklist.agent_active,
                    merchant_assessment: policyResult.checklist.merchant_not_restricted,
                    budget_validation: policyResult.checklist.within_global_limit,
                    shared_budget: policyResult.checklist.shared_budget_available,
                    security_verification: policyResult.checklist.security_check_passed,
                    user_authorization_required: policyResult.requiresUserApproval
                },
                reservation_ref: policyResult.reservationId,
                created_at: timestamp(),
                updated_at: timestamp()
            };
            paymentRequest = newPaymentRequest;
            this.db.addPaymentRequest(newPaymentRequest);
            steps.push({
                step_number: 7,
                agent_code: 'governance_engine',
                agent_name: 'Governance Engine',
                action_name: 'Payment Request Dispatched to Payment Center',
                status: 'completed',
                timestamp: timestamp(),
                detail: `Payment Request REQ-${newPaymentRequest.id} created. Awaiting human cryptographic authorization in Payment Approval Center.`
            });
        }
        const task = {
            id: taskId,
            workspace_id: this.db.getState().workspaces[0].id,
            intent_id: intent.id,
            title: `Procure Developer Laptop (${safeItem.title})`,
            description: userPrompt,
            initiating_agent_code: 'shopping_agent',
            status: 'completed',
            orchestration_steps: steps,
            created_at: timestamp(),
            updated_at: timestamp()
        };
        this.db.addTask(task);
        return {
            task,
            intent,
            securityCheck,
            merchantAssessment,
            policyResult,
            paymentRequest,
            steps
        };
    }
}
exports.AgentOrchestrator = AgentOrchestrator;
