import { Header } from './Header';
import { Hero } from './Hero';
import { ToolsSection } from './ToolsSection';
import { WhyUsSection } from './WhyUsSection';
import { Footer } from './Footer';
import Aurora from './react-bits/Aurora';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      {/* Background ShapeGrid */}
      <div className="fixed inset-0 z-0 opacity-50">
        <Aurora
          colorStops={["#8b5cf6", "#d946ef", "#f43f5e"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
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
