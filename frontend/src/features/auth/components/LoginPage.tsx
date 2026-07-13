import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';
import { useAuthUIStore } from '#/features/auth/store/useAuthUIStore';
import { loginSchema, type LoginFormValues } from '#/features/auth/schemas/loginSchema';

/**
 * Login page content. Header and Aurora background are
 * provided by the parent _layout route.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const { loading, error, setLoading, setError, reset } = useAuthUIStore();

  useEffect(() => {
    reset();
    return () => reset();
  }, [reset]);

  const onSubmit = async (formData: LoginFormValues) => {
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else if (data.session) {
      navigate({ to: '/dashboard' });
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 display-title mt-4">Welcome back</h1>
          <p className="text-[var(--sea-ink-soft)]">Sign in to continue weaving your story.</p>
        </div>

        <div className="island-shell p-8 rounded-3xl transition-all duration-500 shadow-2xl shadow-violet-500/10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--sea-ink)]">Email Address</label>
              <Input
                type="email"
                {...register('email')}
                placeholder="author@example.com"
                className={`w-full h-12 px-4 rounded-xl bg-[var(--surface)] border ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-[var(--line)] focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-[var(--sea-ink-soft)]/50 text-[var(--sea-ink)]`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--sea-ink)]">Password</label>
                <a href="#" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">Forgot password?</a>
              </div>
              <Input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={`w-full h-12 px-4 rounded-xl bg-[var(--surface)] border ${errors.password ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-[var(--line)] focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-[var(--sea-ink-soft)]/50 text-[var(--sea-ink)]`}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-xl border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}

            <Button
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl mt-4 shadow-lg shadow-violet-500/25 group transition-all duration-300 border-none"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                <>
                  <span className="text-base font-semibold">Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--line)] text-center">
            <p className="text-[var(--sea-ink-soft)] text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                Start weaving for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
