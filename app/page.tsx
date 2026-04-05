import Hero from '@/components/Hero';
import TrustPositioning from '@/components/CoreValues';
import ProblemStatement from '@/components/Problem';
import AboutImperium from '@/components/AboutImperium';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Reviews from '@/components/review';

export const metadata = {
  title: 'Imperium Crypto - Komunitas Premium untuk Belajar Investasi Crypto',
  description: 'Bergabunglah dengan Imperium Crypto, komunitas eksklusif untuk belajar investasi crypto dengan pendekatan data-driven dan mindset finansial yang tepat.',
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      
      <AboutImperium />
      <ProblemStatement />
      <TrustPositioning />
      <Pricing />
      <Reviews />
      <Footer />
    </main>
  );
}