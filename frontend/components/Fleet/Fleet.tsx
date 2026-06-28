'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, Luggage, Zap, CarFront } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/lib/motion-easing';
import { fetchVehicles, getVehiclePhotos, type Vehicle } from '@/lib/api/vehicles';
import VehicleModal from '@/components/VehicleModal/VehicleModal';
import ServicePickerModal from '@/components/ServicePickerModal/ServicePickerModal';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import styles from './Fleet.module.scss';

const PAGE_SIZE = 6;

const vehicleVariants = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  hover: {
    transition: { duration: 0.3 },
  },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

function getCardSubtitle(vehicle: Vehicle): string | null {
  const text = vehicle.description?.trim();
  if (!text) return null;
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

function getLuggageLabel(vehicle: Vehicle, ru: boolean): string {
  if (vehicle.luggage) return vehicle.luggage;
  return ru ? '2 больших или 3 маленьких' : '2 large or 3 small';
}

export default function Fleet() {
  const locale = useLocale();
  const ru = locale === 'ru';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [modalVehicle, setModalVehicle] = useState<Vehicle | null>(null);
  const [orderVehicle, setOrderVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchVehicles()
      .then((data) => {
        if (cancelled) return;
        const active = data
          .filter((v) => v.isActive !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setVehicles(active);
      })
      .catch(() => {
        if (!cancelled) setVehicles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const openOrderPicker = (vehicle: Vehicle) => {
    setModalVehicle(null);
    setOrderVehicle(vehicle);
  };

  const visibleVehicles = vehicles.slice(0, visibleCount);
  const hasMore = visibleCount < vehicles.length;

  const fleetTitle = !loading && vehicles.length > 0
    ? (ru
      ? `${vehicles.length} ${vehicles.length === 1 ? 'автомобиль' : vehicles.length < 5 ? 'автомобиля' : 'автомобилей'} в парке`
      : `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'} in our fleet`)
    : (ru ? 'Премиальные автомобили с водителем' : 'Premium chauffeured vehicles');

  return (
    <section className={styles.fleet}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow={ru ? 'Автопарк' : 'Fleet'}
          title={fleetTitle}
          description={
            ru
              ? 'От бизнес-седанов до представительского класса — выберите автомобиль под вашу поездку'
              : 'From business sedans to flagship models — pick the car for your trip'
          }
          icon={CarFront}
          as="h2"
          animate
        />

        {loading ? (
          <p className={styles.status}>{ru ? 'Загрузка автопарка…' : 'Loading fleet…'}</p>
        ) : vehicles.length === 0 ? (
          <p className={styles.status}>{ru ? 'Автопарк скоро появится' : 'Fleet coming soon'}</p>
        ) : (
          <>
            <motion.div
              className={styles.vehicleList}
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
            >
              {visibleVehicles.map((vehicle) => {
                const coverPhoto = getVehiclePhotos(vehicle)[0];
                const subtitle = getCardSubtitle(vehicle);
                const specs = [
                  {
                    icon: Users,
                    value: ru
                      ? `${vehicle.passengers} ${vehicle.passengers === 1 ? 'место' : vehicle.passengers < 5 ? 'места' : 'мест'}`
                      : `${vehicle.passengers} ${vehicle.passengers === 1 ? 'seat' : 'seats'}`,
                  },
                  {
                    icon: Luggage,
                    value: getLuggageLabel(vehicle, ru),
                  },
                  {
                    icon: Zap,
                    value: vehicle.category || (ru ? 'Премиум' : 'Premium'),
                  },
                ];

                return (
                  <motion.div
                    key={vehicle.id}
                    className={styles.vehicle}
                    variants={vehicleVariants}
                    whileHover="hover"
                  >
                    <motion.div
                      className={styles.vehicleImage}
                      style={
                        coverPhoto
                          ? {
                              background: `linear-gradient(135deg, rgba(10, 10, 10, 0.4), rgba(10, 10, 10, 0.7)), url(${coverPhoto})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : undefined
                      }
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
                    >
                      {!coverPhoto && <span className={styles.photoPlaceholder}>🚗</span>}
                    </motion.div>
                    <div className={styles.vehicleOverlay} />

                    <div className={styles.vehicleContent}>
                      <h3 className={styles.vehicleName}>
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      {subtitle && (
                        <p className={styles.vehicleDescription}>{subtitle}</p>
                      )}

                      <div className={styles.specs}>
                        {specs.map((spec, index) => {
                          const Icon = spec.icon;
                          return (
                            <div key={index} className={styles.spec}>
                              <Icon className={styles.specIcon} />
                              <span className={styles.specValue}>{spec.value}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.aboutBtn}
                          onClick={() => setModalVehicle(vehicle)}
                        >
                          {ru ? 'Подробнее' : 'Details'}
                        </button>
                        <button
                          type="button"
                          className={styles.orderBtn}
                          onClick={() => openOrderPicker(vehicle)}
                        >
                          {ru ? 'Заказать' : 'Book'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {hasMore && (
              <div className={styles.loadMoreWrap}>
                <button
                  type="button"
                  className={styles.loadMoreBtn}
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                >
                  {ru ? 'Загрузить ещё' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalVehicle && (
        <VehicleModal
          vehicle={modalVehicle}
          onClose={() => setModalVehicle(null)}
          onOrder={() => openOrderPicker(modalVehicle)}
        />
      )}

      {orderVehicle && (
        <ServicePickerModal
          vehicle={orderVehicle}
          onClose={() => setOrderVehicle(null)}
        />
      )}
    </section>
  );
}
