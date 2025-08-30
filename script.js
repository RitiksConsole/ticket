/* Naruto Theme JS Goodies:
   - Structure the given HTML into a nice panel/grid without editing the HTML file
   - Smooth validation & toasts
   - Replace raw <video> pointing to YouTube with an embedded iframe
   - Ambient shuriken + chakra particles
*/

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // 1) Build a card wrapper & grid without changing the HTML source.
  const card = document.createElement('div');
  card.className = 'naruto-card';

  // Grab existing top-level nodes we want inside the card
  const nodes = Array.from(body.childNodes).filter(n =>
    n.nodeType === 1 // element nodes
  );

  // Move them into the card
  nodes.forEach(n => card.appendChild(n));
  body.appendChild(card);

  // Add kunai icon & badge under title
  const h1 = card.querySelector('h1');
  if (h1) {
    const kunai = document.createElement('span');
    kunai.className = 'kunai';
    h1.prepend(kunai);

    // Optional badge
    const p = card.querySelector('p');
    if (p) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Travelling Ticket Booker';
      p.replaceWith(badge);
    }
  }

  // Group input rows into a grid
  const rows = Array.from(card.querySelectorAll('div'));
  const grid = document.createElement('div');
  grid.className = 'form-grid';
  rows.forEach(r => grid.appendChild(r));
  card.appendChild(grid);

  // Give each row a class for styling
  grid.querySelectorAll('div').forEach(d => d.classList.add('form-row'));

  // Make the submit block look like action row
  const submitRow = document.querySelector('#button')?.closest('div');
  if (submitRow) submitRow.classList.add('actions');

  // Wrap the video/iframe in a media container
  const mediaRow = grid.lastElementChild;
  if (mediaRow) {
    mediaRow.classList.add('media');
  }

  // 2) Video replacement: if <video> src is YouTube page URL, swap to iframe embed
  const v = card.querySelector('video');
  if (v && v.src.includes('youtube.com')) {
    const url = new URL(v.src);
    const id = url.searchParams.get('v');
    const t = url.searchParams.get('t'); // e.g., "2s"
    let start = 0;
    if (t) {
      const match = /^(\d+)(s)?$/i.exec(t);
      if (match) start = parseInt(match[1], 10) || 0;
    }
    const iframe = document.createElement('iframe');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.title = 'Video';
    iframe.src = `https://www.youtube.com/embed/${id}?start=${start}&rel=0`;
    iframe.style.border = '0';
    v.replaceWith(iframe);
  }

  // 3) Validation + Toasts
  const nameEl = document.getElementById('name');
  const dobEl = document.getElementById('date');
  const genderEl = document.getElementById('gender');
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  const btn = document.getElementById('button');

  // Helper to attach a message element after a field (once)
  function msgUnder(el) {
    let m = el.parentElement.querySelector('.field-msg');
    if (!m) {
      m = document.createElement('div');
      m.className = 'field-msg';
      el.parentElement.appendChild(m);
    }
    return m;
  }

  function showMsg(el, text, type = 'error') {
    const m = msgUnder(el);
    m.textContent = text || '';
    m.classList.remove('error','ok');
    m.classList.add(type);
  }

  function clearMsg(el) {
    const m = el.parentElement.querySelector('.field-msg');
    if (m) m.textContent = '';
  }

  function isEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function passwordStrong(v){
    // at least 8, include number or symbol
    return /^(?=.*[\d\W]).{8,}$/.test(v);
  }

  // Live hinting
  emailEl.addEventListener('input', () => {
    if (!emailEl.value) return clearMsg(emailEl);
    showMsg(emailEl, isEmail(emailEl.value) ? 'Looks good.' : 'Enter a valid email.', isEmail(emailEl.value) ? 'ok' : 'error');
  });

  passEl.addEventListener('input', () => {
    if (!passEl.value) return clearMsg(passEl);
    showMsg(passEl, passwordStrong(passEl.value) ? 'Strong enough.' : 'Min 8 chars incl. a number or symbol.', passwordStrong(passEl.value) ? 'ok' : 'error');
  });

  // Toast utility
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);

  function showToast(text, ok=false){
    toast.textContent = text;
    toast.classList.remove('ok','err','show');
    toast.classList.add(ok ? 'ok' : 'err');
    requestAnimationFrame(() => { // next frame to trigger transition
      toast.classList.add('show');
    });
    setTimeout(() => toast.classList.remove('show'), 2600);
  }

  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    let valid = true;

    // Name
    if (!nameEl.value.trim()) {
      showMsg(nameEl, 'Please enter your name.');
      valid = false;
    } else clearMsg(nameEl);

    // DOB
    if (!dobEl.value) {
      showMsg(dobEl, 'Please select your birth date.');
      valid = false;
    } else clearMsg(dobEl);

    // Gender
    if (genderEl.value === '1') {
      showMsg(genderEl, 'Please choose your gender.');
      valid = false;
    } else clearMsg(genderEl);

    // Email
    if (!isEmail(emailEl.value)) {
      showMsg(emailEl, 'Enter a valid email address.');
      valid = false;
    } else clearMsg(emailEl);

    // Password
    if (!passwordStrong(passEl.value)) {
      showMsg(passEl, 'Min 8 chars incl. a number or symbol.');
      valid = false;
    } else clearMsg(passEl);

    if (!valid) {
      showToast('Fix the highlighted fields.', false);
      shake(card);
      return;
    }

    showToast('Believe it! Logged in.', true);
    burstShuriken(btn);
  });

  // 4) Little motion candy
  function shake(el){
    el.animate([
      { transform:'translateX(0)' },
      { transform:'translateX(-6px)' },
      { transform:'translateX(6px)' },
      { transform:'translateX(-4px)' },
      { transform:'translateX(4px)' },
      { transform:'translateX(0)' }
    ], { duration: 380, easing:'cubic-bezier(.36,.07,.19,.97)' });
  }

  // Spinning shuriken burst around the button
  function burstShuriken(target){
    const rect = target.getBoundingClientRect();
    for (let i = 0; i < 10; i++){
      const s = document.createElement('div');
      s.className = 'shuriken';
      const size = 14 + Math.random()*12;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.left = (rect.left + rect.width/2) + 'px';
      s.style.top = (rect.top + rect.height/2) + 'px';
      document.body.appendChild(s);

      const angle = Math.random()*Math.PI*2;
      const dist = 80 + Math.random()*120;
      const dx = Math.cos(angle)*dist;
      const dy = Math.sin(angle)*dist;

      s.animate([
        { transform:`translate(0,0) rotate(0deg)`, opacity:1 },
        { transform:`translate(${dx}px, ${dy}px) rotate(360deg)`, opacity:0 }
      ], { duration: 900 + Math.random()*500, easing:'ease-out' })
      .onfinish = () => s.remove();
    }
  }

  // Ambient chakra particles drifting
  for (let i=0;i<20;i++){
    spawnChakra();
  }
  function spawnChakra(){
    const c = document.createElement('div');
    c.className = 'chakra';
    const x = Math.random()*window.innerWidth;
    const y = Math.random()*window.innerHeight;
    c.style.left = x+'px';
    c.style.top = y+'px';
    document.body.appendChild(c);

    const driftX = (Math.random()*2 - 1) * 80;
    const driftY = 20 + Math.random()*80;
    const duration = 4000 + Math.random()*6000;

    c.animate([
      { transform:`translate(0,0)`, opacity: .65 + Math.random()*.35 },
      { transform:`translate(${driftX}px, ${driftY}px)`, opacity: 0 }
    ], { duration, easing:'ease-out' })
    .onfinish = () => { c.remove(); spawnChakra(); };
  }
});
