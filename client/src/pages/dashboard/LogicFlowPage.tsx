import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Survey, LogicRule } from '../../types';
import { useToast } from '../../components/ui/useToast';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { nanoid } from 'nanoid';
import api from '../../lib/api';
import { 
  ReactFlow, 
  Background, 
  Controls,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Trash2, Plus, GitMerge } from 'lucide-react';

const QuestionNode = ({ data }: { data: { title: string, isEnd: boolean, order: number } }) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-card border-2 ${data.isEnd ? 'border-green-500' : 'border-primary'}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-mono mb-1">
          {data.isEnd ? 'END' : `Q${data.order + 1}`}
        </span>
        <span className="font-semibold text-sm max-w-37.5 truncate">
          {data.title || 'Untitled Question'}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  );
};

const nodeTypes = { question: QuestionNode };

export const LogicFlowPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await api.get(`/surveys/${surveyId}`);
        setSurvey(res.data.survey);
      } catch {
        addToast('Failed to load survey', 'error');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSurvey();
  }, [surveyId, navigate, addToast]);

  useEffect(() => {
    if (!survey) return;

    // Generate nodes
    const generatedNodes: Node[] = survey.questions.map((q, i) => ({
      id: q.id,
      type: 'question',
      position: { x: 250, y: i * 150 + 50 },
      data: { title: q.title, isEnd: false, order: i },
    }));

    // Add End node
    generatedNodes.push({
      id: 'end',
      type: 'question',
      position: { x: 250, y: survey.questions.length * 150 + 50 },
      data: { title: 'Submit Survey', isEnd: true, order: -1 },
    });

    // Generate edges
    const generatedEdges: Edge[] = [];

    // Default sequential edges
    for (let i = 0; i < survey.questions.length; i++) {
      const q = survey.questions[i];
      // Check if this question has a custom logic rule that overrides default flow
      const hasRule = survey.logic?.find(r => r.sourceQuestionId === q.id);
      
      const targetId = i < survey.questions.length - 1 ? survey.questions[i+1].id : 'end';
      
      generatedEdges.push({
        id: `default-${q.id}-${targetId}`,
        source: q.id,
        target: targetId,
        type: 'smoothstep',
        animated: !hasRule,
        style: { stroke: hasRule ? 'var(--muted-foreground)' : 'var(--primary)', strokeWidth: hasRule ? 1 : 2, strokeDasharray: hasRule ? '5 5' : 'none' },
        markerEnd: { type: MarkerType.ArrowClosed, color: hasRule ? 'var(--muted-foreground)' : 'var(--primary)' },
      });
    }

    // Custom logic edges
    survey.logic?.forEach((rule) => {
      generatedEdges.push({
        id: rule.id,
        source: rule.sourceQuestionId,
        target: rule.targetQuestionId,
        type: 'smoothstep',
        label: `${rule.condition} ${rule.value}`,
        labelStyle: { fill: 'var(--primary)', fontWeight: 700 },
        labelBgStyle: { fill: 'var(--card)', fillOpacity: 0.94 },
        animated: true,
        style: { stroke: 'var(--primary)', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--primary)' },
      });
    });

    setNodes(generatedNodes);
    setEdges(generatedEdges);

  }, [survey, setNodes, setEdges]);

  const handleSave = async () => {
    if (!survey) return;
    setIsSaving(true);
    try {
      await api.put(`/surveys/${survey._id}`, { logic: survey.logic });
      addToast('Logic rules saved', 'success');
    } catch {
      addToast('Failed to save logic rules', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addRule = () => {
    if (!survey) return;
    const newRule: LogicRule = {
      id: nanoid(8),
      sourceQuestionId: survey.questions[0]?.id || '',
      condition: 'equals',
      value: '',
      targetQuestionId: 'end'
    };
    setSurvey({ ...survey, logic: [...(survey.logic || []), newRule] });
  };

  const updateRule = (id: string, updates: Partial<LogicRule>) => {
    if (!survey) return;
    setSurvey({
      ...survey,
      logic: survey.logic.map((r) => r.id === id ? { ...r, ...updates } : r)
    });
  };

  const removeRule = (id: string) => {
    if (!survey) return;
    setSurvey({
      ...survey,
      logic: survey.logic.filter((r) => r.id !== id)
    });
  };

  const questionOptions = useMemo(() => {
    if (!survey) return [];
    return survey.questions.map(q => ({ label: `Q${q.order + 1}: ${q.title}`, value: q.id }));
  }, [survey]);

  const targetOptions = useMemo(() => {
    if (!survey) return [];
    return [
      ...survey.questions.map(q => ({ label: `Q${q.order + 1}: ${q.title}`, value: q.id })),
      { label: 'End of Survey (Submit)', value: 'end' }
    ];
  }, [survey]);

  if (isLoading || !survey) {
    return <AppShell><div className="flex h-full items-center justify-center"><Spinner size="lg" /></div></AppShell>;
  }

  return (
    <AppShell survey={survey}>
      <div className="logic-flow-height flex gap-6">
        {/* Logic Rules Sidebar */}
        <div className="w-96 flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden shrink-0">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-semibold flex items-center">
              <GitMerge className="w-4 h-4 mr-2 text-primary" />
              Branching Logic
            </h3>
            <Button size="sm" onClick={handleSave} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!survey.logic || survey.logic.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No logic rules defined.<br/>Survey will follow sequential order.
              </div>
            ) : (
              survey.logic.map((rule) => (
                <Card key={rule.id} className="p-4 bg-muted/20 border-border shadow-none">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">If Answer To</label>
                      <Select 
                        value={rule.sourceQuestionId}
                        onChange={(e) => updateRule(rule.id, { sourceQuestionId: e.target.value })}
                        options={questionOptions}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select 
                          value={rule.condition}
                          onChange={(e) => updateRule(rule.id, { condition: e.target.value as any })}
                          options={[
                            { label: 'Equals', value: 'equals' },
                            { label: 'Not Equals', value: 'not_equals' },
                            { label: 'Contains', value: 'contains' },
                            { label: 'Greater Than', value: 'greater_than' },
                            { label: 'Less Than', value: 'less_than' },
                          ]}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <Input 
                          value={rule.value}
                          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                          placeholder="Enter a value"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Then Skip To</label>
                      <Select 
                        value={rule.targetQuestionId}
                        onChange={(e) => updateRule(rule.id, { targetQuestionId: e.target.value })}
                        options={targetOptions}
                        className="h-8 text-sm mt-1 border-primary/50 focus:border-primary"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)} className="h-7 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
            
            <Button variant="outline" className="w-full border-dashed" onClick={addRule}>
              <Plus className="w-4 h-4 mr-2" /> Add Logic Rule
            </Button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="logic-flow-canvas flex-1 rounded-2xl border border-border overflow-hidden relative shadow-inner">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="var(--border)" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </AppShell>
  );
};
