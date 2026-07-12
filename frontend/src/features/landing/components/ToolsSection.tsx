import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/features/shadcn/components/ui/card';
import { BookOpen, Share2, ShieldCheck, Sparkles, Workflow, PenTool } from 'lucide-react';

export function ToolsSection() {
  const tools = [
    { title: "Interactive Canvas", icon: Workflow, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", desc: "Create and connect story nodes visually to map out your entire plot structure effortlessly." },
    { title: "Continuity Checker", icon: ShieldCheck, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", desc: "AI automatically detects contradictions, timeline issues, and plot holes before they become problems." },
    { title: "World Rule Enforcer", icon: BookOpen, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", desc: "Define custom world-building rules and ensure all story events consistently follow them." },
    { title: "Brainstorm Assistant", icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20", desc: "Stuck? Get creative AI suggestions to fix inconsistencies or explore exciting alternative story paths." },
    { title: "Character Tracking", icon: PenTool, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20", desc: "Easily monitor relationships and maintain character arcs and behavioral consistency across nodes." },
    { title: "Outline Export", icon: Share2, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", desc: "Convert your complex visual node graph into a clean, structured outline ready for your first draft." }
  ];

  return (
    <section id="features" className="px-6 py-24 bg-(--surface) backdrop-blur-md border-y border-(--line)">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight display-title">Everything an Author Needs</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((feature, i) => (
            <Card key={i} className="feature-card rounded-2xl border-none">
              <CardHeader>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${feature.bg} ${feature.border} border`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
