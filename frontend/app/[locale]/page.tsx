import Hero from '@/components/Hero/Hero';
import Services from '@/components/Services/Services';
import Fleet from '@/components/Fleet/Fleet';

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
      <Fleet />
    </>
  );
}
