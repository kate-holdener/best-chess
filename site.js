'use strict';

let _gist = null;

async function loadGist() {
  if (_gist) return _gist;
  const cfg = await fetch('config.json?_=' + Date.now()).then(r => r.json());
  const resp = await fetch('https://api.github.com/gists/' + cfg.gist_id);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  _gist = await resp.json();
  return _gist;
}

async function gistFile(name) {
  const gist = await loadGist();
  const f = gist.files[name];
  if (!f) throw new Error(name + ' not found in gist');
  if (f.content) return JSON.parse(f.content);
  const resp = await fetch(f.raw_url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtScore(n) {
  return n % 1 === 0.5 ? Math.floor(n) + '½' : String(n);
}

function buildSectionTabs(containerId, sections, onSelect) {
  const el = document.getElementById(containerId);
  if (!el || sections.length <= 1) { if (el) el.hidden = true; return; }
  el.innerHTML = sections.map((s, i) =>
    '<button class="section-tab' + (i === 0 ? ' active' : '') +
    '" data-slug="' + esc(s.slug) + '">' + esc(s.name) + '</button>'
  ).join('');
  el.querySelectorAll('.section-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.section-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sec = sections.find(s => s.slug === btn.dataset.slug);
      if (sec) onSelect(sec);
    });
  });
}

(function () {
  const page = document.documentElement.dataset.page;
  document.querySelectorAll('nav.site-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}());
