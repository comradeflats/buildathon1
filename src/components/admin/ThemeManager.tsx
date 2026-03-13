'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Plus, Loader2, Trash2, CheckCircle2, Circle, X, Info, LayoutGrid, Wand2, ArrowRight, Save, Lock, Minus, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Theme } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useVoting } from '@/context/VotingContext';
import { getThemeEmoji, ICON_KEYS, THEME_ICONS, ICON_COLORS } from '@/lib/themeIcons';

interface ThemeManagerProps {
  eventId: string;
  organizationId: string;
}

type CreationMode = 'selection' | 'ai' | 'manual';

export function ThemeManager({ eventId, organizationId }: ThemeManagerProps) {
  const { getFirebaseToken } = useAuth();
  const { showToast } = useVoting();
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [creationMode, setCreationMode] = useState<CreationMode | null>(null);
  const [roughIdea, setRoughIdea] = useState('');
  const [aiPreview, setAiPreview] = useState<Partial<Theme> | null>(null);
  const [manualForm, setManualForm] = useState<Partial<Theme>>({});

  const THEME_LIMIT = 5;
  const isAtLimit = themes.length >= THEME_LIMIT;

  useEffect(() => {
    fetchThemes();
  }, [eventId]);

  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}/themes`);
      const data = await response.json();
      if (data.themes) {
        setThemes(data.themes);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      showToast('Failed to load themes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (isGenerating || !roughIdea.trim()) return;
    
    try {
      setIsGenerating(true);
      const token = await getFirebaseToken();
      
      const response = await fetch(`/api/events/${eventId}/themes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idea: roughIdea, organizationId })
      });

      const data = await response.json();
      if (data.themes && data.themes.length > 0) {
        setAiPreview({
          ...data.themes[0],
          organizationId,
          isPublished: false,
          metadata: { generated: true }
        } as any);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showToast(error.message || 'Failed to generate theme', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTheme = async (themeData: Partial<Theme>) => {
    try {
      setIsSaving(true);
      const token = await getFirebaseToken();
      const response = await fetch(`/api/events/${eventId}/themes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...themeData, organizationId })
      });

      if (!response.ok) throw new Error('Failed to save theme');
      
      showToast('Theme added to event!', 'success');
      setCreationMode(null);
      setAiPreview(null);
      setRoughIdea('');
      fetchThemes();
    } catch (error) {
      showToast('Failed to save theme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (themeId: string, updates: Partial<Theme>) => {
    try {
      const token = await getFirebaseToken();
      const response = await fetch(`/api/events/${eventId}/themes/${themeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...updates, organizationId })
      });

      if (!response.ok) throw new Error('Failed to update theme');
      
      showToast('Theme updated!', 'success');
      fetchThemes();
    } catch (error) {
      showToast('Failed to update theme', 'error');
    }
  };

  const handleDelete = async (themeId: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    
    try {
      const token = await getFirebaseToken();
      const response = await fetch(`/api/events/${eventId}/themes/${themeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ organizationId })
      });

      if (!response.ok) throw new Error('Failed to delete theme');
      
      showToast('Theme removed', 'success');
      fetchThemes();
    } catch (error) {
      showToast('Failed to delete theme', 'error');
    }
  };

  const togglePublish = async (theme: Theme) => {
    await handleUpdate(theme.id, { isPublished: !theme.isPublished });
  };

  const startManual = () => {
    setManualForm({
      name: '',
      iconKey: 'sparkles',
      concept: '',
      judgingCriteria: [
        'Creative Interpretation: How unique was the approach to the theme?',
        'Visual Design: Is the interface visually appealing and polished?',
        'Usability: Is the app intuitive and easy to use?',
        'Utility Impact: Does the app solve the core problem effectively?',
        'The \'Ship\' Factor: How complete and polished is the prototype?'
      ]
    });
    setCreationMode('manual');
  };

  return (
    <div className="space-y-6">
      {/* Header with Slot Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Theme Management</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              {[...Array(THEME_LIMIT)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-8 rounded-full transition-colors ${i < themes.length ? 'bg-accent' : 'bg-zinc-800'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
              {themes.length} / {THEME_LIMIT} Slots Used
            </span>
          </div>
        </div>
        
        <Button 
          onClick={() => isAtLimit ? showToast('Upgrade coming soon for more theme slots!', 'info') : setCreationMode('selection')}
          disabled={isAtLimit}
          className={isAtLimit ? 'opacity-50 cursor-not-allowed' : 'bg-accent hover:bg-accent/90 text-zinc-950 font-bold'}
        >
          {isAtLimit ? 'Limit Reached' : <><Plus size={18} className="mr-2" /> Add Theme</>}
        </Button>
      </div>

      {/* Theme List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-zinc-500" />
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800">
            <LayoutGrid size={48} className="mx-auto text-zinc-700 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-zinc-400">No themes active</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2">
              Create a theme to give your builders a focus and set the judging criteria.
            </p>
            <Button variant="ghost" className="mt-6 text-accent" onClick={() => setCreationMode('selection')}>
              Set your first theme <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        ) : (
          themes.map((theme) => (
            <Card key={theme.id} className={`p-5 transition-all group ${theme.isPublished ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getThemeEmoji(theme)}</span>
                    <h4 className="text-lg font-bold text-white">{theme.name}</h4>
                    {theme.isPublished ? (
                      <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Deployed</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {(theme as any).metadata?.generated && (
                      <Badge variant="outline" className="text-blue-400 border-blue-400/30 flex items-center gap-1">
                        <Sparkles size={10} /> AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">{theme.concept}</p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                       <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Judging Criteria</p>
                       {(theme as any).metadata?.generated && <Lock size={10} className="text-zinc-600" />}
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                      {theme.judgingCriteria.map((criterion, i) => (
                        <li key={i} className="text-xs text-zinc-500 flex items-center gap-2">
                          <span className="text-accent">•</span>
                          {criterion.split(':')[0]}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    variant={theme.isPublished ? 'secondary' : 'primary'} 
                    size="sm"
                    className={theme.isPublished ? 'border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10' : ''}
                    onClick={() => togglePublish(theme)}
                  >
                    {theme.isPublished ? <Circle size={14} className="mr-2" /> : <CheckCircle2 size={14} className="mr-2" />}
                    {theme.isPublished ? 'Un-deploy' : 'Deploy'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(theme.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} className="mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Creation Modal */}
      {creationMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-900">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {creationMode === 'selection' && 'Add New Theme'}
                  {creationMode === 'ai' && 'Magic Draft'}
                  {creationMode === 'manual' && 'Manual Build'}
                </h3>
                <p className="text-sm text-zinc-500">
                  {creationMode === 'selection' && 'Choose how you want to create your hackathon challenge.'}
                  {creationMode === 'ai' && 'Describe your idea and let Gemini generate a theme for you.'}
                  {creationMode === 'manual' && 'Full control over your theme and judging criteria.'}
                </p>
              </div>
              <button onClick={() => { setCreationMode(null); setAiPreview(null); }} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                <X size={20} className="text-zinc-500 hover:text-white" />
              </button>
            </div>

            <div className="p-8">
              {/* SELECTION MODE */}
              {creationMode === 'selection' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setCreationMode('ai')}
                    className="flex flex-col items-center text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Wand2 className="text-accent" size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Magic Draft</h4>
                    <p className="text-sm text-zinc-500">Generate a unique theme with AI in seconds.</p>
                  </button>

                  <button 
                    onClick={startManual}
                    className="flex flex-col items-center text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="text-emerald-500" size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-2">Manual Build</h4>
                    <p className="text-sm text-zinc-500">Perfect for specific prompts and custom criteria.</p>
                  </button>
                </div>
              )}

              {/* AI GENERATOR MODE */}
              {creationMode === 'ai' && (
                <div className="space-y-6">
                  {!aiPreview ? (
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">What's the rough idea?</label>
                      <div className="flex gap-3">
                        <input
                          autoFocus
                          type="text"
                          value={roughIdea}
                          onChange={(e) => setRoughIdea(e.target.value)}
                          placeholder="e.g. Eco-friendly productivity tools..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <Button 
                          onClick={handleGenerate} 
                          disabled={isGenerating || !roughIdea.trim()}
                          className="bg-accent hover:bg-accent/90 text-zinc-950 font-bold px-6"
                        >
                          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        </Button>
                      </div>
                      <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">10 generations available per week</p>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-1">
                          <Sparkles size={12} /> Magic Result
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setAiPreview(null)} className="text-zinc-500 h-8">
                          Clear & Try Again
                        </Button>
                      </div>
                      
                      <Card className="p-6 border-accent/20 bg-accent/5 mb-8">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{(aiPreview as any).emoji}</span>
                          <h4 className="text-xl font-bold text-white">{aiPreview.name}</h4>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{aiPreview.concept}</p>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Generated Criteria</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {aiPreview.judgingCriteria?.map((c, i) => (
                              <div key={i} className="text-[11px] text-zinc-500 flex items-center gap-2">
                                <span className="text-accent">•</span> {c.split(':')[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      <div className="flex gap-3">
                        <Button variant="ghost" className="flex-1" onClick={() => setAiPreview(null)}>
                          Re-roll Idea
                        </Button>
                        <Button 
                          className="flex-2 bg-accent hover:bg-accent/90 text-zinc-950 font-black px-12" 
                          onClick={() => handleSaveTheme(aiPreview)}
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                          KEEP THIS THEME
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL MODE */}
              {creationMode === 'manual' && (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Icon</label>
                    <div className="grid grid-cols-8 gap-2">
                      {ICON_KEYS.map((key) => {
                        const Icon = THEME_ICONS[key];
                        const color = ICON_COLORS[key] || 'text-zinc-400';
                        const isSelected = manualForm.iconKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setManualForm({ ...manualForm, iconKey: key })}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                              isSelected 
                                ? `bg-zinc-800 border-emerald-500/50 ${color} ring-2 ring-emerald-500/20` 
                                : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-700'
                            }`}
                          >
                            <Icon size={18} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Theme Name</label>
                    <input
                      placeholder="e.g. The Sustainable City"
                      value={manualForm.name}
                      onChange={e => setManualForm({...manualForm, name: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">The Concept</label>
                    <textarea
                      placeholder="Briefly describe the challenge..."
                      value={manualForm.concept}
                      onChange={e => setManualForm({...manualForm, concept: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-white h-24 focus:border-emerald-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Judging Criteria ({manualForm.judgingCriteria?.length || 0})</label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const newCriteria = [...(manualForm.judgingCriteria || []), ''];
                          setManualForm({...manualForm, judgingCriteria: newCriteria});
                        }}
                        className="h-6 text-[10px] text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 uppercase tracking-tighter"
                      >
                        <PlusCircle size={12} className="mr-1" /> Add Criterion
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {manualForm.judgingCriteria?.map((criterion, i) => (
                        <div key={i} className="flex gap-2 group/item">
                          <span className="w-6 h-10 flex items-center justify-center text-xs font-bold text-zinc-600">{i + 1}</span>
                          <input
                            value={criterion}
                            onChange={e => {
                              const newCriteria = [...(manualForm.judgingCriteria || [])];
                              newCriteria[i] = e.target.value;
                              setManualForm({...manualForm, judgingCriteria: newCriteria});
                            }}
                            placeholder="e.g. Design: Visual polish and UX..."
                            className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newCriteria = (manualForm.judgingCriteria || []).filter((_, index) => index !== i);
                              setManualForm({...manualForm, judgingCriteria: newCriteria});
                            }}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full opacity-0 group-hover/item:opacity-100 transition-all active:scale-90"
                            title="Remove Criterion"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {manualForm.judgingCriteria?.length === 0 && (
                        <p className="text-[10px] text-zinc-600 italic text-center py-2">No criteria added. Click "Add Criterion" to start.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-zinc-950 py-4">
                    <Button variant="ghost" className="flex-1" onClick={() => setCreationMode('selection')}>
                      Back
                    </Button>
                    <Button 
                      className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-12" 
                      onClick={() => handleSaveTheme(manualForm)}
                      disabled={!manualForm.name || !manualForm.concept || isSaving}
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                      SAVE THEME
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
