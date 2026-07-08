import { getLenis } from './smooth-scroll';

// Offset so the target clears the fixed navbar (~80px) with a small gap.
const NAV_OFFSET = -90;

function smoothScrollTo(target: HTMLElement): void {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: NAV_OFFSET });
  } else {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function scrollToHash(hash: string, updateUrl?: string): boolean {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  const target = document.getElementById(id);
  if (!target) return false;

  smoothScrollTo(target);
  if (updateUrl) {
    window.history.pushState(null, '', updateUrl);
  }
  return true;
}

export function scrollToBookingDetails() {
  window.setTimeout(() => {
    const target = document.getElementById('booking-details');
    if (target) smoothScrollTo(target);
  }, 150);
}

export function isSamePageHashLink(pathname: string, href: string): string | null {
  const hashIndex = href.indexOf('#');
  if (hashIndex === -1) return null;

  const basePath = href.slice(0, hashIndex);
  const hash = href.slice(hashIndex + 1);
  if (!hash) return null;

  const normalizedPath = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
  const normalizedBase = basePath.endsWith('/') && basePath.length > 1
    ? basePath.slice(0, -1)
    : basePath;

  return normalizedPath === normalizedBase ? hash : null;
}
