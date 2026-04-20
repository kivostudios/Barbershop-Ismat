// ============================================
// ADMIN PANEL — JavaScript
// ============================================

const ADMIN_PASSWORD = 'barber2025'; // Wijzig dit wachtwoord!
const BOOKINGS_KEY = 'barber_bookings';
const AUTH_KEY = 'barber_admin_auth';
const LANG_KEY = 'barber_lang';

const monthsNl = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
const monthsEn = ['january','february','march','april','may','june','july','august','september','october','november','december'];

const i18n = {
  nl: {
    pending: 'In afwachting', confirmed: 'Bevestigd', cancelled: 'Geannuleerd',
    confirm: 'Bevestig', cancel: 'Annuleer', delete: 'Verwijder',
    noBookings: 'Nog geen reserveringen.', noFiltered: 'Geen reserveringen gevonden.',
    noToday: 'Geen afspraken vandaag.', deleteConfirm: 'Reservering verwijderen?'
  },
  en: {
    pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled',
    confirm: 'Confirm', cancel: 'Cancel', delete: 'Delete',
    noBookings: 'No bookings yet.', noFiltered: 'No bookings found.',
    noToday: 'No appointments today.', deleteConfirm: 'Delete this booking?'
  }
};

let currentLang = localStorage.getItem(LANG_KEY) || 'nl';
function t(key) { return i18n[currentLang][key]; }
function months() { return currentLang === 'en' ? monthsEn : monthsNl; }

// ---- HELPERS ----
function getBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${months()[parseInt(m)-1]} ${y}`;
}

function statusBadge(status) {
  return `<span class="booking-status ${status}">${t(status)}</span>`;
}

function actionButtons(id, status) {
  let btns = '';
  if (status !== 'confirmed') {
    btns += `<button class="admin-action-btn confirm" onclick="updateStatus('${id}','confirmed')">${t('confirm')}</button>`;
  }
  if (status !== 'cancelled') {
    btns += `<button class="admin-action-btn cancel" onclick="updateStatus('${id}','cancelled')">${t('cancel')}</button>`;
  }
  btns += `<button class="admin-action-btn delete" onclick="deleteBooking('${id}')">${t('delete')}</button>`;
  return btns;
}

function bookingRow(b) {
  return `
    <div class="booking-row" id="row-${b.id}">
      <div>
        <div class="booking-row-name">${b.name}</div>
        <div class="booking-row-phone">${b.phone}</div>
      </div>
      <div>
        <div class="booking-row-service">${b.service}</div>
        <div class="booking-row-price">€${b.price} · ${b.duration} min</div>
      </div>
      <div>
        <div class="booking-row-datetime">${formatDate(b.date)}</div>
        <div class="booking-row-time">${b.time}</div>
      </div>
      <div class="booking-row-actions">
        ${statusBadge(b.status)}
        ${actionButtons(b.id, b.status)}
      </div>
    </div>`;
}

function emptyState(msg) {
  return `<div class="admin-empty">${msg}</div>`;
}

// ---- STATUS ACTIONS ----
window.updateStatus = function(id, status) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => String(b.id) === String(id));
  if (idx === -1) return;
  bookings[idx].status = status;
  saveBookings(bookings);
  renderAll();
};

window.deleteBooking = function(id) {
  if (!confirm(t('deleteConfirm'))) return;
  const bookings = getBookings().filter(b => String(b.id) !== String(id));
  saveBookings(bookings);
  renderAll();
};

// ---- RENDER ----
function renderStats() {
  const bookings = getBookings();
  const today = todayStr();
  document.getElementById('stat-today').textContent = bookings.filter(b => b.date === today).length;
  document.getElementById('stat-total').textContent = bookings.length;
  document.getElementById('stat-confirmed').textContent = bookings.filter(b => b.status === 'confirmed').length;
  document.getElementById('stat-pending').textContent = bookings.filter(b => b.status === 'pending').length;
}

function renderRecent() {
  const bookings = getBookings().slice(-5).reverse();
  const el = document.getElementById('recent-list');
  if (!el) return;
  el.innerHTML = bookings.length
    ? bookings.map(bookingRow).join('')
    : emptyState(t('noBookings'));
}

let currentFilter = 'all';

function renderBookings() {
  const all = getBookings().reverse();
  const filtered = currentFilter === 'all' ? all : all.filter(b => b.status === currentFilter);
  const el = document.getElementById('bookings-list');
  if (!el) return;
  el.innerHTML = filtered.length
    ? filtered.map(bookingRow).join('')
    : emptyState(t('noFiltered'));
}

function renderToday() {
  const today = todayStr();
  const bookings = getBookings().filter(b => b.date === today).sort((a,b) => a.time.localeCompare(b.time));
  const el = document.getElementById('today-list');
  if (!el) return;

  const d = new Date();
  const dateEl = document.getElementById('today-full-date');
  if (dateEl) dateEl.textContent = `${d.getDate()} ${months()[d.getMonth()]} ${d.getFullYear()}`;

  el.innerHTML = bookings.length
    ? bookings.map(bookingRow).join('')
    : emptyState(t('noToday'));
}

function renderAll() {
  renderStats();
  renderRecent();
  renderBookings();
  renderToday();
}

// ---- VIEWS ----
function showView(name) {
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(a => a.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`[data-view="${name}"]`)?.classList.add('active');
}

// ---- AUTH ----
function showDashboard() {
  document.getElementById('admin-login').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'grid';

  const d = new Date();
  const dateEl = document.getElementById('admin-today-date');
  if (dateEl) dateEl.textContent = `${d.getDate()} ${months()[d.getMonth()]} ${d.getFullYear()}`;

  renderAll();
}

// ---- LANGUAGE ----
function applyStaticTranslations(lang) {
  document.querySelectorAll('[data-en]').forEach(el => {
    const enText = el.dataset.en;
    const hasHtml = /<[a-z][\s\S]*>/i.test(enText);
    if (!el.dataset.nl) {
      el.dataset.nl = (hasHtml ? el.innerHTML : el.textContent).trim();
    }
    const target = lang === 'en' ? enText : el.dataset.nl;
    if (hasHtml) el.innerHTML = target;
    else el.textContent = target;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    if (!el.dataset.nlPlaceholder) el.dataset.nlPlaceholder = el.placeholder;
    el.placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.nlPlaceholder;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
  applyStaticTranslations(lang);
  // Re-render dynamic content (bookings, dates)
  if (document.getElementById('admin-dashboard').style.display !== 'none') {
    const d = new Date();
    const dateEl = document.getElementById('admin-today-date');
    if (dateEl) dateEl.textContent = `${d.getDate()} ${months()[d.getMonth()]} ${d.getFullYear()}`;
    renderAll();
  }
}

function checkAuth() {
  return localStorage.getItem(AUTH_KEY) === 'true';
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved language on load
  applyStaticTranslations(currentLang);

  // Language button handlers
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Auto-login if already authenticated
  if (checkAuth()) {
    showDashboard();
  }

  // Login form
  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('login-password').value;
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true');
      document.getElementById('login-error').style.display = 'none';
      showDashboard();
    } else {
      document.getElementById('login-error').style.display = 'block';
      document.getElementById('login-password').value = '';
    }
  });

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    location.reload();
  });

  // Nav links
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showView(el.dataset.view);
    });
  });

  // Filter buttons
  document.querySelectorAll('.admin-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderBookings();
    });
  });
});
