'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User as UserIcon, CheckCircle2, ArrowLeft, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { user, userProfile, isLoading: authLoading, getUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState<'developer' | 'designer' | 'product' | 'other'>('developer');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setBio(userProfile.bio || '');
      setRole(userProfile.role || 'developer');
      setExperienceLevel(userProfile.experienceLevel || 'intermediate');
    }
  }, [userProfile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Check if user doc exists, if not create it (for legacy users)
      const userDoc = await getDoc(userDocRef);
      
      const updateData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        role,
        experienceLevel,
        profileCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, updateData);
      } else {
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          createdAt: new Date().toISOString(),
          isOrganizer: false,
          organizationIds: [],
          ...updateData
        });
      }

      setSuccess(true);
      // Refresh profile in context
      await getUserProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!user) {
    router.push('/signup');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Profile Settings</h1>
        <p className="text-zinc-400">Manage your builder identity and preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8 space-y-6">
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3 text-emerald-400">
              <CheckCircle2 size={20} />
              <span>Profile updated successfully! You are now a Verified Builder.</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Profile Header Preview */}
          <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={32} className="text-zinc-600" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{displayName || 'Anonymous Builder'}</h3>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about what you build..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                  Primary Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="product">Product</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                  Experience
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full font-black text-lg h-14 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-xl"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile & Verify'
              )}
            </Button>
          </div>
        </Card>
      </form>
      
      {/* Integration placeholders */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 opacity-50 cursor-not-allowed border-zinc-800">
          <div className="flex items-center gap-3">
            <Github size={20} className="text-zinc-500" />
            <span className="text-sm font-bold text-zinc-400">GitHub Linked</span>
          </div>
        </Card>
        <Card className="p-4 opacity-50 cursor-not-allowed border-zinc-800">
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-zinc-500" />
            <span className="text-sm font-bold text-zinc-400">Personal Site</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
