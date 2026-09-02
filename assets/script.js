(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hub      = document.getElementById('hub');
  var hubHint  = document.getElementById('hubHint');
  var panels   = Array.prototype.slice.call(document.querySelectorAll('.panel'));
  var order    = panels.map(function (p) { return p.id; });
  var defaultHint = hubHint ? hubHint.innerHTML : '';
  var current  = null;

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

  function idFromHash() {
    var id = (location.hash || '').replace('#', '');
    return order.indexOf(id) !== -1 ? id : null;
  }

  function revealFades(panel) {
    panel.querySelectorAll('.fade-in').forEach(function (el, i) {

      el.style.transitionDelay = Math.min(i * 45, 480) + 'ms';
      el.classList.add('visible');
    });
  }

  function render() {
    var id = idFromHash();
    if (id === current) return;
    current = id;

    panels.forEach(function (p) {
      var open = p.id === id;
      p.classList.toggle('open', open);
      p.setAttribute('aria-hidden', String(!open));
      if (open) {
        p.querySelector('.panel-body').scrollTop = 0;
        revealFades(p);

        setTimeout(function () { p.focus({ preventScroll: true }); }, 60);
      }
    });

    hub.classList.toggle('dimmed', !!id);
    hub.setAttribute('aria-hidden', String(!!id));

    document.documentElement.classList.toggle('panel-open', !!id);
    document.title = id
      ? sectionLabel(id) + ' · Josiel Bach'
      : 'Josiel Bach · Desenvolvedor Back-End .NET';
  }

  function sectionLabel(id) {
    var node = document.querySelector('.node[data-target="' + id + '"] .node-label');
    return node ? node.textContent : id;
  }

  function goHome() {
    if (location.hash) {
      history.pushState(null, '', location.pathname + location.search);
    }
    render();
  }

  function goTo(id, origin) {
    if (location.hash.replace('#', '') === id) return;
    var panel = document.getElementById(id);

    if (panel) panel.style.transformOrigin = origin || '50% 50%';
    history.pushState(null, '', '#' + id);
    render();
  }

  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return (r.left + r.width / 2).toFixed(0) + 'px ' + (r.top + r.height / 2).toFixed(0) + 'px';
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);

  document.querySelectorAll('.node').forEach(function (node) {
    node.addEventListener('click', function (e) {
      e.preventDefault();
      goTo(node.dataset.target, centerOf(node.querySelector('.node-dot')));
    });

    ['mouseenter', 'focus'].forEach(function (evt) {
      node.addEventListener(evt, function () {
        if (!hubHint) return;
        hubHint.innerHTML = '// <b>' + sectionLabel(node.dataset.target) + '</b> — ' + node.dataset.hint;
      });
    });
    ['mouseleave', 'blur'].forEach(function (evt) {
      node.addEventListener(evt, function () {
        if (hubHint) hubHint.innerHTML = defaultHint;
      });
    });
  });

  document.querySelectorAll('[data-close], [data-home]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      goHome();
    });
  });

  function step(delta) {
    if (!current) return;
    var idx = (order.indexOf(current) + delta + order.length) % order.length;
    goTo(order[idx]);
  }

  document.querySelectorAll('[data-go]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      step(btn.dataset.go === 'next' ? 1 : -1);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) { goHome(); return; }
    if (!current) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft')  step(-1);
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.classList.contains('node') || a.hasAttribute('data-home')) return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').replace('#', '');
      if (order.indexOf(id) === -1) return;
      e.preventDefault();
      goTo(id);
    });
  });

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

  document.getElementById('year').textContent = new Date().getFullYear();

  render();
  requestAnimationFrame(function () { hub.classList.add('ready'); });
})();
