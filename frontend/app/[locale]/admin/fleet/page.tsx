'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import styles from './fleet.module.scss';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  photoUrl: string | null;
  photos: string[] | null;
  description: string | null;
  category: string | null;
  passengers: number;
  luggage: string | null;
  childSeat: boolean;
  priceAirport: number | null;
  priceIntercity: number | null;
  priceHourly: number | null;
  pricePerKm: number;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY: Partial<Vehicle> = {
  brand: 'Mercedes-Benz',
  model: '',
  photoUrl: '',
  photos: [],
  description: '',
  category: '',
  passengers: 3,
  luggage: '2 больших или 3 маленьких',
  childSeat: true,
  priceAirport: undefined,
  priceIntercity: undefined,
  priceHourly: undefined,
  pricePerKm: 100,
  isActive: true,
  sortOrder: 0,
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Vehicle>>(EMPTY);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles`);
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); setShowModal(true); };
  const openEdit = (v: Vehicle) => {
    setEditing({
      ...v,
      photos: Array.isArray(v.photos) && v.photos.length > 0
        ? v.photos
        : v.photoUrl
          ? [v.photoUrl]
          : [],
    });
    setIsNew(false);
    setShowModal(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const photos = (editing.photos ?? [])
        .map((url) => url.trim())
        .filter(Boolean);
      const payload = {
        ...editing,
        photos,
        photoUrl: photos[0] ?? editing.photoUrl ?? '',
      };
      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${editing.id}`;
      const res = await fetchWithAuth(url, { method: isNew ? 'POST' : 'PATCH', body: JSON.stringify(payload) });
      if (res.ok) { setShowModal(false); await load(); }
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить автомобиль?')) return;
    await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/vehicles/${id}`, { method: 'DELETE' });
    await load();
  };

  const seed = async (force = false) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/seed${force ? '?force=true' : ''}`);
    await load();
  };

  const field = (key: keyof Vehicle, label: string, type = 'text') => (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <input
        type={type}
        value={(editing[key] as string | number) ?? ''}
        onChange={(e) =>
          setEditing((prev) => ({
            ...prev,
            [key]: type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value,
          }))
        }
        className={styles.input}
        step={type === 'number' ? '1' : undefined}
        min={type === 'number' ? '0' : undefined}
      />
    </div>
  );

  const textarea = (key: keyof Vehicle, label: string) => (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <textarea
        value={(editing[key] as string) ?? ''}
        onChange={(e) => setEditing((prev) => ({ ...prev, [key]: e.target.value }))}
        className={`${styles.input} ${styles.textarea}`}
        rows={4}
      />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Автопарк</h1>
        <div className={styles.headerBtns}>
          <button className={styles.seedBtn} onClick={() => seed(vehicles.length > 0)}>
            {vehicles.length === 0 ? 'Заполнить стандартными' : 'Пересеять стандартные'}
          </button>
          <button className={styles.addBtn} onClick={openNew}>+ Добавить автомобиль</button>
        </div>
      </div>

      {loading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : vehicles.length === 0 ? (
        <p className={styles.empty}>Автопарк пуст. Нажмите «Заполнить стандартными» или добавьте вручную.</p>
      ) : (
        <div className={styles.grid}>
          {vehicles.map((v) => (
            <div key={v.id} className={styles.card}>
              {v.photoUrl ? (
                <img src={v.photoUrl} alt={v.model} className={styles.cardPhoto} />
              ) : (
                <div className={styles.cardPhotoPlaceholder}>🚗</div>
              )}
              <div className={styles.cardBody}>
                {v.category && <div className={styles.cardCategory}>{v.category}</div>}
                <div className={styles.cardBrand}>{v.brand}</div>
                <div className={styles.cardModel}>{v.model}</div>
                <div className={styles.cardSpecs}>
                  <span>👥 {v.passengers} чел.</span>
                  {v.luggage && <span>🧳 {v.luggage}</span>}
                  {v.childSeat && <span>👶 Детское кресло</span>}
                </div>
                {v.description && (
                  <p className={styles.cardDesc}>{v.description.slice(0, 100)}{v.description.length > 100 ? '...' : ''}</p>
                )}
                <div className={styles.prices}>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Аэропорт</span>
                    <span className={styles.priceValue}>{v.priceAirport ? `${Number(v.priceAirport).toLocaleString()}₽` : '—'}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Межгород</span>
                    <span className={styles.priceValue}>{v.pricePerKm ? `${Number(v.pricePerKm).toLocaleString()}₽/км` : '—'}</span>
                  </div>
                  <div className={styles.priceItem}>
                    <span className={styles.priceLabel}>Почасовая</span>
                    <span className={styles.priceValue}>{v.priceHourly ? `${Number(v.priceHourly).toLocaleString()}₽/ч` : '—'}</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(v)}>Изменить</button>
                  <button className={styles.deleteBtn} onClick={() => remove(v.id)}>Удалить</button>
                  <span className={`${styles.statusBadge} ${v.isActive ? styles.active : styles.inactive}`}>
                    {v.isActive ? 'Активен' : 'Скрыт'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{isNew ? 'Добавить автомобиль' : 'Редактировать'}</h2>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.row}>
                {field('brand', 'Марка')}
                {field('model', 'Модель (например: E-Class 213)')}
              </div>

              {field('category', 'Категория (напр. Бизнес-класс, Представительский)')}
              <div className={styles.formGroup}>
                <label>Фотографии (один URL на строку)</label>
                <textarea
                  value={(editing.photos ?? []).join('\n')}
                  onChange={(e) => {
                    const photos = e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean);
                    setEditing((prev) => ({
                      ...prev,
                      photos,
                      photoUrl: photos[0] ?? '',
                    }));
                  }}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={4}
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                />
              </div>
              {textarea('description', 'Описание автомобиля')}

              <div className={styles.row}>
                {field('passengers', 'Пассажиров', 'number')}
                {field('luggage', 'Багаж (напр. 2 больших или 3 маленьких)')}
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!editing.childSeat}
                    onChange={(e) => setEditing((prev) => ({ ...prev, childSeat: e.target.checked }))}
                    style={{ marginRight: 8 }}
                  />
                  Детское кресло/бустер по запросу
                </label>
              </div>

              <div className={`${styles.row} ${styles.rowThree}`}>
                {field('priceAirport', 'Аэропорт ₽', 'number')}
                {field('pricePerKm', 'Межгород ₽/км', 'number')}
                {field('priceHourly', 'Почасовая ₽/ч', 'number')}
              </div>

              <div className={styles.row}>
                {field('sortOrder', 'Порядок', 'number')}
                <div className={styles.formGroup}>
                  <label>Статус</label>
                  <select
                    value={editing.isActive ? 'true' : 'false'}
                    onChange={(e) => setEditing((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className={styles.input}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="true">Активен</option>
                    <option value="false">Скрыт</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={save} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
