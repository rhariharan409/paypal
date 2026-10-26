import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, Search, Plus, Play, AlertOctagon, CheckCircle2, 
  ShieldAlert, CreditCard, ChevronRight, Check
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const TopNavbar: React.FC = () => {
  const location = useLocation();
  const { 
    activeWorkspace, 
    notifications, 
    unreadNotificationsCount, 
    markAllNotificationsRead,
    emergencyStopActive, 
    openMasterDemo, 
    openNewTask 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  // Generate breadcrumb from path
  const pathName = location.pathname;
  let pageTitle = 'Dashboard';
  if (pathName === '/agents') pageTitle = 'AI Agents';
  else if (pathName === '/security') pageTitle = 'Agent Security';
  else if (pathName === '/trust') pageTitle = 'Purchase Truth Engine';
  else if (pathName === '/governance') pageTitle = 'Financial Controls';
  else if (pathName === '/payments') pageTitle = 'Payment Center';
  else if (pathName === '/business') pageTitle = 'Business Intelligence';
  else if (pathName === '/audit') pageTitle = 'Activity & Audit';
  else if (pathName === '/settings') pageTitle = 'Settings';

  return (
    <header className="h-20 bg-white border-b border-[#E5EAF2] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Breadcrumbs & Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs font-medium text-text-muted">
          <span>{activeWorkspace?.name || 'Workspace'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-text-primary font-semibold">{pageTitle}</span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search agents, policies, transactions..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-[#F0F4FA] border border-[#E5EAF2] rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:bg-white transition-all"
        />
      </div>

      {/* Right Action Buttons & Controls */}
      <div className="flex items-center space-x-3">
        {/* Emergency Stop Status Badge */}
        {emergencyStopActive && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-status-danger-soft border border-status-danger/30 text-status-danger text-xs font-semibold">
            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Emergency Lock Active</span>
          </div>
        )}

        {/* Master Demo CTA Button */}
        <button
          onClick={openMasterDemo}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#EAF1FF] text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all text-xs font-semibold shadow-sm group"
          title="Run complete 20-step Section 21 demonstration"
        >
          <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" />
          <span>Run Master Demo</span>
        </button>

        {/* Global New AI Task Action */}
        <button
          onClick={openNewTask}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold neu-button"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New AI Task</span>
        </button>

        {/* Notification Bell with Flyout Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#F0F4FA] hover:bg-[#EAF1FF] border border-[#E5EAF2] flex items-center justify-center text-text-secondary hover:text-primary transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-danger ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5EAF2] rounded-2xl shadow-neu-card p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF2]">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-sm text-text-primary">Notifications</h4>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-primary hover:underline font-medium flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              </div>

              <div className="divide-y divide-[#E5EAF2] max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="py-3 flex space-x-3 items-start">
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'security_alert' ? (
                          <div className="w-7 h-7 rounded-lg bg-status-danger-soft text-status-danger flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                        ) : n.type === 'approval_required' ? (
                          <div className="w-7 h-7 rounded-lg bg-status-warning-soft text-status-warning flex items-center justify-center">
                            <CreditCard className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-status-success-soft text-status-success flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-text-primary block truncate">
                          {n.title}
                        </span>
                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-text-muted mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 text-center border-t border-[#E5EAF2]">
                <Link
                  to="/audit"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View full activity ledger →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
