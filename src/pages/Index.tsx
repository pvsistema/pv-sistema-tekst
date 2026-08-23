import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Audience from '@/components/Audience';
import Formats from '@/components/Formats';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

const Index = () => (
  <div className="min-h-screen bg-background font-body">
    <div className="mx-auto max-w-[1400px] px-6 pt-8 sm:px-10 lg:px-16">
      <Header />
      <Hero />
      <Features />
      <Audience />
      <Formats />
      <CTA />
      <Footer />
    </div>
  </div>
);

export default Index;