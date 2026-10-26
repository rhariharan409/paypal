# AEGIS PAY
### Autonomous AI Financial Trust, Security & Payment Governance Platform

> *"Your AI agents can make decisions. Only you control the money."*

AEGIS PAY is an enterprise-grade AI financial trust and autonomous payment governance platform. In an emerging world where autonomous AI agents research, shop, coordinate supply chains, and negotiate commerce, AEGIS PAY provides the independent governance layer that prevents prompt injections, budget manipulation, and unauthorized payment execution before any transaction can result in real money movement.

---

## 🌟 The Five Innovations

1. **AI Agent Manipulation & Injection Defense**
   - Intercepts untrusted external product metadata and reviews.
   - Detects adversarial prompt injection attacks (e.g. system overrides, budget expansion keywords, approval bypass flags).
   - Generates side-by-side **Original Intent vs Proposed Agent Action** diffs.
   - Executes deterministic hard blocks against compromised proposals.

2. **Cross-Agent Financial Permission & Coordination**
   - Central atomic shared budget ledger preventing race conditions and double-spending across multiple concurrent agents.
   - Supports role-specific budgets (Shopping: $20,000, Security: $10,000, Merchant Intel: $10,000, Finance: $15,000, Business: $5,000).
   - Atomic reservation locks (`reserved`, `consumed`, `released`).

3. **Purchase Truth & Merchant Intelligence Engine**
   - 7-Factor explainable trust scoring (0–100 scale):
     1. Identity consistency
     2. Description consistency
     3. Price anomaly index
     4. Review credibility
     5. Refund clarity
     6. Specification consistency
     7. Merchant reputation evidence
   - Clear distinction between verified cryptographic evidence vs unverified claims.

4. **Intelligent Financial Authorization & Deterministic Governance**
   - 10-point deterministic backend policy pipeline (evaluates spending caps, velocities, blacklisted vendors, and permission hierarchies).
   - Rule precedence: Hard policy constraints always override soft preferences; LLMs can never independently execute payments.
   - Instant **STOP ALL AGENTS (Emergency Stop)** circuit breaker.

5. **Autonomous Business Financial Intelligence (AI CFO)**
   - Predictive 7-day and 30-day cash flow projections modeled from real receivables and commitments.
   - Conversational AI CFO assistant answering liquidity and affordability questions (e.g., *"Can I afford a $30,000 inventory purchase?"*).
   - Automated accounts receivable tracking and PayPal invoice payment reminders.

---

## 🏗️ System Architecture

```
User Intent Prompt
       │
       ▼
[ AI Orchestrator ]
       │
       ├──► [ Shopping Agent ] ──────► Catalog Discovery
       │
       ├──► [ Security Agent ] ──────► Prompt Injection & Intent Deviation Sanitizer
       │                               (Blocks malicious external overrides)
       │
       ├──► [ Merchant Intel Agent ] ─► 7-Factor Seller Trust Scoring (0-100)
       │
       ├──► [ Finance Agent ] ───────► Atomic Shared Budget Reservation Lock
       │
       ▼
[ Central Governance Engine ]
       │
  (Evaluates 10-point policy pipeline: ALLOW / REVIEW / BLOCK)
       │
       ▼
[ Human Cryptographic Authorization ] ──► Payment Approval Center
       │
       ▼
[ PayPal Sandbox REST API ]
       │
  • POST /v2/checkout/orders (Create Order)
  • POST /v2/checkout/orders/{id}/capture (Capture Funds)
       │
       ▼
[ Immutable Append-Only Audit Ledger ] ──► Forensic Event Trail
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation
Clone the repository and install dependencies:

```bash
# Install root orchestration, backend and frontend dependencies
npm run install:all
```

Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Configuration
Copy the environment example in `backend`:
```bash
cp backend/.env.example backend/.env
```

Key environment settings:
- `PORT=5000`
- `PAYPAL_MODE=sandbox`
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`: Add your official PayPal Sandbox developer credentials. When left blank, AEGIS PAY runs in verified **Sandbox Test Simulation** mode.
- `GEMINI_API_KEY`: Optional Gemini AI API key for generative dynamic intent parsing.

### Launching Development Servers
Run both backend API (Port 5000) and frontend Vite application (Port 3000):

```bash
# From repository root
npm run dev
```

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Health**: `http://localhost:5000/api/health`

---

## 🧪 Interactive End-to-End Hackathon Demonstration (Section 21)

Judges can execute the master interactive demonstration with one click:

1. Click **"Run Master Demo"** in the top navigation bar.
2. Watch the live 7-step visual workflow execute:
   - **Step 1**: User intent recorded: *"Find the best programming laptop under $60,000. Only use trustworthy merchants. Do not purchase without my approval."*
   - **Step 2**: Shopping Agent crawls catalog offerings.
   - **Step 3**: Adversarial listing injected: **QuantumBook Stealth Pro ($75,000)** containing injected override instructions.
   - **Step 4**: Security Agent intercepts adversarial injection, displays side-by-side intent deviation diff, and hard blocks the malicious action.
   - **Step 5**: Shopping Agent cleanly falls back to safe candidate: **ThinkBook 15 Gen 4 ($54,999)**.
   - **Step 6**: Merchant Intelligence Agent verifies **Official TechRetail Direct** with 94/100 trust score.
   - **Step 7**: Finance Agent atomically reserves $54,999 in shared ledger.
   - **Step 8**: Governance Engine mandates explicit human authorization.
   - **Step 9**: Click **"Authorize & Capture via PayPal Sandbox"** to complete the payment capture and log the immutable forensic audit record.

---

## 📁 Repository Structure

```
aegis-pay/
├── backend/
│   ├── src/
│   │   ├── routes/              # Express REST API endpoints
│   │   ├── services/
│   │   │   ├── ai/              # Multi-agent orchestrator
│   │   │   ├── security/        # Prompt injection detector
│   │   │   ├── merchant/        # 7-factor trust scoring
│   │   │   ├── governance/      # 10-point policy engine
│   │   │   ├── payments/        # PayPal REST API integration
│   │   │   ├── business/        # AI CFO cash flow forecasting
│   │   │   └── audit/           # Immutable audit logging
│   │   ├── db/                  # Persistent store & atomic locking
│   │   └── types/               # TypeScript models
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI & layout components
│   │   ├── pages/               # All 10 core pages
│   │   ├── contexts/            # Global AppContext
│   │   ├── services/            # API client
│   │   └── types/               # TypeScript interfaces
├── database/
│   ├── migrations/              # Supabase 20-table SQL schema
│   └── seed/                    # Demo seed dataset
└── README.md
```

---

## 🔒 Security & Fintech Standards

- **Server-Only Credentials**: PayPal Client Secrets and AI API keys are never exposed in frontend bundles.
- **Fail-Closed Gate**: If security sanitization or policy validation fails, payment execution is blocked automatically.
- **Deterministic Supremacy**: LLMs advise; deterministic code authorizes; human users control the money.
