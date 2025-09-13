// hooks/useUrlState.ts
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => (obj[k] = v));
    return obj;
  }, [searchParams]);

  const setParams = useCallback(
    (patch: Record<string, any>, opts: { replace?: boolean } = {}) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) {
          sp.delete(k);
        } else if (Array.isArray(v)) {
          sp.delete(k);
          v.forEach((val) => sp.append(k, String(val)));
        } else {
          sp.set(k, String(v));
        }
      });
      const url = `${pathname}?${sp.toString()}`;
      opts.replace ? router.replace(url) : router.push(url);
    },
    [router, pathname, searchParams]
  );

  return { params, setParams };
}
