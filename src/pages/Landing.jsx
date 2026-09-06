import HeroSection from './landing/HeroSection';
import ValueStrip from './landing/ValueStrip';
import HowItWorks from './landing/HowItWorks';
import Differentiator from './landing/Differentiator';
import DemoChallenge from './landing/DemoChallenge';
import ImpactPreview from './landing/ImpactPreview';
import FinalCta from './landing/FinalCta';

export default function Landing() {
  return (
    <>
      <HeroSection />
      <ValueStrip />
      <HowItWorks />
      <Differentiator />
      <DemoChallenge />
      <ImpactPreview />
      <FinalCta />
    </>
  );
}
