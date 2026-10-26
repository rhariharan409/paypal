import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Bot, ShieldAlert, CheckCircle, 
  Sliders, CreditCard, TrendingUp, History, Settings, 
  ChevronLeft, ChevronRight, AlertOctagon, Building2, User, ChevronDown
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace, 
    emergencyStopActive, 
    openEmergencyModal,
    user 
  } = useApp();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { path: '/agents', label: 'AI Agents', icon: Bot },
        { path: '/security', label: 'Agent Security', icon: ShieldAlert },
        { path: '/trust', label: 'Purchase Truth Engine', icon: CheckCircle }
      ]
    },
    {
      title: 'GOVERNANCE',
      items: [
        { path: '/governance', label: 'Financial Controls', icon: Sliders },
        { path: '/payments', label: 'Payment Center', icon: CreditCard }
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { path: '/business', label: 'Business Intelligence', icon: TrendingUp }
      ]
    },
    {
      title: 'TRANSPARENCY',
      items: [
        { path: '/audit', label: 'Activity & Audit', icon: History }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-white border-r border-[#E5EAF2] flex flex-col z-30 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 border-b border-[#E5EAF2] flex items-center justify-between px-5">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-neu-primary shrink-0">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-lg text-text-primary tracking-tight block truncate">
                AEGIS PAY
              </span>
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider block truncate">
                AI Financial Governance
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-[#F0F4FA] transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Workspace Switcher */}
      {!collapsed ? (
        <div className="p-3 border-b border-[#E5EAF2] relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] border border-[#E5EAF2] transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E5EAF2] flex items-center justify-center text-primary shrink-0">
                {activeWorkspace?.type === 'business' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold text-text-primary block truncate">
                  {activeWorkspace?.name || 'Workspace'}
                </span>
                <span className="text-[10px] text-text-secondary capitalize block">
                  {activeWorkspace?.type || 'personal'} Account
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
          </button>

          {showWorkspaceMenu && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-[#E5EAF2] rounded-xl shadow-neu-card p-1.5 z-50">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setShowWorkspaceMenu(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 p-2 rounded-lg text-xs transition-colors ${
                    activeWorkspace?.id === ws.id ? 'bg-primary-soft text-primary font-semibold' : 'text-text-primary hover:bg-[#F0F4FA]'
                  }`}
                >
                  {ws.type === 'business' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 flex justify-center border-b border-[#E5EAF2]">
          <div className="w-8 h-8 rounded-lg bg-[#F0F4FA] flex items-center justify-center text-primary">
            {activeWorkspace?.type === 'business' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
        </div>
      )}

      {/* Emergency Stop Banner in Sidebar */}
      {emergencyStopActive && (
        <div className="mx-3 mt-3 p-2 bg-status-danger-soft border border-status-danger/30 rounded-xl text-status-danger flex items-center space-x-2 animate-pulse">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="text-xs font-bold uppercase tracking-wider">
              Emergency Stop Active
            </span>
          )}
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-text-muted uppercase">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-neu-primary font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-[#F0F4FA]'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Emergency Stop Trigger & Profile */}
      <div className="p-3 border-t border-[#E5EAF2] space-y-3">
        <button
          onClick={openEmergencyModal}
          className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-bold tracking-wide transition-all ${
            emergencyStopActive
              ? 'bg-status-danger text-white border-status-danger shadow-neu-danger'
              : 'bg-status-danger-soft text-status-danger border-status-danger/30 hover:bg-status-danger hover:text-white'
          }`}
          title="Emergency Stop All AI Agents"
        >
          <AlertOctagon className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span>{emergencyStopActive ? 'RESUME AGENTS' : 'STOP ALL AGENTS'}</span>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pt-2">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="Alex Vance"
            className="w-8 h-8 rounded-full object-cover border border-[#E5EAF2] shrink-0"
          />
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-text-primary block truncate">
                {user?.full_name || 'Alex Vance'}
              </span>
              <span className="text-[10px] text-text-secondary block truncate">
                {user?.email || 'alex.vance@aegispay.fintech'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
