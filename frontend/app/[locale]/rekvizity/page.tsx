import type { Metadata } from 'next';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Реквизиты — NOIR RIDE',
  description: 'Реквизиты исполнителя NOIR RIDE — самозанятый, ИНН, контакты.',
  robots: { index: false },
};

export default function RekvizityPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Реквизиты</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Исполнитель</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.key}>Статус</td>
                <td className={styles.value}>Самозанятый (плательщик налога на профессиональный доход)</td>
              </tr>
              <tr>
                <td className={styles.key}>ФИО</td>
                <td className={styles.value}>Тюрина Юлия Сергеевна</td>
              </tr>
              <tr>
                <td className={styles.key}>ИНН</td>
                <td className={styles.value}>643965505200</td>
              </tr>
              <tr>
                <td className={styles.key}>Вид деятельности</td>
                <td className={styles.value}>Услуги по перевозке пассажиров (услуги водителя-курьера)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Контакты</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.key}>Телефон</td>
                <td className={styles.value}>+7 968 880 4748</td>
              </tr>
              <tr>
                <td className={styles.key}>Email</td>
                <td className={styles.value}>noir.ride999@gmail.com</td>
              </tr>
              <tr>
                <td className={styles.key}>Сайт</td>
                <td className={styles.value}>https://noir-ride.ru</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Документы</h2>
          <p className={styles.link}>
            <a href="/ru/oferta">Публичная оферта на оказание услуг</a>
          </p>
        </section>
      </div>
    </main>
  );
}
