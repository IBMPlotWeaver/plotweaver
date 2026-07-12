import ShapeGrid from './react-bits/ShapeGrid';
import { Header } from './Header';
import { Hero } from './Hero';
import { ToolsSection } from './ToolsSection';
import { WhyUsSection } from './WhyUsSection';
import { Footer } from './Footer';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Background ShapeGrid */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none">
        <ShapeGrid
          shape="hexagon"
          hoverFillColor="#8b5cf6"
          borderColor="rgba(139, 92, 246, 0.15)"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="grow">
          <Hero />
          <ToolsSection />
          <WhyUsSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
