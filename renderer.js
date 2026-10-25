const $ = (id) => document.getElementById(id);
const petEl = $('pet'), wig = $('wig'), bubble = $('bubble'), badge = $('badge'), eyes = $('eyes');
let unread = 0, bubbleTimer;

function restart(cls) { wig.classList.remove('wiggle', 'alert'); void wig.offsetWidth; wig.classList.add(cls); }
function setMood(on) { document.body.classList.toggle('happy', on); document.body.classList.toggle('alerting', on); }

function dismiss() {
  clearTimeout(bubbleTimer);
  bubble.classList.remove('show');
  unread = 0; badge.classList.remove('show'); setMood(false);
}

window.pet.onNotify(({ title, message }) => {
  unread++;
  badge.textContent = unread > 9 ? '9+' : String(unread); badge.classList.add('show');
  bubble.textContent = '';
  if (title) { const b = document.createElement('b'); b.textContent = title; bubble.appendChild(b); }
  bubble.appendChild(document.createTextNode(message || (title ? '' : 'New notification')));
  bubble.classList.add('show');
  restart('alert'); setMood(true);
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { bubble.classList.remove('show'); setMood(false); }, 15000); // badge stays until clicked
});

// Only the ball and a visible bubble catch the mouse; the rest of the window is click-through.
const hit = (t) => petEl.contains(t) || (bubble.classList.contains('show') && bubble.contains(t));
document.addEventListener('mousemove', (e) => window.pet.overPet(hit(e.target)));
document.addEventListener('mouseleave', () => window.pet.overPet(false));

// Click vs drag: movement under 4px counts as a click.
let down = null, dragging = false;
petEl.addEventListener('mousedown', (e) => { if (e.button === 0) { down = { x: e.screenX, y: e.screenY }; dragging = false; } });
window.addEventListener('mousemove', (e) => {
  if (!down) return;
  if (!dragging && Math.hypot(e.screenX - down.x, e.screenY - down.y) > 4) { dragging = true; window.pet.dragStart(); }
  if (dragging) window.pet.dragMove();
});
window.addEventListener('mouseup', () => {
  if (!down) return;
  const wasDrag = dragging; down = null; dragging = false;
  if (wasDrag) { window.pet.dragEnd(); return; }
  dismiss(); restart('wiggle'); window.pet.openChat();   // single click: open chat + clear notification
});
bubble.addEventListener('click', dismiss);
petEl.addEventListener('contextmenu', (e) => { e.preventDefault(); window.pet.menu(); });

// Idle: blink + look around
function blink() {
  document.body.classList.add('blink'); setTimeout(() => document.body.classList.remove('blink'), 140);
  setTimeout(blink, 2000 + Math.random() * 3500);
}
function look() {
  eyes.style.transform = `translate(${Math.round((Math.random() * 2 - 1) * 5)}px, ${Math.round((Math.random() * 2 - 1) * 2)}px)`;
  setTimeout(() => { eyes.style.transform = ''; }, 900 + Math.random() * 800);
  setTimeout(look, 3000 + Math.random() * 5000);
}
setTimeout(blink, 2000); setTimeout(look, 3000);
