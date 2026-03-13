'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building2, 
  ChevronDown, 
  LayoutGrid, 
  Plus, 
  Check, 
  Trophy,
  User,
  Settings,
  Calendar
} from 'lucide-react';
import { useOrg } from '@/context/OrgContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export function WorkspaceSwitcher() {
  const { currentOrg, userOrgs, switchOrg, isLoading } = useOrg();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if we are in "Participant View" or "Organization View"
  const isOrgView = pathname.startsWith('/dashboard/') && currentOrg;
  const isGlobalDashboard = pathname === '/dashboard';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading || !user) return null;

  const handleOrgSelect = (org: any) => {
    switchOrg(org.id);
    setIsOpen(false);
    router.push(`/dashboard/${org.slug}`);
  };

  const handleParticipantView = () => {
    setIsOpen(false);
    router.push('/dashboard');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          isOrgView 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOrgView ? (
            <>
              <Building2 size={16} />
              <span className="text-sm font-bold truncate max-w-[120px]">
                {currentOrg?.name}
              </span>
            </>
          ) : (
            <>
              <User size={16} />
              <span className="text-sm font-bold">Participant View</span>
            </>
          )}
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1">
              Personal
            </p>
            <button
              onClick={handleParticipantView}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isGlobalDashboard || !isOrgView ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy size={16} className={isGlobalDashboard || !isOrgView ? 'text-emerald-400' : ''} />
                My Submissions & Events
              </div>
              {(isGlobalDashboard || !isOrgView) && <Check size={14} className="text-emerald-400" />}
            </button>
          </div>

          <div className="p-2 max-h-[300px] overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-3 py-1">
              Organizations
            </p>
            {userOrgs.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-zinc-500 mb-2">No organizations yet</p>
                <Link href="/onboarding" onClick={() => setIsOpen(false)}>
                  <Button size="xs" variant="secondary" className="w-full">
                    Create One
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {userOrgs.map((org) => {
                  const isActive = isOrgView && currentOrg?.id === org.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Building2 size={16} className={isActive ? 'text-emerald-400' : ''} />
                        <span className="truncate">{org.name}</span>
                      </div>
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-zinc-800 bg-zinc-950/50">
            <Link 
              href="/onboarding" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <Plus size={16} />
              Create Organization
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Button({ children, size, variant, className, ...props }: any) {
  const sizes: any = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
  };
  const variants: any = {
    secondary: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
  };
  return (
    <button className={`rounded-lg font-bold transition-all ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
