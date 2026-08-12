"use client";

import { Suspense, useState } from "react";

export function SearchParamsWrapper({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
  const [searchParams] = useState(() => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''));
  
  return (
    <Suspense fallback={null}>
      {children(searchParams)}
    </Suspense>
  );
}
