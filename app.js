/**
 * Main Application Logic
 * Al-Sari Terrestrial Broadcast Management System
 * الساري للبث الأرضي
 */

(function () {
  'use strict';

  // --- Utility Functions ---
  function getEngine() {
    return window.syncEngine;
  }

  function getData() {
    return getEngine() ? getEngine().data : {};
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatIQD(num) {
    if (num === null || num === undefined || num === '') return '0 د.ع';
    const clean = typeof num === 'string' ? num.replace(/[^\d.-]/g, '') : num;
    const val = Number(clean) || 0;
    return val.toLocaleString('en-US') + ' د.ع';
  }

  if (!window.normalizeSearchQuery) {
    window.normalizeSearchQuery = function(str) {
      if (!str) return '';
      return String(str)
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[\u064B-\u065F]/g, '')
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .trim();
    };
  }

  function formatNumber(num) {
    if (num === null || num === undefined || num === '') return '0';
    const clean = typeof num === 'string' ? num.replace(/[^\d.-]/g, '') : num;
    const val = Number(clean) || 0;
    return val.toLocaleString('en-US');
  }

  function parseNumber(val) {
    if (val === null || val === undefined || val === '') return 0;
    const clean = typeof val === 'string' ? val.replace(/[^\d.-]/g, '') : val;
    return Number(clean) || 0;
  }

  function formatInputWithCommas(input) {
    if (!input) return;
    const cursor = input.selectionStart || 0;
    const oldLength = input.value.length;
    const raw = input.value.replace(/[^\d]/g, '');
    if (!raw) {
      input.value = '';
      return;
    }
    const formatted = Number(raw).toLocaleString('en-US');
    input.value = formatted;
    try {
      const newLength = formatted.length;
      const diff = newLength - oldLength;
      input.setSelectionRange(cursor + diff, cursor + diff);
    } catch (e) {}
  }

  window.formatNumber = formatNumber;
  window.parseNumber = parseNumber;
  window.formatInputWithCommas = formatInputWithCommas;
  window.formatIQD = formatIQD;

  function normalizeDigits(str) {
    if (!str) return '';
    const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(str).replace(/[٠-٩]/g, d => arabicDigits.indexOf(d))
                      .replace(/[۰-۹]/g, d => persianDigits.indexOf(d));
  }

  function normalizeIraqiPhone(phone) {
    if (!phone) return '';
    let clean = normalizeDigits(phone).replace(/\D/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (!clean.startsWith('964')) clean = '964' + clean;
    return clean;
  }
  window.normalizeIraqiPhone = normalizeIraqiPhone;

  function getEnUsToday() {
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'صباح الخير والبركة ☀️' : 'مساء الخير والنشاط 🌙';
  }

  function generateSaleCode() {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `SR-${num}`;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
      <span>${escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function showConfirmDialog(title, message, onConfirm) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="confirm-modal">
        <div class="modal-dialog" style="max-width: 420px; text-align: center;">
          <div class="modal-body" style="padding: 28px 24px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px; color: var(--warning);">⚠️</div>
            <h3 style="margin-bottom: 8px;">${escapeHtml(title)}</h3>
            <p style="color: var(--text-sub); font-size: 0.95rem;">${escapeHtml(message)}</p>
          </div>
          <div class="modal-footer" style="justify-content: center; gap: 14px;">
            <button class="btn btn-secondary" id="confirm-btn-cancel">إلغاء</button>
            <button class="btn btn-danger" id="confirm-btn-ok">تأكيد ومتابعة</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('confirm-btn-cancel').onclick = () => {
      modalContainer.innerHTML = '';
    };

    document.getElementById('confirm-btn-ok').onclick = () => {
      modalContainer.innerHTML = '';
      if (typeof onConfirm === 'function') onConfirm();
    };
  }

  window.showConfirmDialog = showConfirmDialog;

  // --- Auth & State Handling ---
  let currentPage = 'dashboard';
  let salesFilter = { seller: 'all', type: 'all', paymentStatus: 'all', search: '' };
  let subscribersFilter = { owner: 'all', status: 'all', search: '' };
  let selectedBarcodes = new Set();

  function initApp() {
    // Set Live en-US Date
    const dateEl = document.getElementById('topbar-date');
    if (dateEl) dateEl.textContent = getEnUsToday();

    // Check restored session
    const restored = getEngine().restoreSession();
    if (restored) {
      renderAppView(restored);
    } else {
      renderLoginView();
    }

    attachGlobalEvents();
  }

  function renderLoginView() {
    document.getElementById('login-view').style.display = 'flex';
    document.getElementById('app-view').style.display = 'none';
  }

  function renderAppView(user) {
    document.getElementById('login-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'flex';

    // Set User info in UI
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-user-avatar');
    const badgeEl = document.getElementById('sidebar-role-label');

    if (nameEl) nameEl.textContent = user.displayName || user.username;
    if (avatarEl) avatarEl.textContent = (user.displayName || user.username).substring(0, 1);

    const isAdmin = user.role === 'admin' || user.role === 'أدمن' || user.role === 'مدير رئيسي';

    if (isAdmin) {
      if (roleEl) roleEl.textContent = 'أدمن رئيسي';
      if (badgeEl) badgeEl.textContent = 'نظام إدارة المركز - رئيسي';
      document.getElementById('sidebar-nav-admin').style.display = 'flex';
      document.getElementById('sidebar-nav-agent').style.display = 'none';
      navigateTo('dashboard');
    } else {
      if (roleEl) roleEl.textContent = 'وكيل معتمد';
      if (badgeEl) badgeEl.textContent = `وكيل: ${user.agentName || user.displayName}`;
      document.getElementById('sidebar-nav-admin').style.display = 'none';
      document.getElementById('sidebar-nav-agent').style.display = 'flex';
      navigateTo('agent-dash');
    }
  }

  // Navigation router
  function navigateTo(page) {
    currentPage = page;
    const pageTitleMap = {
      dashboard: 'الداشبورد',
      sales: 'المبيعات',
      'pending-requests': 'الطلبات المعلقة',
      agents: 'الوكلاء',
      debts: 'الديون',
      subscribers: 'المشتركون',
      barcodes: 'الأكواد والباركود',
      reports: 'التقارير والتصدير',
      products: 'المنتجات',
      pricing: 'الأسعار',
      users: 'المستخدمون والأدمن',
      'agent-dash': 'لوحة الوكيل',
      'agent-sales': 'مبيعاتي وديوني'
    };

    const titleEl = document.getElementById('topbar-current-page');
    if (titleEl) titleEl.textContent = pageTitleMap[page] || page;

    // Update active nav-item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
      if (el.getAttribute('data-page') === page) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Close mobile menu if open
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-backdrop').classList.remove('active');

    updatePendingApprovalsBadge();

    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    switch (page) {
      case 'dashboard': renderDashboard(mainEl); break;
      case 'sales': renderSales(mainEl); break;
      case 'pending-requests': renderPendingRequests(mainEl); break;
      case 'agents': renderAgents(mainEl); break;
      case 'debts': renderDebts(mainEl); break;
      case 'subscribers': renderSubscribers(mainEl); break;
      case 'barcodes': renderBarcodes(mainEl); break;
      case 'reports': renderReports(mainEl); break;
      case 'products': renderProducts(mainEl); break;
      case 'pricing': renderPricing(mainEl); break;
      case 'users': renderUsers(mainEl); break;
      case 'agent-dash': renderAgentDashboard(mainEl); break;
      case 'agent-sales': renderAgentSales(mainEl); break;
      default: renderDashboard(mainEl); break;
    }
  }

  // Expose to window for inline calls
  window.navigateTo = navigateTo;
  window.showToast = showToast;
  
  window.updatePendingApprovalsBadge = function() {
    const data = getData();
    const pending = (data.agentSubmissions || []).length;
    const badge = document.getElementById('pending-requests-badge');
    if (badge) {
      if (pending > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = pending;
      } else {
        badge.style.display = 'none';
      }
    }
  };

  window.quickFillLogin = function(user, pass) {
    document.getElementById('login-username').value = user;
    document.getElementById('login-password').value = pass;
    document.getElementById('login-form').dispatchEvent(new Event('submit'));
  };

  // --- Global Event Listeners ---
  function attachGlobalEvents() {
    window.addEventListener('sari:data-updated', () => {
      updatePendingApprovalsBadge();
    });

    // Login form submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errEl = document.getElementById('login-error');
        errEl.style.display = 'none';

        try {
          const res = await getEngine().login(username, password);
          if (res && res.user) {
            showToast(`أهلاً بك، ${res.user.displayName || res.user.username}!`, 'success');
            renderAppView(res.user);
          }
        } catch (err) {
          errEl.textContent = err.message || 'اسم الحساب أو كلمة المرور غير صحيحة.';
          errEl.style.display = 'block';
        }
      });
    }

    // Sidebar navigation clicks
    document.querySelectorAll('.sidebar-nav').forEach(nav => {
      nav.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (item && item.getAttribute('data-page')) {
          e.preventDefault();
          navigateTo(item.getAttribute('data-page'));
        }
      });
    });

    // Mobile Hamburger
    const menuToggle = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (menuToggle && sidebar && backdrop) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    // Theme toggle ◐
    const themeBtn = document.getElementById('btn-toggle-theme');
    if (themeBtn) {
      const savedTheme = localStorage.getItem('sari_theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('sari_theme', next);
        showToast(next === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري');
      });
    }

    // Refresh / Sync ↻
    const syncBtn = document.getElementById('btn-sync-data');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        syncBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => syncBtn.style.transform = '', 500);
        getEngine().loadLocal();
        navigateTo(currentPage);
        showToast('تم تحديث البيانات بنجاح', 'success');
      });
    }

    // Logout
    function handleLogout() {
      showConfirmDialog('تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟', () => {
        getEngine().logout();
        renderLoginView();
        showToast('تم تسجيل الخروج بنجاح');
      });
    }

    document.getElementById('btn-topbar-logout')?.addEventListener('click', handleLogout);
    document.getElementById('btn-quick-logout')?.addEventListener('click', handleLogout);

    // Listen to data-updated events from syncEngine
    window.addEventListener('sari:data-updated', () => {
      navigateTo(currentPage);
    });
  }

  // --- Page 1: Dashboard ---
  function renderDashboard(container) {
    const data = getData();
    const sales = data.sales || [];
    const debts = data.debts || [];
    const agents = data.agents || [];

    const totalSalesVal = sales.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const todayStr = new Date().toISOString().substring(0, 10);
    const todaySalesVal = sales.filter(s => (s.startDate || s.createdAt || '').startsWith(todayStr))
                               .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const totalOutstandingDebt = debts.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0);

    // 7-day Sales Chart Calculation with ar-IQ day labels
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const chartPoints = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().substring(0, 10);
      const daySales = sales.filter(s => (s.startDate || s.createdAt || '').startsWith(iso))
                            .reduce((sum, s) => sum + (Number(s.price) || 0), 0);
      chartPoints.push({
        dayName: days[d.getDay()],
        date: iso,
        amount: daySales
      });
    }

    const maxChartVal = Math.max(...chartPoints.map(p => p.amount), 100000);
    const svgWidth = 600;
    const svgHeight = 160;
    const pts = chartPoints.map((p, idx) => {
      const x = 40 + idx * ((svgWidth - 80) / 6);
      const y = svgHeight - 30 - ((p.amount / maxChartVal) * (svgHeight - 60));
      return { x, y, ...p };
    });

    const polylinePts = pts.map(p => `${p.x},${p.y}`).join(' ');
    const areaPts = `40,${svgHeight - 30} ` + polylinePts + ` ${svgWidth - 40},${svgHeight - 30}`;

    // Recent Operations (last 6)
    const recentSales = [...sales].reverse().slice(0, 6);

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">${getGreeting()}</span>
            <h1>الداشبورد العام للمركز</h1>
            <p class="subtitle">نظرة شاملة ومباشرة على المبيعات، الوكلاء، والديون القائمة</p>
          </div>
        </div>

        <!-- 4 Stat Cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">إجمالي المبيعات</span>
              <div class="stat-icon">💰</div>
            </div>
            <div class="stat-value-group">
              <span class="stat-value">${formatNumber(totalSalesVal)}</span>
              <span class="stat-unit">د.ع</span>
            </div>
            <div class="stat-footer"><span>عدد العمليات الإجمالي:</span> <strong>${sales.length} عملية</strong></div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">مبيعات اليوم</span>
              <div class="stat-icon">📈</div>
            </div>
            <div class="stat-value-group">
              <span class="stat-value">${formatNumber(todaySalesVal)}</span>
              <span class="stat-unit">د.ع</span>
            </div>
            <div class="stat-footer"><span>معدل النشاط الحالي:</span> <strong>مباشر</strong></div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">الوكلاء النشطون</span>
              <div class="stat-icon">👥</div>
            </div>
            <div class="stat-value-group">
              <span class="stat-value">${agents.length}</span>
              <span class="stat-unit">وكيل</span>
            </div>
            <div class="stat-footer"><span>تغطية شبكة الساري:</span> <strong>مستقرة</strong></div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-title">الديون المستحقة</span>
              <div class="stat-icon">⏳</div>
            </div>
            <div class="stat-value-group">
              <span class="stat-value" style="color: var(--danger);">${formatNumber(totalOutstandingDebt)}</span>
              <span class="stat-unit">د.ع</span>
            </div>
            <div class="stat-footer"><span>الديون غير المسددة:</span> <strong>${debts.filter(d => d.remainingAmount > 0).length} سجل</strong></div>
          </div>
        </div>

        <!-- Sales Chart Card -->
        <div class="content-card">
          <div class="card-header-bar">
            <h3>مخطط حركة المبيعات لآخر 7 أيام</h3>
            <span class="badge badge-neutral">بالدينار العراقي</span>
          </div>
          <div style="overflow-x: auto;">
            <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 180px; overflow: visible;">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#245b89" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#245b89" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <!-- Grid line -->
              <line x1="40" y1="${svgHeight - 30}" x2="${svgWidth - 40}" y2="${svgHeight - 30}" stroke="var(--line)" stroke-width="1.5" />
              <!-- Area -->
              <polygon points="${areaPts}" fill="url(#chartGrad)" />
              <!-- Polyline -->
              <polyline points="${polylinePts}" fill="none" stroke="var(--green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Points & Labels -->
              ${pts.map(p => `
                <circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#fff" stroke="var(--green)" stroke-width="2.5" />
                <text x="${p.x}" y="${svgHeight - 10}" font-size="11" fill="var(--text-sub)" text-anchor="middle" font-weight="600">${p.dayName}</text>
                ${p.amount > 0 ? `<text x="${p.x}" y="${p.y - 10}" font-size="10" fill="var(--ink)" text-anchor="middle" font-weight="700">${(p.amount / 1000).toFixed(0)}k</text>` : ''}
              `).join('')}
            </svg>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="content-card">
          <div class="card-header-bar">
            <h3>آخر العمليات</h3>
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('sales')">عرض الكل ←</button>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الفاتورة / التاريخ</th>
                  <th>الزبون / البائع</th>
                  <th>نوع العملية</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${recentSales.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 30px;">لا توجد عمليات مسجلة بعد</td></tr>` : 
                  recentSales.map(s => `
                    <tr>
                      <td>
                        <strong style="color: var(--green); font-size: 0.85rem;">${escapeHtml(s.code)}</strong>
                        <div class="cell-subtitle" style="direction: ltr; text-align: right;">${escapeHtml((s.startDate || s.createdAt || '').substring(0, 10))}</div>
                      </td>
                      <td>
                        <strong class="cell-title">${escapeHtml(s.customerName)}</strong>
                        <div class="cell-subtitle">${escapeHtml(s.seller)}</div>
                      </td>
                      <td>${escapeHtml(s.saleType || s.subscriptionType)}</td>
                      <td><strong>${formatIQD(s.price)}</strong></td>
                      <td>
                        <span class="badge ${s.paymentStatus === 'تم التسديد' ? 'badge-success' : 'badge-danger'}">
                          ${escapeHtml(s.paymentStatus)}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // --- Page 2: Sales ---
  window.formatWhatsAppMessage = function(s, templateOverride) {
    const engine = getEngine();
    const defaultTpl = window.DEFAULT_WHATSAPP_TEMPLATE || `السلام عليكم ورحمة الله

• المشترك: «اسم الزبون»🌟

تمت عملية «تجديد اشتراك» بنجاح.
• المدة: «مدة تجديد اشتراك»
• المبلغ: «المبلغ» د.ع
• المدفوع: «المبلغ المدفوع» د.ع
• المتبقي: «المبلغ المتبقي» د.ع
• تاريخ الانتهاء: «تاريخ انتهاء الاشتراك»

شكراً لثقتكم — الساري للبث الأرضي - وكيل قنوات الرابعة الرياضية 📡`;

    const tpl = templateOverride || engine?.data?.templates?.whatsapp || defaultTpl;

    const customerName = s.customerName || s.name || '';
    const saleType = s.saleType || s.subscriptionType || 'تجديد اشتراك';
    const duration = s.subscriptionType || s.saleType || 'اشتراك شهر واحد';
    const price = formatNumber(Number(s.price) || 0);
    const isPaidFull = s.paymentStatus === 'تم التسديد';
    const paidVal = isPaidFull ? (Number(s.price) || 0) : (Number(s.agentPaid) || 0);
    const paid = formatNumber(paidVal);
    const remainingVal = Math.max(0, (Number(s.price) || 0) - paidVal);
    const remaining = formatNumber(remainingVal);
    const endDate = s.endDate || s.expiryDate || '-';
    const deviceNumber = s.deviceNumber || '-';

    let msg = tpl;
    msg = msg.replace(/«اسم الزبون»|\{customerName\}|\{اسم_الزبون\}|\{المشترك\}/g, customerName);
    msg = msg.replace(/«تجديد اشتراك»|\{saleType\}|\{نوع_العملية\}/g, saleType);
    msg = msg.replace(/«مدة تجديد اشتراك»|\{duration\}|\{المدة\}/g, duration);
    msg = msg.replace(/«المبلغ»|\{price\}|\{المبلغ\}/g, price);
    msg = msg.replace(/«المبلغ المدفوع»|\{paid\}|\{المدفوع\}|\{المبلغ_المدفوع\}/g, paid);
    msg = msg.replace(/«المبلغ المتبقي»|\{remaining\}|\{المتبقي\}|\{المبلغ_المتبقي\}/g, remaining);
    msg = msg.replace(/«تاريخ انتهاء الاشتراك»|\{endDate\}|\{تاريخ_الانتهاء\}/g, endDate);
    msg = msg.replace(/«رقم الجهاز»|\{deviceNumber\}|\{رقم_الجهاز\}/g, deviceNumber);

    return msg;
  };

  window.renderPendingSubmissions = function(container) {
    const data = getData();
    const pendingSubmissions = data.agentSubmissions || [];
    if (pendingSubmissions.length === 0) {
      container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--muted);">لا توجد طلبات معلقة بانتظار الاعتماد.</p>';
      return;
    }
    container.innerHTML = `
      <div class="content-card" style="border: 2px solid var(--warning); background: var(--warning-bg);">
        <div class="card-header-bar" style="margin-bottom: 12px;">
          <h3 style="color: var(--warning); display: flex; align-items: center; gap: 8px;">
            <span>🔔</span>
            <span>طلبات بيع وتجديد من الوكلاء (${pendingSubmissions.length})</span>
          </h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>الزبون والوكيل</th>
                <th>الجهاز / نوع الطلب</th>
                <th>فترة الاشتراك</th>
                <th>المبلغ</th>
                <th style="text-align: center;">إجراءات الاعتماد</th>
              </tr>
            </thead>
            <tbody>
              ${pendingSubmissions.map(req => `
                <tr>
                  <td>
                    <strong class="cell-title">${escapeHtml(req.customerName)}</strong>
                    <div class="cell-subtitle">
                      <span class="badge badge-neutral" style="font-size: 0.68rem; padding: 1px 5px;">${escapeHtml(window.resolveAgentName ? window.resolveAgentName(req) : (req.agentName || req.seller))}</span>
                      ${req.customerPhone ? `<span style="direction: ltr; margin-right: 4px;">${escapeHtml(req.customerPhone)}</span>` : ''}
                    </div>
                  </td>
                  <td>
                    <div style="font-family: monospace; font-size: 0.84rem;">
                      <span style="cursor: pointer; color: var(--green); text-decoration: underline; font-weight: 700;" onclick="showDeviceBarcodeModal('${escapeHtml(req.deviceNumber)}')" title="انقر لعرض QR Code">${escapeHtml(req.deviceNumber)}</span>
                    </div>
                    <div class="cell-subtitle">${escapeHtml(req.subscriptionType || req.saleType || 'تجديد')}</div>
                  </td>
                  <td>
                    <div class="cell-date-range" style="direction: ltr;">
                      <span class="cell-date-from">بدء: ${escapeHtml(req.startDate || '-')}</span>
                      <span class="cell-date-to">انتهاء: ${escapeHtml(req.endDate || '-')}</span>
                    </div>
                  </td>
                  <td><strong class="cell-title">${formatIQD(req.price || 0)}</strong></td>
                  <td style="text-align: center;">
                    <div class="action-btns" style="justify-content: center;">
                      <button class="btn btn-success btn-sm" onclick="approveSubmission('${req.id}', 'نقد')" style="padding: 3px 7px; font-size: 0.75rem;">قبول نقد</button>
                      <button class="btn btn-secondary btn-sm" onclick="approveSubmission('${req.id}', 'دين')" style="padding: 3px 7px; font-size: 0.75rem;">قبول دين</button>
                      <button class="btn btn-danger btn-sm" onclick="rejectSubmission('${req.id}')" style="padding: 3px 7px; font-size: 0.75rem;">رفض</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  function renderSales(container) {
    const data = getData();
    let sales = data.sales || [];
    const agents = data.agents || [];
    // ... rest of original renderSales logic ...

    // Filter calculations
    if (salesFilter.seller !== 'all') {
      sales = sales.filter(s => s.seller === salesFilter.seller);
    }
    if (salesFilter.type !== 'all') {
      sales = sales.filter(s => {
        if (salesFilter.type === 'devices') return s.saleType === 'جهاز جديد' || s.subscriptionType === 'أجهزة جديدة';
        if (salesFilter.type === 'subscriptions') return s.saleType === 'تجديد اشتراك';
        return true;
      });
    }
    if (salesFilter.paymentStatus && salesFilter.paymentStatus !== 'all') {
      sales = sales.filter(s => {
        if (salesFilter.paymentStatus === 'نقد' || salesFilter.paymentStatus === 'تم التسديد') {
          return s.paymentMethod === 'نقد' || s.paymentStatus === 'نقد' || s.paymentStatus === 'تم التسديد';
        }
        if (salesFilter.paymentStatus === 'دين' || salesFilter.paymentStatus === 'عليه دين') {
          return s.paymentMethod === 'دين' || s.paymentStatus === 'دين' || s.paymentStatus === 'عليه دين';
        }
        return s.paymentStatus === salesFilter.paymentStatus || s.paymentMethod === salesFilter.paymentStatus;
      });
    }
    if (salesFilter.search) {
      const qRaw = salesFilter.search.trim();
      const qNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(qRaw) : qRaw.toLowerCase();
      const qDigits = qRaw.replace(/\D/g, '');

      sales = sales.filter(s => {
        const cNameNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(s.customerName || '') : (s.customerName || '').toLowerCase();
        const phoneClean = (s.customerPhone || '').replace(/\D/g, '');
        const devClean = (s.deviceNumber || '').replace(/\D/g, '');
        const devRaw = (s.deviceNumber || '').toLowerCase();
        const codeNorm = (s.code || '').toLowerCase();

        return cNameNorm.includes(qNorm) || 
               (qDigits && (phoneClean.includes(qDigits) || devClean.includes(qDigits))) ||
               devRaw.includes(qRaw.toLowerCase()) ||
               (s.customerPhone || '').includes(qRaw) ||
               codeNorm.includes(qRaw.toLowerCase());
      });
    }

    const totalCount = sales.length;
    const totalSum = sales.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const receivedSum = sales.reduce((sum, s) => sum + ((s.paymentMethod === 'نقد' || s.paymentStatus === 'نقد' || s.paymentStatus === 'تم التسديد') ? Number(s.price) || 0 : Number(s.agentPaid) || 0), 0);
    const remainingSum = Math.max(0, totalSum - receivedSum);
    const pendingSubmissions = data.agentSubmissions || [];

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">إدارة السجلات والفواتير</span>
            <h1>سجل المبيعات والاشتراكات</h1>
            <p class="subtitle">تسجيل المبيعات، تحديث الدفعات، وربط الواتساب مع المشتركين</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary btn-icon" onclick="exportSalesExcel()" title="تصدير Excel" aria-label="تصدير Excel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button class="btn btn-outline-danger btn-icon" onclick="confirmDeleteAllSales()" title="حذف جميع المبيعات" aria-label="حذف جميع المبيعات">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
            <button class="btn btn-primary" onclick="openSaleModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>تسجيل بيع جديد</span>
            </button>
          </div>
        </div>

        <!-- 4 Stats -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">عدد العمليات</span><div class="stat-icon">📄</div></div>
            <div class="stat-value-group"><span class="stat-value">${totalCount}</span><span class="stat-unit">فاتورة</span></div>
            <div class="stat-footer"><span>بحسب الفلتر الحالي</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي قيمة المبيعات</span><div class="stat-icon">💵</div></div>
            <div class="stat-value-group"><span class="stat-value">${formatNumber(totalSum)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>المبلغ الكلي المطلوب</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">المبالغ المستلمة</span><div class="stat-icon">✅</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--success);">${formatNumber(receivedSum)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>نقد ومسدد بالكامل</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">المتبقي للتحصيل</span><div class="stat-icon">⏳</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--danger);">${formatNumber(remainingSum)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>ديون جارية للمتابعة</span></div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="content-card">
          <div class="filters-bar">
            <div class="filter-chips">
              <span class="chip ${salesFilter.seller === 'all' ? 'active' : ''}" onclick="setSalesFilter('seller', 'all')">الكل</span>
              <span class="chip ${salesFilter.seller === 'المركز الرئيسي' ? 'active' : ''}" onclick="setSalesFilter('seller', 'المركز الرئيسي')">المركز الرئيسي</span>
              ${agents.map(a => `
                <span class="chip ${salesFilter.seller === a.name ? 'active' : ''}" onclick="setSalesFilter('seller', '${escapeHtml(a.name)}')">${escapeHtml(a.name)}</span>
              `).join('')}
            </div>

            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <div class="filter-chips">
                <span class="chip ${salesFilter.type === 'all' ? 'active' : ''}" onclick="setSalesFilter('type', 'all')">كافة العمليات</span>
                <span class="chip ${salesFilter.type === 'devices' ? 'active' : ''}" onclick="setSalesFilter('type', 'devices')">أجهزة</span>
                <span class="chip ${salesFilter.type === 'subscriptions' ? 'active' : ''}" onclick="setSalesFilter('type', 'subscriptions')">اشتراكات</span>
              </div>

              <div class="filter-chips">
                <span class="chip ${salesFilter.paymentStatus === 'all' || !salesFilter.paymentStatus ? 'active' : ''}" onclick="setSalesFilter('paymentStatus', 'all')">كافة حالات الدفع</span>
                <span class="chip ${salesFilter.paymentStatus === 'نقد' || salesFilter.paymentStatus === 'تم التسديد' ? 'active' : ''}" onclick="setSalesFilter('paymentStatus', 'نقد')">نقد (تم التسديد)</span>
                <span class="chip ${salesFilter.paymentStatus === 'دين' || salesFilter.paymentStatus === 'عليه دين' ? 'active' : ''}" onclick="setSalesFilter('paymentStatus', 'دين')">دين (غير مسدد)</span>
              </div>

              <div class="search-box" style="position: relative; display: flex; align-items: center;">
                <span class="search-icon">🔍</span>
                <input type="text" id="sales-search-input" placeholder="بحث بالاسم، الهاتف، الجهاز، الفاتورة..." value="${escapeHtml(salesFilter.search)}" oninput="handleSalesSearch(this.value)">
                ${salesFilter.search ? `<button type="button" onclick="handleSalesSearch('')" style="position: absolute; left: 10px; background: none; border: none; cursor: pointer; color: var(--muted); font-size: 0.9rem; padding: 2px 6px;" title="إلغاء البحث">✕</button>` : ''}
              </div>
            </div>
          </div>

          <!-- Sales Table -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الفاتورة / البائع</th>
                  <th>الزبون / الهاتف</th>
                  <th>الجهاز / نوع العملية</th>
                  <th>فترة الاشتراك</th>
                  <th>المبلغ والدفع</th>
                  <th style="text-align: center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${sales.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 40px;">لا توجد مبيعات مطابقة لمعايير البحث</td></tr>` : 
                  sales.map(s => {
                    const waPhone = normalizeIraqiPhone(s.customerPhone);
                    const waText = encodeURIComponent(window.formatWhatsAppMessage(s));
                    return `
                      <tr>
                        <td>
                          <strong style="color: var(--green); font-size: 0.85rem;">${escapeHtml(s.code)}</strong>
                          <div class="cell-subtitle">
                            <span class="badge badge-neutral" style="font-size: 0.68rem; padding: 1px 5px;">${escapeHtml(window.resolveAgentName ? window.resolveAgentName(s) : s.seller)}</span>
                          </div>
                        </td>
                        <td>
                          <strong class="cell-title">${escapeHtml(s.customerName)}</strong>
                          <div class="cell-subtitle" style="direction: ltr; text-align: right;">${escapeHtml(s.customerPhone || '-')}</div>
                        </td>
                        <td>
                          <div style="font-family: monospace; font-size: 0.84rem;">
                            <span style="cursor: pointer; color: var(--green); text-decoration: underline; font-weight: 700;" onclick="showDeviceBarcodeModal('${escapeHtml(s.deviceNumber || '')}')" title="انقر لعرض الباركود">${escapeHtml(s.deviceNumber || '-')}</span>
                          </div>
                          <div class="cell-subtitle">${escapeHtml(s.subscriptionType || s.saleType)}</div>
                        </td>
                        <td>
                          <div class="cell-date-range" style="direction: ltr;">
                            <span class="cell-date-from">بدء: ${escapeHtml(s.startDate || '-')}</span>
                            <span class="cell-date-to">انتهاء: ${escapeHtml(s.endDate || '-')}</span>
                          </div>
                        </td>
                        <td>
                          <strong class="cell-title">${formatIQD(s.price)}</strong>
                          <div style="margin-top: 2px;">
                            <span class="badge ${(s.paymentMethod === 'نقد' || s.paymentStatus === 'نقد' || s.paymentStatus === 'تم التسديد') ? 'badge-success' : 'badge-danger'}">
                              ${(s.paymentMethod === 'نقد' || s.paymentStatus === 'نقد') ? 'نقد' : ((s.paymentMethod === 'دين' || s.paymentStatus === 'دين') ? 'دين' : escapeHtml(s.paymentStatus || 'عليه دين'))}
                            </span>
                          </div>
                        </td>
                        <td style="text-align: center;">
                          <div class="action-btns" style="justify-content: center;">
                            ${waPhone ? `
                              <a href="https://wa.me/${waPhone}?text=${waText}" target="_blank" class="icon-btn btn-whatsapp" title="مراسلة عبر واتساب">
                                💬
                              </a>
                            ` : ''}
                            <button class="icon-btn" onclick="openSaleModal('${s.id}')" title="تعديل الفاتورة">✏️</button>
                            <button class="icon-btn btn-del" onclick="deleteSale('${s.id}')" title="حذف الفاتورة">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  function renderPendingRequests(container) {
    const data = getData();
    const pendingSubmissions = data.agentSubmissions || [];

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">إدارة طلبات الوكلاء</span>
            <h1>الطلبات المعلقة (طلبات التجديد الواردة من الوكلاء)</h1>
            <p class="subtitle">مراجعة والاعتماد الفوري لطلبات تجديد الاشتراكات الواردة من كافة الوكلاء باستخدام بطاقات المعالجة</p>
          </div>
          <div class="header-actions">
            <span class="badge" style="background: var(--warning-bg); color: var(--warning); border: 1px solid var(--warning-border); padding: 8px 16px; font-weight: bold; font-size: 0.95rem;">
              <span class="pulse-badge"></span> الطلبات المعلقة: ${pendingSubmissions.length}
            </span>
          </div>
        </div>

        <div class="content-card" style="border: 2px solid var(--warning); background: var(--warning-bg); margin-top: 16px;">
          <div class="card-header-bar" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <h3 style="color: var(--warning); display: flex; align-items: center; gap: 8px; margin: 0; font-size: 1.05rem;">
              <span class="pulse-badge"></span>
              <span>قائمة طلبات التجديد الواردة من الوكلاء (${pendingSubmissions.length})</span>
            </h3>
            ${pendingSubmissions.length > 0 ? `<span class="badge" style="background: var(--warning); color: #fff; font-weight: bold; font-size: 0.78rem;">تتطلب اعتماد الأدمن</span>` : ''}
          </div>
          ${pendingSubmissions.length === 0 ? `
            <div style="text-align: center; color: var(--muted); padding: 50px 20px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">✅</div>
              <h3 style="color: var(--text-main); margin-bottom: 6px;">لا توجد طلبات معلقة حالياً</h3>
              <p style="font-size: 0.9rem;">جميع طلبات التجديد الواردة من الوكلاء تم اعتمادها أو رفضها بنجاح.</p>
            </div>
          ` : `
            <div class="pending-cards-grid">
              ${pendingSubmissions.map(req => {
                const agentNameStr = escapeHtml(window.resolveAgentName ? window.resolveAgentName(req) : (req.agentName || req.seller));
                return `
                  <div class="pending-sub-card">
                    <div class="pending-card-header">
                      <div class="pending-agent-info">
                        <span class="pending-agent-icon">👤</span>
                        <div class="pending-agent-details">
                          <span class="pending-agent-label">الوكيل المعتمد</span>
                          <strong class="pending-agent-name" title="${agentNameStr}">${agentNameStr}</strong>
                        </div>
                      </div>
                      <span class="pending-status-badge">
                        <span class="pulse-badge"></span> معلق
                      </span>
                    </div>

                    <div class="pending-card-body">
                      <!-- Row 1: Customer Name and Phone -->
                      <div class="pending-info-row">
                        <div class="pending-info-cell" style="flex: 1; min-width: 0;">
                          <span class="pending-info-label">الزبون:</span>
                          <strong class="pending-info-val" title="${escapeHtml(req.customerName)}">${escapeHtml(req.customerName)}</strong>
                        </div>
                        ${req.customerPhone ? `
                          <div class="pending-info-cell" style="direction: ltr; flex-shrink: 0;">
                            <span class="pending-phone-val">${escapeHtml(req.customerPhone)}</span>
                          </div>
                        ` : ''}
                      </div>

                      <!-- Row 2: Device and Type -->
                      <div class="pending-info-row">
                        <div class="pending-info-cell">
                          <span class="pending-info-label">الجهاز:</span>
                          <span class="pending-device-pill" onclick="showDeviceBarcodeModal('${escapeHtml(req.deviceNumber)}')" title="انقر لعرض الباركود وQR Code">
                            📱 ${escapeHtml(req.deviceNumber)}
                          </span>
                        </div>
                        <div class="pending-info-cell">
                          <span class="pending-type-badge">${escapeHtml(req.subscriptionType || 'تجديد')}</span>
                        </div>
                      </div>

                      <!-- Row 3: Period and Price -->
                      <div class="pending-info-row highlight-row">
                        <div class="pending-info-cell">
                          <span class="pending-info-label">الفترة:</span>
                          <span class="pending-date-val">${escapeHtml(req.startDate)} ~ ${escapeHtml(req.endDate)}</span>
                        </div>
                        <div class="pending-info-cell">
                          <strong class="pending-price-val">${formatIQD(req.price)}</strong>
                        </div>
                      </div>
                    </div>

                    <div class="pending-card-actions">
                      <button type="button" class="btn btn-success btn-sm btn-pending-action" onclick="approveSubmission('${req.id}', 'نقد')" title="اعتماد كدفع نقدي">
                        <span>✓</span> <span>قبول نقد</span>
                      </button>
                      <button type="button" class="btn btn-secondary btn-sm btn-pending-action" onclick="approveSubmission('${req.id}', 'دين')" title="اعتماد كدين على الوكيل">
                        <span>📝</span> <span>قبول دين</span>
                      </button>
                      <button type="button" class="btn btn-danger btn-sm btn-pending-action" onclick="rejectSubmission('${req.id}')" title="رفض الطلب">
                        <span>✕</span> <span>رفض</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  window.setSalesFilter = function(key, val) {
    salesFilter[key] = val;
    renderSales(document.getElementById('main-content'));
  };

  window.handleSalesSearch = function(val) {
    salesFilter.search = val;
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      renderSales(mainEl);
      const searchBox = document.getElementById('sales-search-input');
      if (searchBox) {
        searchBox.focus();
        const len = searchBox.value.length;
        searchBox.setSelectionRange(len, len);
      }
    }
  };

  window.exportSalesExcel = function() {
    const data = getData();
    const sales = data.sales || [];
    const exportRows = sales.map(s => ({
      'رمز الفاتورة': s.code,
      'اسم الزبون': s.customerName,
      'رقم الهاتف': s.customerPhone,
      'البائع': s.seller,
      'رقم الجهاز': s.deviceNumber,
      'نوع العملية': s.subscriptionType || s.saleType,
      'تاريخ البدء': s.startDate,
      'تاريخ الانتهاء': s.endDate,
      'السعر (د.ع)': s.price,
      'حالة الدفع': s.paymentStatus
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المبيعات");
    XLSX.writeFile(wb, `مبيعات_الساري_${new Date().toISOString().substring(0,10)}.xlsx`);
    showToast('تم تصدير ملف المبيعات بنجاح', 'success');
  };

  window.confirmDeleteAllSales = function() {
    showConfirmDialog('حذف جميع المبيعات', 'هل أنت متأكد تماماً من رغبتك في حذف كافة سجلات المبيعات والديون المرتبطة؟ هذا الإجراء لا يمكن التراجع عنه!', async () => {
      await getEngine().clearCollection('sales');
      await getEngine().clearCollection('debts');
      showToast('تم حذف كافة المبيعات والديون بنجاح', 'success');
    });
  };

  window.deleteSale = async function(id) {
    showConfirmDialog('حذف الفاتورة', 'هل تريد حذف هذه الفاتورة؟', async () => {
      const data = getData();
      const saleToDelete = (data.sales || []).find(s => s.id === id);
      const debtsToDelete = (data.debts || []).filter(d => d.saleId === id || (saleToDelete && d.saleCode === saleToDelete.code));

      await getEngine().deleteItem('sales', id);
      for (const d of debtsToDelete) {
        await getEngine().deleteItem('debts', d.id);
      }
      showToast('تم حذف الفاتورة وسجلات الديون المرتبطة بنجاح', 'success');
    });
  };

  window.approveSubmission = function(subId, paymentMethod) {
    const isCash = paymentMethod === 'نقد';
    const title = isCash ? 'قبول الطلب كنقد' : 'قبول الطلب كدين';
    const message = `هل أنت متأكد من قبول هذا الطلب وترحيله إلى المبيعات وإضافته لقائمة المشتركين والزبائن للوكيل ${isCash ? 'كنقد' : 'كدين'}؟`;

    showConfirmDialog(title, message, async () => {
      try {
        const data = getData();
        const subs = data.agentSubmissions || [];
        const req = subs.find(s => s.id === subId);
        if (!req) return;

        const agentName = window.resolveAgentName ? window.resolveAgentName(req) : (req.agentName || req.seller || 'وكيل');
        const isNewDevice = req.saleType === 'جهاز جديد' || req.subscriptionType === 'جهاز جديد';
        const startDate = req.startDate || new Date().toISOString().substring(0, 10);
        
        let endDate = req.endDate;
        if (isNewDevice || !endDate || endDate === '-') {
          if (typeof window.addMonthsToDate === 'function') {
            endDate = window.addMonthsToDate(startDate, 1);
          } else {
            const parts = startDate.split('-').map(Number);
            const target = new Date(parts[0], parts[1], parts[2]);
            endDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
          }
        }

        // 1. Create completed sale
        const newSale = {
          id: 'sale-' + Date.now(),
          code: generateSaleCode(),
          customerName: req.customerName,
          customerPhone: req.customerPhone || '',
          seller: agentName,
          agentName: agentName,
          agentCode: req.agentCode || '',
          saleType: req.saleType || (isNewDevice ? 'جهاز جديد' : 'تجديد اشتراك'),
          deviceNumber: req.deviceNumber,
          subscriptionType: req.subscriptionType || (isNewDevice ? 'جهاز جديد' : 'اشتراك شهر واحد'),
          startDate: startDate,
          endDate: endDate,
          price: Number(req.price) || 0,
          paymentStatus: isCash ? 'نقد' : 'دين',
          paymentMethod: isCash ? 'نقد' : 'دين',
          agentPaid: isCash ? (Number(req.price) || 0) : 0,
          approvalStatus: 'معتمدة',
          approvedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        const updatedSales = [newSale, ...(data.sales || [])];
        const updatedSubs = subs.filter(s => s.id !== subId);

        // 2. If credit (دين), register debt
        let updatedDebts = data.debts || [];
        if (!isCash) {
          const debtDueDate = endDate;
          const newDebt = {
            id: 'debt-' + Date.now(),
            saleId: newSale.id,
            saleCode: newSale.code,
            customerName: req.customerName,
            debtor: 'الوكيل والزبون',
            seller: agentName,
            agentName: agentName,
            agentCode: req.agentCode || '',
            customerPhone: req.customerPhone || '',
            deviceNumber: req.deviceNumber,
            totalAmount: Number(req.price) || 0,
            paidAmount: 0,
            remainingAmount: Number(req.price) || 0,
            dueDate: debtDueDate,
            notes: `دين على الوكيل (${agentName}) والزبون (${req.customerName}) - ${req.subscriptionType}`,
            status: 'غير مسدد',
            createdAt: new Date().toISOString().substring(0, 10)
          };
          updatedDebts = [newDebt, ...updatedDebts];
        }

        // 3. Update subscribers table (Add or update subscriber and assign to agent)
        let updatedSubscribers = data.subscribers || [];
        const subIdx = updatedSubscribers.findIndex(s => s.deviceNumber === req.deviceNumber);
        if (subIdx >= 0) {
          updatedSubscribers[subIdx].name = req.customerName;
          if (req.customerPhone) updatedSubscribers[subIdx].phone = req.customerPhone;
          updatedSubscribers[subIdx].expiryDate = endDate;
          updatedSubscribers[subIdx].status = 'فعال';
          updatedSubscribers[subIdx].owner = agentName;
          updatedSubscribers[subIdx].agentName = agentName;
          if (!updatedSubscribers[subIdx].joiningDate) {
            updatedSubscribers[subIdx].joiningDate = startDate;
          }
        } else {
          updatedSubscribers.push({
            id: 'sub-' + Date.now(),
            name: req.customerName,
            phone: req.customerPhone || '',
            deviceNumber: req.deviceNumber,
            owner: agentName,
            agentName: agentName,
            joiningDate: startDate,
            activationDate: startDate,
            expiryDate: endDate,
            status: 'فعال'
          });
        }

        // Use batch commit for all updates
        await getEngine().batchCommitData([
          { collectionName: 'sales', items: updatedSales },
          { collectionName: 'subscribers', items: updatedSubscribers },
          ...(isCash ? [] : [{ collectionName: 'debts', items: updatedDebts }]),
          { collectionName: 'agentSubmissions', items: updatedSubs }
        ]);
        
        if (typeof getEngine().deleteFirestoreSubmission === 'function') { await getEngine().deleteFirestoreSubmission(req.submittedBy, req.id); } else if (typeof getEngine().deleteItem === 'function') { await getEngine().deleteItem('agentSubmissions', req.id); }

        showToast(`تم قبول الطلب بنجاح وإضافته لقائمة المشتركين والزبائن للوكيل (${agentName})`, 'success');
        navigateTo(currentPage);
      } catch (err) {
        console.error(err);
        showToast('حدث خطأ أثناء المعالجة', 'error');
      }
    });
  };

  window.rejectSubmission = async function(subId) {
    showConfirmDialog('رفض الطلب', 'هل أنت متأكد من رفض هذا الطلب؟', async () => {
      const data = getData();
      const subs = data.agentSubmissions || [];
      const req = subs.find(s => s.id === subId);
      if (req && typeof getEngine().deleteFirestoreSubmission === 'function') {
        await getEngine().deleteFirestoreSubmission(req.submittedBy, req.id);
      }
      const updated = subs.filter(s => s.id !== subId);
      await getEngine().commitData('agentSubmissions', updated);
      showToast('تم رفض الطلب وحذفه', 'info');
      navigateTo(currentPage);
    });
  };

  // --- Sale Modal (Create / Edit) ---
  window.openSaleModal = function(saleId) {
    const data = getData();
    const agents = data.agents || [];
    const pricing = data.pricing || DEFAULT_PRICING;
    const existing = saleId ? (data.sales || []).find(s => s.id === saleId) : null;

    const modalContainer = document.getElementById('modal-container');
    const today = new Date().toISOString().substring(0, 10);
    const endDef = new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

    modalContainer.innerHTML = `
      <div class="modal-overlay active" id="sale-modal" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${existing ? 'تعديل الفاتورة' : 'تسجيل بيع جديد'}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="sale-form">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group" style="position: relative;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <label style="margin: 0;">اسم الزبون *</label>
                    <span id="sf-name-badge" style="font-size: 0.78rem; color: var(--muted); font-weight: normal;">(بحث ذكي وتكملة تلقائية ⚡)</span>
                  </div>
                  <div class="autocomplete-container">
                    <input type="text" id="sf-name" required autocomplete="off" placeholder="اكتب اسم الزبون للبحث التلقائي وجلب البيانات..." value="${escapeHtml(existing?.customerName || '')}" oninput="onAdminCustomerNameInput(this.value)" onfocus="onAdminCustomerNameFocus()">
                    <div id="sf-name-suggestions" class="autocomplete-suggestions" style="display: none;"></div>
                  </div>
                </div>
                <div class="form-group">
                  <label>رقم الهاتف</label>
                  <input type="text" id="sf-phone" placeholder="0770xxxxxxx" value="${escapeHtml(existing?.customerPhone || '')}">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>جهة البيع (البائع) *</label>
                  <select id="sf-seller" onchange="recalculateSalePrice()">
                    <option value="المركز الرئيسي" ${!existing || existing.seller === 'المركز الرئيسي' ? 'selected' : ''}>المركز الرئيسي</option>
                    ${agents.map(a => `
                      <option value="${escapeHtml(a.name)}" ${existing?.seller === a.name ? 'selected' : ''}>وكيل: ${escapeHtml(a.name)}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>نوع البيع *</label>
                  <select id="sf-type" onchange="handleSaleTypeChange()">
                    <option value="جهاز جديد" ${existing?.saleType === 'جهاز جديد' ? 'selected' : ''}>بيع جهاز جديد</option>
                    <option value="تجديد اشتراك" ${existing?.saleType === 'تجديد اشتراك' || !existing ? 'selected' : ''}>تجديد اشتراك</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>رقم الجهاز / الباركود</label>
                <div style="display: flex; gap: 6px;">
                  <input type="text" id="sf-device" placeholder="16 رقم..." value="${escapeHtml(existing?.deviceNumber || '')}" oninput="onAdminDeviceInput(this.value)">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="openScannerModal((code) => { document.getElementById('sf-device').value = code; onAdminDeviceInput(code); })">📷 مسح</button>
                </div>
              </div>

              <!-- حقول الاشتراك: يتم إخفاؤها تلقائياً عند اختيار بيع جهاز جديد -->
              <div id="sf-subscription-section" style="${existing?.saleType === 'جهاز جديد' ? 'display: none;' : ''}">
                <div class="form-group">
                  <label>فترة الاشتراك *</label>
                  <select id="sf-sub" onchange="recalculateSalePrice()">
                    <option value="اشتراك شهر واحد" ${existing?.subscriptionType === 'اشتراك شهر واحد' ? 'selected' : ''}>اشتراك شهر واحد</option>
                    <option value="اشتراك شهرين" ${existing?.subscriptionType === 'اشتراك شهرين' ? 'selected' : ''}>اشتراك شهرين</option>
                    <option value="اشتراك 3 أشهر" ${existing?.subscriptionType === 'اشتراك 3 أشهر' ? 'selected' : ''}>اشتراك 3 أشهر</option>
                  </select>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>تاريخ البدء (تلقائي مقفل) *</label>
                    <input type="date" id="sf-start" value="${existing?.startDate || today}" readonly style="background: var(--surface-alt); cursor: not-allowed; font-weight: 600;" title="تاريخ البدء محدد تلقائياً من تاريخ تسجيل الفاتورة">
                  </div>
                  <div class="form-group">
                    <label>تاريخ الانتهاء (تلقائي مقفل) *</label>
                    <input type="date" id="sf-end" value="${existing?.endDate || endDef}" readonly style="background: var(--surface-alt); cursor: not-allowed; font-weight: 600;" title="تاريخ الانتهاء محدد تلقائياً حسب فترة الاشتراك">
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>السعر (د.ع) (تلقائي مقفل) *</label>
                  <input type="text" id="sf-price" required value="${formatNumber(existing?.price || 50000)}" readonly style="background: var(--surface-alt); cursor: not-allowed; font-weight: 800; color: var(--green);" title="السعر محدد تلقائياً ولا يمكن تعديله">
                  <span class="form-help">يتم احتساب السعر والتواريخ تلقائياً وبشكل مقفل حسب فترة الاشتراك</span>
                </div>
                <div class="form-group">
                  <label>طريقة الدفع *</label>
                  <select id="sf-payment">
                    <option value="نقد" ${existing?.paymentMethod === 'نقد' || !existing ? 'selected' : ''}>نقد (تم التسديد)</option>
                    <option value="دين" ${existing?.paymentMethod === 'دين' ? 'selected' : ''}>دين (تسجيل دين)</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary">${existing ? 'حفظ التعديلات' : 'تسجيل الفاتورة'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    window.onAdminCustomerNameInput = function(val) {
      const container = document.getElementById('sf-name-suggestions');
      const badgeEl = document.getElementById('sf-name-badge');
      if (!container) return;

      const cleanVal = (val || '').trim();
      if (!cleanVal) {
        container.style.display = 'none';
        container.innerHTML = '';
        if (badgeEl) badgeEl.innerHTML = '(بحث ذكي وتكملة تلقائية ⚡)';
        return;
      }

      const curData = getData();
      const subscribers = curData.subscribers || [];
      const normQuery = window.normalizeSearchQuery ? window.normalizeSearchQuery(cleanVal) : cleanVal.toLowerCase();
      const digitsQuery = cleanVal.replace(/\D/g, '');

      const matched = subscribers.filter(s => {
        const sNameNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(s.name || '') : (s.name || '').toLowerCase();
        const sPhoneClean = (s.phone || '').replace(/\D/g, '');
        const sDevClean = (s.deviceNumber || '').replace(/\D/g, '');
        return sNameNorm.includes(normQuery) || 
               (digitsQuery && (sPhoneClean.includes(digitsQuery) || sDevClean.includes(digitsQuery)));
      }).slice(0, 8);

      if (matched.length === 0) {
        container.innerHTML = `
          <div class="autocomplete-hint">
            <span>✨ لا يوجد مشترك مسجل بهذا الاسم — سيتم تسجيله كزبون جديد</span>
          </div>
        `;
        container.style.display = 'block';
        return;
      }

      container.innerHTML = matched.map(sub => `
        <div class="autocomplete-item" onclick="selectSubscriberForSale('${escapeHtml(sub.id)}')">
          <div class="autocomplete-item-main">
            <div class="autocomplete-item-name">👤 ${escapeHtml(sub.name)}</div>
            <div class="autocomplete-item-details">
              <span>📞 ${escapeHtml(sub.phone || 'بدون هاتف')}</span>
              <span>📱 ${escapeHtml(sub.deviceNumber)}</span>
            </div>
          </div>
          <div class="autocomplete-item-meta">
            <span class="badge ${sub.status === 'فعال' ? 'badge-success' : 'badge-danger'}" style="font-size: 0.72rem; padding: 2px 6px;">
              ${escapeHtml(sub.status || 'غير فعال')}
            </span>
            <span style="font-size: 0.74rem; color: var(--muted);">${escapeHtml(window.resolveAgentName ? window.resolveAgentName(sub) : sub.owner)}</span>
          </div>
        </div>
      `).join('');
      container.style.display = 'block';
    };

    window.onAdminCustomerNameFocus = function() {
      const input = document.getElementById('sf-name');
      if (input && input.value.trim().length >= 1) {
        window.onAdminCustomerNameInput(input.value);
      }
    };

    window.selectSubscriberForSale = function(subId) {
      const curData = getData();
      const sub = (curData.subscribers || []).find(s => s.id === subId);
      if (!sub) return;

      const nameInput = document.getElementById('sf-name');
      const phoneInput = document.getElementById('sf-phone');
      const deviceInput = document.getElementById('sf-device');
      const sellerSelect = document.getElementById('sf-seller');
      const badgeEl = document.getElementById('sf-name-badge');

      if (nameInput) nameInput.value = sub.name;
      if (phoneInput) phoneInput.value = sub.phone || '';
      if (deviceInput) {
        deviceInput.value = sub.deviceNumber || '';
        if (typeof window.onAdminDeviceInput === 'function') {
          window.onAdminDeviceInput(sub.deviceNumber);
        }
      }
      if (sellerSelect && sub.owner) {
        for (let i = 0; i < sellerSelect.options.length; i++) {
          if (sellerSelect.options[i].value === sub.owner) {
            sellerSelect.selectedIndex = i;
            break;
          }
        }
      }

      if (badgeEl) {
        badgeEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✅ تم جلب البيانات تلقائياً (${escapeHtml(sub.deviceNumber)})</span>`;
      }

      const container = document.getElementById('sf-name-suggestions');
      if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
      }
    };

    // Close suggestions dropdown when clicking outside
    document.addEventListener('click', function(evt) {
      const container = document.getElementById('sf-name-suggestions');
      const input = document.getElementById('sf-name');
      if (container && input && !container.contains(evt.target) && evt.target !== input) {
        container.style.display = 'none';
      }
    });

    window.onAdminDeviceInput = function(val) {
      const cleanVal = (val || '').trim();
      if (!cleanVal || cleanVal.length < 5) return;
      const curData = getData();
      const sub = (curData.subscribers || []).find(s => s.deviceNumber === cleanVal);
      const sale = (curData.sales || []).find(s => s.deviceNumber === cleanVal);
      const nameInput = document.getElementById('sf-name');
      const phoneInput = document.getElementById('sf-phone');
      const badgeEl = document.getElementById('sf-name-badge');

      if (sub) {
        if (nameInput && !nameInput.value) {
          nameInput.value = sub.name || '';
        }
        if (phoneInput && !phoneInput.value) {
          phoneInput.value = sub.phone || '';
        }
        if (badgeEl) {
          badgeEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✅ مطابق للمشترك: ${escapeHtml(sub.name)}</span>`;
        }
      } else if (sale) {
        if (nameInput && !nameInput.value) {
          nameInput.value = sale.customerName || '';
        }
        if (phoneInput && !phoneInput.value) {
          phoneInput.value = sale.customerPhone || '';
        }
        if (badgeEl) {
          badgeEl.innerHTML = `<span style="color: var(--success); font-weight: 700;">✅ مطابق لفاتورة سابقة: ${escapeHtml(sale.customerName)}</span>`;
        }
      }
    };

    window.handleSaleTypeChange = function() {
      const type = document.getElementById('sf-type')?.value;
      const subSec = document.getElementById('sf-subscription-section');
      if (subSec) {
        if (type === 'جهاز جديد') {
          subSec.style.display = 'none';
        } else {
          subSec.style.display = 'block';
        }
      }
      recalculateSalePrice();
    };

    handleSaleTypeChange();

    document.getElementById('sale-form').onsubmit = async (e) => {
      e.preventDefault();
      const customerName = document.getElementById('sf-name').value.trim();
      const customerPhone = document.getElementById('sf-phone').value.trim();
      const seller = document.getElementById('sf-seller').value;
      const saleType = document.getElementById('sf-type').value;
      const isNewDevice = saleType === 'جهاز جديد';
      const deviceNumber = document.getElementById('sf-device').value.trim();
      const subscriptionType = isNewDevice ? 'جهاز جديد' : (document.getElementById('sf-sub')?.value || 'اشتراك شهر واحد');
      const startDate = isNewDevice ? today : (document.getElementById('sf-start')?.value || today);
      const endDate = isNewDevice ? '-' : (document.getElementById('sf-end')?.value || endDef);
      const price = parseNumber(document.getElementById('sf-price').value);
      const paymentMethod = document.getElementById('sf-payment').value;
      const paymentStatus = paymentMethod === 'نقد' ? 'تم التسديد' : 'عليه دين';

      const allSales = data.sales || [];

      if (existing) {
        existing.customerName = customerName;
        existing.customerPhone = customerPhone;
        existing.seller = seller;
        existing.saleType = saleType;
        existing.deviceNumber = deviceNumber;
        existing.subscriptionType = subscriptionType;
        existing.startDate = startDate;
        existing.endDate = endDate;
        existing.price = price;
        existing.paymentStatus = paymentStatus;
        existing.paymentMethod = paymentMethod;

        let debts = data.debts || [];
        const debtIdx = debts.findIndex(d => d.saleId === existing.id || d.saleCode === existing.code);
        if (paymentMethod === 'دين') {
          if (debtIdx >= 0) {
            debts[debtIdx].totalAmount = price;
            debts[debtIdx].remainingAmount = Math.max(0, price - (debts[debtIdx].paidAmount || 0));
            debts[debtIdx].customerName = customerName;
            debts[debtIdx].seller = seller;
          } else {
            let debtDueDate = endDate;
            if (isNewDevice || !debtDueDate || debtDueDate === '-') {
              const parts = (startDate || today).split('-');
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10);
              const eom = new Date(y, m, 0);
              debtDueDate = `${eom.getFullYear()}-${String(eom.getMonth() + 1).padStart(2, '0')}-${String(eom.getDate()).padStart(2, '0')}`;
            }
            const newDebt = {
              id: 'debt-' + Date.now(),
              saleId: existing.id,
              saleCode: existing.code,
              customerName,
              seller,
              totalAmount: price,
              paidAmount: 0,
              remainingAmount: price,
              dueDate: debtDueDate,
              notes: `فاتورة بيع معدلة بالدين`,
              createdAt: startDate
            };
            debts = [newDebt, ...debts];
          }
        } else {
          if (debtIdx >= 0) {
            debts.splice(debtIdx, 1);
          }
          existing.agentPaid = price;
        }

        await getEngine().commitData('sales', allSales);
        await getEngine().commitData('debts', debts);
        showToast('تم تحديث الفاتورة بنجاح', 'success');
      } else {
        const saleCode = generateSaleCode();
        const newSale = {
          id: 'sale-' + Date.now(),
          code: saleCode,
          customerName,
          customerPhone,
          seller,
          saleType,
          deviceNumber,
          subscriptionType,
          startDate,
          endDate,
          price,
          paymentStatus,
          paymentMethod,
          agentPaid: paymentMethod === 'نقد' ? price : 0,
          createdAt: new Date().toISOString()
        };

        const updatedSales = [newSale, ...allSales];

        // Automatic debt creation for credit sale
        let debts = data.debts || [];
        if (paymentMethod === 'دين') {
          let debtDueDate = endDate;
          if (isNewDevice || !debtDueDate || debtDueDate === '-') {
            const parts = (startDate || today).split('-');
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const eom = new Date(y, m, 0);
            debtDueDate = `${eom.getFullYear()}-${String(eom.getMonth() + 1).padStart(2, '0')}-${String(eom.getDate()).padStart(2, '0')}`;
          }
          const newDebt = {
            id: 'debt-' + Date.now(),
            saleId: newSale.id,
            saleCode: saleCode,
            customerName,
            seller,
            totalAmount: price,
            paidAmount: 0,
            remainingAmount: price,
            dueDate: debtDueDate,
            notes: `فاتورة بيع بالدين (${isNewDevice ? 'جهاز جديد' : subscriptionType})`,
            createdAt: startDate
          };
          debts = [newDebt, ...debts];
          await getEngine().commitData('debts', debts);
        }

        // Auto update / register subscriber
        if (deviceNumber) {
          const subs = data.subscribers || [];
          const idx = subs.findIndex(s => s.deviceNumber === deviceNumber);
          const subExpiry = isNewDevice ? '-' : endDate;
          if (idx >= 0) {
            subs[idx].name = customerName;
            subs[idx].phone = customerPhone || subs[idx].phone;
            if (!isNewDevice) subs[idx].expiryDate = subExpiry;
            subs[idx].status = 'فعال';
            if (!subs[idx].joiningDate) subs[idx].joiningDate = startDate || today;
          } else {
            subs.push({
              id: 'sub-' + Date.now(),
              name: customerName,
              phone: customerPhone,
              deviceNumber: deviceNumber,
              owner: seller,
              joiningDate: startDate || today,
              activationDate: startDate,
              expiryDate: subExpiry,
              status: 'فعال'
            });
          }
          await getEngine().commitData('subscribers', subs);
        }

        await getEngine().commitData('sales', updatedSales);
        showToast('تم تسجيل الفاتورة بنجاح', 'success');
      }

      closeModal();
    };
  };

  window.addMonthsToDate = function(dateStr, months) {
    if (!dateStr) return '';
    const parts = dateStr.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return '';
    const [year, month, day] = parts;
    const target = new Date(year, month - 1 + months, day);
    if (target.getDate() !== day) {
      target.setDate(0);
    }
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  window.recalcEndDate = function() {
    const startInput = document.getElementById('sf-start');
    const subType = document.getElementById('sf-sub')?.value;
    const today = new Date().toISOString().substring(0, 10);
    if (startInput && !startInput.value) {
      startInput.value = today;
    }
    const startVal = startInput?.value || today;

    let months = 1;
    if (subType === 'اشتراك شهر واحد') months = 1;
    else if (subType === 'اشتراك شهرين') months = 2;
    else if (subType === 'اشتراك 3 أشهر') months = 3;

    const endVal = window.addMonthsToDate(startVal, months);
    const endInput = document.getElementById('sf-end');
    if (endInput) {
      endInput.value = endVal;
    }
  };

  window.recalculateSalePrice = function() {
    const seller = document.getElementById('sf-seller')?.value;
    const saleType = document.getElementById('sf-type')?.value;
    const subType = document.getElementById('sf-sub')?.value;
    const priceInput = document.getElementById('sf-price');
    if (!priceInput) return;

    const group = window.getAgentPricing ? window.getAgentPricing(seller) : (DEFAULT_PRICING.headquarters);

    let calculated = 50000;
    if (saleType === 'جهاز جديد') {
      calculated = group.device || 50000;
    } else {
      if (subType === 'اشتراك شهر واحد') calculated = group.sub1 || 25000;
      else if (subType === 'اشتراك شهرين') calculated = group.sub2 || 50000;
      else if (subType === 'اشتراك 3 أشهر') calculated = group.sub3 || 75000;
    }

    priceInput.value = formatNumber(calculated);
    window.recalcEndDate();
  };

  window.showConfirmModal = function(title, message, onConfirm, confirmText = 'تأكيد', cancelText = 'إلغاء', isDanger = true) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active" style="z-index: 9999;" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" style="max-width: 440px; text-align: right; direction: rtl;" onclick="event.stopPropagation()">
          <div class="modal-header" style="border-bottom: 1px solid var(--line); padding-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.5rem;">${isDanger ? '⚠️' : 'ℹ️'}</span>
              <h3 style="margin: 0; font-size: 1.15rem; color: var(--text);">${escapeHtml(title)}</h3>
            </div>
            <button type="button" class="modal-close" onclick="closeModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--muted);">✕</button>
          </div>
          <div class="modal-body" style="padding: 20px 0; color: var(--text-sub); font-size: 0.95rem; line-height: 1.6; white-space: pre-line;">
            ${escapeHtml(message)}
          </div>
          <div class="modal-footer" style="border-top: 1px solid var(--line); padding-top: 14px; display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="min-width: 90px;">${escapeHtml(cancelText)}</button>
            <button type="button" id="custom-confirm-btn" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" style="min-width: 100px;">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('custom-confirm-btn').onclick = async () => {
      window.closeModal();
      if (typeof onConfirm === 'function') {
        await onConfirm();
      }
    };
  };

  window.closeModal = function() {
    const container = document.getElementById('modal-container');
    if (container) {
      container.innerHTML = '';
    }
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(el => el.remove());
    document.body.classList.remove('modal-open');
  };

  // Global Escape key listener to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeModal();
    }
  });

  // Run initialization on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();


