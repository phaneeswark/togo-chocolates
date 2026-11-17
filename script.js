const items = new Map();
const images = { 'Milk Chocolate Bars': 'assets/milk-bars.jpg', 'Dark Chocolate Bars': 'assets/dark-bars.jpg' };
const bag = document.getElementById('bag-drawer');
const backdrop = document.getElementById('drawer-backdrop');
const openBagButton = document.getElementById('open-bag');
const closeBagButton = document.getElementById('close-bag');
const bagBody = document.getElementById('drawer-body');
const copyButton = document.getElementById('copy-enquiry');
const feedback = document.getElementById('copy-feedback');
let returnFocus = null;

function updateBag() {
  const count = items.size;
  document.getElementById('bag-count').textContent = count;
  document.getElementById('drawer-count').textContent = `(${count})`;
  copyButton.disabled = count === 0;
  bagBody.replaceChildren();
  if (!count) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Your bag is waiting for something lovely. Explore the collection to begin.';
    bagBody.append(empty);
    return;
  }
  for (const name of items.keys()) {
    const row = document.createElement('div'); row.className = 'bag-item';
    const img = document.createElement('img'); img.src = images[name]; img.alt = '';
    const title = document.createElement('span'); title.className = 'bag-item-name'; title.textContent = name;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-item'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${name}`);
    remove.addEventListener('click', () => { items.delete(name); updateBag(); });
    row.append(img, title, remove); bagBody.append(row);
  }
}
function openBag() { returnFocus = document.activeElement; bag.hidden = false; backdrop.hidden = false; document.body.style.overflow = 'hidden'; closeBagButton.focus(); }
function closeBag() { bag.hidden = true; backdrop.hidden = true; document.body.style.overflow = ''; feedback.textContent = ''; returnFocus?.focus(); }
openBagButton.addEventListener('click', openBag);
document.getElementById('footer-bag').addEventListener('click', openBag);
closeBagButton.addEventListener('click', closeBag);
backdrop.addEventListener('click', closeBag);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !bag.hidden) closeBag(); });
bag.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const controls = [...bag.querySelectorAll('button:not(:disabled)')]; const first = controls[0], last = controls.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } });
document.querySelectorAll('.add-item').forEach(button => button.addEventListener('click', () => { items.set(button.dataset.item, true); updateBag(); openBag(); }));
copyButton.addEventListener('click', async () => {
  const text = `TOGO Chocolates enquiry\nInterested in: ${[...items.keys()].join(', ')}\n\nPlease share availability and ordering details.`;
  try { await navigator.clipboard.writeText(text); feedback.textContent = 'Enquiry list copied.'; }
  catch { feedback.textContent = 'Copy is unavailable here. Please note your selections above.'; }
});
const menuButton = document.getElementById('menu-button');
const mobileNav = document.getElementById('mobile-nav');
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); mobileNav.hidden = open; menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu'); });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open menu'); }));
document.getElementById('year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: .1 }); document.querySelectorAll('.reveal').forEach(el => observer.observe(el)); } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
