import Hero from '@/components/Hero/Hero';
import Services from '@/components/Services/Services';
import Benefits from '@/components/Benefits/Benefits';
import Stats from '@/components/Stats/Stats';
import Fleet from '@/components/Fleet/Fleet';
import Guarantees from '@/components/Guarantees/Guarantees';
import ContactSection from '@/components/ContactSection/ContactSection';
import Steps from '@/components/Steps/Steps';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <Hero />
      <Services />
      <Benefits />
      <Stats />
      <Fleet />
      <Guarantees />
      <ContactSection />
      <Steps />
    </>
  );
}
