import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MasterDemoModal } from '../modals/MasterDemoModal';
import { NewTaskModal } from '../modals/NewTaskModal';
import { EmergencyStopModal } from '../modals/EmergencyStopModal';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-64 min-w-0 transition-all duration-300">
        <TopNavbar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <MasterDemoModal />
      <NewTaskModal />
      <EmergencyStopModal />
    </div>
  );
};
