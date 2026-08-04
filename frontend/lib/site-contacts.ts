export const SITE_CONTACTS = {
  phone: process.env.NEXT_PUBLIC_PHONE ?? '+79858682304',
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE_DISPLAY ?? '+7 985 868 2304',
  email: process.env.NEXT_PUBLIC_EMAIL ?? 'stassb129@gmail.com',
  telegram: process.env.NEXT_PUBLIC_TELEGRAM ?? 'https://t.me/stassb129',
  telegramLabel: process.env.NEXT_PUBLIC_TELEGRAM_LABEL ?? '@stassb129',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? 'https://wa.me/79858682304',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? 'https://instagram.com/noirride',
  instagramLabel: process.env.NEXT_PUBLIC_INSTAGRAM_LABEL ?? '@noirride',
  vk: process.env.NEXT_PUBLIC_VK ?? 'https://vk.com/noirride',
} as const;

export function phoneHref(phone = SITE_CONTACTS.phone): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function emailHref(email = SITE_CONTACTS.email): string {
  return `mailto:${email}`;
}
