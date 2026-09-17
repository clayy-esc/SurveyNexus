import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Survey } from '../../types';
import { useToast } from '../../components/ui/useToast';
import { Spinner } from '../../components/ui/Spinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import api from '../../lib/api';
import { ArrowRight, Layers3, Layout, Palette, Sparkles, Type } from 'lucide-react';

type ThemeDraft = {
  primaryColor: string;
  backgroundColor: string;
  lightPrimaryColor: string;
  lightBackgroundColor: string;
  darkPrimaryColor: string;
  darkBackgroundColor: string;
  fontFamily: string;
  layout: string;
};

const themeTemplates: Array<{
  id: string;
  name: string;
  description: string;
  swatches: string[];
  values: Pick<ThemeDraft, 'lightPrimaryColor' | 'lightBackgroundColor' | 'darkPrimaryColor' | 'darkBackgroundColor' | 'fontFamily'>;
}> = [
  {
    id: 'signal',
    name: 'Signal Studio',
    description: 'Teal, warm paper, and a focused editorial rhythm.',
    swatches: ['#0f766e', '#f4f7f5', '#f2b84b'],
    values: { lightPrimaryColor: '#0f766e', lightBackgroundColor: '#f4f7f5', darkPrimaryColor: '#f2b84b', darkBackgroundColor: '#101817', fontFamily: 'Manrope' },
  },
  {
    id: 'citrus',
    name: 'Citrus Field',
    description: 'Fresh green energy with a bright, optimistic surface.',
    swatches: ['#3f6212', '#f7fee7', '#bef264'],
    values: { lightPrimaryColor: '#3f6212', lightBackgroundColor: '#f7fee7', darkPrimaryColor: '#bef264', darkBackgroundColor: '#17200f', fontFamily: 'Manrope' },
  },
  {
    id: 'ink',
    name: 'Ink & Bloom',
    description: 'Cobalt accents, soft blush, and a confident editorial feel.',
    swatches: ['#4338ca', '#fff7f5', '#fda4af'],
    values: { lightPrimaryColor: '#4338ca', lightBackgroundColor: '#fff7f5', darkPrimaryColor: '#fda4af', darkBackgroundColor: '#1d1720', fontFamily: 'Merriweather' },
  },
];

