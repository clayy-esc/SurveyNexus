import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { ArrowLeft, Menu, Share, ExternalLink, EyeOff } from 'lucide-react';
import { Survey } from '../../types';

interface TopbarProps {
  survey?: Survey | null;
  onPublish?: () => void;
  isPublishing?: boolean;
  onUnpublish?: () => void;
  isUnpublishing?: boolean;
  onMenuOpen?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ survey, onPublish, isPublishing, onUnpublish, isUnpublishing, onMenuOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex h-20 shrink-0 items-center justify-between border-b border-border bg-card/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center flex-1">
        {survey && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            title="Return to dashboard"
            aria-label="Return to dashboard"
            className="mr-3 h-9 w-9 shrink-0 rounded-xl border border-border/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open survey navigation"
          aria-expanded={Boolean(onMenuOpen)}
          aria-controls="survey-navigation"
          className="mr-3 inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        {survey ? (
          <div>
            <h1 className="survey-title-clamp truncate text-base font-extrabold leading-tight sm:text-lg">{survey.title}</h1>
            <div className="mt-1 flex items-center space-x-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                survey.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                survey.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {survey.status}
              </span>
              {survey.publicSlug && (
                <a 
                  href={`/s/${survey.publicSlug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[11px] font-semibold text-muted-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Public Link
                </a>
              )}
            </div>
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-muted-foreground">Dashboard</h1>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {survey && survey.status === 'draft' && onPublish && (
          <Button size="sm" onClick={onPublish} isLoading={isPublishing}>
            <Share className="w-4 h-4 mr-2" />
            Publish
          </Button>
        )}
        {survey && survey.status === 'published' && onUnpublish && (
          <Button size="sm" variant="outline" onClick={onUnpublish} isLoading={isUnpublishing}>
            <EyeOff className="w-4 h-4 mr-2" />
            Unpublish
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};
