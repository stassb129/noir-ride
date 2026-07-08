'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { isSamePageHashLink, scrollToHash } from '@/lib/scroll-to-hash';

type HashLinkProps = ComponentProps<typeof Link>;

export default function HashLink({ href, onClick, ...props }: HashLinkProps) {
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const hrefStr = typeof href === 'string' ? href : href.toString();
    const hash = isSamePageHashLink(pathname, hrefStr);
    if (!hash) return;

    event.preventDefault();
    let attempts = 0;
    const maxAttempts = 8;

    const tryScroll = () => {
      attempts += 1;
      const ok = scrollToHash(hash, hrefStr);
      if (ok || attempts >= maxAttempts) return;
      window.setTimeout(tryScroll, 80);
    };

    // On mobile menu we need a tiny delay so collapsing header
    // doesn't fight with anchor scroll.
    window.setTimeout(tryScroll, 120);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
