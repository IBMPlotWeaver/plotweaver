import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '#/features/shadcn/components/ui/button';
import { Input } from '#/features/shadcn/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import Aurora from '#/features/landing/components/react-bits/Aurora';
import { Header } from '#/features/landing/components/Header';
import { supabase } from '#/lib/supabase';
import { useAuthUIStore } from '#/features/auth/store/useAuthUIStore';
import { signupSchema, type SignupFormValues } from '#/features/auth/schemas/signupSchema';

export function SignupPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });
  const { loading, error, success, setLoading, setError, setSuccess, reset } = useAuthUIStore();

  useEffect(() => {
    // Reset state when mounting/unmounting
    reset();
    return () => reset();
  }, [reset]);

  const onSubmit = async (formData: SignupFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name,
        }
      }
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
      // Wait a bit before redirecting
      setTimeout(() => navigate({ to: '/login' }), 3000);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans">
      <Header />
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Aurora colorStops={['#f43f5e', '#d946ef', '#8b5cf6']} speed={0.5} amplitude={1.2} />
      </div>
      <div className="grow flex items-center justify-center p-6 relative z-10">
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
                  {...register("name")}
                  placeholder="Your Name"
                  className={`w-full h-12 px-4 rounded-xl bg-(--surface) border ${errors.name ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--sea-ink)">Email Address</label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="author@example.com"
                  className={`w-full h-12 px-4 rounded-xl bg-(--surface) border ${errors.email ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-(--sea-ink)">Password</label>
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 rounded-xl bg-(--surface) border ${errors.password ? 'border-red-500 focus-visible:ring-red-500/20' : 'border-(--line) focus-visible:ring-violet-500/20 focus-visible:border-violet-500'} outline-none transition-all placeholder:text-(--sea-ink-soft)/50 text-(--sea-ink)`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
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

              <Button disabled={loading || success} className="w-full h-12 bg-linear-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white rounded-xl mt-4 shadow-lg shadow-violet-500/25 group transition-all duration-300 border-none">
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
    </div>
  );
}
