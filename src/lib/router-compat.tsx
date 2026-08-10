'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Link({ to, href, children, className, onClick, ...props }: any) {
  const destination = href || to || '#';
  return (
    <NextLink href={destination} className={className} onClick={onClick} {...props}>
      {children}
    </NextLink>
  );
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname: pathname || '/', search: '', hash: '', state: null, key: 'default' };
}

export function useNavigate() {
  const router = useRouter();
  return (path: string | number, options?: any) => {
    if (typeof path === 'number') {
      if (path === -1) router.back();
      return;
    }
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}
