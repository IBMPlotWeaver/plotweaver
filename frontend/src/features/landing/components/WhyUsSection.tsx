import React from 'react';
import { ShieldCheck, Workflow } from 'lucide-react';

export function WhyUsSection() {
  return (
    <section id="why-us" className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
              Why choose <span className="text-violet-600 dark:text-violet-400">PlotWeaver</span>?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Because a polished MVP with 4–5 strong AI features stands out better than a cluttered tool.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4 p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-shrink-0 mt-1 bg-violet-100 dark:bg-violet-900/50 p-3 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">Your Creative Partner, Not Your Replacement</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Our AI strictly assists. It doesn't write the story for you. It helps you build a better narrative by catching mistakes and offering suggestions.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-shrink-0 mt-1 bg-fuchsia-100 dark:bg-fuchsia-900/50 p-3 rounded-xl">
                <Workflow className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <h4 className="font-bold text-xl mb-2">See the Big Picture</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Stop scrolling through endless, confusing text documents. See your entire plot structure at a glance and reorganize your narrative with drag-and-drop ease.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 w-full relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-3xl blur-2xl opacity-20 dark:opacity-40"></div>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl aspect-[4/3] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative flex flex-col">
            <div className="h-12 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2 bg-white/50 dark:bg-slate-950/50">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div className="text-slate-400 dark:text-slate-500 font-medium">
                <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                Interactive React Flow Canvas Demo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
