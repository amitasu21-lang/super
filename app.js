/* סופר – רשימת הקניות של הבית */
(function () {
  'use strict';

  const PEOPLE = window.PEOPLE;
  const POLL_MS = 4000;
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem('super.' + k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('super.' + k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem('super.' + k); } catch (e) {} }
  };

  const S = {
    cfg: LS.get('cfg'),            // {api, k}
    me: LS.get('me'),              // 'amit' | 'noga'
    data: LS.get('cache') || { items: [], cats: [], learned: {}, history: [] },
    view: 'list',
    online: true,
    pending: 0,
    lastLocal: 0,
    openTrip: null,
    installEvt: null
  };

  const $app = document.getElementById('app');
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  /* ---------- utilities ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ');
  const uid = () => 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const icon = (name) => '' + (name || 'bag') + '.svg';
  const person = (id) => PEOPLE[id] || null;

  const ICONS = {
    plus: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5 L12 19 M5 12 L19 12" stroke="#FFFBF2" stroke-width="3" stroke-linecap="round"/></svg>',
    tick: '<svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 14 C7 16 9 19 11 22 C14 14 18 8 24 3" fill="none" stroke="#C4623E" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tickW: '<svg width="18" height="18" viewBox="0 0 26 26" aria-hidden="true"><path d="M4 14 C7 16 9 19 11 22 C14 14 18 8 24 3" fill="none" stroke="#FFFBF2" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pen: '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20 L8 19 L19 8 L16 5 L5 16 Z" fill="none" stroke="#7A5230" stroke-width="2.4" stroke-linejoin="round"/></svg>',
    clock: '<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#3B2A1E" stroke-width="2.2"/><path d="M12 7 L12 12 L15.5 14" fill="none" stroke="#3B2A1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5 L16 12 L9 19" fill="none" stroke="#3B2A1E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    again: '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 A8 8 0 1 0 7 6 M4 3 L4 8 L9 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trash: '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7 L20 7 M9 7 L9 4 L15 4 L15 7 M6 7 L7 20 L17 20 L18 7 M10 11 L10 16 M14 11 L14 16" fill="none" stroke="#B23A2A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bulb: '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="flex-shrink:0;margin-top:2px"><path d="M12 3 C7 3 4 7 4 11 C4 14 6 16 8 17 L8 20 L16 20 L16 17 C18 16 20 14 20 11 C20 7 17 3 12 3Z" fill="none" stroke="#4F5E25" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    share: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 L12 15 M7 8 L12 3 L17 8 M5 12 L5 20 L19 20 L19 12" fill="none" stroke="#3B2A1E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  /* ---------- categorising ---------- */
  function guess(name) {
    const n = norm(name);
    const learnedCat = S.data.learned && S.data.learned[n];
    if (learnedCat && catByKey(learnedCat)) {
      const hit = dict(n);
      return { cat: learnedCat, icon: hit && hit[0] === learnedCat ? hit[1] : null, known: true };
    }
    const hit = dict(n);
    if (hit && catByKey(hit[0])) return { cat: hit[0], icon: hit[1], known: true };
    return { cat: null, icon: hit ? hit[1] : null, known: false };
  }
  function dict(n) {
    let best = null, bestLen = 0;
    for (const k in window.CATALOG) {
      if (k.length > bestLen && n.indexOf(k) !== -1) { best = window.CATALOG[k]; bestLen = k.length; }
    }
    return best;
  }
  function itemIcon(it) {
    const hit = dict(norm(it.name));
    if (hit) return icon(hit[1]);
    const c = catByKey(it.cat);
    return icon((c && c.icon) || window.CAT_ICON[it.cat] || 'bag');
  }
  function catByKey(k) { return (S.data.cats || []).filter((c) => c.key === k)[0] || null; }

  /* ---------- server ---------- */
  async function apiGet() {
    const url = S.cfg.api + (S.cfg.api.indexOf('?') === -1 ? '?' : '&') + 'action=state&k=' + encodeURIComponent(S.cfg.k) + '&t=' + Date.now();
    const r = await fetch(url, { cache: 'no-store' });
    return r.json();
  }
  async function apiPost(action, payload) {
    const body = Object.assign({ k: S.cfg.k, action: action, by: S.me }, payload || {});
    const r = await fetch(S.cfg.api, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
    return r.json();
  }
  function setOnline(v) {
    if (S.online === v) return;
    S.online = v;
    const d = document.querySelector('.duo .dot'); const t = document.querySelector('.duo .status');
    if (d) d.classList.toggle('off', !v);
    if (t) t.textContent = v ? 'שניכם מחוברים' : 'אין חיבור';
  }
  function accept(state) {
    if (!state) return;
    S.data = state;
    LS.set('cache', state);
    renderData();
  }
  async function refresh() {
    if (!S.cfg || S.pending > 0) return;
    const started = Date.now();
    try {
      const res = await apiGet();
      setOnline(true);
      if (res.ok) {
        if (S.pending > 0 || S.lastLocal > started) return; // a local change is newer
        accept(res.state);
      } else if (res.error === 'bad_key') {
        toast('קישור ההצטרפות לא תקין. בקשו קישור חדש');
      }
    } catch (e) { setOnline(false); }
  }
  async function send(action, payload, okMsg) {
    S.pending++; S.lastLocal = Date.now();
    try {
      const res = await apiPost(action, payload);
      setOnline(true);
      S.pending--;
      if (res.ok) { if (S.pending === 0) accept(res.state); if (okMsg) toast(okMsg); }
      else toast('משהו השתבש, נסו שוב');
    } catch (e) {
      S.pending--;
      setOnline(false);
      toast('אין חיבור – השינוי לא נשמר');
      refresh();
    }
  }
  setInterval(() => { if (document.visibilityState === 'visible') refresh(); }, POLL_MS);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  window.addEventListener('online', refresh);

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg, actionLabel, action) {
    const t = document.getElementById('toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (actionLabel ? '<button type="button">' + esc(actionLabel) + '</button>' : '');
    if (actionLabel) t.querySelector('button').onclick = () => { t.classList.remove('show'); action(); };
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), actionLabel ? 5000 : 2600);
  }

  /* ---------- routing ---------- */
  function boot() {
    const q = new URLSearchParams(location.search);
    if (q.get('api') && q.get('k')) {
      S.cfg = { api: q.get('api'), k: q.get('k') };
      LS.set('cfg', S.cfg);
      LS.set('invite', location.href);
      history.replaceState(null, '', location.pathname);
    }
    if (!S.cfg) return renderJoin();
    if (!S.me) return renderWho();
    renderList();
    refresh();
  }

  /* ---------- screens: join / who ---------- */
  function renderJoin() {
    $app.innerHTML = `
      <main class="screen">
        <img src="logo.svg" alt="" width="96" height="96">
        <h1 class="hand">ברוכים הבאים לסופר</h1>
        <p style="margin:0;font-size:17px;line-height:1.5">כדי להתחבר לרשימה של הבית, הדביקו כאן את קישור ההצטרפות שקיבלתם</p>
        <form id="joinForm" style="width:100%;display:flex;flex-direction:column;gap:10px">
          <label for="joinLink" class="sr">קישור ההצטרפות</label>
          <input id="joinLink" class="field" type="url" inputmode="url" placeholder="הדביקו את הקישור כאן" dir="ltr" autocomplete="off">
          <div class="row">
            <button type="button" class="btn light hand" id="pasteBtn" style="font-size:26px">הדבקה</button>
            <button type="submit" class="btn terra hand">התחברות</button>
          </div>
        </form>
        <p class="hint" style="font-size:13px">את הקישור מקבלים פעם אחת בלבד, בוואטסאפ</p>
      </main>`;
    const inp = document.getElementById('joinLink');
    document.getElementById('pasteBtn').onclick = async () => {
      try { inp.value = await navigator.clipboard.readText(); } catch (e) { inp.focus(); toast('לחצו לחיצה ארוכה על השדה ובחרו "הדבק"'); }
    };
    document.getElementById('joinForm').onsubmit = (e) => {
      e.preventDefault();
      try {
        const u = new URL(inp.value.trim());
        const api = u.searchParams.get('api'), k = u.searchParams.get('k');
        if (!api || !k) throw new Error('x');
        S.cfg = { api: api, k: k }; LS.set('cfg', S.cfg); LS.set('invite', u.href);
        boot();
      } catch (err) { toast('זה לא נראה כמו קישור הצטרפות של סופר'); }
    };
  }

  function renderWho() {
    let pick = null;
    $app.innerHTML = `
      <main class="screen">
        <img src="logo.svg" alt="" width="96" height="96">
        <h1 class="hand">ברוכים הבאים לסופר</h1>
        <p style="margin:0;font-size:18px;font-weight:500">מי משתמש בטלפון הזה?</p>
        <div class="people">
          ${Object.keys(PEOPLE).map((id) => `
            <button type="button" class="person" data-id="${id}" aria-pressed="false" style="--ring:${PEOPLE[id].ring}">
              <img src="${PEOPLE[id].img}" alt="">
              <span class="hand">${esc(PEOPLE[id].name)}</span>
              <span class="tick">${ICONS.tickW}</span>
            </button>`).join('')}
        </div>
        <button type="button" class="btn terra hand" id="whoGo" disabled style="width:100%;flex:none;font-size:34px;height:60px;opacity:.5">בחרו מי אתם</button>
        <p class="hint" style="font-size:13px;line-height:1.5;margin:0">בוחרים פעם אחת בלבד. מעכשיו כל מוצר שתוסיפו יופיע עם התמונה שלכם</p>
      </main>`;
    const go = document.getElementById('whoGo');
    $app.querySelectorAll('.person').forEach((b) => {
      b.onclick = () => {
        pick = b.dataset.id;
        $app.querySelectorAll('.person').forEach((x) => {
          const on = x === b;
          x.classList.toggle('on', on);
          x.setAttribute('aria-pressed', on);
          x.style.border = on ? '3px solid ' + PEOPLE[x.dataset.id].ring : '';
        });
        go.disabled = false; go.style.opacity = 1;
        go.textContent = PEOPLE[pick].me;
      };
    });
    go.onclick = () => {
      if (!pick) return;
      S.me = pick; LS.set('me', pick);
      renderList(); refresh();
    };
  }

  /* ---------- main list ---------- */
  function renderList() {
    S.view = 'list';
    const me = person(S.me);
    const showIOSTip = isIOS && !isStandalone && !LS.get('iosTipDone');
    $app.innerHTML = `
      <header class="top">
        <div class="top-row">
          <div class="brand">
            <img src="logo.svg" alt="">
            <div><h1 class="hand">סופר</h1><small>שלום ${esc(me.name)}!</small></div>
          </div>
          <button type="button" class="duo" id="duoBtn" aria-label="הגדרות והזמנה">
            <span class="duo-faces"><img src="${PEOPLE.amit.img}" alt=""><img src="${PEOPLE.noga.img}" alt=""></span>
            <span><i class="dot${S.online ? '' : ' off'}"></i><span class="status">${S.online ? 'שניכם מחוברים' : 'אין חיבור'}</span></span>
          </button>
        </div>
        <form class="add" id="addForm" autocomplete="off">
          <label for="newItem" class="sr">מה חסר בבית?</label>
          <input id="newItem" type="text" placeholder="מה חסר בבית?" enterkeyhint="done" maxlength="60">
          <button type="submit" class="btn-plus" aria-label="הוספה">${ICONS.plus}</button>
        </form>
      </header>
      ${showIOSTip ? `<div class="banner" id="iosTip">${ICONS.share}<span>להתקנה כאפליקציה: לוחצים <b>שיתוף</b> ב-Safari ואז <b>"הוספה למסך הבית"</b>. בפתיחה הראשונה מהמסך הראשי תתבקשו להדביק את הקישור, אז העתיקו אותו קודם.</span><button type="button" class="btn-small" id="copyInvite">העתקה</button></div>` : ''}
      ${S.installEvt ? `<div class="banner" id="installTip">${ICONS.share}<span>אפשר להתקין את סופר כאפליקציה בטלפון</span><button type="button" class="btn-small" id="installBtn">התקנה</button></div>` : ''}
      <main class="lists" id="lists"></main>
      <div class="bottom"><div class="bottom-in">
        <button type="button" class="btn-sq" id="histBtn" aria-label="היסטוריית קניות">${ICONS.clock}</button>
        <button type="button" class="btn-done hand" id="doneBtn">סיימנו קניות! <span class="pill" id="cartPill">0 בעגלה</span></button>
      </div></div>`;

    document.getElementById('addForm').onsubmit = onAdd;
    document.getElementById('histBtn').onclick = renderHistory;
    document.getElementById('doneBtn').onclick = onFinish;
    document.getElementById('duoBtn').onclick = openSettings;
    const copy = document.getElementById('copyInvite');
    if (copy) copy.onclick = async () => {
      try { await navigator.clipboard.writeText(LS.get('invite') || ''); toast('הקישור הועתק'); LS.set('iosTipDone', true); } catch (e) { toast('לא הצלחתי להעתיק'); }
    };
    const inst = document.getElementById('installBtn');
    if (inst) inst.onclick = async () => { S.installEvt.prompt(); await S.installEvt.userChoice; S.installEvt = null; document.getElementById('installTip').remove(); };
    renderData();
  }

  function renderData() {
    if (S.view === 'history') return renderHistoryBody();
    const box = document.getElementById('lists');
    if (!box) return;
    const items = S.data.items || [];
    const cats = (S.data.cats || []).slice();
    const known = {}; cats.forEach((c) => { known[c.key] = true; });
    items.forEach((it) => { if (!known[it.cat]) { known[it.cat] = true; cats.push({ key: it.cat, name: 'אחר', icon: 'bag' }); } });

    const inCart = items.filter((i) => i.checked).length;
    document.getElementById('cartPill').textContent = inCart + ' בעגלה';
    document.getElementById('doneBtn').disabled = inCart === 0;

    if (!items.length) {
      box.innerHTML = `<div class="empty"><img src="logo.svg" alt=""><h2 class="hand">הרשימה ריקה</h2><p style="margin:0">חסר משהו בבית? כתבו אותו למעלה</p></div>`;
      return;
    }
    box.innerHTML = cats.map((c) => {
      let list = items.filter((i) => i.cat === c.key);
      if (!list.length) return '';
      list = list.filter((i) => !i.checked).concat(list.filter((i) => i.checked));
      const open = list.filter((i) => !i.checked).length;
      return `<section class="cat">
        <div class="cat-head"><h2 class="sign hand">${esc(c.name)}</h2><span class="cat-count">${open === 0 ? 'הכל בעגלה' : open === 1 ? 'מוצר אחד' : open + ' מוצרים'}</span></div>
        ${list.map(itemHTML).join('')}
      </section>`;
    }).join('');
    box.querySelectorAll('.chk').forEach((b) => { b.onclick = () => onToggle(b.dataset.id); });
    box.querySelectorAll('.body').forEach((b) => { b.onclick = () => openEdit(b.dataset.id); });
  }

  function itemHTML(it) {
    const p = person(it.by);
    return `<div class="item${it.checked ? ' done' : ''}">
      <button type="button" class="chk" data-id="${esc(it.id)}" aria-pressed="${it.checked}" aria-label="${it.checked ? 'ביטול סימון' : 'סימון כנקנה'}: ${esc(it.name)}">${it.checked ? ICONS.tick : ''}</button>
      <div class="pic"><img src="${itemIcon(it)}" alt=""></div>
      <button type="button" class="body" data-id="${esc(it.id)}" aria-label="עריכה: ${esc(it.name)}">
        <span class="name">${esc(it.name)}</span>
        ${it.note ? `<span class="note">${ICONS.pen}${esc(it.note)}</span>` : ''}
      </button>
      ${p ? `<img class="who" src="${p.img}" alt="${esc(p.added)}">` : ''}
    </div>`;
  }

  /* ---------- actions ---------- */
  function localAdd(name, cat, note) {
    const it = { id: uid(), name: name, note: note || '', cat: cat, by: S.me, checked: false };
    S.data.items = [it].concat(S.data.items || []);
    S.lastLocal = Date.now();
    renderData();
    return it;
  }

  function onAdd(e) {
    e.preventDefault();
    const inp = document.getElementById('newItem');
    const name = norm(inp.value);
    if (!name) return;
    const dup = (S.data.items || []).filter((i) => !i.checked && norm(i.name) === name)[0];
    if (dup) { toast(name + ' כבר ברשימה'); inp.value = ''; return; }
    inp.value = '';
    const g = guess(name);
    if (g.known) {
      const it = localAdd(name, g.cat);
      send('add', { id: it.id, name: name, cat: g.cat });
    } else {
      openPickCat(name);
    }
  }

  function onToggle(id) {
    const it = (S.data.items || []).filter((i) => i.id === id)[0];
    if (!it) return;
    it.checked = !it.checked;
    if (navigator.vibrate) navigator.vibrate(12);
    renderData();
    send('check', { id: id, checked: it.checked });
  }

  function onFinish() {
    const done = (S.data.items || []).filter((i) => i.checked);
    if (!done.length) return;
    const stores = [];
    (S.data.history || []).forEach((t) => { if (t.store && stores.indexOf(t.store) === -1 && stores.length < 5) stores.push(t.store); });
    sheet(`
      <h2 class="hand">סיימנו קניות!</h2>
      <p style="margin:0;font-size:16px;line-height:1.5">${done.length === 1 ? 'מוצר אחד יעבור' : done.length + ' מוצרים יעברו'} להיסטוריה, וכל השאר יישארו ברשימה.</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label for="fStore" class="label hand">איפה קניתם? <span style="font-family:Rubik,sans-serif;font-size:13px;color:var(--muted);font-weight:400">(לא חובה)</span></label>
        ${stores.length ? `<div class="chips" id="fStores">${stores.map((s) => `<button type="button" class="chip" data-store="${esc(s)}">${esc(s)}</button>`).join('')}</div>` : ''}
        <input id="fStore" class="field" type="text" maxlength="40" placeholder="למשל: שופרסל, רמי לוי, המכולת" autocomplete="off">
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label for="fTotal" class="label hand">כמה עלו הקניות? <span style="font-family:Rubik,sans-serif;font-size:13px;color:var(--muted);font-weight:400">(לא חובה)</span></label>
        <div style="position:relative">
          <input id="fTotal" class="field" type="text" inputmode="decimal" maxlength="9" placeholder="0" autocomplete="off" style="padding-left:40px;font-size:20px;font-weight:500">
          <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:20px;color:var(--muted)">₪</span>
        </div>
      </div>
      <div class="row">
        <button type="button" class="btn hand" id="finYes">שמירה</button>
        <button type="button" class="btn light hand" id="finNo" style="flex:.6">עוד לא</button>
      </div>`, (root) => {
      const storeInp = root.querySelector('#fStore');
      root.querySelectorAll('#fStores .chip').forEach((b) => {
        b.onclick = () => {
          storeInp.value = b.dataset.store;
          root.querySelectorAll('#fStores .chip').forEach((x) => x.classList.toggle('on', x === b));
        };
      });
      storeInp.oninput = () => root.querySelectorAll('#fStores .chip').forEach((x) => x.classList.toggle('on', x.dataset.store === storeInp.value));
      root.querySelector('#finNo').onclick = closeSheet;
      root.querySelector('#finYes').onclick = () => {
        const store = norm(storeInp.value);
        const totalRaw = root.querySelector('#fTotal').value.replace(',', '.').replace(/[^\d.]/g, '');
        const total = parseFloat(totalRaw) > 0 ? Math.round(parseFloat(totalRaw) * 100) / 100 : null;
        closeSheet();
        S.data.items = S.data.items.filter((i) => !i.checked);
        renderData();
        cheer();
        send('finish', { store: store, total: total }, 'כל הכבוד! הקנייה נשמרה בהיסטוריה');
      };
    });
  }

  function cheer() {
    const colors = ['#C4623E', '#6B7A3A', '#D9A441', '#D2483A', '#7A5230'];
    for (let i = 0; i < 26; i++) {
      const d = document.createElement('div');
      d.style.cssText = 'position:fixed;z-index:40;top:-12px;width:10px;height:14px;border-radius:3px;pointer-events:none;left:' + (Math.random() * 100) + 'vw;background:' + colors[i % colors.length] + ';transition:transform 1.6s cubic-bezier(.2,.6,.4,1),opacity 1.6s;';
      document.body.appendChild(d);
      requestAnimationFrame(() => { d.style.transform = 'translate(' + (Math.random() * 80 - 40) + 'px,' + (window.innerHeight * (0.6 + Math.random() * 0.4)) + 'px) rotate(' + (Math.random() * 720) + 'deg)'; d.style.opacity = '0'; });
      setTimeout(() => d.remove(), 1700);
    }
  }

  /* ---------- sheets ---------- */
  function sheet(html, wire) {
    closeSheet();
    const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.id = 'scrim';
    const s = document.createElement('div'); s.className = 'sheet'; s.id = 'sheet'; s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true');
    s.innerHTML = '<div class="grab"></div>' + html;
    scrim.onclick = closeSheet;
    document.body.appendChild(scrim); document.body.appendChild(s);
    wire(s);
  }
  function closeSheet() { ['scrim', 'sheet'].forEach((id) => { const el = document.getElementById(id); if (el) el.remove(); }); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });

  function catChips(selected) {
    return (S.data.cats || []).map((c) => `<button type="button" class="chip${c.key === selected ? ' on' : ''}" data-cat="${esc(c.key)}" aria-pressed="${c.key === selected}">${esc(c.name)}</button>`).join('');
  }

  function newCatForm() {
    return `<form class="row" id="newCatForm" autocomplete="off" style="gap:8px">
      <label for="newCat" class="sr">קטגוריה חדשה</label>
      <input id="newCat" class="field" type="text" placeholder="קטגוריה חדשה..." maxlength="30" style="flex:1;min-width:0;border-style:dashed;border-color:#8A5A32">
      <button type="submit" class="btn-small">יצירה</button>
    </form>`;
  }

  function addCategory(name) {
    const n = norm(name);
    if (!n) return null;
    const exist = (S.data.cats || []).filter((c) => c.name === n)[0];
    if (exist) return exist.key;
    const key = 'c' + Date.now().toString(36);
    S.data.cats = (S.data.cats || []).concat([{ key: key, name: n, icon: 'bag' }]);
    send('addCat', { key: key, name: n });
    return key;
  }

  function openPickCat(name) {
    const g = guess(name);
    sheet(`
      <div class="row" style="gap:12px">
        <div class="pic" style="width:56px;height:56px"><img src="${icon(g.icon || 'bag')}" alt="" style="width:42px;height:42px"></div>
        <div><h2 class="hand">לאן שייך "${esc(name)}"?</h2><span style="font-size:13px;color:var(--muted)">אני עוד לא מכיר את המוצר הזה</span></div>
      </div>
      <div class="chips">${catChips(null)}</div>
      ${newCatForm()}
      <p class="tip">${ICONS.bulb}מעכשיו אזכור את זה, ובפעם הבאה זה ייכנס לבד</p>
      <button type="button" class="link" id="pcCancel">ביטול</button>`, (root) => {
      const place = (cat) => {
        closeSheet();
        S.data.learned = Object.assign({}, S.data.learned, { [name]: cat });
        const it = localAdd(name, cat);
        send('add', { id: it.id, name: name, cat: cat, learn: true });
      };
      root.querySelectorAll('.chip').forEach((b) => { b.onclick = () => place(b.dataset.cat); });
      root.querySelector('#newCatForm').onsubmit = (e) => {
        e.preventDefault();
        const key = addCategory(root.querySelector('#newCat').value);
        if (key) setTimeout(() => place(key), 50);
      };
      root.querySelector('#pcCancel').onclick = closeSheet;
    });
  }

  function openEdit(id) {
    const it = (S.data.items || []).filter((i) => i.id === id)[0];
    if (!it) return;
    let cat = it.cat;
    const p = person(it.by);
    sheet(`
      <div class="row" style="gap:14px">
        <div class="pic" style="width:72px;height:72px;border-width:2px"><img src="${itemIcon(it)}" alt="" style="width:56px;height:56px"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:4px">
          <label for="eName" style="font-size:12px;color:var(--muted)">שם המוצר</label>
          <input id="eName" class="field" type="text" value="${esc(it.name)}" maxlength="60" style="font-weight:500">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <label for="eNote" class="label hand">הערה</label>
        <textarea id="eNote" class="field" rows="2" maxlength="200" placeholder="למשל: 2 ק״ג, רק של תנובה">${esc(it.note)}</textarea>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <span class="label hand">קטגוריה</span>
        <div class="chips" id="eChips">${catChips(cat)}<button type="button" class="chip new" id="eNewCat">+ קטגוריה חדשה</button></div>
        <div id="eNewCatBox" hidden>${newCatForm()}</div>
      </div>
      ${p ? `<div class="meta"><img src="${p.img}" alt="">${esc(p.added)} את זה${it.createdAt ? ' ' + whenText(it.createdAt) : ''}</div>` : ''}
      <div class="row">
        <button type="button" class="btn hand" id="eSave">שמירה</button>
        <button type="button" class="btn-sq" id="eDel" aria-label="מחיקת המוצר" style="width:54px;height:54px">${ICONS.trash}</button>
      </div>`, (root) => {
      const wireChips = () => root.querySelectorAll('#eChips .chip[data-cat]').forEach((b) => {
        b.onclick = () => {
          cat = b.dataset.cat;
          root.querySelectorAll('#eChips .chip[data-cat]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        };
      });
      wireChips();
      root.querySelector('#eNewCat').onclick = () => { root.querySelector('#eNewCatBox').hidden = false; root.querySelector('#newCat').focus(); };
      root.querySelector('#newCatForm').onsubmit = (e) => {
        e.preventDefault();
        const key = addCategory(root.querySelector('#newCat').value);
        if (!key) return;
        cat = key;
        root.querySelector('#eChips').innerHTML = catChips(cat) + '<button type="button" class="chip new" id="eNewCat">+ קטגוריה חדשה</button>';
        root.querySelector('#eNewCatBox').hidden = true;
        root.querySelector('#eNewCat').onclick = () => { root.querySelector('#eNewCatBox').hidden = false; };
        wireChips();
      };
      root.querySelector('#eSave').onclick = () => {
        const name = norm(root.querySelector('#eName').value) || it.name;
        const note = norm(root.querySelector('#eNote').value);
        const catChanged = cat !== it.cat;
        Object.assign(it, { name: name, note: note, cat: cat });
        if (catChanged) S.data.learned = Object.assign({}, S.data.learned, { [name]: cat });
        closeSheet(); renderData();
        send('update', { id: it.id, name: name, note: note, cat: cat }, catChanged ? 'נשמר. בפעם הבאה ' + name + ' ייכנס לשם לבד' : null);
      };
      root.querySelector('#eDel').onclick = () => {
        closeSheet();
        const backup = Object.assign({}, it);
        S.data.items = S.data.items.filter((x) => x.id !== it.id);
        renderData();
        send('delete', { id: it.id });
        toast(it.name + ' נמחק', 'ביטול', () => {
          S.data.items = [backup].concat(S.data.items); renderData();
          send('add', { id: backup.id, name: backup.name, note: backup.note, cat: backup.cat, by: backup.by });
        });
      };
    });
  }

  function inviteLink() {
    const base = location.origin + location.pathname;
    return base + '?api=' + encodeURIComponent(S.cfg.api) + '&k=' + encodeURIComponent(S.cfg.k);
  }

  function openSettings() {
    const me = person(S.me);
    const other = S.me === 'amit' ? PEOPLE.noga : PEOPLE.amit;
    sheet(`
      <div class="row" style="gap:12px">
        <img src="${me.img}" alt="" style="width:64px;height:64px;border-radius:50%">
        <div><h2 class="hand">היי ${esc(me.name)}</h2><span style="font-size:13px;color:var(--muted)">הטלפון הזה מחובר בתור ${esc(me.name)}</span></div>
      </div>
      <button type="button" class="btn terra hand" id="sInvite" style="flex:none">שליחת הזמנה ל${esc(other.name)}</button>
      <button type="button" class="btn light hand" id="sCopy" style="flex:none;font-size:24px">העתקת קישור ההצטרפות</button>
      <p class="tip">${ICONS.bulb}הקישור מחבר כל טלפון לרשימה של הבית. שלחו אותו רק לבני הבית</p>
      <button type="button" class="link" id="sSwitch">זה לא ${esc(me.name)}? החלפת משתמש</button>`, (root) => {
      root.querySelector('#sInvite').onclick = () => {
        const text = 'היי ' + other.name + '! זה הקישור לרשימת הקניות שלנו בסופר: ' + inviteLink();
        if (navigator.share) navigator.share({ title: 'סופר', text: text }).catch(() => {});
        else window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
      };
      root.querySelector('#sCopy').onclick = async () => {
        try { await navigator.clipboard.writeText(inviteLink()); toast('הקישור הועתק'); } catch (e) { toast('לא הצלחתי להעתיק'); }
      };
      root.querySelector('#sSwitch').onclick = () => { closeSheet(); S.me = null; LS.del('me'); renderWho(); };
    });
  }

  /* ---------- history ---------- */
  function whenText(iso) {
    const d = new Date(iso); if (isNaN(d)) return '';
    const today = new Date(); const y = new Date(); y.setDate(today.getDate() - 1);
    const hm = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === today.toDateString()) return 'היום ב-' + hm;
    if (d.toDateString() === y.toDateString()) return 'אתמול ב-' + hm;
    return 'ב-' + d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' });
  }
  function money(n) {
    return '₪' + Number(n).toLocaleString('he-IL', { maximumFractionDigits: 2 });
  }
  function dayTitle(iso) {
    const d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'numeric' });
  }

  function renderHistory() {
    S.view = 'history';
    if (S.openTrip === null && S.data.history && S.data.history[0]) S.openTrip = S.data.history[0].id;
    $app.innerHTML = `
      <header class="top"><div class="top-row" style="justify-content:flex-start">
        <button type="button" class="back" id="backBtn" aria-label="חזרה לרשימה">${ICONS.back}</button>
        <h1 class="hand" style="margin:0;font-size:40px;color:var(--olive)">מה קנינו</h1>
      </div></header>
      <main class="hist" id="hist"></main>`;
    document.getElementById('backBtn').onclick = () => { renderList(); };
    renderHistoryBody();
  }

  function renderHistoryBody() {
    const box = document.getElementById('hist'); if (!box) return;
    const trips = S.data.history || [];
    if (!trips.length) {
      box.innerHTML = `<div class="empty"><img src="logo.svg" alt=""><h2 class="hand">עוד אין היסטוריה</h2><p style="margin:0">אחרי "סיימנו קניות!" הקנייה תופיע כאן</p></div>`;
      return;
    }
    const onList = {}; (S.data.items || []).forEach((i) => { if (!i.checked) onList[norm(i.name)] = true; });
    const now = new Date();
    const month = trips.filter((t) => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const monthSum = month.reduce((s, t) => s + (t.total > 0 ? t.total : 0), 0);
    const summary = monthSum > 0 ? `<div class="trip" style="flex-direction:row;align-items:center;gap:12px;background:var(--olive);color:#FFFBF2;border-color:var(--ink)">
        <div style="flex:1"><div style="font-size:14px;opacity:.9">הוצאות על קניות ב${esc(now.toLocaleDateString('he-IL', { month: 'long' }))}</div>
        <div style="font-size:13px;opacity:.8">${month.length === 1 ? 'קנייה אחת' : month.length + ' קניות'}</div></div>
        <div style="font-size:26px;font-weight:700">${money(monthSum)}</div></div>` : '';
    box.innerHTML = summary + trips.map((t) => {
      const p = person(t.by); const open = S.openTrip === t.id;
      return `<article class="trip">
        <button type="button" class="trip-head" data-trip="${esc(t.id)}" aria-expanded="${open}">
          <div style="flex:1;display:flex;flex-direction:column;gap:2px">
            <h2>${esc(dayTitle(t.date))}</h2>
            <small>${t.items.length === 1 ? 'מוצר אחד' : t.items.length + ' מוצרים'}${p ? ' · ' + esc(p.bought) : ''}</small>
            ${t.store || t.total > 0 ? `<span style="display:flex;gap:6px;flex-wrap:wrap;margin-top:2px">${t.store ? `<span class="pill" style="background:var(--paper);border:1.5px solid var(--line)">${esc(t.store)}</span>` : ''}${t.total > 0 ? `<span class="pill">${money(t.total)}</span>` : ''}</span>` : ''}
            ${open ? '' : `<span class="minis">${t.items.slice(0, 6).map((i) => `<img src="${itemIcon(i)}" alt="">`).join('')}</span>`}
          </div>
          ${p ? `<img class="by" src="${p.img}" alt="">` : ''}
        </button>
        ${open ? `<ul>${t.items.map((i, n) => {
          const already = onList[norm(i.name)];
          return `<li><img src="${itemIcon(i)}" alt=""><span>${esc(i.name)}${i.note ? ` <span style="color:var(--muted);font-size:13px">· ${esc(i.note)}</span>` : ''}</span>
            <button type="button" class="again" data-t="${esc(t.id)}" data-n="${n}" ${already ? 'disabled' : ''}>${ICONS.again}${already ? 'כבר ברשימה' : 'שוב לרשימה'}</button></li>`;
        }).join('')}</ul>` : ''}
      </article>`;
    }).join('');
    box.querySelectorAll('.trip-head').forEach((b) => { b.onclick = () => { S.openTrip = S.openTrip === b.dataset.trip ? '' : b.dataset.trip; renderHistoryBody(); }; });
    box.querySelectorAll('.again').forEach((b) => {
      b.onclick = () => {
        const t = trips.filter((x) => x.id === b.dataset.t)[0]; const i = t && t.items[+b.dataset.n]; if (!i) return;
        const cat = catByKey(i.cat) ? i.cat : (guess(i.name).cat || 'dry');
        const it = localAdd(i.name, cat, i.note);
        send('add', { id: it.id, name: i.name, note: i.note, cat: cat });
        toast(i.name + ' חזר לרשימה');
        renderHistoryBody();
      };
    });
  }

  /* ---------- install ---------- */
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); S.installEvt = e;
    if (S.view === 'list' && S.me && !document.getElementById('installTip')) renderList();
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

  boot();
})();
