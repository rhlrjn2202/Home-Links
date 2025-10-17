import { HeroSection } from '@/components/home/HeroSection';
import { PropertyCategories } from '@/components/home/PropertyCategories';
import { TopPickedProperties } from '@/components/home/TopPickedProperties';
import { MadeWithDyad } from '@/components/made-with-dyad';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <PropertyCategories />
      <TopPickedProperties />
      <MadeWithDyad />
    </>
  );
}