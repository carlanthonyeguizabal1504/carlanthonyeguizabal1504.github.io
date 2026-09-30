(() => {
  document.documentElement.classList.add("js-ready");

  document.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest("[data-scroll-top]")
        : null;
    if (!target) return;

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener(
    "click",
    (event) => {
      const link =
        event.target instanceof Element
          ? event.target.closest("a[data-page-link]")
          : null;
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const url = new URL(link.href, window.location.href);
      const isSamePage =
        url.pathname === window.location.pathname && url.hash === window.location.hash;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (url.origin !== window.location.origin || isSamePage || reduceMotion) return;

      event.preventDefault();
      document.documentElement.classList.add("is-page-leaving");
      window.setTimeout(() => window.location.assign(url.href), 360);
    },
    true,
  );
})();
