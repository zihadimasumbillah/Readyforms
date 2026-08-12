"use client";

import { useState, useEffect } from "react";

export function useQueryParams() {
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, []);

  return params;
}
