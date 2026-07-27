(() => {
  const copy = window.HOME_COPY || {};
  let lang = localStorage.getItem('lang') || 'en';
  let theme = getTimeTheme();
  let themeTimer;
  const langToggle = document.getElementById('langToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  function applyLanguage(next) {
    if (!copy[next]) next = 'en';
    lang = next;
    localStorage.setItem('lang', next);
    document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const value = copy[next]?.[element.dataset.i18n];
      if (value !== undefined) element.textContent = value;
    });
    document.title = copy[next]?.title || document.title;
    langToggle.textContent = next === 'zh' ? 'EN' : '中';
  }

  function getTimeTheme(date = new Date()) {
    const hour = date.getHours();
    return hour >= 7 && hour < 19 ? 'light' : 'dark';
  }

  function applyTheme(next) {
    theme = next;
    document.documentElement.dataset.theme = next;
    themeIcon.textContent = next === 'dark' ? '☀' : '☾';
  }

  function scheduleTimeTheme() {
    clearTimeout(themeTimer);
    applyTheme(getTimeTheme());
    const now = new Date();
    const nextChange = new Date(now);
    if (now.getHours() < 7) nextChange.setHours(7, 0, 0, 0);
    else if (now.getHours() < 19) nextChange.setHours(19, 0, 0, 0);
    else {
      nextChange.setDate(nextChange.getDate() + 1);
      nextChange.setHours(7, 0, 0, 0);
    }
    themeTimer = window.setTimeout(scheduleTimeTheme, nextChange - now + 1000);
  }

  langToggle.addEventListener('click', () => applyLanguage(lang === 'zh' ? 'en' : 'zh'));
  themeToggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));
  applyLanguage(lang);
  scheduleTimeTheme();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleTimeTheme();
  });

  const topbar = document.getElementById('topbar');
  window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

  const canvas = document.getElementById('starfield');
  const context = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let stars = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: width < 700 ? 55 : 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.25 + .25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * .006 + .002
    }));
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    const rgb = getComputedStyle(document.body).getPropertyValue('--accent-rgb').trim() || '100,180,230';
    stars.forEach((star) => {
      const alpha = reduceMotion ? .28 : .16 + (Math.sin(time * star.speed + star.phase) + 1) * .17;
      context.beginPath();
      context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(${rgb},${alpha})`;
      context.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
})();
