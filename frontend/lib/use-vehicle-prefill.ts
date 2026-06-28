'use client';

import { useEffect, useRef } from 'react';
import { clampPassengers } from '@/lib/booking-passengers';
import type { Vehicle } from '@/lib/api/vehicles';

/** Применить предвыбранный автомобиль один раз после загрузки списка */
export function useVehiclePrefill(
  vehicles: Vehicle[],
  initialVehicleId: number | null | undefined,
  apply: (vehicle: Vehicle) => void,
) {
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current || !initialVehicleId || vehicles.length === 0) return;

    const vehicle = vehicles.find(
      (v) => v.id === initialVehicleId && v.isActive !== false,
    );
    if (!vehicle) return;

    applied.current = true;
    apply(vehicle);
  }, [initialVehicleId, vehicles, apply]);
}

export function getPrefilledPassengers(current: number, vehicle: Vehicle): number {
  return clampPassengers(current, vehicle.passengers);
}
