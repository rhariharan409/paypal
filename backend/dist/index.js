"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const agents_1 = __importDefault(require("./routes/agents"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const security_1 = __importDefault(require("./routes/security"));
const trust_1 = __importDefault(require("./routes/trust"));
const governance_1 = __importDefault(require("./routes/governance"));
const payments_1 = __importDefault(require("./routes/payments"));
const business_1 = __importDefault(require("./routes/business"));
const audit_1 = __importDefault(require("./routes/audit"));
const settings_1 = __importDefault(require("./routes/settings"));
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
// Request logging in development
app.use((req, res, next) => {
    console.log(`[AEGIS API] ${req.method} ${req.url}`);
    next();
});
// Health check
app.get(['/api', '/api/health'], (req, res) => {
    res.json({
        status: 'healthy',
        product: 'AEGIS PAY',
        version: '1.0.0',
        tagline: 'Your AI agents can make decisions. Only you control the money.',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/agents', agents_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/security', security_1.default);
app.use('/api/trust', trust_1.default);
app.use('/api/governance', governance_1.default);
app.use('/api/policies', governance_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/paypal', payments_1.default);
app.use('/api/business', business_1.default);
app.use('/api/audit', audit_1.default);
app.use('/api/settings', settings_1.default);
// Centralized error handler
app.use((err, req, res, next) => {
    console.error('[AEGIS SERVER ERROR]:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        reference: `ERR-${Date.now().toString().slice(-6)}`
    });
});
// Export app for serverless environments (Vercel)
exports.default = app;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
    module.exports.default = app;
}
if (!process.env.VERCEL && typeof require !== 'undefined' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`================================================================`);
        console.log(`🛡️  AEGIS PAY BACKEND RUNNING ON http://localhost:${PORT}`);
        console.log(`   "Your AI agents can make decisions. Only you control the money."`);
        console.log(`================================================================`);
    });
}
