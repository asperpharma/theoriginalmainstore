import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage1 from "@/assets/beauty-hero.jpg";
import heroImage2 from "@/assets/hero-makeup.jpg";
import heroImage3 from "@/assets/hero-skincare.jpg";
import heroImage4 from "@/assets/hero-perfume.jpg";

const heroSlides = [
  {
    image: heroImage1,
    title: "Asper Shop",
    subtitle: "Your Ultimate Beauty Destination",
    description: "Discover premium beauty products, skincare essentials, and luxury cosmetics curated just for you"
  },
  {
    image: heroImage2,
    title: "Luxury Makeup",
    subtitle: "Premium Cosmetics Collection",
    description: "Explore our curated selection of high-end makeup products from world-renowned brands"
  },
  {
    image: heroImage3,
    title: "Advanced Skincare",
    subtitle: "Revolutionary Beauty Solutions",
    description: "Transform your skin with our scientifically-proven skincare formulations and treatments"
  },
  {
    image: heroImage4,
    title: "Signature Fragrances",
    subtitle: "Exquisite Perfume Collection",
    description: "Find your perfect scent from our exclusive range of luxury perfumes and fragrances"
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[60vh] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white max-w-4xl px-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light opacity-95">
                {slide.subtitle}
              </p>
              <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                {slide.description}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white border-white/30"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "bg-white" 
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;