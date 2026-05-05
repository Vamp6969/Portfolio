// Single shared IntersectionObserver for all .reveal elements on the page.
// Lives once in BaseLayout, observes every .reveal, and unobserves on first
// intersection. Disabled when prefers-reduced-motion is set.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -100px 0px', threshold: 0.05 },
  );

  const start = () => {
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
