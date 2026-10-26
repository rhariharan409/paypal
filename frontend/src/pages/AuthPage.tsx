import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('alex.vance@aegispay.fintech');
  const [password, setPassword] = useState('DemoSecurePass2026!');
  const [fullName, setFullName] = useState('Alex Vance');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await api.login(email);
        navigate('/');
      } else {
        await api.signup({ email, full_name: fullName });
        navigate('/onboarding');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    try {
      await api.login('alex.vance@aegispay.fintech');
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-[#E5EAF2] rounded-3xl shadow-neu-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-neu-primary">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            AEGIS PAY
          </h1>
          <p className="text-xs text-text-secondary">
            "Your AI agents can make decisions. Only you control the money."
          </p>
        </div>

        {/* Demo One-Click Access Button */}
        <button
          onClick={handleQuickDemoLogin}
          type="button"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-[#EAF1FF] border border-primary/20 text-primary font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Quick Demo Access (Alex Vance - Admin)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E5EAF2] w-full"></div>
          <span className="bg-white px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider absolute">
            Or Sign In Manually
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-text-primary block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-white"
                placeholder="Alex Vance"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-white"
                placeholder="alex.vance@aegispay.fintech"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-primary block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#F5F7FB] border border-[#E5EAF2] rounded-xl text-text-primary focus:outline-none focus:border-primary focus:bg-white"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold neu-button flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Authenticating...' : isLogin ? 'Sign In to Command Center' : 'Create Free Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="text-center text-xs text-text-secondary">
          {isLogin ? (
            <span>
              Don't have an enterprise account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-primary font-semibold hover:underline"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already configured?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
