import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, NotificationItem, UserProfile, Workspace } from '../types';
import { api } from '../services/api';

interface AppContextType {
  user: UserProfile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  agents: Agent[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  emergencyStopActive: boolean;
  refreshAgents: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsRead: () => void;
  toggleEmergencyStop: (active: boolean) => Promise<void>;
  // Global Modals
  isMasterDemoOpen: boolean;
  openMasterDemo: () => void;
  closeMasterDemo: () => void;
  isNewTaskOpen: boolean;
  openNewTask: () => void;
  closeNewTask: () => void;
  isEmergencyModalOpen: boolean;
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alex.vance@aegispay.fintech',
    full_name: 'Alex Vance',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Enterprise Admin',
    preferred_currency: 'USD',
    created_at: new Date().toISOString()
  });

  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: '10000000-0000-0000-0000-000000000001',
      owner_id: '00000000-0000-0000-0000-000000000001',
      name: 'Personal Finance Vault',
      type: 'personal',
      currency: 'USD',
      monthly_budget: 100000.00,
      created_at: new Date().toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      owner_id: '00000000-0000-0000-0000-000000000001',
      name: 'Vance Corp Financial Operations',
      type: 'business',
      currency: 'USD',
      monthly_budget: 250000.00,
      created_at: new Date().toISOString()
    }
  ]);

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(workspaces[0]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emergencyStopActive, setEmergencyStopActive] = useState<boolean>(false);

  // Modals state
  const [isMasterDemoOpen, setIsMasterDemoOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const refreshAgents = async () => {
    try {
      const data = await api.getAgents();
      if (data?.agents) setAgents(data.agents);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  const refreshNotifications = async () => {
    try {
      const data = await api.getDashboardActivity();
      if (data?.notifications) setNotifications(data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const checkEmergencyState = async () => {
    try {
      const data = await api.getDashboardOverview();
      if (typeof data?.emergencyStopActive === 'boolean') {
        setEmergencyStopActive(data.emergencyStopActive);
      }
    } catch (err) {
      console.error('Error checking emergency state:', err);
    }
  };

  const toggleEmergencyStop = async (active: boolean) => {
    try {
      const res = await api.triggerEmergencyStop(active);
      setEmergencyStopActive(res.emergencyStopActive);
      await refreshAgents();
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to trigger emergency stop:', err);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  useEffect(() => {
    refreshAgents();
    refreshNotifications();
    checkEmergencyState();

    // Periodic gentle refresh every 15s
    const timer = setInterval(() => {
      refreshAgents();
      refreshNotifications();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        agents,
        notifications,
        unreadNotificationsCount,
        emergencyStopActive,
        refreshAgents,
        refreshNotifications,
        markAllNotificationsRead,
        toggleEmergencyStop,
        isMasterDemoOpen,
        openMasterDemo: () => setIsMasterDemoOpen(true),
        closeMasterDemo: () => setIsMasterDemoOpen(false),
        isNewTaskOpen,
        openNewTask: () => setIsNewTaskOpen(true),
        closeNewTask: () => setIsNewTaskOpen(false),
        isEmergencyModalOpen,
        openEmergencyModal: () => setIsEmergencyModalOpen(true),
        closeEmergencyModal: () => setIsEmergencyModalOpen(false),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
