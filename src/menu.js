// Main menu for the phone game: shown when loading finishes, over the (already running) world. PLAY closes it;
// CREDITS shows src/credits.js. ?nomenu skips it (tests).
import { CREDITS, AUTHORS } from './credits.js';
export function showMenu(onPlay = () => {}) {
  if (/[?&]nomenu\b/.test(location.search)) { onPlay(); return; }
  const css = document.createElement('style'); css.textContent = `
  #menu { position: fixed; inset: 0; z-index: 9000; display: grid; place-items: center; background: radial-gradient(ellipse at center, rgba(10,8,14,.55), rgba(5,4,8,.92)); color: #e8e6e0; font: 15px/1.5 system-ui, sans-serif; transition: opacity .5s; }
  #menu.out { opacity: 0; pointer-events: none; }
  #menu .box { width: min(380px, 88vw); text-align: center; }
  #menu h1 { font: 700 34px/1.1 Georgia, serif; letter-spacing: .12em; margin: 0 0 6px; color: #f2e8cc; text-shadow: 0 0 18px rgba(255,90,140,.35); }
  #menu .sub { color: #a8a2b4; font-style: italic; margin-bottom: 28px; }
  #menu button { display: block; width: 100%; margin: 10px 0; padding: 14px; font: 600 17px system-ui; letter-spacing: .1em; color: #f2e8cc; background: #1e1a24; border: 1px solid #4a4058; border-radius: 10px; }
  #menu button:active { background: #2e2638; }
  #menu .credits { display: none; text-align: left; max-height: 60vh; overflow-y: auto; padding: 4px 6px; }
  #menu .credits h3 { margin: 16px 0 4px; font: 600 13px system-ui; letter-spacing: .14em; text-transform: uppercase; color: #d8a840; }
  #menu .credits p { margin: 3px 0; color: #d8d4e0; }
  #menu.showcredits .main { display: none; } #menu.showcredits .credits { display: block; }`;
  document.head.appendChild(css);
  const el = document.createElement('div'); el.id = 'menu';
  const list = CREDITS.map(([h, items]) => `<h3>${h}</h3>` + items.map((t) => { const name = t.split(' —')[0]; return `<p>${t}${AUTHORS[name] ? ` — by ${AUTHORS[name]}` : ''}</p>`; }).join('')).join('');
  el.innerHTML = `<div class="box"><div class="main"><h1>PHOTO TOWN</h1><div class="sub">it is not far now</div><button data-a="play">PLAY</button><button data-a="credits">CREDITS</button></div>
    <div class="credits"><h1 style="font-size:24px">CREDITS</h1>${list}<button data-a="back" style="margin-top:20px">BACK</button></div></div>`;
  document.body.appendChild(el);
  el.addEventListener('click', (e) => { const a = e.target.dataset && e.target.dataset.a; if (!a) return; e.stopPropagation();
    if (a === 'credits') el.classList.add('showcredits'); else if (a === 'back') el.classList.remove('showcredits'); else if (a === 'play') { el.classList.add('out'); setTimeout(() => el.remove(), 600); onPlay(); } });
  for (const t of ['pointerdown', 'touchstart', 'mousedown', 'keydown']) el.addEventListener(t, (e) => e.stopPropagation());
}
