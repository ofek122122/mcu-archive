"use client";

import { useEffect } from "react";

/**
 * Freeze the page behind an overlay for as long as the caller is mounted.
 *
 * Locks `<html>` as well as `<body>`. The scrolling element on this page is the
 * root, so locking `<body>` alone does nothing — every overlay in the app had
 * set only `body.style.overflow` and the list scrolled away underneath all of
 * them. It shows worst on a phone, where the sheet covers the page and the
 * content you were looking at is gone when you close it.
 *
 * `mediaQuery` narrows the lock to widths where the overlay actually covers the
 * page: the filter panel is a full-height sheet on a phone but a small dropdown
 * beside the content above `sm`, where freezing the page would be obnoxious.
 * It is evaluated once on mount rather than watched, since an overlay's job is
 * decided when it opens.
 */
export function useScrollLock(mediaQuery?: string) {
  useEffect(() => {
    if (mediaQuery && !window.matchMedia(mediaQuery).matches) return;

    const root = document.documentElement;
    const previousRoot = root.style.overflow;
    const previousBody = document.body.style.overflow;

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      root.style.overflow = previousRoot;
      document.body.style.overflow = previousBody;
    };
  }, [mediaQuery]);
}
