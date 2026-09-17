import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Survey } from '../../types';
import { useAuth } from '../../contexts/useAuth';

interface AppShellProps {
  children: React.ReactNode;
  survey?: Survey | null;
  onPublish?: () => void;
  isPublishing?: boolean;
  onUnpublish?: () => void;
  isUnpublishing?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, survey, onPublish, isPublishing, onUnpublish, isUnpublishing }) => {
  const { logout } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        surveyId={survey?._id}
        onLogout={logout}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          survey={survey}
          onPublish={onPublish}
          isPublishing={isPublishing}
          onUnpublish={onUnpublish}
          isUnpublishing={isUnpublishing}
          onMenuOpen={() => setIsMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto bg-transparent p-4 sm:p-6 lg:p-8">
          <div className="mx-auto h-full max-w-360">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
