import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { useCurrentUser } from '#/lib/useCurrentUser';
import {
  User,
  Mail,
  AtSign,
  Calendar,
  Pencil,
  Check,
  X,
  Loader2,
  ArrowLeft,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

export function ProfilePage() {
  const { data: user } = useCurrentUser();

  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Writer';
  const initials = displayName.slice(0, 2).toUpperCase();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const handleEdit = () => {
    setUsername(profile?.username ?? '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      await updateProfileMutation.mutateAsync({ id: user.id, updates: { username } });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername('');
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  if (isLoading) {
    return (
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-[var(--sea-ink-soft)]">Loading profile…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto w-full animate-blur-reveal">

      {/* ── Back + Title ─────────────────────────── */}
      <div className="flex items-center gap-3 mb-8 mt-10 sm:mt-14">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--line)]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-fuchsia-500 island-kicker">Account</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight display-title text-[var(--sea-ink)]">
            Profile & Settings
          </h1>
        </div>
      </div>

      <div className="space-y-4">

        {/* ── Avatar card ──────────────────────────── */}
        <div className="island-shell rounded-3xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
            <span className="text-2xl font-bold text-white tracking-tight">{initials}</span>
          </div>
          <div>
            <p className="font-semibold text-lg text-[var(--sea-ink)] leading-tight">{displayName}</p>
            <p className="text-sm text-[var(--sea-ink-soft)] mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* ── Account information ──────────────────── */}
        <div className="island-shell rounded-3xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[var(--sea-ink)] flex items-center gap-2">
            <User className="w-4 h-4 text-violet-500" />
            Account Information
          </h2>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </label>
            <div className="flex items-center h-11 px-4 rounded-xl bg-[var(--line)]/40 border border-[var(--line)] text-sm text-[var(--sea-ink-soft)] cursor-not-allowed">
              {user?.email}
            </div>
            <p className="text-xs text-[var(--sea-ink-soft)]/60">Email address cannot be changed.</p>
          </div>

          {/* Username (editable) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)] flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5" /> Username
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  autoFocus
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-11 px-4 rounded-xl bg-[var(--surface)] border-[var(--line)] focus-visible:ring-violet-500/20 focus-visible:border-violet-500 text-[var(--sea-ink)]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="rounded-xl h-9 px-4 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white border-none gap-1.5 text-sm"
                  >
                    {updateProfileMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Check className="w-4 h-4" />}
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={updateProfileMutation.isPending}
                    className="rounded-xl h-9 px-4 border-[var(--line)] text-[var(--sea-ink-soft)] gap-1.5 text-sm"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center h-11 px-4 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-sm text-[var(--sea-ink)]">
                  {profile?.username ?? <span className="text-[var(--sea-ink-soft)]/50">Not set</span>}
                </div>
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="rounded-xl h-11 px-4 border-[var(--line)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] gap-1.5 text-sm"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
            )}
          </div>

          {/* Member since (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--sea-ink-soft)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Member Since
            </label>
            <div className="flex items-center h-11 px-4 rounded-xl bg-[var(--line)]/40 border border-[var(--line)] text-sm text-[var(--sea-ink-soft)] cursor-not-allowed">
              {memberSince}
            </div>
          </div>
        </div>

        {/* ── Danger zone ──────────────────────────── */}
        <div className="island-shell rounded-3xl p-6 space-y-4 border border-rose-200 dark:border-rose-900/50">
          <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Danger Zone
          </h2>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-[var(--sea-ink)]">Sign out of your account</p>
              <p className="text-xs text-[var(--sea-ink-soft)] mt-0.5">You will be redirected to the home page.</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="rounded-xl border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-400 gap-2 text-sm flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>

      </div>
    </main>
  );
}
