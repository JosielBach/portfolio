(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  var nameTarget = document.getElementById('typedName');
  var cursor     = document.getElementById('heroCursor');
  var fullName   = 'Josiel Bach';

  if (reduceMotion) {
    nameTarget.textContent = fullName;
  } else {
    var i = 0;
    (function typeWriter() {
      if (i < fullName.length) {
        nameTarget.textContent += fullName[i];
        i++;
        setTimeout(typeWriter, 110);
      } else {
        cursor.style.animation = 'none';
        cursor.style.opacity = '1';
        setTimeout(function () { cursor.style.animation = ''; }, 1500);
      }
    })();
  }

  /* -----------------------------------------------
     NAVBAR — sombra ao rolar + seção ativa
  ----------------------------------------------- */
  var navbar   = document.getElementById('navbar');
  var sections = document.querySelectorAll('section[id]');
  var navItems = document.querySelectorAll('.nav-links a[data-section]');
  var ticking  = false;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    var current = '';
    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
    });

    navItems.forEach(function (a) {
      a.classList.toggle('active', a.dataset.section === current);
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  /* -----------------------------------------------
     MENU MOBILE
  ----------------------------------------------- */
  var burger    = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');

  function closeMobile() {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function () {
    var open = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobile);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobile();
  });

  /* -----------------------------------------------
     FADE-IN via IntersectionObserver
  ----------------------------------------------- */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* -----------------------------------------------
     FORMULÁRIO — monta um mailto (sem back-end)
  ----------------------------------------------- */
  var form = document.getElementById('contactForm');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name  = document.getElementById('contactName').value.trim();
    var email = document.getElementById('contactEmail').value.trim();
    var msg   = document.getElementById('contactMsg').value.trim();

    if (!name || !email || !msg) {
      showToast('⚠️ Preencha todos os campos.', '#f59e0b');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ E-mail inválido.', '#f59e0b');
      return;
    }

    var subject = 'Contato pelo portfólio — ' + name;
    var body    = msg + '\n\n---\n' + name + '\n' + email;

    window.location.href = 'mailto:josielbach86@gmail.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body='    + encodeURIComponent(body);

    showToast('📨 Abrindo seu app de e-mail...', '#10b981');
  });

  /* -----------------------------------------------
     TOAST
  ----------------------------------------------- */
  var toastTimer;
  function showToast(msg, color) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.borderColor = color || '#3b82f6';
    toast.style.color       = color || '#3b82f6';
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  /* -----------------------------------------------
     SCROLL SUAVE com offset da navbar
  ----------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href === '#') return;

      var target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  /* -----------------------------------------------
     ANO NO RODAPÉ
  ----------------------------------------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
