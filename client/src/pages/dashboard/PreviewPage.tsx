import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Spinner } from '../../components/ui/Spinner';
import { Survey } from '../../types';
import api from '../../lib/api';

export const PreviewPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!surveyId) return;
      try {
        const res = await api.get(`/surveys/${surveyId}`);
        setSurvey(res.data.survey);
      } catch {
        setSurvey(null);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  return (
    <AppShell survey={survey}>
      {!survey ? (
        <div className="h-full flex items-center justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="preview-height bg-muted/10 rounded-xl border border-border flex flex-col overflow-hidden">
          <div className="bg-muted px-4 py-2 border-b border-border text-sm text-center font-mono text-muted-foreground">
            Live Preview Mode (Responses will not be saved)
          </div>
          <div className="flex-1 w-full relative">
            {/* We reuse the public route inside an iframe for exact 1:1 preview representation */}
            <iframe 
              src={`/s/preview-${surveyId}?preview=true`}
              className="absolute inset-0 w-full h-full border-0"
              title="Survey Preview"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
};
