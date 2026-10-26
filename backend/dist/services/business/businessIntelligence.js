"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessIntelligenceService = void 0;
const store_1 = require("../../db/store");
class BusinessIntelligenceService {
    static instance;
    db;
    constructor() {
        this.db = store_1.DatabaseStore.getInstance();
    }
    static getInstance() {
        if (!BusinessIntelligenceService.instance) {
            BusinessIntelligenceService.instance = new BusinessIntelligenceService();
        }
        return BusinessIntelligenceService.instance;
    }
    /**
     * Generates 7-day and 30-day cash-flow forecast models
     */
    getCashFlowForecast(days = 7) {
        const invoices = this.db.getInvoices();
        const baseBalance = 142500.00; // Verified business baseline reserve
        let currentBalance = baseBalance;
        const points = [];
        const now = new Date();
        for (let i = 0; i < days; i++) {
            const targetDate = new Date(now.getTime() + i * 86400000);
            const dateStr = targetDate.toISOString().split('T')[0];
            // Calculate scheduled inflows from pending invoices due on or around this day
            let dayInflow = 0;
            let dayOutflow = 2200.00 + (i % 3 === 0 ? 3500 : 800); // Standard operational amortized daily burn
            // Check matching invoices
            invoices.forEach(inv => {
                if (inv.due_date === dateStr && inv.status === 'pending') {
                    dayInflow += inv.amount;
                }
            });
            // Special scheduled inflows/outflows for demo realism
            if (i === 3)
                dayInflow += 24000; // Client milestone payment
            if (i === 5)
                dayOutflow += 12500; // Scheduled cloud server invoice
            currentBalance = currentBalance + dayInflow - dayOutflow;
            points.push({
                date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                inflow: Math.round(dayInflow),
                outflow: Math.round(dayOutflow),
                projectedBalance: Math.round(currentBalance),
                confidence: Math.max(70, Math.round(98 - (i * 0.8))) // Decays slightly into future
            });
        }
        return points;
    }
    getBusinessOverview() {
        const invoices = this.db.getInvoices();
        const pendingInvoices = invoices.filter(i => i.status === 'pending');
        const overdueInvoices = invoices.filter(i => i.status === 'overdue');
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const totalReceivables = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
        const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amount, 0);
        const upcomingLiabilities = 48500.00; // Scheduled supplier & operational expenses
        const estimatedCashPosition = 142500.00;
        return {
            estimatedCashPosition,
            totalReceivables,
            totalOverdue,
            upcomingLiabilities,
            invoiceSummary: {
                total: invoices.length,
                pendingCount: pendingInvoices.length,
                overdueCount: overdueInvoices.length,
                paidCount: paidInvoices.length
            },
            forecastRisk: totalOverdue > 15000 ? 'MODERATE' : 'LOW'
        };
    }
    /**
     * AI CFO Natural Language Intelligence
     */
    askCFO(question) {
        const q = question.toLowerCase();
        const overview = this.getBusinessOverview();
        const invoices = this.db.getInvoices();
        if (q.includes('afford') || q.includes('purchase') || q.includes('inventory')) {
            const match = question.match(/(\d+[\d,]*)/);
            const amount = match ? parseFloat(match[1].replace(/,/g, '')) : 30000;
            const netCashAfterLiabilities = overview.estimatedCashPosition - overview.upcomingLiabilities;
            if (amount <= netCashAfterLiabilities * 0.4) {
                return {
                    answer: `Yes, Vance Corp can safely afford the $${amount.toLocaleString()} purchase. Your current liquidity is $${overview.estimatedCashPosition.toLocaleString()}, with $${overview.upcomingLiabilities.toLocaleString()} in committed liabilities. Post-purchase reserve remains healthy at $${(netCashAfterLiabilities - amount).toLocaleString()}.`,
                    metrics: {
                        purchaseAmount: amount,
                        currentBalance: overview.estimatedCashPosition,
                        projectedPostPurchase: overview.estimatedCashPosition - amount,
                        riskAssessment: 'LOW'
                    },
                    recommendationAction: 'PROCEED_WITH_STANDARD_GOVERNANCE'
                };
            }
            else {
                return {
                    answer: `Caution advised: A $${amount.toLocaleString()} purchase would consume ${Math.round((amount / netCashAfterLiabilities) * 100)}% of your discretionary liquidity ahead of $${overview.upcomingLiabilities.toLocaleString()} in upcoming operational liabilities. We recommend awaiting collection of overdue invoice INV-2026-079 ($18,200) first.`,
                    metrics: {
                        purchaseAmount: amount,
                        availableDiscretionary: netCashAfterLiabilities,
                        recommendedThreshold: netCashAfterLiabilities * 0.4
                    },
                    recommendationAction: 'DEFER_OR_REQUIRE_EXECUTIVE_DOUBLE_SIGN'
                };
            }
        }
        if (q.includes('overdue') || q.includes('unpaid') || q.includes('customer')) {
            const overdue = invoices.filter(i => i.status === 'overdue');
            return {
                answer: `You currently have ${overdue.length} overdue invoice(s) totaling $${overview.totalOverdue.toLocaleString()}. Most urgent: ${overdue.map(i => `${i.invoice_number} from ${i.client_name} ($${i.amount.toLocaleString()}, due ${i.due_date})`).join('; ')}.`,
                metrics: {
                    overdueInvoices: overdue
                },
                recommendationAction: 'SEND_AUTOMATED_PAYPAL_REMINDER'
            };
        }
        if (q.includes('expect') || q.includes('receivable') || q.includes('this week')) {
            return {
                answer: `Over the next 7 days, Vance Corp expects $${overview.totalReceivables.toLocaleString()} in client receivables across ${overview.invoiceSummary.pendingCount} active invoices. The largest incoming payment is from Apex Cloud Solutions LLC ($34,500 due in 5 days).`,
                metrics: {
                    expectedInflows: overview.totalReceivables,
                    confidence: '94%'
                }
            };
        }
        // Default conversational response
        return {
            answer: `Based on current financial telemetry: Vance Corp maintains $${overview.estimatedCashPosition.toLocaleString()} in cash reserves, with $${overview.totalReceivables.toLocaleString()} expected receivables and $${overview.upcomingLiabilities.toLocaleString()} in upcoming liabilities. 30-day runway remains stable. How else can I assist with your financial planning?`,
            metrics: overview
        };
    }
}
exports.BusinessIntelligenceService = BusinessIntelligenceService;
