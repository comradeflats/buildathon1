'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Plus, Loader2, Trash2, CheckCircle2, Circle, Edit2, Save, X, Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Theme } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useVoting } from '@/context/VotingContext';
import { getThemeEmoji, ICON_KEYS, THEME_EMOJIS, THEME_ICONS, ICON_COLORS } from '@/lib/themeIcons';

interface ThemeManagerProps {
  eventId: string;
  organizationId: string;
}

export function ThemeManager({ eventId, organizationId }: ThemeManagerProps) {
  const { getFirebaseToken } = useAuth();
  const { showToast } = useVoting();
  const formRef = useRef<HTMLDivElement>(null);
  
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roughIdea, setRoughIdea] = useState('');
  
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Theme>>({});
  const [isAddingManual, setIsAddingManual] = useState(false);

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

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
    if (isGenerating) return;
    
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
      if (data.themes) {
        // Add generated themes as drafts (not published)
        for (const genTheme of data.themes) {
          await handleSaveManual({
            ...genTheme,
            organizationId,
            isPublished: false
          }, true);
        }
        showToast('3 New themes generated as drafts!', 'success');
        setRoughIdea('');
        fetchThemes();
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      showToast(error.message || 'Failed to generate themes', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveManual = async (themeData: Partial<Theme>, silent = false) => {
    try {
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
      
      if (!silent) {
        showToast('Theme saved!', 'success');
        setIsAddingManual(false);
        fetchThemes();
      }
    } catch (error) {
      if (!silent) showToast('Failed to save theme', 'error');
      throw error;
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
      setEditingThemeId(null);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Theme Management</h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsAddingManual(true);
              setEditForm({
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
              scrollToForm();
            }}
          >
            <Plus size={16} className="mr-2" />
            Manual Theme
          </Button>
        </div>
      </div>

      {/* AI Generator Box */}
      <Card className="p-6 bg-accent/5 border-accent/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-accent" size={20} />
          <h3 className="font-semibold text-white">AI Theme Generator</h3>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          Describe the rough idea for your hackathon themes. We'll generate 3 unique "Micro-App" concepts for you.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={roughIdea}
            onChange={(e) => setRoughIdea(e.target.value)}
            placeholder="e.g. Eco-friendly productivity tools..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={isGenerating || !roughIdea.trim()}>
            {isGenerating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
            Generate
          </Button>
        </div>
      </Card>

      {/* Theme List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-zinc-500" />
          </div>
        ) : themes.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Info size={32} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-zinc-500">No themes created yet.</p>
          </div>
        ) : (
          themes.map((theme) => (
            <Card key={theme.id} className={`p-5 transition-all ${theme.isPublished ? 'border-emerald-500/30' : 'border-zinc-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getThemeEmoji(theme)}</span>
                    <h4 className="text-lg font-bold text-white">{theme.name}</h4>
                    {theme.isPublished ? (
                      <Badge variant="success">Deployed</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">{theme.concept}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Judging Criteria</p>
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
                    {theme.isPublished ? 'Un-deploy' : 'Deploy Theme'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(theme.id)} className="text-zinc-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Manual Add Form */}
      {isAddingManual && (
        <Card ref={formRef} className="p-8 border-emerald-500/50 bg-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="text-xl font-bold text-white">Add Manual Theme</h3>
               <p className="text-sm text-zinc-500">Configure a custom challenge for your buildathon.</p>
            </div>
            <button 
              onClick={() => setIsAddingManual(false)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-500 hover:text-white" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Select Theme Icon</label>
               <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                  {ICON_KEYS.map((key) => {
                    const Icon = THEME_ICONS[key];
                    const color = ICON_COLORS[key] || 'text-zinc-400';
                    const isSelected = editForm.iconKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, iconKey: key })}
                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-center hover:scale-110 active:scale-95 ${
                          isSelected 
                            ? `bg-zinc-800 border-emerald-500/50 ${color} ring-2 ring-emerald-500/20` 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                        }`}
                        title={key}
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
                value={editForm.name}
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">The Concept</label>
              <textarea
                placeholder="Concise summary of the challenge (e.g. Build a micro-app that helps urban residents track their carbon footprint in real-time.)"
                value={editForm.concept}
                onChange={e => setEditForm({...editForm, concept: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white h-28 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => setIsAddingManual(false)} 
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-12 px-12" 
                onClick={() => handleSaveManual(editForm)}
                disabled={!editForm.name || !editForm.concept}
              >
                SAVE THEME
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
