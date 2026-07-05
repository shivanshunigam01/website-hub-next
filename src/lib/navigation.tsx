"use client";

import NextLink from "next/link";
import {
  useRouter,
  useParams as useNextParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import {
  forwardRef,
  type ComponentProps,
  type ReactNode,
  useMemo,
  useEffect,
  useState,
} from "react";

type SearchRecord = Record<string, unknown>;

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  to: string;
  search?: SearchRecord;
  params?: Record<string, string>;
  hash?: string;
  children?: ReactNode;
};

function buildHref(
  to: string,
  search?: SearchRecord,
  params?: Record<string, string>,
  hash?: string,
): string {
  let path = to;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`$${key}`, value).replace(`:${key}`, value);
    }
  }
  if (search) {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(search)) {
      if (value == null || value === "") continue;
      q.set(key, String(value));
    }
    const qs = q.toString();
    if (qs) path += `?${qs}`;
  }
  if (hash) path += `#${hash.replace(/^#/, "")}`;
  return path;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, search, params, hash, children, ...rest },
  ref,
) {
  const href = buildHref(to, search, params, hash);
  return (
    <NextLink ref={ref} href={href} scroll {...rest}>
      {children}
    </NextLink>
  );
});
Link.displayName = "Link";

function readSearchRecord(sp: URLSearchParams): SearchRecord {
  const out: SearchRecord = {};
  sp.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

export function useNavigate() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();

  return (opts: {
    to?: string;
    search?: SearchRecord | ((prev: SearchRecord) => SearchRecord);
    replace?: boolean;
    hash?: string;
  }) => {
    const target = opts.to ?? pathname;
    let search = opts.search;
    if (typeof search === "function") {
      search = search(readSearchRecord(searchParams));
    }
    const href = buildHref(target, search, undefined, opts.hash);
    if (opts.replace) router.replace(href);
    else router.push(href);
    return Promise.resolve();
  };
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useNextParams() as T;
}

export function useRouterState<T = { location: { pathname: string; hash: string } }>(opts?: {
  select?: (state: { location: { pathname: string; hash: string } }) => T;
}): T {
  const pathname = usePathname() || "/";
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () => setHash(window.location.hash.replace(/^#/, ""));
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, [pathname]);
  const state = { location: { pathname, hash } };
  return opts?.select ? opts.select(state) : (state as T);
}

export function useSearch<T extends SearchRecord = SearchRecord>(): T {
  const sp = useSearchParams();
  return useMemo(() => {
    const out: SearchRecord = {};
    sp.forEach((value, key) => {
      out[key] = value;
    });
    return out as T;
  }, [sp]);
}

export function Outlet({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function Navigate({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
}

/** @deprecated TanStack compatibility — SEO lives in Next.js page metadata */
export function createFileRoute(_path: string) {
  return (config: { component?: () => ReactNode; head?: () => unknown; validateSearch?: unknown }) =>
    config;
}
