import { Hero } from './Hero';
import { ToolsSection } from './ToolsSection';
import { WhyUsSection } from './WhyUsSection';
import { Footer } from './Footer';

/**
 * Landing page content. Header and Aurora background are
 * provided by the parent _layout route.
 */
export default function LandingPage() {
  return (
    <main className="grow">
      <Hero />
      <ToolsSection />
      <WhyUsSection />
      <Footer />
    </main>
  );
}
