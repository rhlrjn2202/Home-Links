import { HeroSection } from '@/components/home/HeroSection';
import { PropertyCategories } from '@/components/home/PropertyCategories';
import { TopPickedProperties } from '@/components/home/TopPickedProperties';
// MadeWithDyad import removed

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PropertyCategories />
      <TopPickedProperties />
      {/* MadeWithDyad component removed */}
    </>
  );
}