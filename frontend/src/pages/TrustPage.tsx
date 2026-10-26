import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, ShieldCheck, AlertTriangle, Search, Filter, 
  ExternalLink, ArrowRight, ShieldAlert, Award, Star, Info, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { ProductItem, MerchantAssessment } from '../types';

export const TrustPage: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadCatalog = async () => {
    try {
      const data = await api.getProductCatalog();
      if (data?.products) {
        setProducts(data.products);
        setSelectedProduct(data.products[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.merchant_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const assessment = selectedProduct?.trustAssessment;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          Purchase Truth & Merchant Intelligence Engine
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          7-factor explainable trust scoring, adversarial listing detection, and cross-seller warranty verification.
        </p>
      </div>

      {/* Catalog Search & Filter Controls */}
      <div className="neu-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified hardware offerings or vendors..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F0F4FA] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 text-xs bg-[#F0F4FA] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">All Categories</option>
            <option value="computers">Developer Computers</option>
            <option value="office_supplies">Office Supplies</option>
          </select>
        </div>
      </div>

      {/* Main Comparison & Trust Score Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Offerings & Multi-Seller Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-text-primary">
            Curated Procurement Catalog & Sellers
          </h3>

          <div className="space-y-3">
            {filteredProducts.map((prod) => {
              const isSelected = selectedProduct?.id === prod.id;
              const isHighRisk = !prod.is_safe_candidate;
              const score = prod.trustAssessment?.trust_score || (isHighRisk ? 21 : 94);

              return (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProduct(prod)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-primary shadow-neu-elevated ring-2 ring-primary/20'
                      : 'bg-white border-[#E5EAF2] hover:border-primary/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-text-primary">{prod.title}</span>
                        {isHighRisk && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-status-danger text-white flex items-center space-x-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Adversarial Payload</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-text-secondary flex items-center space-x-3">
                        <span>Merchant: <strong className="text-text-primary">{prod.merchant_name}</strong></span>
                        <span>•</span>
                        <span className="capitalize">{prod.category}</span>
                      </div>

                      <p className="text-[11px] text-text-muted line-clamp-1">
                        Warranty: {prod.warranty_info || 'Standard Manufacturer'} • Refund: {prod.refund_policy}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                      <span className="text-base font-bold text-primary tabular-nums">
                        ${prod.price?.toLocaleString()} {prod.currency}
                      </span>
                      <div className="mt-1 flex items-center space-x-1">
                        <span className="text-[10px] text-text-muted">Trust:</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                          score >= 80 
                            ? 'bg-status-success-soft text-status-success' 
                            : score >= 50 
                            ? 'bg-status-warning-soft text-status-warning' 
                            : 'bg-status-danger-soft text-status-danger'
                        }`}>
                          {score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Deep 7-Factor Trust Assessment */}
        <div className="neu-card p-6 space-y-5">
          {selectedProduct && assessment ? (
            <>
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Explainable Merchant Verification
                </span>
                <h4 className="text-base font-bold text-text-primary mt-1">
                  {selectedProduct.merchant_name}
                </h4>
              </div>

              {/* Big Score Gauge */}
              <div className="p-4 rounded-2xl bg-[#F0F4FA] border border-[#E5EAF2] flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-text-secondary block">Overall Trust Index</span>
                  <span className="text-3xl font-extrabold text-primary tabular-nums mt-0.5 block">
                    {assessment.trust_score}/100
                  </span>
                  <span className="text-[10px] text-text-muted mt-0.5 block font-semibold">
                    Confidence: {assessment.confidence_level}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  {assessment.trust_score >= 80 ? (
                    <Award className="w-8 h-8 text-status-success" />
                  ) : (
                    <ShieldAlert className="w-8 h-8 text-status-danger" />
                  )}
                </div>
              </div>

              {/* 7-Factor Detailed Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-text-primary block">
                  7-Factor Forensic Score Breakdown
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-text-secondary">Identity Consistency</span>
                      <span className="font-bold text-text-primary">{assessment.identity_consistency_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${assessment.identity_consistency_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-text-secondary">Description Integrity</span>
                      <span className="font-bold text-text-primary">{assessment.description_consistency_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${assessment.description_consistency_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-text-secondary">Price Anomaly Index</span>
                      <span className="font-bold text-text-primary">{assessment.price_anomaly_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${assessment.price_anomaly_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-text-secondary">Review Credibility</span>
                      <span className="font-bold text-text-primary">{assessment.review_credibility_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${assessment.review_credibility_score}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-text-secondary">Refund Policy Transparency</span>
                      <span className="font-bold text-text-primary">{assessment.refund_clarity_score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${assessment.refund_clarity_score}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Evidence Box */}
              <div>
                <span className="text-[11px] font-bold text-text-primary block mb-1.5">
                  Verified Merchant Evidence
                </span>
                <div className="space-y-1">
                  {assessment.verified_evidence.map((ev: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] text-text-secondary">
                      <CheckCircle className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors if any */}
              {assessment.risk_factors?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-status-danger block mb-1.5">
                    Identified Risk Factors
                  </span>
                  <div className="space-y-1">
                    {assessment.risk_factors.map((rf: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-[11px] text-status-danger">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{rf}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation Note */}
              <div className="p-3 bg-[#F0F4FA] rounded-xl border border-[#E5EAF2] text-[11px] leading-relaxed">
                <span className="font-bold text-text-primary block mb-0.5">Recommendation:</span>
                <p className="text-text-secondary">{assessment.recommendation}</p>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-xs text-text-muted">
              Select an item on the left to inspect merchant evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
