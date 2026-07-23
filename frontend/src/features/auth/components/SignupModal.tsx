import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/features/shadcn/components/ui/dialog';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';
import { signupSchema, type SignupFormValues } from '#/features/auth/schemas/signupSchema';

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (userId: string) => void;
}

export function SignupModal({ open, onOpenChange, onSuccess }: SignupModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (formData: SignupFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.name } },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (data.user) {
      // Forcefully login to ensure session tokens are actively set before migrating
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      setLoading(false);

      if (loginError) {
        setError("Account created, but automatic login failed. Please sign in manually.");
      } else if (loginData.user) {
        setSuccess(true);
        reset();
        onSuccess?.(loginData.user.id);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight display-title">
            Create an account
          </DialogTitle>
          <DialogDescription className="text-base">
            Join PlotWeaver to save your work and unlock unlimited AI analysis.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-(--sea-ink)">Name</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="Your Name"
              className={`w-full h-11 px-4 rounded-xl bg-(--surface) border ${
                errors.name
                  ? 'border-red-500 focus-visible:ring-red-500/20'
                  : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'
              } outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-(--sea-ink)">Email Address</label>
            <Input
              type="email"
              {...register('email')}
              placeholder="author@example.com"
              className={`w-full h-11 px-4 rounded-xl bg-(--surface) border ${
                errors.email
                  ? 'border-red-500 focus-visible:ring-red-500/20'
                  : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'
              } outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-(--sea-ink)">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`w-full h-11 px-4 pr-12 rounded-xl bg-(--surface) border ${
                  errors.password
                    ? 'border-red-500 focus-visible:ring-red-500/20'
                    : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'
                } outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
              Account created successfully! Saving your work...
            </div>
          )}

          <Button
            disabled={loading || success}
            className="w-full h-11 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/25 group transition-all duration-300 border-none"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>
                <span className="text-base font-semibold">Create Account</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-(--line) text-center">
          <p className="text-(--sea-ink-soft) text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
