import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TopPickedProperties } from "@/components/home/TopPickedProperties";
import { PropertyCategories } from "@/components/home/PropertyCategories";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TopPickedProperties />
        <PropertyCategories />
        {/* Additional content sections can be added here */}
      </main>
      <Footer />
    </div>
  );
}