const barTypes = {
  milk: { label: 'Milk chocolate', image: 'assets/milk-bars.jpg' },
  dark: { label: 'Dark chocolate', image: 'assets/dark-bars.jpg' }
};
const additions = {
  nuts: { label: 'Nuts', image: 'assets/packaging-nuts.webp', description: 'A milk or dark chocolate bar concept with a simple nut crunch.' },
  berries: { label: 'Berries', image: 'assets/packaging-berries.webp', description: 'A fruit-led bar concept inspired by raspberry and cranberry notes.' },
  'nuts-and-berries': { label: 'Nuts & Berries', image: 'assets/packaging-nuts-and-berries.webp', description: 'The nut and berry ideas together in one bar concept.' }
};
const products = Object.keys(barTypes).flatMap(type => Object.keys(additions).map(addition => ({
  id: `${type}-${addition}`, type, addition,
  title: `${barTypes[type].label} with ${additions[addition].label}`,
  image: barTypes[type].image,
  packaging: additions[addition].image,
  description: additions[addition].description
})));

const items = new Map();
try {
  const saved = JSON.parse(localStorage.getItem('togo-enquiry-v1') || '[]');
  if (Array.isArray(saved)) saved.forEach(([name, image]) => {
    if (typeof name === 'string' && typeof image === 'string' && name.length < 120 && image.startsWith('assets/')) items.set(name, image);
  });
} catch { /* Browser storage can be unavailable. */ }

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
    empty.textContent = 'Your bag is waiting for something lovely. Explore the bars to begin.';
    bagBody.append(empty);
  } else {
    for (const [name, image] of items) {
      const row = document.createElement('div'); row.className = 'bag-item';
      const img = document.createElement('img'); img.src = image; img.alt = '';
      const title = document.createElement('span'); title.className = 'bag-item-name'; title.textContent = name;
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-item'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove ${name}`);
      remove.addEventListener('click', () => { items.delete(name); updateBag(); });
      row.append(img, title, remove); bagBody.append(row);
    }
  }
  try { localStorage.setItem('togo-enquiry-v1', JSON.stringify([...items])); } catch { /* Continue without persistence. */ }
}

function addSelection(name, image) { items.set(name, image); updateBag(); openBag(); }
function openBag() { returnFocus = document.activeElement; bag.hidden = false; backdrop.hidden = false; document.body.style.overflow = 'hidden'; closeBagButton.focus(); }
function closeBag() { bag.hidden = true; backdrop.hidden = true; document.body.style.overflow = ''; feedback.textContent = ''; returnFocus?.focus(); }
openBagButton.addEventListener('click', openBag);
document.getElementById('footer-bag').addEventListener('click', openBag);
closeBagButton.addEventListener('click', closeBag);
backdrop.addEventListener('click', closeBag);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !bag.hidden) closeBag(); });
bag.addEventListener('keydown', e => { if (e.key !== 'Tab') return; const controls = [...bag.querySelectorAll('button:not(:disabled)')]; const first = controls[0], last = controls.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } });
document.querySelectorAll('.add-item').forEach(button => button.addEventListener('click', () => {
  const name = button.dataset.item;
  addSelection(name, name.toLowerCase().includes('milk') ? barTypes.milk.image : barTypes.dark.image);
}));
copyButton.addEventListener('click', async () => {
  const text = `TOGO Chocolates enquiry\nInterested in: ${[...items.keys()].join(', ')}\n\nPlease share availability and ordering details.`;
  try { await navigator.clipboard.writeText(text); feedback.textContent = 'Enquiry list copied.'; }
  catch { feedback.textContent = 'Copy is unavailable here. Please note your selections above.'; }
});

