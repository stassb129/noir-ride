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
    scrollToHash(hash, hrefStr);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
