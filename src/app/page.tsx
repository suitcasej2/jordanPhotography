import { AboutSection } from "@/components/site/AboutSection";
import { BookingFooter } from "@/components/site/BookingFooter";
import { HeroSection } from "@/components/site/HeroSection";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WorkSection } from "@/components/site/WorkSection";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <SiteHeader />
      <HeroSection />
      <AboutSection />
      <WorkSection />
      <BookingFooter />
    </main>
  );
}