const barGrid = document.getElementById('bar-grid');
const searchInput = document.getElementById('bar-search');
const flavourFilter = document.getElementById('flavour-filter');
const resultCount = document.getElementById('bar-results');
let activeType = 'all';

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = products.filter(product =>
    (activeType === 'all' || product.type === activeType) &&
    (flavourFilter.value === 'all' || product.addition === flavourFilter.value) &&
    (!query || `${product.title} ${product.description}`.toLowerCase().includes(query))
  );
  resultCount.textContent = `${matches.length} bar ${matches.length === 1 ? 'idea' : 'ideas'} to explore`;
  barGrid.innerHTML = matches.map(product => `
    <article class="bar-card" data-id="${product.id}">
      <div class="bar-card-media"><img class="bar-photo" src="${product.image}" alt="${product.title} concept" loading="lazy"><img class="bar-pack" src="${product.packaging}" alt="" loading="lazy"><span class="bar-media-label">${product.type.toUpperCase()} · PACKAGING CONCEPT</span></div>
      <div class="bar-card-body"><p class="card-kicker">${product.type.toUpperCase()} CHOCOLATE · ${additions[product.addition].label.toUpperCase()}</p><h3>${product.title}</h3><p>Explore the full or half-size bar concept.</p><div class="bar-card-actions"><label>Size <select class="card-size" aria-label="Choose size for ${product.title}"><option value="Full">Full bar</option><option value="Half">Half bar</option></select></label><button type="button" class="bar-details">View details <span aria-hidden="true">↗</span></button></div><button type="button" class="bar-add">Add to enquiry <span aria-hidden="true">+</span></button></div>
    </article>`).join('');
  if (!matches.length) barGrid.innerHTML = '<p class="bar-empty">No bars match that search. Try another chocolate type or addition.</p>';
}

document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
  activeType = button.dataset.type;
  document.querySelectorAll('.filter-chip').forEach(chip => { const active = chip === button; chip.classList.toggle('is-active', active); chip.setAttribute('aria-pressed', String(active)); });
  renderProducts();
}));
searchInput.addEventListener('input', renderProducts);
flavourFilter.addEventListener('change', renderProducts);
document.getElementById('open-search').addEventListener('click', () => { document.getElementById('bar-finder').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => searchInput.focus({ preventScroll: true }), 350); });

const productDialog = document.getElementById('product-dialog');
let selectedProduct = null;
let selectedSize = 'Full';
function productSelection(product, size) { return `${product.title} · ${size} bar`; }
function openProduct(product) {
  selectedProduct = product; selectedSize = 'Full';
  document.getElementById('product-dialog-title').textContent = product.title;
  document.getElementById('product-dialog-description').textContent = product.description;
  const image = document.getElementById('product-dialog-image'); image.src = product.image; image.alt = `${product.title} concept`;
  document.querySelectorAll('.size-choice').forEach(button => { const active = button.dataset.size === selectedSize; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  productDialog.showModal();
}
barGrid.addEventListener('click', event => {
  const card = event.target.closest('.bar-card');
  if (!card) return;
  const product = products.find(entry => entry.id === card.dataset.id);
  if (event.target.closest('.bar-details')) openProduct(product);
  if (event.target.closest('.bar-add')) addSelection(productSelection(product, card.querySelector('.card-size').value), product.image);
});
document.getElementById('close-product').addEventListener('click', () => productDialog.close());
productDialog.addEventListener('click', event => { if (event.target === productDialog) productDialog.close(); });
document.querySelectorAll('.size-choice').forEach(button => button.addEventListener('click', () => {
  selectedSize = button.dataset.size;
  document.querySelectorAll('.size-choice').forEach(choice => { const active = choice === button; choice.classList.toggle('is-active', active); choice.setAttribute('aria-pressed', String(active)); });
}));
document.getElementById('add-product').addEventListener('click', () => {
  const product = selectedProduct;
  productDialog.close();
  addSelection(productSelection(product, selectedSize), product.image);
});

const menuButton = document.getElementById('menu-button');
const mobileNav = document.getElementById('mobile-nav');
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); mobileNav.hidden = open; menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu'); });
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileNav.hidden = true; menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open menu'); }));
document.getElementById('year').textContent = new Date().getFullYear();
renderProducts();
updateBag();
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }); }, { threshold: .1 }); document.querySelectorAll('.reveal').forEach(el => observer.observe(el)); } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
