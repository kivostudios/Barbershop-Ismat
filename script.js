// ============================================
// BERBER TASLAK — JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ---- Hamburger menu (old dark theme) ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
    });
  });

  // ---- Trimva mobile menu ----
  const tMenuBtn = document.getElementById('t-menu-btn');
  const tMobileMenu = document.getElementById('t-mobile-menu');
  const tMobileClose = document.getElementById('t-mobile-close');

  tMenuBtn?.addEventListener('click', () => tMobileMenu?.classList.add('open'));
  tMobileClose?.addEventListener('click', () => tMobileMenu?.classList.remove('open'));
  document.querySelectorAll('.t-mobile-menu a').forEach(link => {
    link.addEventListener('click', () => tMobileMenu?.classList.remove('open'));
  });

  // ---- Active nav link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Lightbox ----
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');

  document.querySelectorAll('.gallery-item[data-src], .full-gallery-item[data-src]').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      if (lightboxImg && src) {
        lightboxImg.src = src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ---- Appointment form (legacy) ----
  const appointmentForm = document.querySelector('#appointment-form');
  appointmentForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = document.querySelector('.form-success');
    if (success) {
      success.style.display = 'block';
      appointmentForm.reset();
      setTimeout(() => { success.style.display = 'none'; }, 5000);
    }
  });

  // ============================================
  // BOOKING WIZARD
  // ============================================
  const wizardBody = document.querySelector('.wizard-body');
  if (wizardBody) initWizard();

  function initWizard() {
    const state = {
      step: 1,
      service: null,
      date: null,
      time: null,
      name: '',
      phone: '',
      email: '',
      note: ''
    };
    const TOTAL_STEPS = 5;

    const steps = document.querySelectorAll('.wizard-step');
    const indicators = document.querySelectorAll('.wizard-step-indicator');
    const lines = document.querySelectorAll('.wizard-step-line');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnConfirm = document.getElementById('btn-confirm');
    const wizardNav = document.getElementById('wizard-nav');
    const successBox = document.getElementById('wizard-success');

    // ---- STEP 1: SERVICE ----
    document.querySelectorAll('.booking-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.booking-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.service = {
          id: card.dataset.service,
          nameNl: card.dataset.nameNl,
          nameEn: card.dataset.nameEn,
          price: parseInt(card.dataset.price, 10),
          duration: parseInt(card.dataset.duration, 10)
        };
        updateNav();
      });
    });

    // ---- STEP 2: CALENDAR ----
    const monthsNl = ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'];
    const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const today = new Date(); today.setHours(0,0,0,0);
    let viewYear = today.getFullYear();
    let viewMonth = today.getMonth();

    function renderCalendar() {
      const grid = document.getElementById('cal-grid');
      const monthLabel = document.getElementById('cal-month');
      const lang = document.documentElement.lang === 'en' ? 'en' : 'nl';
      const months = lang === 'en' ? monthsEn : monthsNl;

      monthLabel.textContent = `${months[viewMonth]} ${viewYear}`;
      grid.innerHTML = '';

      const firstDay = new Date(viewYear, viewMonth, 1);
      // Convert: Mon=0 ... Sun=6
      let startWeekday = firstDay.getDay() - 1;
      if (startWeekday < 0) startWeekday = 6;
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (let i = 0; i < startWeekday; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth, d);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'calendar-day';
        btn.textContent = d;
        const isPast = date < today;
        if (isPast) {
          btn.classList.add('disabled');
          btn.disabled = true;
        }
        if (date.getTime() === today.getTime()) btn.classList.add('today');
        if (state.date && date.getTime() === state.date.getTime()) btn.classList.add('selected');

        btn.addEventListener('click', () => {
          if (isPast) return;
          state.date = date;
          state.time = null;
          renderCalendar();
          updateNav();
        });
        grid.appendChild(btn);
      }

      const prevBtn = document.getElementById('cal-prev');
      const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
      prevBtn.disabled = isCurrentMonth;
    }

    document.getElementById('cal-prev')?.addEventListener('click', () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    document.getElementById('cal-next')?.addEventListener('click', () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });

    // ---- STEP 3: TIME ----
    function renderTimes() {
      const morning = document.getElementById('time-morning');
      const afternoon = document.getElementById('time-afternoon');
      const evening = document.getElementById('time-evening');
      morning.innerHTML = ''; afternoon.innerHTML = ''; evening.innerHTML = '';

      if (!state.date) return;
      const isSunday = state.date.getDay() === 0;
      const startHour = isSunday ? 10 : 9;
      const endHour = isSunday ? 18 : 20;

      // Random "unavailable" slots based on date for visual variety
      const seed = state.date.getDate() + state.date.getMonth();
      const unavailable = new Set();
      for (let i = 0; i < 3; i++) {
        const h = startHour + ((seed * (i + 1)) % (endHour - startHour));
        const m = (i * 30) % 60;
        unavailable.add(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      }

      for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
          const time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'time-slot';
          btn.textContent = time;
          if (unavailable.has(time)) btn.disabled = true;
          if (state.time === time) btn.classList.add('selected');
          btn.addEventListener('click', () => {
            state.time = time;
            renderTimes();
            updateNav();
          });
          if (h < 12) morning.appendChild(btn);
          else if (h < 17) afternoon.appendChild(btn);
          else evening.appendChild(btn);
        }
      }
    }

    // ---- STEP 4: DETAILS ----
    const inputName = document.getElementById('w-name');
    const inputPhone = document.getElementById('w-phone');
    const inputEmail = document.getElementById('w-email');
    const inputNote = document.getElementById('w-note');

    [inputName, inputPhone, inputEmail, inputNote].forEach(el => {
      el?.addEventListener('input', () => {
        state.name = inputName.value.trim();
        state.phone = inputPhone.value.trim();
        state.email = inputEmail.value.trim();
        state.note = inputNote.value.trim();
        updateNav();
      });
    });

    // ---- STEP 5: SUMMARY ----
    function renderSummary() {
      const lang = document.documentElement.lang === 'en' ? 'en' : 'nl';
      const months = lang === 'en' ? monthsEn : monthsNl;
      const dateStr = state.date
        ? `${state.date.getDate()} ${months[state.date.getMonth()]} ${state.date.getFullYear()}`
        : '—';
      const serviceName = state.service ? (lang === 'en' ? state.service.nameEn : state.service.nameNl) : '—';

      document.getElementById('sum-service').textContent = serviceName;
      document.getElementById('sum-date').textContent = dateStr;
      document.getElementById('sum-time').textContent = state.time || '—';
      document.getElementById('sum-duration').textContent = state.service ? `${state.service.duration} min` : '—';
      document.getElementById('sum-name').textContent = state.name || '—';
      document.getElementById('sum-phone').textContent = state.phone || '—';
      document.getElementById('sum-price').textContent = state.service ? `€${state.service.price}` : '—';
    }

    // ---- VALIDATION ----
    function canProceed() {
      switch (state.step) {
        case 1: return !!state.service;
        case 2: return !!state.date;
        case 3: return !!state.time;
        case 4: return state.name.length >= 2 && state.phone.length >= 6;
        case 5: return true;
        default: return false;
      }
    }

    // ---- NAV ----
    function updateNav() {
      btnPrev.disabled = state.step === 1;
      btnNext.disabled = !canProceed();

      if (state.step === TOTAL_STEPS) {
        btnNext.style.display = 'none';
        btnConfirm.style.display = 'inline-flex';
      } else {
        btnNext.style.display = 'inline-flex';
        btnConfirm.style.display = 'none';
      }
    }

    function goToStep(n) {
      state.step = n;
      steps.forEach(s => s.classList.toggle('active', parseInt(s.dataset.step, 10) === n));
      indicators.forEach(ind => {
        const idx = parseInt(ind.dataset.step, 10);
        ind.classList.toggle('active', idx === n);
        ind.classList.toggle('completed', idx < n);
      });
      lines.forEach((line, i) => {
        line.classList.toggle('completed', i + 1 < n);
      });
      if (n === 2) renderCalendar();
      if (n === 3) renderTimes();
      if (n === 5) renderSummary();
      updateNav();
      window.scrollTo({ top: wizardBody.offsetTop - 100, behavior: 'smooth' });
    }

    btnNext.addEventListener('click', () => {
      if (!canProceed()) return;
      if (state.step < TOTAL_STEPS) goToStep(state.step + 1);
    });

    btnPrev.addEventListener('click', () => {
      if (state.step > 1) goToStep(state.step - 1);
    });

    btnConfirm.addEventListener('click', () => {
      // Save booking to localStorage
      const bookings = JSON.parse(localStorage.getItem('barber_bookings') || '[]');
      const d = state.date;
      const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      bookings.push({
        id: Date.now(),
        name: state.name,
        phone: state.phone,
        email: state.email || '',
        note: state.note || '',
        service: state.service.nameNl,
        serviceEn: state.service.nameEn,
        price: state.service.price,
        duration: state.service.duration,
        date: dateKey,
        time: state.time,
        status: 'pending',
        createdAt: Date.now()
      });
      localStorage.setItem('barber_bookings', JSON.stringify(bookings));

      // Show success
      steps.forEach(s => s.classList.remove('active'));
      wizardNav.style.display = 'none';
      successBox.classList.add('active');
      indicators.forEach(ind => {
        ind.classList.remove('active');
        ind.classList.add('completed');
      });
      lines.forEach(line => line.classList.add('completed'));
    });

    updateNav();
  }

  // ---- Smooth scroll ----
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Fade-in on scroll ----
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    observer.observe(el);
  });

  // ============================================
  // TAAL WISSELEN — NL / EN
  // ============================================

  const LANG_KEY = 'barber_lang';

  function setLanguage(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;

    // Update text/HTML content
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

    // Update placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
      if (!el.dataset.nlPlaceholder) el.dataset.nlPlaceholder = el.placeholder;
      el.placeholder = lang === 'en' ? el.dataset.enPlaceholder : el.dataset.nlPlaceholder;
    });

    // Update lang button active states (all .lang-btn on page)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // Bind lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Init with saved preference
  const savedLang = localStorage.getItem(LANG_KEY) || 'nl';
  if (savedLang === 'en') setLanguage('en');
  else {
    // Just mark NL button active
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === 'nl');
    });
  }

});
