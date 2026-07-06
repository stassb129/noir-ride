'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingWizard from '@/components/BookingWizard/BookingWizard';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'route' | 'airport' | 'hourly' | null;
  const validTypes = ['route', 'airport', 'hourly'] as const;
  const initialType = type && validTypes.includes(type) ? type : undefined;
  const vehicleIdParam = searchParams.get('vehicleId');
  const initialVehicleId = vehicleIdParam ? Number(vehicleIdParam) : undefined;
  const initialFrom = searchParams.get('from') ?? undefined;
  const initialTo = searchParams.get('to') ?? undefined;
  const initialAirport = searchParams.get('airport') ?? undefined;

  return (
    <BookingWizard
      initialType={initialType}
      initialVehicleId={initialVehicleId}
      initialFrom={initialFrom}
      initialTo={initialTo}
      initialAirport={initialAirport}
    />
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingPageContent />
    </Suspense>
  );
}
