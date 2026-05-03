import PromoHeader from "@/components/PromoHeader";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <PromoHeader />
      <Header />
      <HeroSection />
      <CategoriesSection />
      <ContactSection />
    </div>
  );
};

export default Index;
