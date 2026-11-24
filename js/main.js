(function () {
  var d = document;
  var WA = '5549998030915';

  /* ---------- hero "salão de retratos": molduras douradas na parede adamascada do estúdio.
     Em cada moldura a peça se forma do preto ao cinza (retrato.js). WebGL no PC, MP4 no celular em pé ---------- */
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = d.querySelector('.hero'), centro = d.querySelector('.q-centro'), V = '?v=1', NH = 5;
  var baixa = function () { return innerHeight <= 520 && innerWidth > innerHeight; };
  var celPe = function () { return innerWidth <= 860 && !baixa(); };
  function estatico() { centro.classList.remove('vd-modo'); centro.classList.add('est'); }
  function iniciaGL() {
    if (!window.Retrato || !d.createElement('canvas').getContext('webgl')) return false;
    var imgs = [], faltam = NH, falhou = false;
    for (var i = 0; i < NH; i++) {
      var im = new Image(); im.decoding = 'async'; im.src = 'img/hero/h' + i + '.webp' + V; imgs.push(im);
      im.onload = function () { if (!--faltam) pronto(); };
      im.onerror = function () { if (!falhou) { falhou = true; iniciaVideo(); } };
    }
    function pronto() {
      if (falhou) return;
      var R = [];
      [[centro, 0, 0], [d.querySelector('.q-e'), 2, .45], [d.querySelector('.q-d'), 4, .45]].forEach(function (q) {
        if (!q[0] || !q[0].offsetParent) return;
        try { var r = window.Retrato(q[0].querySelector('canvas'), imgs, { desloc: q[1], atraso: q[2] }); if (r) { R.push(r); q[0].classList.add('gl'); } } catch (e) {}
      });
      if (!R.length) { iniciaVideo(); return; }
      var t0 = 0, vis = true, raf = 0, pausa = 0, tp = 0;
      function quadro(ts) {
        if (!t0) t0 = ts;
        if (pausa) { t0 += ts - pausa; pausa = 0; }
        var t = (ts - t0) / 1000; R.forEach(function (r) { r.desenha(t, devicePixelRatio || 1); });
        tp = ts; raf = vis ? requestAnimationFrame(quadro) : 0;
      }
      new IntersectionObserver(function (es) {
        vis = es[0].isIntersecting;
        if (!vis) pausa = tp;
        if (vis && !raf) raf = requestAnimationFrame(quadro);
      }).observe(hero);
      raf = requestAnimationFrame(quadro);
    }
    return true;
  }
  var videoTentado = false;
  function iniciaVideo() {
    if (videoTentado) return; videoTentado = true;
    centro.classList.add('vd-modo');
    var v = centro.querySelector('.t-video');
    v.src = 'img/hero/retrato.mp4' + V; v.preload = 'auto';
    var p = v.play();
    if (p && p.catch) p.catch(function () { estatico(); });
    v.addEventListener('playing', function () { centro.classList.add('vd'); }, { once: true });
    v.addEventListener('error', estatico);
    d.addEventListener('visibilitychange', function () { if (!d.hidden && centro.classList.contains('vd')) v.play().catch(function () {}); });
  }
  if (hero) {
    if (reduz) estatico();
    else if (celPe()) iniciaVideo();
    else if (!iniciaGL()) iniciaVideo();
    requestAnimationFrame(function () { hero.classList.add('pronto'); });
  }

  /* ---------- topo e gaveta ---------- */
  var topo = d.getElementById('topo'), gav = d.getElementById('gaveta'), burger = d.getElementById('burger');
  function rolar() { topo.classList.toggle('solido', scrollY > 30 || !gav.hidden); }
  addEventListener('scroll', rolar, { passive: true }); rolar();
  function gaveta(a) { gav.hidden = !a; burger.setAttribute('aria-expanded', a); d.body.style.overflow = a ? 'hidden' : ''; rolar(); }
  burger.addEventListener('click', function () { gaveta(gav.hidden); });
  gav.addEventListener('click', function (e) { if (e.target.closest('a')) gaveta(false); });

  /* ---------- entrada ao rolar ---------- */
  var io = new IntersectionObserver(function (es) {
    var meio = innerWidth / 2;
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var r = e.boundingClientRect, dist = Math.abs(r.left + r.width / 2 - meio) / meio;
      e.target.style.transitionDelay = Math.round(Math.min(1, dist) * 240) + 'ms';
      e.target.classList.add('vis'); io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  function observar() { d.querySelectorAll('.rev:not(.vis),.item:not(.vis):not(.sai)').forEach(function (el) { io.observe(el); }); }

  /* ---------- trabalhos ---------- */
  var grade = d.getElementById('grade'), mais = d.getElementById('mais'), filtro = 'todos';
  var passoN = 24, limite = passoN;

  PECAS.forEach(function (p, i) {
    var f = d.createElement('figure'); f.className = 'item'; f.tabIndex = 0; f.dataset.i = i;
    f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + p.l);
    f.innerHTML = '<div class="fr"><img src="img/p/' + p.c + '.webp" alt="' + p.l + ', tatuagem de Cássio Pescador" width="720" height="900" draggable="false"></div>';
    grade.appendChild(f);
  });
  var itens = [].slice.call(grade.children);
  function visiveis() { return itens.filter(function (el) { return filtro === 'todos' || PECAS[el.dataset.i].t === filtro; }); }
  function aplicar() {
    var v = visiveis();
    itens.forEach(function (el) { el.classList.add('sai'); });
    v.forEach(function (el, k) { if (k < limite) el.classList.remove('sai'); });
    mais.hidden = v.length <= limite;
    observar();
  }
  aplicar(); observar();
  d.querySelectorAll('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      d.querySelectorAll('.filtros button').forEach(function (x) { x.classList.toggle('on', x === b); });
      filtro = b.dataset.f; limite = passoN; aplicar();
      itens.forEach(function (el) { if (!el.classList.contains('sai')) el.classList.add('vis'); });
      grade.animate && grade.animate([{ opacity: .2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.16,.84,.32,1)' });
    });
  });
  mais.addEventListener('click', function () { limite += passoN; aplicar(); });

  /* lightbox */
  var lb = d.getElementById('lb'), lbImg = d.getElementById('lbImg'), atualLb = 0, lista = [];
  function abrirLb(i) { lista = visiveis().map(function (el) { return +el.dataset.i; }); atualLb = Math.max(0, lista.indexOf(i)); mostrar(); lb.hidden = false; d.body.style.overflow = 'hidden'; }
  function mostrar() { var p = PECAS[lista[atualLb]]; d.getElementById('lbTit').textContent = p.l; lbImg.src = 'img/g/' + p.c + '.webp'; lbImg.alt = p.l + ', tatuagem de Cássio Pescador'; }
  function passo(n) { atualLb = (atualLb + n + lista.length) % lista.length; mostrar(); }
  function fechar() { lb.hidden = true; d.body.style.overflow = ''; }
  grade.addEventListener('click', function (e) { var f = e.target.closest('.item'); if (f) abrirLb(+f.dataset.i); });
  grade.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var f = e.target.closest('.item'); if (f) { e.preventDefault(); abrirLb(+f.dataset.i); } } });
  d.getElementById('lbX').onclick = fechar;
  d.getElementById('lbP').onclick = function () { passo(-1); };
  d.getElementById('lbS').onclick = function () { passo(1); };
  d.getElementById('lbQuero').onclick = function () {
    var p = PECAS[lista[atualLb]], ideia = d.getElementById('ideia');
    ideia.value = 'Quero uma peça como esta do portfólio: ' + p.l + '.';
    var mapa = { feras: 'Feras (leão, tigre, lobo, águia...)', fe: 'Fé e mitologia', retratos: 'Retrato', fech: 'Fechamento' };
    var r = d.querySelector('input[name="tema"][value="' + mapa[p.t] + '"]'); if (r) r.checked = true;
    if (p.t === 'fech') d.querySelector('select[name="tamanho"]').value = 'Fechamento';
    fechar();
    d.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  lb.addEventListener('click', function (e) { if (e.target === lb) fechar(); });
  addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechar(); if (e.key === 'ArrowLeft') passo(-1); if (e.key === 'ArrowRight') passo(1);
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) passo(dx < 0 ? 1 : -1); tx = null; });

  /* ---------- pedido de orçamento pelo WhatsApp ---------- */
  var form = d.getElementById('form'), erro = d.getElementById('erro');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = new FormData(form), nomeC = (f.get('nome') || '').trim();
    if (!nomeC) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    var l = ['Olá, Cássio! Sou *' + nomeC + '* e quero um orçamento.', '',
      '*Tema:* ' + f.get('tema'), '*Cobertura:* ' + f.get('cob'),
      '*Local do corpo:* ' + ((f.get('local') || '').trim() || 'a definir'),
      '*Tamanho:* ' + f.get('tamanho'), '*Disponibilidade:* ' + f.get('quando')];
    var ideia = (f.get('ideia') || '').trim();
    if (ideia) l.push('', '*Ideia:* ' + ideia);
    l.push('', 'Vou mandar a referência e a foto do local aqui na conversa.', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(l.join('\n')), '_blank', 'noopener');
  });
})();
