import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/documents': 'Document Hub',
  '/upload': 'Upload Certificate',
  '/verify': 'Verify Certificate',
  '/review': 'Review Panel',
};

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-900 overflow-hidden transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-mesh">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>
    </div>
  );
};