export const ThemePage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [theme, setTheme] = useState<ThemeDraft>({
    primaryColor: '#6366f1',
    backgroundColor: '#ffffff',
    lightPrimaryColor: '#6366f1',
    lightBackgroundColor: '#ffffff',
    darkPrimaryColor: '#818cf8',
    darkBackgroundColor: '#0f172a',
    fontFamily: 'Inter',
    layout: 'single_page'
  });
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [selectedTemplate, setSelectedTemplate] = useState('custom');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await api.get(`/surveys/${surveyId}`);
        const s = res.data.survey;
        setSurvey(s);
        if (s.theme) {
          setTheme({
            primaryColor: s.theme.primaryColor || '#6366f1',
            backgroundColor: s.theme.backgroundColor || '#ffffff',
            lightPrimaryColor: s.theme.lightPrimaryColor || s.theme.primaryColor || '#6366f1',
            lightBackgroundColor: s.theme.lightBackgroundColor || s.theme.backgroundColor || '#ffffff',
            darkPrimaryColor: s.theme.darkPrimaryColor || '#818cf8',
            darkBackgroundColor: s.theme.darkBackgroundColor || '#0f172a',
            fontFamily: s.theme.fontFamily || 'Inter',
            layout: s.theme.layout || 'single_page'
          });
        }
      } catch {
        addToast('Failed to load theme settings', 'error');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurvey();
  }, [surveyId, navigate, addToast]);

  const previewPrimaryColor = previewMode === 'light' ? theme.lightPrimaryColor : theme.darkPrimaryColor;
  const previewBackgroundColor = previewMode === 'light' ? theme.lightBackgroundColor : theme.darkBackgroundColor;
  const previewSurfaceColor = previewMode === 'light' ? '#ffffff' : '#1e293b';
  const previewTextColor = previewMode === 'light' ? '#0f172a' : '#f8fafc';
  const previewMutedTextColor = previewMode === 'light' ? '#64748b' : '#cbd5e1';

  const handleSave = async () => {
    if (!survey) return;
    setIsSaving(true);
    try {
      const themeToSave = {
        ...theme,
        primaryColor: theme.lightPrimaryColor,
        backgroundColor: theme.lightBackgroundColor,
      };
      const res = await api.put(`/surveys/${survey._id}`, { theme: themeToSave });
      setSurvey(res.data.survey);
      setTheme(themeToSave);
      addToast('Theme saved successfully', 'success');
    } catch {
      addToast('Failed to save theme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const applyTemplate = (template: typeof themeTemplates[number]) => {
    setTheme({ ...theme, ...template.values, primaryColor: template.values.lightPrimaryColor, backgroundColor: template.values.lightBackgroundColor });
    setSelectedTemplate(template.id);
    setPreviewMode('light');
  };

  if (isLoading || !survey) {
    return <AppShell><div className="flex h-full items-center justify-center"><Spinner size="lg" /></div></AppShell>;
  }

  return (
    <AppShell survey={survey}>
      <div className="flex h-full gap-8">
        {/* Editor */}
        <div className="w-96 shrink-0 space-y-5 overflow-y-auto pb-8 pr-2">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Visual direction</div>
            <h2 className="text-3xl font-extrabold tracking-tight">Make it yours</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a starting point, then tune the details. The preview mirrors the published respondent view.</p>
          </div>

          <Card className="overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-border/70 pb-4">
              <CardTitle className="flex items-center text-base"><Layers3 className="mr-2 h-4 w-4 text-primary" /> Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {themeTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className={`w-full rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${selectedTemplate === template.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/60'}`}
                >
                  <span className="mb-2 flex items-center gap-1.5">
                    {template.swatches.map((swatch) => <span key={swatch} className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: swatch }} />)}
                  </span>
                  <span className="block text-sm font-bold">{template.name}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{template.description}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Palette className="w-5 h-5 mr-2" /> Colors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 rounded-md bg-muted p-1" role="tablist" aria-label="Theme mode">
                {(['light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={previewMode === mode}
                    onClick={() => setPreviewMode(mode)}
                    className={`flex-1 rounded px-3 py-2 text-sm font-medium capitalize transition-colors ${previewMode === mode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{previewMode === 'light' ? 'Light' : 'Dark'} Primary Color</label>
                <div className="flex gap-3">
                  <Input 
                    type="color" 
                    value={previewPrimaryColor} 
                    onChange={(e) => setTheme({ ...theme, [previewMode === 'light' ? 'lightPrimaryColor' : 'darkPrimaryColor']: e.target.value })} 
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    type="text" 
                    value={previewPrimaryColor} 
                    onChange={(e) => setTheme({ ...theme, [previewMode === 'light' ? 'lightPrimaryColor' : 'darkPrimaryColor']: e.target.value })}
                    className="uppercase font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{previewMode === 'light' ? 'Light' : 'Dark'} Background Color</label>
                <div className="flex gap-3">
                  <Input 
                    type="color" 
                    value={previewBackgroundColor} 
                    onChange={(e) => setTheme({ ...theme, [previewMode === 'light' ? 'lightBackgroundColor' : 'darkBackgroundColor']: e.target.value })} 
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input 
                    type="text" 
                    value={previewBackgroundColor} 
                    onChange={(e) => setTheme({ ...theme, [previewMode === 'light' ? 'lightBackgroundColor' : 'darkBackgroundColor']: e.target.value })}
                    className="uppercase font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Type className="w-5 h-5 mr-2" /> Typography
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                label="Font Family"
                value={theme.fontFamily}
                onChange={(e) => setTheme({...theme, fontFamily: e.target.value})}
                options={[
                  { label: 'Inter (Default)', value: 'Inter' },
                  { label: 'Roboto', value: 'Roboto' },
                  { label: 'Merriweather (Serif)', value: 'Merriweather' },
                  { label: 'Courier New (Mono)', value: 'Courier New' },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Layout className="w-5 h-5 mr-2" /> Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                label="Form Layout"
                value={theme.layout}
                onChange={(e) => setTheme({...theme, layout: e.target.value})}
                options={[
                  { label: 'Single Page (Scroll)', value: 'single_page' },
                  { label: 'One Question at a Time (No Scroll)', value: 'one_at_a_time' },
                ]}
              />
            </CardContent>
          </Card>

          <Button onClick={handleSave} isLoading={isSaving} className="w-full">Save Theme</Button>
        </div>

        {/* Live Preview Pane */}
        <div className="hidden flex-1 overflow-y-auto rounded-2xl border border-border bg-muted/30 p-5 lg:block lg:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Respondent view</p>
              <p className="mt-1 text-xs text-muted-foreground">Live preview · {previewMode} palette</p>
            </div>
            <div className="flex gap-1 rounded-xl bg-background p-1">
              {(['light', 'dark'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setPreviewMode(mode)} className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${previewMode === mode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>{mode}</button>
              ))}
            </div>
          </div>
          <div className="public-survey-card mx-auto max-w-3xl overflow-hidden rounded-[1.75rem] transition-all duration-300" style={{ backgroundColor: previewBackgroundColor, color: previewTextColor, fontFamily: theme.fontFamily }}>
            <div className="h-1.5" style={{ backgroundColor: previewPrimaryColor }} />
            <div className="p-6 sm:p-10">
              <div className="mb-7 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${previewPrimaryColor}18`, color: previewPrimaryColor }}><Sparkles className="h-4 w-4" /></div><div><p className="text-sm font-extrabold">{survey.title}</p><p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: previewMutedTextColor }}>Response workspace</p></div></div>
                <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: previewMutedTextColor }}>Progress</p><p className="font-mono text-xs font-bold" style={{ color: previewPrimaryColor }}>1 of 4</p></div>
              </div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: previewPrimaryColor }}>A few considered questions</p>
              <h1 className="text-3xl font-extrabold leading-tight">{survey.title}</h1>
              <p className="mt-3 mb-7 max-w-xl text-sm leading-6" style={{ color: previewMutedTextColor }}>{survey.description || 'Survey description goes here.'}</p>
              <div className="overflow-hidden rounded-3xl border" style={{ backgroundColor: previewSurfaceColor, borderColor: previewMode === 'light' ? '#e5e7eb' : '#334155' }}>
                <div className="p-6 sm:p-8">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: previewPrimaryColor }}>Question 1 of 4</p>
                  <h3 className="text-xl font-extrabold">{survey.questions[0]?.title || 'How would you describe your experience?'}</h3>
                  <div className="mt-6 space-y-2.5">
                    {['Option A', 'Option B', 'Option C'].map((opt, i) => <div key={opt} className="flex items-center rounded-2xl border-2 p-3" style={{ backgroundColor: i === 0 ? `${previewPrimaryColor}14` : previewSurfaceColor, borderColor: i === 0 ? previewPrimaryColor : previewMode === 'light' ? '#e5e7eb' : '#475569' }}><span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: i === 0 ? previewPrimaryColor : previewMode === 'light' ? '#d1d5db' : '#64748b' }}>{i === 0 && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: previewPrimaryColor }} />}</span><span className="text-sm font-semibold">{opt}</span></div>)}
                  </div>
                </div>
                {theme.layout === 'single_page' && (
                  <div className="border-t p-6 sm:p-8" style={{ borderColor: previewMode === 'light' ? '#e5e7eb' : '#334155' }}>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: previewPrimaryColor }}>Question 2 of 4</p>
                    <h3 className="text-xl font-extrabold">A second question appears below</h3>
                    <input type="text" className="mt-5 h-11 w-full rounded-xl px-4" style={{ backgroundColor: previewMode === 'light' ? '#ffffff' : '#0f172a', border: `1px solid ${previewMode === 'light' ? '#d1d5db' : '#475569'}`, color: previewTextColor }} placeholder="Your answer" />
                  </div>
                )}
                <div className="flex justify-end border-t px-6 py-4" style={{ backgroundColor: previewMode === 'light' ? '#f9fafb' : '#0f172a', borderColor: previewMode === 'light' ? '#e5e7eb' : '#334155' }}><button className="flex items-center rounded-xl px-5 py-2 text-sm font-bold text-white" style={{ backgroundColor: previewPrimaryColor }}>Next <ArrowRight className="ml-2 h-4 w-4" /></button></div>
              </div>
              <p className="mt-6 text-center text-[10px] font-semibold" style={{ color: previewMutedTextColor }}>Powered by SurveyNexus</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
