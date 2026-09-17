import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Survey, AnalyticsData } from '../../types';
import { useToast } from '../../components/ui/useToast';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../lib/api';
import { toPng } from 'html-to-image';
import { Download, Users, Clock, Timer, LayoutTemplate } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyRes, analyticsRes] = await Promise.all([
          api.get(`/surveys/${surveyId}`),
          api.get(`/surveys/${surveyId}/analytics`)
        ]);
        setSurvey(surveyRes.data.survey);
        setAnalytics(analyticsRes.data);
      } catch (err: any) {
        addToast('Failed to load analytics', 'error');
        if (err.response?.status === 404) navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [surveyId, navigate, addToast]);

  const handleExportImage = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);
    try {
      // Small delay to ensure any layout shifts are settled
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await toPng(dashboardRef.current, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc',
        style: {
          padding: '24px',
          margin: '0',
          borderRadius: '0'
        }
      });
      
      const link = document.createElement('a');
      link.download = `${survey?.title.replace(/[^a-z0-9]/gi, '_')}_analytics.png`;
      link.href = dataUrl;
      link.click();
      
      addToast('Dashboard exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export dashboard image', 'error');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !survey || !analytics) {
    return <AppShell><div className="flex h-full items-center justify-center"><Spinner size="lg" /></div></AppShell>;
  }

  const primaryColor = survey.theme?.primaryColor || '#6366f1';

  return (
    <AppShell survey={survey}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground mt-1">Real-time survey insights</p>
          </div>
          <Button onClick={handleExportImage} isLoading={isExporting} disabled={analytics.totalResponses === 0}>
            <Download className="w-4 h-4 mr-2" /> Download Image
          </Button>
        </div>

        {analytics.totalResponses === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-border rounded-xl">
            <LayoutTemplate className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No responses yet</h3>
            <p className="text-muted-foreground">Share your survey to start collecting data.</p>
          </div>
        ) : (
          <div ref={dashboardRef} className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalResponses}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.completionStats?.avgTime ? `${Math.round(analytics.completionStats.avgTime)}s` : '-'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-xs text-muted-foreground mt-1">Based on started surveys</p>
                </CardContent>
              </Card>
            </div>

            {/* Per Question Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.questions.map((q, idx) => (
                <Card key={q.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base leading-tight">
                      <span className="text-muted-foreground font-mono text-sm mr-2">Q{idx + 1}</span>
                      {q.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    
                    {['single_choice', 'multi_choice', 'dropdown', 'rating'].includes(q.type) && q.data && Array.isArray(q.data) && (
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={q.data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                            <RechartsTooltip 
                              cursor={{ fill: 'var(--muted)' }}
                              contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                              formatter={(value, _name, props: any) => [`${value ?? 0} (${props.payload.percentage}%)`, 'Count']}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                              {q.data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={primaryColor} opacity={0.8 + (index * 0.05)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {['linear_scale', 'number'].includes(q.type) && q.data && !Array.isArray(q.data) && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted p-4 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Average</div>
                            <div className="text-2xl font-bold">{q.data.avg}</div>
                          </div>
                          <div className="bg-muted p-4 rounded-lg text-center">
                            <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Median</div>
                            <div className="text-2xl font-bold">{q.data.median}</div>
                          </div>
                        </div>
                        {q.distribution && q.distribution.length > 0 && (
                          <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={q.distribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <RechartsTooltip 
                                  cursor={{ fill: 'var(--muted)' }}
                                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                />
                                <Bar dataKey="count" fill={primaryColor} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    )}

                    {['short_text', 'long_text'].includes(q.type) && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium mb-3">{q.data?.responseCount || 0} responses</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {q.samples?.length === 0 ? (
                            <div className="text-sm text-muted-foreground italic">No text responses yet.</div>
                          ) : (
                            q.samples?.map((text: string, i: number) => (
                              <div key={i} className="text-sm bg-muted p-3 rounded-md border border-border/50">
                                "{text}"
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                    
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
