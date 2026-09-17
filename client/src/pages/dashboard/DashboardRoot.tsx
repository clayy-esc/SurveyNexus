import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/useToast';
import api from '../../lib/api';
import { Survey } from '../../types';
import { Plus, LayoutTemplate, Clock, Trash2, ArrowUpRight, Radio, FileText } from 'lucide-react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';

export const DashboardRoot: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchSurveys = useCallback(async () => {
    try {
      const res = await api.get('/surveys');
      setSurveys(res.data.surveys);
    } catch {
      addToast('Failed to load surveys', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const res = await api.post('/surveys', { title: 'New survey' });
      navigate(`/dashboard/${res.data.survey._id}/builder`);
    } catch {
      addToast('Failed to create survey', 'error');
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/surveys/${deleteId}`);
      addToast('Survey deleted', 'success');
      setSurveys(surveys.filter((s) => s._id !== deleteId));
    } catch {
      addToast('Failed to delete survey', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <AppShell>
      <div className="flex h-full flex-col space-y-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_15%,transparent)]" />
              Workspace overview
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your surveys</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Shape better questions, follow the signal, and keep every response in one considered workspace.</p>
          </div>
          <Button onClick={handleCreate} isLoading={isCreating} className="h-11 rounded-xl px-5 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Survey
          </Button>
        </div>

        {!isLoading && surveys.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="workspace-panel rounded-2xl border border-border p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between text-muted-foreground"><FileText className="h-5 w-5" /><span className="font-mono text-[10px] uppercase tracking-wider">Total</span></div>
              <p className="text-2xl font-extrabold">{surveys.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">surveys in workspace</p>
            </div>
            <div className="workspace-panel rounded-2xl border border-border p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between text-primary"><Radio className="h-5 w-5" /><span className="font-mono text-[10px] uppercase tracking-wider">Live</span></div>
              <p className="text-2xl font-extrabold">{surveys.filter((survey) => survey.status === 'published').length}</p>
              <p className="mt-1 text-xs text-muted-foreground">published and collecting</p>
            </div>
            <div className="workspace-panel col-span-2 rounded-2xl border border-border bg-[#fff7ed] p-4 sm:col-span-1 sm:p-5 dark:bg-[#30251b]">
              <div className="mb-4 flex items-center justify-between text-[#c2410c]"><Clock className="h-5 w-5" /><span className="font-mono text-[10px] uppercase tracking-wider">Focus</span></div>
              <p className="truncate text-sm font-extrabold">{surveys[0]?.title || 'Start a survey'}</p>
              <p className="mt-1 text-xs text-muted-foreground">most recently updated</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : surveys.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title="No surveys yet"
            description="Create your first survey to start collecting data. It's completely free and yours to own."
            action={
              <Button onClick={handleCreate} isLoading={isCreating}>
                <Plus className="w-4 h-4 mr-2" /> Create Survey
              </Button>
            }
          />
        ) : (
          <div className="dashboard-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Card key={survey._id} className="dashboard-card group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-border/80 bg-card/90" onClick={() => navigate(`/dashboard/${survey._id}/builder`)}>
                <div className={`h-1.5 w-full ${survey.status === 'published' ? 'bg-primary' : 'bg-[#f59e0b]'}`} />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1 flex-1 pr-4" title={survey.title}>
                      {survey.title}
                    </CardTitle>
                    <button 
                      aria-label={`Delete ${survey.title}`}
                      title="Delete survey"
                      className="absolute right-4 top-5 rounded-lg p-2 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(survey._id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-10">
                    {survey.description || 'No description yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between pb-6 pt-0">
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {new Date(survey.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    survey.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    survey.status === 'closed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {survey.status}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Survey"
        description="Are you sure you want to delete this survey? This action cannot be undone and will permanently delete all associated responses."
        confirmText="Delete Survey"
        isDestructive={true}
        requiredTypedConfirmation="DELETE"
      />
    </AppShell>
  );
};
