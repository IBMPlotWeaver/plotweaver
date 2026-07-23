import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { supabase } from '#/lib/supabase';
import { useAuthUIStore } from '#/features/auth/store/useAuthUIStore';
import { signupSchema, type SignupFormValues } from '#/features/auth/schemas/signupSchema';
import { useMigrateGuestCanvas } from '#/features/canvas/hooks/useMigrateGuestCanvas';
import { MigrateGuestCanvasDialog } from '#/features/canvas/components/MigrateGuestCanvasDialog';

/**
 * Signup page content. Header and Aurora background are
 * provided by the parent _layout route.
 */
export function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const loading = useAuthUIStore(state => state.loading)
  const error = useAuthUIStore(state => state.error)
  const setLoading = useAuthUIStore(state => state.setLoading)
  const setError = useAuthUIStore(state => state.setError)
  const reset = useAuthUIStore(state => state.reset)
  const success = useAuthUIStore(state => state.success)
  const setSuccess = useAuthUIStore(state => state.setSuccess)
  const { 
    promptMigration, 
    handleSave, 
    handleDiscard, 
    closeDialog,
    showDialog, 
    isMigrating,
    hasGuestCanvas 
  } = useMigrateGuestCanvas();

  useEffect(() => {
    reset();
    return () => reset();
  }, [reset]);

  const onSubmit = async (formData: SignupFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { full_name: formData.name } },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      
      // Check if there's a guest canvas to migrate
      if (data.user && hasGuestCanvas) {
        promptMigration(data.user.id);
      } else {
        navigate({ to: '/login' });
      }
    }
  };

  return (
    <>
      <MigrateGuestCanvasDialog
        open={showDialog}
        onOpenChange={closeDialog}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isMigrating={isMigrating}
      />
      <div className="grow flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 display-title mt-4">Create an account</h1>
          <p className="text-(--sea-ink-soft)">Join the AI Builders Challenge to start weaving.</p>
        </div>

        <div className="island-shell p-8 rounded-3xl transition-all duration-500 shadow-2xl shadow-violet-500/10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--sea-ink)">Name</label>
              <Input
                type="text"
                {...register('name')}
                placeholder="Your Name"
                className={`w-full h-12 px-4 rounded-xl bg-(--surface) border ${errors.name ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-(--sea-ink)">Email Address</label>
              <Input
                type="email"
                {...register('email')}
                placeholder="author@example.com"
                className={`w-full h-12 px-4 rounded-xl bg-(--surface) border ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
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
                  className={`w-full h-12 px-4 pr-12 rounded-xl bg-(--surface) border ${errors.password ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--sea-ink-soft) hover:text-(--sea-ink) transition-colors cursor-pointer"
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
                Account created successfully! Redirecting...
              </div>
            )}

            <Button
              disabled={loading || success}
              className="w-full h-12 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl mt-4 shadow-lg shadow-violet-500/25 group transition-all duration-300 border-none"
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

          <div className="mt-8 pt-6 border-t border-(--line) text-center">
            <p className="text-(--sea-ink-soft) text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}