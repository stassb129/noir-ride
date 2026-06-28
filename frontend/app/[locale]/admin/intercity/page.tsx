'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/utils/fetchWithAuth';
import styles from './intercity.module.scss';

interface Destination {
  id: number;
  from: string;
  to: string;
  distanceKm: number;
  basePrice: number;
  isPredefined: boolean;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY: Partial<Destination> = {
  from: 'Москва', to: '', distanceKm: 0,
  isPredefined: true,
  isActive: true, sortOrder: 0,
};

export default function AdminIntercityPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Destination>>(EMPTY);
  const [isNew, setIsNew] = useState(true);
  const [saving, setSaving] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/admin/intercity`);
      const data = await res.json();
      setDestinations(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); setShowModal(true); };
  const openEdit = (d: Destination) => { setEditing({ ...d }); setIsNew(false); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      const url = isNew ? `${API}/admin/intercity` : `${API}/admin/intercity/${editing.id}`;
      const res = await fetchWithAuth(url, { method: isNew ? 'POST' : 'PATCH', body: JSON.stringify(editing) });
      if (res.ok) { setShowModal(false); await load(); }
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить направление?')) return;
    await fetchWithAuth(`${API}/admin/intercity/${id}`, { method: 'DELETE' });
    await load();
  };

  const seed = async () => {
    await fetch(`${API}/intercity/seed?force=true`);
    await load();
  };

  const field = (key: keyof Destination, label: string, type = 'text') => (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <input
        type={type}
        value={(editing[key] as string | number) ?? ''}
        onChange={(e) => setEditing((p) => ({
          ...p,
          [key]: type === 'number' ? (e.target.value === '' ? 0 : Number(e.target.value)) : e.target.value,
        }))}
        className={styles.input}
        step={type === 'number' ? '1' : undefined}
        min={type === 'number' ? '0' : undefined}
      />
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Межгород — направления</h1>
        <div className={styles.headerBtns}>
          <button className={styles.seedBtn} onClick={seed}>Сбросить к стандартным</button>
          <button className={styles.addBtn} onClick={openNew}>+ Добавить</button>
        </div>
      </div>

      {loading ? <p className={styles.loading}>Загрузка...</p> : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Откуда</span>
            <span>Куда</span>
            <span>Км</span>
            <span>Тип</span>
            <span>Статус</span>
            <span />
          </div>
          {destinations.map((d) => (
            <div key={d.id} className={styles.tableRow}>
              <span className={styles.city}>{d.from}</span>
              <span className={styles.city}>{d.to}</span>
              <span>{d.distanceKm} км</span>
              <span>
                <span className={`${styles.badge} ${d.isPredefined ? styles.badgePrimary : styles.badgeSecondary}`}>
                  {d.isPredefined ? 'Фикс.' : 'Расч.'}
                </span>
              </span>
              <span>
                <span className={`${styles.badge} ${d.isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {d.isActive ? 'Активен' : 'Скрыт'}
                </span>
              </span>
              <span className={styles.actions}>
                <button className={styles.editBtn} onClick={() => openEdit(d)}>Изм.</button>
                <button className={styles.deleteBtn} onClick={() => remove(d.id)}>Удал.</button>
              </span>
            </div>
          ))}
          {destinations.length === 0 && (
            <p className={styles.empty}>Направлений нет. Нажмите «Сбросить к стандартным».</p>
          )}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className={styles.modal}>
            <h2>{isNew ? 'Добавить направление' : 'Редактировать'}</h2>

            <div className={styles.row}>
              {field('from', 'Откуда')}
              {field('to', 'Куда')}
            </div>
            {field('distanceKm', 'Расстояние (км)', 'number')}
            <div className={styles.row}>
              {field('sortOrder', 'Порядок', 'number')}
              <div className={styles.formGroup}>
                <label>Статус</label>
                <select className={styles.input}
                  value={editing.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditing((p) => ({ ...p, isActive: e.target.value === 'true' }))}>
                  <option value="true">Активен</option>
                  <option value="false">Скрыт</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>
                <input type="checkbox" checked={!!editing.isPredefined}
                  onChange={(e) => setEditing((p) => ({ ...p, isPredefined: e.target.checked }))}
                  style={{ marginRight: 8 }} />
                Показывать в списке направлений (фиксированный маршрут)
              </label>
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
