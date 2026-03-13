'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Globe, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Save,
  Trash2,
  Building2,
  Info,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { createSlug, validateSlug, checkOrgSlugExists } from '@/lib/slugs';

export default function OrgSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.orgSlug as string;

  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading, updateOrganization, deleteOrganization } = useOrganizations();
  const [org, setOrg] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'access'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
    settings: {
      allowPublicEventDiscovery: true,
      branding: {
        primaryColor: '#10b981',
        accentColor: '#06b6d4',
      },
      accessControl: {
        inviteLinkEnabled: false,
        inviteLinkCode: '',
        defaultRole: 'member' as 'admin' | 'member' | 'judge'
      }
    }
  });

  // Find organization by slug
  useEffect(() => {
    if (!orgsLoading && organizations.length > 0) {
      const foundOrg = organizations.find((o) => o.slug === slug);
      if (foundOrg) {
        setOrg(foundOrg);
        setFormData({
          name: foundOrg.name || '',
          slug: foundOrg.slug || '',
          description: foundOrg.description || '',
          websiteUrl: foundOrg.websiteUrl || '',
          logoUrl: foundOrg.logoUrl || '',
          settings: {
            allowPublicEventDiscovery: foundOrg.settings?.allowPublicEventDiscovery ?? true,
            branding: {
              primaryColor: foundOrg.settings?.branding?.primaryColor || '#10b981',
              accentColor: foundOrg.settings?.branding?.accentColor || '#06b6d4',
            },
            accessControl: {
              inviteLinkEnabled: foundOrg.settings?.accessControl?.inviteLinkEnabled || false,
              inviteLinkCode: foundOrg.settings?.accessControl?.inviteLinkCode || '',
              defaultRole: (foundOrg.settings?.accessControl?.defaultRole || 'member') as 'admin' | 'member' | 'judge'
            }
          }
        });
      } else {
        router.push('/dashboard');
      }
    }
  }, [organizations, orgsLoading, slug, router]);

  const { permissions } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || !org;

  const handleSave = async () => {
    if (!org) return;
    
    // Validate slug before saving if it changed
    if (formData.slug !== org.slug) {
      if (!validateSlug(formData.slug)) {
        setSlugStatus('invalid');
        return;
      }
      
      const exists = await checkOrgSlugExists(formData.slug, org.id);
      if (exists) {
        setSlugStatus('taken');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateOrganization(org.id, formData);
      
      // If slug changed, we need to redirect to the new URL
      if (formData.slug !== org.slug) {
        router.replace(`/dashboard/${formData.slug}/settings`);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const syncSlugWithName = () => {
    const newSlug = createSlug(formData.name);
    setFormData({ ...formData, slug: newSlug });
    validateNewSlug(newSlug);
  };

  const validateNewSlug = async (newSlug: string) => {
    if (!newSlug) {
      setSlugStatus('idle');
      return;
    }
    
    if (!validateSlug(newSlug)) {
      setSlugStatus('invalid');
      return;
    }
    
    if (newSlug === org?.slug) {
      setSlugStatus('available');
      return;
    }

    setSlugStatus('checking');
    try {
      const exists = await checkOrgSlugExists(newSlug, org?.id);
      setSlugStatus(exists ? 'taken' : 'available');
    } catch (error) {
      setSlugStatus('idle');
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, slug: val });
    validateNewSlug(val);
  };

  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        accessControl: {
          ...formData.settings.accessControl,
          inviteLinkCode: code,
          inviteLinkEnabled: true
        }
      }
    });
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${formData.settings.accessControl.inviteLinkCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link
            href={`/dashboard/${slug}`}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white mb-2">Settings</h1>
          <p className="text-zinc-400 font-medium">
            Manage <span className="text-white">{org.name}</span> identity, appearance, and access.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-8 py-6 rounded-2xl shadow-lg shadow-emerald-500/20"
        >
          {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'general' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Building2 size={18} />
          General
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'branding' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Palette size={18} />
          Branding
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'access' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Shield size={18} />
          Access Control
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'general' && (
          <div className="grid gap-6">
            <Card className="p-8 border-zinc-800 bg-zinc-900/30 backdrop-blur-sm space-y-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Organization Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      placeholder="Acme Hackathons"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Organization Slug</label>
                      <button 
                        onClick={syncSlugWithName}
                        className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw size={10} />
                        Sync with Name
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all pr-10 ${
                          slugStatus === 'taken' || slugStatus === 'invalid' 
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                            : 'border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                        }`}
                        placeholder="acme-hackathons"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {slugStatus === 'checking' && <Loader2 size={16} className="animate-spin text-zinc-500" />}
                        {slugStatus === 'available' && <Check size={16} className="text-emerald-500" />}
                        {(slugStatus === 'taken' || slugStatus === 'invalid') && <AlertCircle size={16} className="text-red-500" />}
                      </div>
                    </div>
                    {slugStatus === 'taken' && <p className="text-[10px] text-red-500 font-bold ml-1">This slug is already taken</p>}
                    {slugStatus === 'invalid' && <p className="text-[10px] text-red-500 font-bold ml-1">Invalid slug format (use lowercase letters, numbers, and hyphens)</p>}
                    <p className="text-[10px] text-zinc-600 font-medium ml-1">
                      Your dashboard: <span className="text-zinc-400">buildathon.live/dashboard/{formData.slug || '...'}</span>
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Website URL</label>
                    <input
                      type="text"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      placeholder="https://acme.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                    placeholder="Tell us about your organization..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                      <Globe size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Public Discovery</p>
                      <p className="text-xs text-zinc-500">Allow your organization to be found in the global explorer.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowPublicEventDiscovery: !formData.settings.allowPublicEventDiscovery }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.settings.allowPublicEventDiscovery ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      formData.settings.allowPublicEventDiscovery ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-red-500/20 bg-red-500/5 space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Danger Zone</h3>
              </div>
              <p className="text-sm text-zinc-500 max-w-lg">
                Once you delete an organization, there is no going back. Please be certain. All events and submissions will be permanently detached.
              </p>
              <Button variant="ghost" className="text-red-400 hover:bg-red-400/10 border border-red-500/20 rounded-xl">
                Delete Organization
              </Button>
            </Card>
          </div>
        )}

        {activeTab === 'branding' && (
          <Card className="p-8 border-zinc-800 bg-zinc-900/30 backdrop-blur-sm space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Palette size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Visual Identity</h2>
                <p className="text-sm text-zinc-500 font-medium">Customize how your event portals look to participants.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Brand Colors</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Primary</p>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <input
                          type="color"
                          value={formData.settings.branding.primaryColor}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              branding: { ...formData.settings.branding, primaryColor: e.target.value }
                            }
                          })}
                          className="w-8 h-8 rounded-lg bg-transparent cursor-pointer"
                        />
                        <span className="text-sm font-mono text-zinc-400 uppercase">{formData.settings.branding.primaryColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase">Accent</p>
                      <div className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                        <input
                          type="color"
                          value={formData.settings.branding.accentColor}
                          onChange={(e) => setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              branding: { ...formData.settings.branding, accentColor: e.target.value }
                            }
                          })}
                          className="w-8 h-8 rounded-lg bg-transparent cursor-pointer"
                        />
                        <span className="text-sm font-mono text-zinc-400 uppercase">{formData.settings.branding.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Info size={18} />
                    <span className="text-sm font-bold">Pro Tip</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    These colors will be used for buttons, links, and highlights in your organization's custom event portal (e.g., buildathon.live/e/{slug}).
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Live Preview</label>
                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: formData.settings.branding.primaryColor }} />
                    <div className="flex gap-2">
                      <div className="w-12 h-2 rounded-full bg-zinc-800" />
                      <div className="w-12 h-2 rounded-full bg-zinc-800" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 bg-zinc-800 rounded-full" />
                    <div className="h-4 w-1/2 bg-zinc-800 rounded-full opacity-50" />
                  </div>
                  <div 
                    className="py-3 rounded-xl text-center text-xs font-black uppercase tracking-widest shadow-lg transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: formData.settings.branding.primaryColor, color: '#000' }}
                  >
                    Register Now
                  </div>
                  <div className="flex justify-center">
                    <span className="text-[10px] font-bold" style={{ color: formData.settings.branding.accentColor }}>
                      Powered by Buildathon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'access' && (
          <Card className="p-8 border-zinc-800 bg-zinc-900/30 backdrop-blur-sm space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Admin Access</h2>
                <p className="text-sm text-zinc-500 font-medium">Control who can manage this organization and its events.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Invite Link</h3>
                    <p className="text-xs text-zinc-500">Share this link to add new admins or judges to your team.</p>
                  </div>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        accessControl: {
                          ...formData.settings.accessControl,
                          inviteLinkEnabled: !formData.settings.accessControl.inviteLinkEnabled
                        }
                      }
                    })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      formData.settings.accessControl.inviteLinkEnabled ? 'bg-purple-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      formData.settings.accessControl.inviteLinkEnabled ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {formData.settings.accessControl.inviteLinkEnabled && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    {!formData.settings.accessControl.inviteLinkCode ? (
                      <Button 
                        onClick={generateInviteCode}
                        variant="secondary"
                        className="w-full py-6 rounded-xl border border-dashed border-zinc-700 hover:border-purple-500/50"
                      >
                        <LinkIcon size={18} className="mr-2" />
                        Generate Invite Link
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-sm text-zinc-400 overflow-hidden truncate">
                            {window.location.origin}/join/{formData.settings.accessControl.inviteLinkCode}
                          </div>
                          <Button onClick={copyInviteLink} className="h-[46px] w-[46px] p-0 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white">
                            {copySuccess ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Default Role</label>
                            <select 
                              value={formData.settings.accessControl.defaultRole}
                              onChange={(e) => setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  accessControl: {
                                    ...formData.settings.accessControl,
                                    defaultRole: e.target.value as any
                                  }
                                }
                              })}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                            >
                              <option value="member">Member (Organizer)</option>
                              <option value="admin">Admin</option>
                              <option value="judge">Judge Only</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <Button 
                              variant="ghost" 
                              onClick={generateInviteCode}
                              className="w-full text-xs text-zinc-500 hover:text-white"
                            >
                              Reset Link
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                <Info size={18} className="text-purple-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Anyone with this link can join your organization as a <strong>{formData.settings.accessControl.defaultRole}</strong>. Be careful who you share it with!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
