/* Shared behaviour for every page: app hand-off links, nav drawer, scroll reveals.
   Loaded with `defer`; replaces the reveal and nav-toggle snippets that used to be
   pasted into each page by hand. */
(function () {
  'use strict';

  /* The one place the product app lives. Every CTA also ships a working absolute
     href in markup, so this file only has to be right for param decoration — if it
     fails to load, the links still go to the right place. */
  var APP_ORIGIN = 'https://d1v7uf95aw2lbq.cloudfront.net';
  var APP_PATHS = { register: '/auth/register', login: '/auth/login' };

  var CARRY = /^(utm_[a-z_]+|gclid|fbclid|msclkid)$/;

  function pageRef() {
    var name = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    return name || 'index';
  }

  /* Params from the ad or referrer that brought the visitor here beat our own
     defaults — they name the real acquisition source and we are only a hop. */
  function attribution() {
    var carried = {};
    new URLSearchParams(location.search).forEach(function (value, key) {
      if (CARRY.test(key) && value) carried[key] = value;
    });
    if (!carried.utm_source) {
      carried.utm_source = 'legisly.ai';
      carried.utm_medium = 'landing';
    }
    carried.ref = pageRef();
    return carried;
  }

  function appUrl(target, params) {
    var url = new URL(APP_PATHS[target] || APP_PATHS.register, APP_ORIGIN);
    Object.keys(params).forEach(function (key) {
      url.searchParams.set(key, params[key]);
    });
    return url.href;
  }

  function connectApp() {
    var params = attribution();

    document.querySelectorAll('[data-app]').forEach(function (link) {
      var withPlan = Object.assign({}, params);
      if (link.dataset.plan) withPlan.plan = link.dataset.plan;
      if (link.dataset.cycle) withPlan.cycle = link.dataset.cycle;
      link.href = appUrl(link.dataset.app, withPlan);
    });

    /* A GET form serialises its own fields and throws away the action's query
       string, so attribution has to ride along as hidden inputs instead. */
    document.querySelectorAll('[data-app-form]').forEach(function (form) {
      form.action = appUrl(form.dataset.appForm, {});
      Object.keys(params).forEach(function (key) {
        var field = form.querySelector('input[name="' + key + '"]');
        if (!field) {
          field = document.createElement('input');
          field.type = 'hidden';
          field.name = key;
          form.appendChild(field);
        }
        field.value = params[key];
      });
    });
  }

  function navDrawer() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav-in');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', nav.classList.toggle('open'));
    });
    nav.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function reveals() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: .12 });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.08 + 's';
      io.observe(el);
    });
  }

  connectApp();
  navDrawer();
  reveals();

  /* Pages that mutate data-plan / data-cycle after load re-run the decoration
     by dispatching this on document. */
  document.addEventListener('legisly:relink', connectApp);
})();
