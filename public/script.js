(() => {
  document.documentElement.classList.add("js-ready");

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-scroll-top]");
    if (!target) return;

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
