import AiCapabilitiesSection from '@/components/blocks/ai-capabilities/ai-capabilities';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import ComparisonSection from '@/components/blocks/comparison/comparison';
import DemoSection from '@/components/blocks/demo/demo';
import FAQsSection from '@/components/blocks/faqs/faqs';
import FeaturesSection from '@/components/blocks/features/features';
import { HeroImageToVideo } from '@/components/blocks/hero/HeroImageToVideo';
import HowItWorksSection from '@/components/blocks/how-it-works/how-it-works';
import IntegrationSection from '@/components/blocks/integration/integration';
import LogoCloudSection from '@/components/blocks/logo-cloud/logo-cloud';
import PricingSection from '@/components/blocks/pricing/pricing';
import StatsSection from '@/components/blocks/stats/stats';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials';
import UseCasesSection from '@/components/blocks/use-cases/use-cases';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('', locale),
  });
}

export default function HomePage() {
  return (
    <>
      <div className="flex flex-col">
        {/* Hero Section - Main AI Image to Video Tool */}
        <HeroImageToVideo />

        {/* Demo - Product demonstration */}
        <DemoSection />

        {/* Use Cases - Different scenarios */}
        <UseCasesSection />

        {/* Features - Key product features */}
        <FeaturesSection />

        {/* How It Works - Step by step process */}
        <HowItWorksSection />

        {/* AI Capabilities - What our AI can do */}
        <AiCapabilitiesSection />

        {/* Comparison - Why choose us */}
        <ComparisonSection />

        <PricingSection />

        {/* FAQs - Frequently asked questions */}
        <FAQsSection />

        {/* Call to Action - Final conversion push */}
        <CallToActionSection />
      </div>
    </>
  );
}
