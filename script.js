/* =========================================================
   Mohammed Lakhal — Portfolio interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Preloader ---------- */
  window.addEventListener("load", () => {
    const pre = $("#preloader");
    if (!pre) return;
    setTimeout(() => {
      pre.classList.add("is-done");
      document.body.style.overflow = "";
    }, 700);
  });
  document.body.style.overflow = "hidden";

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Nav scroll state + progress ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const sections = $$("main section[id]");
  const navAnchors = $$(".nav__links a");

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);

    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }

    let current = "";
    sections.forEach((sec) => {
      if (y >= sec.offsetTop - 140) current = sec.id;
    });
    navAnchors.forEach((a) =>
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current)
    );
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const navLinks = $("#navLinks");
  const closeMenu = () => {
    if (!burger || !navLinks) return;
    burger.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    document.body.style.overflow = "";
  };
  if (burger) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$(".nav__links a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  /* ---------- Cursor glow (desktop only) ---------- */
  const glow = $("#cursorGlow");
  if (glow && window.matchMedia("(pointer:fine)").matches) {
    let gx = 0,
      gy = 0,
      cx = 0,
      cy = 0;
    window.addEventListener("mousemove", (e) => {
      gx = e.clientX;
      gy = e.clientY;
      glow.style.opacity = "1";
    });
    (function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Typewriter ---------- */
  const phrases = {
    fr: ["Full Stack Java", "Spring Boot", "Microservices", "React.js", "Next.js", "TypeScript", "APIs REST sécurisées"],
    en: ["Full Stack Java", "Spring Boot", "Microservices", "React.js", "Next.js", "TypeScript", "Secure REST APIs"],
  };
  const tw = $("#typewriter");
  let twIndex = 0,
    charIndex = 0,
    deleting = false,
    currentLang = "fr";

  function type() {
    const list = phrases[currentLang];
    const full = list[twIndex % list.length];
    if (!deleting) {
      charIndex++;
      if (charIndex >= full.length) {
        charIndex = full.length;
        if (tw) tw.textContent = full;
        deleting = true;
        return setTimeout(type, 1500);
      }
    } else {
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        twIndex++;
      }
    }
    if (tw) tw.textContent = full.substring(0, charIndex);
    setTimeout(type, deleting ? 45 : 85);
  }
  if (tw) setTimeout(type, 900);

  /* ---------- Counters ---------- */
  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          let val = 0;
          const step = Math.max(1, Math.round(target / 40));
          const run = () => {
            val += step;
            if (val >= target) {
              el.textContent = target + suffix;
              return;
            }
            el.textContent = val;
            requestAnimationFrame(run);
          };
          run();
          co.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- Language toggle ---------- */
  const langOpts = $$(".lang-toggle__opt");
  function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;

    $$("[data-fr]").forEach((el) => {
      const val = el.getAttribute("data-" + lang);
      if (val !== null) el.textContent = val;
    });
    $$("[data-ph-fr]").forEach((el) => {
      const val = el.getAttribute("data-ph-" + lang);
      if (val !== null) el.placeholder = val;
    });
    langOpts.forEach((o) =>
      o.classList.toggle("is-active", o.dataset.lang === lang)
    );
    try {
      localStorage.setItem("ml-lang", lang);
    } catch (e) {}
  }
  langOpts.forEach((opt) =>
    opt.addEventListener("click", () => setLang(opt.dataset.lang))
  );

  let saved = "fr";
  try {
    saved = localStorage.getItem("ml-lang") || "fr";
  } catch (e) {}
  if (saved === "en") setLang("en");

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const note = $("#formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();
      if (!name || !email || !message) return;

      const subject = encodeURIComponent(`Portfolio — ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:mohammedlakhal272@gmail.com?subject=${subject}&body=${body}`;

      if (note) {
        note.classList.add("is-success");
        note.textContent =
          currentLang === "fr"
            ? "Merci ! Votre client mail va s'ouvrir…"
            : "Thanks! Your mail client will open…";
      }
      form.reset();
    });
  }

  /* ---------- Marquee duplicate for seamless loop ---------- */
  const track = $("#marqueeTrack");
  if (track) track.innerHTML += track.innerHTML;
})();
