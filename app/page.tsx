import type { Metadata } from 'next';
import HeroSection         from '@/components/home/HeroSection';
import FeaturedEvents      from '@/components/home/FeaturedEvents';
import TrendingRestaurants from '@/components/home/TrendingRestaurants';
import LifestyleSection    from '@/components/home/LifestyleSection';
import TalentsSpotlight    from '@/components/home/TalentsSpotlight';
import GalleryPreview      from '@/components/home/GalleryPreview';
import PartnersSection     from '@/components/home/PartnersSection';
import NewsletterSection   from '@/components/home/NewsletterSection';

export const metadata: Metadata = {
  title: 'Bangui est Doux – Le meilleur de Bangui',
  description: 'Découvrez le meilleur de Bangui : événements, restaurants, nightlife, culture et lifestyle en République Centrafricaine.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      <TrendingRestaurants />
      <LifestyleSection />
      <TalentsSpotlight />
      <GalleryPreview />
      <PartnersSection />
      <NewsletterSection />
    </>
  );
}
