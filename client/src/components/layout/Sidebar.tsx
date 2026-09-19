import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, Eye, BarChart3, Palette, Settings, LogOut, X, Sparkles } from 'lucide-react';
import { SurveyNexusLogo } from '../common/SurveyNexusLogo';

interface SidebarProps {
  surveyId?: string;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ surveyId, onLogout, isMobileOpen = false, onMobileClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onMobileClose?.();
    };

    if (isMobileOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, onMobileClose]);

  const getNavLinks = () => {
    if (!surveyId) return [];
    const base = `/dashboard/${surveyId}`;
    return [
      { to: `${base}/builder`, icon: LayoutDashboard, label: 'Form Builder' },
      { to: `${base}/logic`, icon: FileSpreadsheet, label: 'Logic Flow' },
      { to: `${base}/preview`, icon: Eye, label: 'Preview' },
      { to: `${base}/analytics`, icon: BarChart3, label: 'Analytics' },
      { to: `${base}/submissions`, icon: FileSpreadsheet, label: 'Submissions' },
      { to: `${base}/theme`, icon: Palette, label: 'Theme' },
      { to: `${base}/settings`, icon: Settings, label: 'Settings' },
    ];
  };

  const navLinks = getNavLinks();

  const closeOnMobile = () => onMobileClose?.();

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close survey navigation"
          onClick={closeOnMobile}
          className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
        />
      )}
      <aside id="survey-navigation" aria-label="Survey navigation" className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 -translate-x-full flex-col border-r border-border bg-card/90 shadow-xl backdrop-blur-xl transition-transform duration-200 ease-out md:static md:w-64 md:translate-x-0 md:transition-none ${isMobileOpen ? 'translate-x-0' : ''}`}>
      <div className="h-20 flex items-center px-5 border-b border-border">
        <SurveyNexusLogo size={36} showText={true} subtitle="Signal Studio" interactive={true} />
        <button
          type="button"
          onClick={closeOnMobile}
          aria-label="Close survey navigation"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        {navLinks.length > 0 ? (
          <nav className="space-y-1">
            <div className="mb-3 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Survey Context
            </div>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeOnMobile}
                className={({ isActive }) =>
                  `group flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <link.icon className="mr-3 h-4.5 w-4.5 opacity-80 transition-transform group-hover:scale-110" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        ) : (
          <div className="mx-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-5 text-sm leading-6 text-muted-foreground">
            Select a survey to open its workspace.
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <button
          onClick={onLogout}
          type="button"
          className="flex min-h-11 w-full items-center rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut className="mr-3 h-5 w-5 opacity-75" />
          Log out
        </button>
      </div>
      </aside>
    </>
  );
};
