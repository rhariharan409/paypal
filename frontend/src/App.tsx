import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { SecurityPage } from './pages/SecurityPage';
import { TrustPage } from './pages/TrustPage';
import { GovernancePage } from './pages/GovernancePage';
import { PaymentsPage } from './pages/PaymentsPage';
import { BusinessPage } from './pages/BusinessPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          {/* Public Auth & Onboarding */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected Application Shell */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="trust" element={<TrustPage />} />
            <Route path="governance" element={<GovernancePage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="business" element={<BusinessPage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
