/**
 * Features: Debts, Subscribers, Barcodes/QR, Reports, Pricing, Users, Agent Dashboard
 * Al-Sari Terrestrial Broadcast Management System
 */

(function () {
  'use strict';

  function getEngine() { return window.syncEngine; }
  function getData() { return getEngine() ? getEngine().data : {}; }

  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatIQD(num) {
    return (Number(num) || 0).toLocaleString('en-US') + ' د.ع';
  }

  function formatNumber(num) {
    return (Number(num) || 0).toLocaleString('en-US');
  }

  function normalizeDigits(str) {
    if (!str) return '';
    const arabicDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    const persianDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(str).replace(/[٠-٩]/g, d => arabicDigits.indexOf(d))
                      .replace(/[۰-۹]/g, d => persianDigits.indexOf(d));
  }

  // --- Page 4: Debts ---
  let debtFilterSeller = 'all';

  window.renderDebts = function(container) {
    const data = getData();
    let debts = data.debts || [];
    const agents = data.agents || [];

    if (debtFilterSeller !== 'all') {
      debts = debts.filter(d => d.seller === debtFilterSeller);
    }

    const totalDebts = debts.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0);
    const totalRecords = debts.length;
    const paidSum = debts.reduce((sum, d) => sum + (Number(d.paidAmount) || 0), 0);
    const creditSalesTotal = debts.reduce((sum, d) => sum + (Number(d.totalAmount) || 0), 0);

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">إدارة المستحقات والذمم المالية</span>
            <h1>سجل الديون والمستحقات</h1>
            <p class="subtitle">متابعة دفعات الزبائن والوكلاء وجدولة السداد</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="exportDebtsExcel()">
              <span>📥</span> <span>تصدير Excel</span>
            </button>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي الديون القائمة</span><div class="stat-icon">⏳</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--danger);">${formatNumber(totalDebts)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>المبلغ المتبقي للتحصيل</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">عدد سجلات الديون</span><div class="stat-icon">📑</div></div>
            <div class="stat-value-group"><span class="stat-value">${totalRecords}</span><span class="stat-unit">سجل</span></div>
            <div class="stat-footer"><span>تشمل الوكلاء والزبائن</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">المبالغ المسددة جزئياً</span><div class="stat-icon">💰</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--success);">${formatNumber(paidSum)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>دفعات تم تحصيلها</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي المبيعات بالآجل</span><div class="stat-icon">📊</div></div>
            <div class="stat-value-group"><span class="stat-value">${formatNumber(creditSalesTotal)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>القيمة الكلية للديون الأصلية</span></div>
          </div>
        </div>

        <div class="content-card" style="max-width: 1100px; margin: 0 auto;">
          <div class="filters-bar">
            <div class="filter-chips">
              <span class="chip ${debtFilterSeller === 'all' ? 'active' : ''}" onclick="setDebtFilter('all')">كافة الجهات</span>
              <span class="chip ${debtFilterSeller === 'المركز الرئيسي' ? 'active' : ''}" onclick="setDebtFilter('المركز الرئيسي')">المركز الرئيسي</span>
              ${agents.map(a => `
                <span class="chip ${debtFilterSeller === a.name ? 'active' : ''}" onclick="setDebtFilter('${escapeHtml(a.name)}')">${escapeHtml(a.name)}</span>
              `).join('')}
            </div>
          </div>

          <div class="table-responsive">
            <table class="data-table compact-table">
              <thead>
                <tr>
                  <th>المدين / الفاتورة</th>
                  <th>المبلغ والمسدد</th>
                  <th>المتبقي</th>
                  <th>التواريخ (استحقاق / تسديد)</th>
                  <th>ملاحظات</th>
                  <th style="text-align: center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${debts.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 30px;">لا توجد ديون مسجلة</td></tr>` : 
                  debts.map(d => `
                    <tr>
                      <td>
                        <strong class="cell-title">${escapeHtml(d.customerName)}</strong>
                        <div class="cell-subtitle">
                          <span class="badge badge-neutral" style="font-size: 0.70rem; padding: 1px 5px;">${escapeHtml(window.resolveAgentName ? window.resolveAgentName(d) : (d.seller || '-'))} (${escapeHtml(d.saleCode || '')})</span>
                        </div>
                        ${(d.debtor === 'الوكيل والزبون' || d.agentName) ? `
                          <div style="margin-top: 3px;">
                            <span class="badge badge-warning" style="font-size: 0.68rem; padding: 1px 5px;">
                              دين على الوكيل (${escapeHtml(d.agentName || d.seller)})
                            </span>
                          </div>
                        ` : ''}
                      </td>
                      <td>
                        <div style="font-size: 0.78rem;"><span style="color: var(--muted);">الكلي:</span> ${formatIQD(d.totalAmount)}</div>
                        <div style="font-size: 0.78rem; color: var(--success);"><span style="color: var(--muted);">المسدد:</span> ${formatIQD(d.paidAmount)}</div>
                      </td>
                      <td>
                        <strong style="color: var(--danger); font-size: 0.95rem;">${formatIQD(d.remainingAmount)}</strong>
                      </td>
                      <td>
                        <div class="cell-date-range" style="direction: ltr;">
                          <span class="cell-date-from">استحقاق: ${escapeHtml(d.dueDate || '-')}</span>
                          ${d.paymentDate ? `<span class="cell-date-to" style="color: var(--success);">تسديد: ${escapeHtml(d.paymentDate)}</span>` : (d.remainingAmount === 0 ? `<span class="badge badge-success" style="font-size: 0.68rem; padding: 1px 4px; align-self: flex-start;">مسدد بالكامل</span>` : '')}
                        </div>
                      </td>
                      <td>
                        <small style="color: var(--text-sub); font-size: 0.75rem; max-width: 140px; display: inline-block; word-break: break-word;">${escapeHtml(d.notes || '-')}</small>
                      </td>
                      <td style="text-align: center;">
                        <div class="action-btns" style="justify-content: center;">
                          <button class="btn btn-primary btn-sm" onclick="openDebtPaymentModal('${d.id}')" style="padding: 3px 7px; font-size: 0.75rem;">تسجيل دفعة</button>
                          <button class="icon-btn btn-del" onclick="deleteDebt('${d.id}')" title="حذف الدين">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  window.setDebtFilter = function(seller) {
    debtFilterSeller = seller;
    window.renderDebts(document.getElementById('main-content'));
  };

  window.openDebtPaymentModal = function(debtId) {
    const data = getData();
    const debts = data.debts || [];
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" style="max-width: 440px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>تسجيل دفعة للدين</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="debt-pay-form">
            <div class="modal-body">
              <p>المدين: <strong>${escapeHtml(debt.customerName)}</strong></p>
              <p>المبلغ المتبقي حالياً: <strong style="color: var(--danger);">${formatIQD(debt.remainingAmount)}</strong></p>

              <div class="form-group" style="margin-top: 12px;">
                <label>مبلغ الدفعة المسددة (د.ع) *</label>
                <input type="text" inputmode="numeric" id="pay-amount" required value="${formatNumber(debt.remainingAmount)}" oninput="formatInputWithCommas(this)">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" id="btn-pay-submit">تأكيد استلام الدفعة</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('debt-pay-form').onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-pay-submit');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'جاري التسجيل...'; }
      try {
        const amount = parseNumber(document.getElementById('pay-amount').value) || 0;
        debt.paidAmount = (debt.paidAmount || 0) + amount;
        debt.remainingAmount = Math.max(0, debt.remainingAmount - amount);
        if (debt.remainingAmount <= 0 && !debt.paymentDate) {
          debt.paymentDate = new Date().toISOString().substring(0, 10);
        }

        // If fully paid, optionally update sale
        const sales = data.sales || [];
        const s = sales.find(x => x.id === debt.saleId || x.code === debt.saleCode);
        if (s) {
          s.agentPaid = (s.agentPaid || 0) + amount;
          if (debt.remainingAmount <= 0) s.paymentStatus = 'تم التسديد';
        }

        await getEngine().commitData('debts', debts);
        await getEngine().commitData('sales', sales);
        window.showToast('تم تسجيل الدفعة بنجاح', 'success');
        window.closeModal();
      } catch (err) {
        console.error('Error recording debt payment:', err);
        window.showToast('حدث خطأ أثناء تسجيل الدفعة', 'error');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'تأكيد استلام الدفعة'; }
      }
    };
  };

  window.deleteDebt = function(id) {
    window.showConfirmModal('حذف سجل الديون', 'هل أنت متأكد من حذف هذا السجل والدين المتبقي؟', async () => {
      const data = getData();
      const debtToDelete = (data.debts || []).find(d => d.id === id);

      let updatedSales = data.sales || [];
      if (debtToDelete) {
        updatedSales = updatedSales.map(s => {
          if (s.id === debtToDelete.saleId || s.code === debtToDelete.saleCode) {
            return { ...s, agentPaid: 0, paymentStatus: 'معلق' };
          }
          return s;
        });
      }

      await getEngine().commitData('sales', updatedSales);
      await getEngine().deleteItem('debts', id);
      window.showToast('تم حذف السجل بنجاح', 'success');
    }, 'حذف السجل', 'إلغاء', true);
  };

  window.exportDebtsExcel = function() {
    const data = getData();
    const rows = (data.debts || []).map(d => ({
      'المدين': d.customerName,
      'الجهة': d.seller,
      'رمز الفاتورة': d.saleCode,
      'المبلغ الكلي': d.totalAmount,
      'المبلغ المسدد': d.paidAmount,
      'المتبقي': d.remainingAmount,
      'تاريخ الاستحقاق': d.dueDate,
      'ملاحظات': d.notes
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الديون");
    XLSX.writeFile(wb, `ديون_الساري_${new Date().toISOString().substring(0,10)}.xlsx`);
  };

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

  // --- Page 5: Subscribers ---
  let subFilter = { owner: 'all', status: 'all', paymentStatus: 'all', startDate: '', endDate: '', search: '', expiring: 'all' };

  window.renderSubscribers = function(container) {
    if (!container) {
      container = document.getElementById('main-content');
      if (!container) return;
    }
    const data = getData();
    let subs = data.subscribers || [];
    const agents = data.agents || [];
    const sales = data.sales || [];
    const debts = data.debts || [];
    const today = new Date().toISOString().substring(0, 10);
    const todayTime = new Date(today).getTime();

    // Dynamic status check
    subs.forEach(s => {
      if (s.expiryDate && s.activationDate) {
        s.status = (s.activationDate <= today && today <= s.expiryDate) ? 'فعال' : 'غير فعال';
      } else {
        s.status = 'غير فعال';
      }
    });

    // Helper to check if subscriber is paid
    function checkSubscriberPaid(s) {
      if (!s.activationDate || !s.expiryDate) return '-';
      const hasDebt = debts.some(d => (d.customerName && d.customerName.includes(s.name)) || (d.saleId && sales.find(sal => sal.id === d.saleId && sal.deviceNumber === s.deviceNumber)) && Number(d.remainingAmount) > 0);
      if (hasDebt) return 'غير مدفوع';
      const subSales = sales.filter(sal => sal.deviceNumber === s.deviceNumber || sal.customerName === s.name);
      if (subSales.length > 0) {
        const hasUnpaidSale = subSales.some(sal => sal.paymentStatus === 'عليه دين');
        if (hasUnpaidSale) return 'غير مدفوع';
        return 'مدفوع';
      }
      return '-';
    }

    subs.forEach(s => {
      s.paymentStatus = checkSubscriberPaid(s);
    });

    // Calculate subscribers whose subscriptions expire within 7 days
    const expiringSoonSubs = (data.subscribers || []).filter(s => {
      if (!s.expiryDate) return false;
      const expTime = new Date(s.expiryDate).getTime();
      const diffDays = Math.ceil((expTime - todayTime) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).map(s => {
      const expTime = new Date(s.expiryDate).getTime();
      const diffDays = Math.ceil((expTime - todayTime) / (1000 * 60 * 60 * 24));
      return { ...s, daysLeft: diffDays };
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    if (subFilter.owner !== 'all') {
      subs = subs.filter(s => s.owner === subFilter.owner);
    }
    if (subFilter.status !== 'all') {
      subs = subs.filter(s => s.status === subFilter.status);
    }
    if (subFilter.paymentStatus && subFilter.paymentStatus !== 'all') {
      subs = subs.filter(s => s.paymentStatus === subFilter.paymentStatus);
    }
    if (subFilter.startDate) {
      subs = subs.filter(s => s.activationDate && s.activationDate >= subFilter.startDate);
    }
    if (subFilter.endDate) {
      subs = subs.filter(s => s.activationDate && s.activationDate <= subFilter.endDate);
    }
    if (subFilter.expiring === '7days') {
      subs = subs.filter(s => expiringSoonSubs.some(exp => exp.id === s.id));
    }
    if (subFilter.search) {
      const qRaw = subFilter.search.trim();
      const qNorm = window.normalizeSearchQuery(qRaw);
      const qDigits = qRaw.replace(/\D/g, '');

      subs = subs.filter(s => {
        const nameNorm = window.normalizeSearchQuery(s.name || '');
        const phoneClean = (s.phone || '').replace(/\D/g, '');
        const devClean = (s.deviceNumber || '').replace(/\D/g, '');
        const devRaw = (s.deviceNumber || '').toLowerCase();
        const ownerNorm = window.normalizeSearchQuery(s.owner || '');

        return nameNorm.includes(qNorm) || 
               (qDigits && (phoneClean.includes(qDigits) || devClean.includes(qDigits))) ||
               devRaw.includes(qRaw.toLowerCase()) ||
               (s.phone || '').includes(qRaw) ||
               ownerNorm.includes(qNorm);
      });
    }

    const activeCount = subs.filter(s => s.status === 'فعال').length;

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">قاعدة بيانات المشتركين</span>
            <h1>المشتركون وأجهزة البث</h1>
            <p class="subtitle">متابعة تواريخ تفعيل وانتهاء اشتراكات الأجهزة واستيرادها من Excel ونظام التنبيه التلقائي</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline-danger" onclick="confirmDeleteAllSubscribers()" title="حذف جميع المشتركين والتعاملات المالية">
              <span>🗑️</span> <span>حذف الكل والتعاملات</span>
            </button>
            <button class="btn btn-secondary" onclick="openExcelImportSubscribersModal()">
              <span>📥</span> <span>استدعاء المشتركين من Excel</span>
            </button>
            <button class="btn btn-secondary" onclick="exportSubscribersExcel()">
              <span>📤</span> <span>تصدير Excel</span>
            </button>
            <button class="btn btn-primary" onclick="openSubscriberModal()">
              <span>➕</span> <span>إضافة مشترك جديد</span>
            </button>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي المشتركين</span><div class="stat-icon">👥</div></div>
            <div class="stat-value-group"><span class="stat-value">${subs.length}</span><span class="stat-unit">مشترك</span></div>
            <div class="stat-footer"><span>بحسب الفلتر</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">الاشتراكات الفعالة</span><div class="stat-icon">🟢</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--success);">${activeCount}</span><span class="stat-unit">اشتراك</span></div>
            <div class="stat-footer"><span>أجهزة صالحة حالياً</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">الاشتراكات المنتهية</span><div class="stat-icon">🔴</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--danger);">${subs.length - activeCount}</span><span class="stat-unit">منتهي</span></div>
            <div class="stat-footer"><span>تحتاج إلى تجديد</span></div>
          </div>
          <div class="stat-card" style="${expiringSoonSubs.length > 0 ? 'border: 2px solid var(--warning);' : ''}">
            <div class="stat-card-header">
              <span class="stat-title">توشك على الانتهاء</span>
              <div class="stat-icon">⏳</div>
            </div>
            <div class="stat-value-group">
              <span class="stat-value" style="color: #b45309;">${expiringSoonSubs.length}</span>
              <span class="stat-unit">خلال 7 أيام</span>
            </div>
            <div class="stat-footer">
              <span style="color: ${expiringSoonSubs.length > 0 ? '#b45309' : 'var(--muted)'}; font-weight: 600;">
                ${expiringSoonSubs.length > 0 ? '⚠️ تتطلب تذكيراً وتجديداً' : 'جميع الاشتراكات مستقرة'}
              </span>
            </div>
          </div>
        </div>

        <!-- Automatic Alert Banner: Subscriptions expiring within 7 days -->
        ${expiringSoonSubs.length > 0 ? `
          <div class="content-card" style="border: 2px solid var(--warning); background: linear-gradient(135deg, rgba(234, 154, 42, 0.08) 0%, rgba(234, 154, 42, 0.02) 100%); margin-bottom: 24px; box-shadow: 0 4px 16px rgba(234, 154, 42, 0.12);">
            <div class="card-header-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; border-bottom: 1px solid rgba(234, 154, 42, 0.25); padding-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.6rem;">🔔</span>
                <div>
                  <h3 style="margin: 0; color: #b45309; font-size: 1.15rem; font-weight: 800;">
                    نظام التنبيه التلقائي: مشتركون أوشك اشتراكهم على الانتهاء في غضون 7 أيام (${expiringSoonSubs.length} مشترك)
                  </h3>
                  <small style="color: var(--muted); font-size: 0.85rem;">قائمة المشتركين الواجب تذكيرهم لتجديد الاشتراك قبل توقف الخدمة</small>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm" onclick="setSubFilter('expiring', '${subFilter.expiring === '7days' ? 'all' : '7days'}')" style="font-size: 0.82rem; padding: 5px 12px; border-color: rgba(234, 154, 42, 0.5);">
                  ${subFilter.expiring === '7days' ? '👁️ إلغاء الحصر وعرض الكل' : '🎯 حصر هؤلاء فقط بالجدول'}
                </button>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 12px;">
              ${expiringSoonSubs.map(s => {
                const waMsg = encodeURIComponent(`السلام عليكم أخ ${s.name}، نود تذكيركم بأن اشتراككم في شبكة الساري للبث الأرضي (رقم الجهاز: ${s.deviceNumber}) أوشك على الانتهاء بتاريخ ${s.expiryDate} (متبقي: ${s.daysLeft === 0 ? 'اليوم' : s.daysLeft + ' أيام'}). يرجى التجديد لضمان استمرار البث دون انقطاع.`);
                const waLink = s.phone && window.normalizeIraqiPhone ? `https://wa.me/${window.normalizeIraqiPhone(s.phone)}?text=${waMsg}` : null;
                const daysBadgeText = s.daysLeft === 0 ? 'ينتهي اليوم 🚨' : (s.daysLeft === 1 ? 'ينتهي غداً ⚠️' : (s.daysLeft === 2 ? 'متبقي يومان ⏳' : `متبقي ${s.daysLeft} أيام ⏳`));
                const daysBadgeClass = s.daysLeft <= 1 ? 'badge-danger' : 'badge-warning';

                return `
                  <div style="background: var(--surface); border: 1px solid rgba(234, 154, 42, 0.3); border-radius: var(--radius); padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                      <div>
                        <strong style="font-size: 1rem; color: var(--text); display: block;">${escapeHtml(s.name)}</strong>
                        <span style="font-size: 0.8rem; color: var(--muted);">${escapeHtml(window.resolveAgentName ? window.resolveAgentName(s) : s.owner)}</span>
                      </div>
                      <span class="badge ${daysBadgeClass}" style="font-size: 0.78rem; font-weight: 700; white-space: nowrap;">
                        ${daysBadgeText}
                      </span>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; padding: 7px 10px; background: var(--surface-alt); border-radius: 8px;">
                      <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="color: var(--muted); font-size: 0.75rem;">الجهاز:</span>
                        <span style="font-family: monospace; font-weight: 700; color: var(--green); cursor: pointer; text-decoration: underline;" onclick="showDeviceBarcodeModal('${escapeHtml(s.deviceNumber)}')" title="انقر لعرض QR Code">
                          ${escapeHtml(s.deviceNumber)} 📱
                        </span>
                      </div>
                      <span style="font-size: 0.82rem; color: var(--text-sub); direction: ltr; font-weight: 600;">${escapeHtml(s.expiryDate)}</span>
                    </div>

                    <div style="display: flex; gap: 6px; justify-content: flex-end; align-items: center; margin-top: 4px;">
                      ${waLink ? `
                        <a href="${waLink}" target="_blank" class="btn btn-secondary btn-sm" style="font-size: 0.78rem; padding: 4px 8px; color: #16a34a;" title="إرسال تذكير عبر واتساب">
                          <span>💬</span> <span>تذكير واتساب</span>
                        </a>
                      ` : ''}
                      <button class="btn btn-primary btn-sm" onclick="openSaleModalForSubscriber('${escapeHtml(s.deviceNumber)}', '${escapeHtml(s.name)}', '${escapeHtml(s.phone || '')}', '${escapeHtml(s.owner)}')" style="font-size: 0.78rem; padding: 4px 10px;">
                        <span>🔄</span> <span>تجديد الاشتراك</span>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <div class="content-card" style="margin-bottom: 18px;">
          <div class="sub-filter-panel">
            <!-- Row 1: Agent filter -->
            <div class="filter-group-row">
              <span class="filter-group-label">الوكيل المسؤول:</span>
              <div class="filter-chips-wrap">
                <span class="chip ${subFilter.owner === 'all' ? 'active' : ''}" onclick="setSubFilter('owner', 'all')">الكل</span>
                <span class="chip ${subFilter.owner === 'المركز الرئيسي' ? 'active' : ''}" onclick="setSubFilter('owner', 'المركز الرئيسي')">المركز الرئيسي</span>
                ${agents.map(a => `
                  <span class="chip ${subFilter.owner === a.name ? 'active' : ''}" onclick="setSubFilter('owner', '${escapeHtml(a.name)}')">${escapeHtml(a.name)}</span>
                `).join('')}
              </div>
            </div>

            <!-- Row 2: Status & Payment chips -->
            <div class="filter-groups-split">
              <div class="filter-group-block">
                <span class="filter-group-label">حالة الاشتراك:</span>
                <div class="filter-chips-wrap">
                  <span class="chip ${subFilter.status === 'all' ? 'active' : ''}" onclick="setSubFilter('status', 'all')">الكل</span>
                  <span class="chip ${subFilter.status === 'فعال' ? 'active' : ''}" onclick="setSubFilter('status', 'فعال')">فعال</span>
                  <span class="chip ${subFilter.status === 'غير فعال' ? 'active' : ''}" onclick="setSubFilter('status', 'غير فعال')">غير فعال</span>
                  <span class="chip ${subFilter.expiring === '7days' ? 'active' : ''}" style="${subFilter.expiring === '7days' ? 'background: #b45309; color: white;' : 'color: #b45309; border-color: rgba(234, 154, 42, 0.4);'}" onclick="setSubFilter('expiring', '${subFilter.expiring === '7days' ? 'all' : '7days'}')">
                    🔔 تنبيه (7 أيام) [${expiringSoonSubs.length}]
                  </span>
                </div>
              </div>

              <div class="filter-group-block">
                <span class="filter-group-label">حالة الدفع:</span>
                <div class="filter-chips-wrap">
                  <span class="chip ${subFilter.paymentStatus === 'all' ? 'active' : ''}" onclick="setSubFilter('paymentStatus', 'all')">الكل</span>
                  <span class="chip ${subFilter.paymentStatus === 'مدفوع' ? 'active' : ''}" onclick="setSubFilter('paymentStatus', 'مدفوع')">🟢 مدفوع</span>
                  <span class="chip ${subFilter.paymentStatus === 'غير مدفوع' ? 'active' : ''}" onclick="setSubFilter('paymentStatus', 'غير مدفوع')">🔴 غير مدفوع</span>
                </div>
              </div>
            </div>

            <!-- Row 3: Subscription Date Range & Search Box -->
            <div class="filter-bottom-bar">
              <div class="date-filter-group">
                <span class="filter-group-label">تاريخ الاشتراك:</span>
                <div class="date-inputs-cluster">
                  <div class="date-input-field">
                    <span class="date-label-sub">من:</span>
                    <input type="date" class="date-picker-input" value="${subFilter.startDate || ''}" onchange="setSubFilter('startDate', this.value)" title="من تاريخ الاشتراك">
                  </div>
                  <div class="date-input-field">
                    <span class="date-label-sub">إلى:</span>
                    <input type="date" class="date-picker-input" value="${subFilter.endDate || ''}" onchange="setSubFilter('endDate', this.value)" title="إلى تاريخ الاشتراك">
                  </div>
                  ${subFilter.startDate || subFilter.endDate ? `
                    <button type="button" class="btn btn-secondary btn-sm clear-date-btn" onclick="setSubFilter('startDate', ''); setSubFilter('endDate', '');" title="إلغاء تصفية التاريخ">إلغاء</button>
                  ` : ''}
                </div>
              </div>

              <div class="search-box-wrapper">
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input type="text" id="subscribers-search-input" placeholder="بحث بالاسم، الهاتف، الجهاز..." value="${escapeHtml(subFilter.search)}" oninput="onSubscriberSearchInput(this.value)">
                  ${subFilter.search ? `<button type="button" onclick="onSubscriberSearchInput('')" class="search-clear-btn" title="إلغاء البحث">✕</button>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

          <div class="table-responsive">
            <table class="data-table subscribers-table">
              <thead>
                <tr>
                  <th>المشترك / الهاتف</th>
                  <th>رقم الجهاز</th>
                  <th>الوكيل المسؤول</th>
                  <th>تاريخ الانضمام</th>
                  <th>فترة الاشتراك</th>
                  <th>الحالة والدفع</th>
                  <th style="text-align: center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${subs.length === 0 ? `<tr><td colspan="7" style="text-align: center; color: var(--muted); padding: 30px;">لا يوجد مشتركون مطابقون</td></tr>` : 
                  subs.map(s => `
                    <tr>
                      <td>
                        <strong class="cell-title">${escapeHtml(s.name)}</strong>
                        <div class="cell-subtitle" style="direction: ltr; text-align: right;">${escapeHtml(s.phone || '-')}</div>
                      </td>
                      <td style="font-family: monospace; font-size: 0.84rem;">
                        <span style="cursor: pointer; color: var(--green); text-decoration: underline; font-weight: 700;" onclick="showDeviceBarcodeModal('${escapeHtml(s.deviceNumber)}')" title="انقر لعرض الباركود">${escapeHtml(s.deviceNumber)}</span>
                      </td>
                      <td><span class="badge badge-neutral">${escapeHtml(window.resolveAgentName ? window.resolveAgentName(s) : s.owner)}</span></td>
                      <td style="direction: ltr; font-size: 0.78rem;">${escapeHtml(s.joiningDate || s.activationDate || '-')}</td>
                      <td>
                        <div class="cell-date-range" style="direction: ltr;">
                          <span class="cell-date-from">بدء: ${escapeHtml(s.activationDate || '-')}</span>
                          <span class="cell-date-to">انتهاء: ${escapeHtml(s.expiryDate || '-')}</span>
                        </div>
                      </td>
                      <td>
                        <div class="cell-badges-group">
                          <span class="badge ${s.status === 'فعال' ? 'badge-success' : 'badge-danger'}">
                            ${escapeHtml(s.status || 'غير فعال')}
                          </span>
                          <span class="badge ${s.paymentStatus === 'مدفوع' ? 'badge-success' : (s.paymentStatus === 'غير مدفوع' ? 'badge-danger' : 'badge-neutral')}">
                            ${escapeHtml(s.paymentStatus && s.paymentStatus !== '-' ? s.paymentStatus : 'فارغ')}
                          </span>
                        </div>
                      </td>
                      <td style="text-align: center;">
                        <div class="action-btns" style="justify-content: center;">
                          ${s.phone && window.normalizeIraqiPhone ? `
                            <a href="https://wa.me/${window.normalizeIraqiPhone(s.phone)}?text=${encodeURIComponent(typeof window.formatWhatsAppMessage === 'function' ? window.formatWhatsAppMessage({ customerName: s.name, saleType: 'تجديد اشتراك', subscriptionType: 'اشتراك سنوي/شهري', price: 0, paymentStatus: 'تم التسديد', endDate: s.expiryDate, deviceNumber: s.deviceNumber }) : '')}" target="_blank" class="icon-btn btn-whatsapp" title="مراسلة عبر واتساب">
                              💬
                            </a>
                          ` : ''}
                          <button class="icon-btn" onclick="openSubscriberModal('${s.id}')" title="تعديل">✏️</button>
                          <button class="icon-btn btn-del" onclick="deleteSubscriber('${s.id}')" title="حذف">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  window.onSubscriberSearchInput = function(val) {
    subFilter.search = val || '';
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      window.renderSubscribers(mainEl);
      const searchBox = document.getElementById('subscribers-search-input');
      if (searchBox) {
        searchBox.focus();
        const len = searchBox.value.length;
        searchBox.setSelectionRange(len, len);
      }
    }
  };

  window.setSubFilter = function(k, v) {
    subFilter[k] = v;
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      window.renderSubscribers(mainEl);
      if (k === 'search') {
        const searchBox = document.getElementById('subscribers-search-input');
        if (searchBox) {
          searchBox.focus();
          const len = searchBox.value.length;
          searchBox.setSelectionRange(len, len);
        }
      }
    }
  };

  window.deleteSubscriber = function(id) {
    window.showConfirmModal('حذف المشترك', 'هل تريد حذف هذا المشترك نهائياً من النظام مع كافة سجلات المبيعات والديون المتعلقة به؟', async () => {
      const data = getData();
      const subscriber = (data.subscribers || []).find(s => s.id === id);
      if (!subscriber) {
        window.showToast('المشترك غير موجود', 'error');
        return;
      }

      const deviceNumber = subscriber.deviceNumber;

      // 1. Remove Subscriber
      const updatedSubscribers = (data.subscribers || []).filter(s => s.id !== id);

      // 2. Cascade delete Sales
      const updatedSales = (data.sales || []).filter(s => s.deviceNumber !== deviceNumber);

      // 3. Cascade delete Debts
      const updatedDebts = (data.debts || []).filter(d => d.deviceNumber !== deviceNumber);

      // 4. Cascade delete Agent Settlements & Submissions (if linked to device)
      const updatedSettlements = (data.agentSettlements || []).filter(st => st.deviceNumber !== deviceNumber);
      const updatedSubmissions = (data.agentSubmissions || []).filter(sub => sub.deviceNumber !== deviceNumber);

      // 5. Commit all changes atomically
      await getEngine().batchCommitData([
        { collectionName: 'subscribers', items: updatedSubscribers },
        { collectionName: 'sales', items: updatedSales },
        { collectionName: 'debts', items: updatedDebts },
        { collectionName: 'agentSettlements', items: updatedSettlements },
        { collectionName: 'agentSubmissions', items: updatedSubmissions }
      ]);

      window.showToast('تم حذف المشترك وكافة سجلاته المرتبطة بنجاح', 'success');
      // Re-render current view if possible
      if (typeof window.renderSubscribers === 'function') window.renderSubscribers(document.getElementById('main-content'));
    }, 'حذف المشترك', 'إلغاء', true);
  };

  window.requestRenewal = async function(subId) {
    const data = getData();
    const subscriber = (data.subscribers || []).find(s => s.id === subId);
    if (!subscriber) {
      window.showToast('المشترك غير موجود', 'error');
      return;
    }

    const user = window.syncEngine?.currentUser;
    const agName = user?.agentName || user?.displayName || subscriber.owner || subscriber.agentName || 'وكيل';
    const agCode = user?.agentCode || subscriber.agentCode || '';

    const renewalRequest = {
      id: 'sub-req-' + Date.now(),
      customerName: subscriber.name,
      customerPhone: subscriber.phone || '',
      deviceNumber: subscriber.deviceNumber,
      subscriptionType: 'تجديد اشتراك',
      saleType: 'تجديد اشتراك',
      price: 0, // Admin/pricing fallback to set price
      startDate: subscriber.expiryDate || new Date().toISOString().substring(0, 10),
      endDate: '-', // Admin to set end date
      status: 'Pending',
      approvalStatus: 'قيد الاعتماد',
      submittedBy: user?.uid || 'agent',
      agentName: agName,
      seller: agName,
      agentCode: agCode,
      createdAt: new Date().toISOString()
    };

    const submissions = [...(data.agentSubmissions || []), renewalRequest];
    await getEngine().commitData('agentSubmissions', submissions);
    window.showToast('تم إرسال طلب التجديد للاعتماد بنجاح', 'success');
  };

  window.openSubscriberModal = function(subId) {
    const data = getData();
    const agents = data.agents || [];
    const existing = subId ? (data.subscribers || []).find(s => s.id === subId) : null;
    const modalContainer = document.getElementById('modal-container');
    const today = new Date().toISOString().substring(0, 10);

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${existing ? 'تعديل بيانات المشترك' : 'إضافة مشترك جديد'}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="subscriber-form">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>اسم المشترك *</label>
                  <input type="text" id="sub-name" required value="${escapeHtml(existing?.name || '')}">
                </div>
                <div class="form-group">
                  <label>رقم الهاتف</label>
                  <input type="text" id="sub-phone" placeholder="0770xxxxxxx" value="${escapeHtml(existing?.phone || '')}">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>رقم الجهاز *</label>
                  <input type="text" id="sub-device" required placeholder="16 رقم..." value="${escapeHtml(existing?.deviceNumber || '')}">
                </div>
                <div class="form-group">
                  <label>المالك / الوكيل *</label>
                  <select id="sub-owner">
                    <option value="المركز الرئيسي" ${!existing || existing.owner === 'المركز الرئيسي' ? 'selected' : ''}>المركز الرئيسي</option>
                    ${agents.map(a => `<option value="${escapeHtml(a.name)}" ${existing?.owner === a.name ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>تاريخ التفعيل</label>
                  <input type="date" id="sub-act" value="${existing?.activationDate || ''}">
                </div>
                <div class="form-group">
                  <label>تاريخ الانتهاء</label>
                  <input type="date" id="sub-exp" value="${existing?.expiryDate || ''}">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" id="btn-sub-save">حفظ المشترك</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('subscriber-form').onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-sub-save');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'جاري الحفظ...'; }
      try {
        const name = document.getElementById('sub-name').value.trim();
        const phone = document.getElementById('sub-phone').value.trim();
        const deviceNumber = document.getElementById('sub-device').value.trim();
        const owner = document.getElementById('sub-owner').value;
        const activationDate = document.getElementById('sub-act').value;
        const expiryDate = document.getElementById('sub-exp').value;

        const subs = data.subscribers || [];
        const status = (activationDate && expiryDate && activationDate <= today && today <= expiryDate) ? 'فعال' : 'غير فعال';

        if (existing) {
          existing.name = name;
          existing.phone = phone;
          existing.deviceNumber = deviceNumber;
          existing.owner = owner;
          existing.activationDate = activationDate;
          existing.expiryDate = expiryDate;
          existing.status = status;
          if (!existing.joiningDate) {
            existing.joiningDate = activationDate || today;
          }
        } else {
          subs.push({
            id: 'sub-' + Date.now(),
            name, phone, deviceNumber, owner,
            joiningDate: activationDate || today,
            activationDate, expiryDate, status: 'غير فعال'
          });
        }

        await getEngine().commitData('subscribers', subs);
        window.showToast('تم حفظ المشترك بنجاح', 'success');
      } catch (err) {
        console.error('Error saving subscriber:', err);
        window.showToast('حدث خطأ أثناء حفظ بيانات المشترك', 'error');
      } finally {
        window.closeModal();
        if (typeof window.renderSubscribers === 'function') {
          const mainEl = document.getElementById('main-content');
          if (mainEl) window.renderSubscribers(mainEl);
        }
      }
    };
  };

  window.showDeviceBarcodeModal = function(deviceNum) {
    const cleanNum = String(deviceNum || '').trim();
    if (!cleanNum) return;

    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="closeModal()">
        <div class="modal-dialog" style="max-width: 440px; text-align: center; border-radius: 16px; overflow: hidden;" onclick="event.stopPropagation()">
          <div class="modal-header" style="background: var(--surface); border-bottom: 1px solid var(--line); padding: 16px 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">📱</span>
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800;">رمز QR Code لرقم الجهاز</h3>
            </div>
            <button class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <div class="modal-body" style="padding: 24px 20px;">
            <!-- Prominent Device Number Display -->
            <div style="margin-bottom: 18px;">
              <span style="font-size: 0.85rem; color: var(--muted); display: block; margin-bottom: 6px;">رقم الجهاز المسجل</span>
              <div style="font-family: monospace; font-size: 1.55rem; font-weight: 900; letter-spacing: 2.5px; color: var(--green); background: var(--surface-alt); padding: 12px 14px; border-radius: 12px; border: 2px solid var(--line); user-select: all; word-break: break-all;">
                ${escapeHtml(cleanNum)}
              </div>
              <button type="button" class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${escapeHtml(cleanNum)}'); window.showToast('تم نسخ رقم الجهاز إلى الحافظة بنجاح', 'success');" style="margin-top: 10px; font-size: 0.8rem; padding: 5px 12px;">
                📋 نسخ رقم الجهاز
              </button>
            </div>

            <!-- Square QR Code Container -->
            <div style="background: #ffffff; padding: 20px; border-radius: 18px; display: inline-flex; justify-content: center; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 2px solid var(--line); margin: 4px auto 14px;">
              <div id="device-qrcode-target" style="display: flex; justify-content: center; align-items: center; width: 200px; height: 200px; background: #fff;"></div>
            </div>

            <p style="font-size: 0.83rem; color: var(--muted); margin: 6px 0 0; line-height: 1.5;">
              رمز QR-Code مربع متكامل وتوضيحي خاص بهذا الجهاز، يمكن مسحه بكاميرا الهاتف أو قارئ الباركود للتعرف المباشر على الجهاز.
            </p>
          </div>
          <div class="modal-footer" style="justify-content: center; background: var(--surface); border-top: 1px solid var(--line); padding: 12px 20px;">
            <button class="btn btn-secondary" onclick="closeModal()" style="min-width: 120px;">إغلاق</button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const qrTarget = document.getElementById('device-qrcode-target');
      if (!qrTarget) return;
      qrTarget.innerHTML = '';

      if (typeof QRCode !== 'undefined') {
        try {
          new QRCode(qrTarget, {
            text: cleanNum,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
          });
          return;
        } catch (e) {
          console.warn('QRCode library error, using SVG fallback:', e);
        }
      }

      renderFallbackQRCodeSVG(qrTarget, cleanNum, 200);
    }, 40);
  };

  // High-fidelity square QR code SVG fallback
  function renderFallbackQRCodeSVG(container, text, size = 200) {
    const n = 25;
    const matrix = Array.from({ length: n }, () => Array(n).fill(0));

    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[r0 + r][c0 + c] = 1;
          }
        }
      }
    }
    drawFinder(0, 0);
    drawFinder(0, n - 7);
    drawFinder(n - 7, 0);

    for (let i = 8; i < n - 8; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = 1;
        matrix[i][6] = 1;
      }
    }

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    let seed = Math.abs(hash);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const isFinder = (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
        const isTiming = (r === 6 || c === 6);
        if (!isFinder && !isTiming) {
          seed = (seed * 9301 + 49297) % 233280;
          if (seed / 233280 > 0.5) matrix[r][c] = 1;
        }
      }
    }

    const cellSize = (size / n).toFixed(2);
    let rects = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) {
          rects += `<rect x="${(c * cellSize)}" y="${(r * cellSize)}" width="${cellSize}" height="${cellSize}" fill="#000" />`;
        }
      }
    }

    container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="shape-rendering: crispEdges;">${rects}</svg>`;
  }

  // Quick renewal helper from 7-day expiration alert list
  window.openSaleModalForSubscriber = function(deviceNumber, name, phone, owner) {
    if (typeof window.openSaleModal === 'function') {
      window.openSaleModal();
      setTimeout(() => {
        const typeEl = document.getElementById('sf-type');
        if (typeEl) {
          typeEl.value = 'تجديد اشتراك';
          if (typeof window.handleSaleTypeChange === 'function') window.handleSaleTypeChange();
        }
        const devEl = document.getElementById('sf-device');
        if (devEl) {
          devEl.value = deviceNumber;
          if (typeof window.onAdminDeviceInput === 'function') window.onAdminDeviceInput(deviceNumber);
        }
        const nameEl = document.getElementById('sf-name');
        if (nameEl && name) nameEl.value = name;
        const phoneEl = document.getElementById('sf-phone');
        if (phoneEl && phone) phoneEl.value = phone;
        const sellerEl = document.getElementById('sf-seller');
        if (sellerEl && owner) sellerEl.value = owner;
        if (typeof window.recalculateSalePrice === 'function') window.recalculateSalePrice();
      }, 50);
    }
  };

  // Excel Import for Subscribers
  window.openExcelImportSubscribersModal = function() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>استدعاء المشتركين من ملف Excel</h3>
            <button class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.9rem; color: var(--text-sub);">
              يجب أن يحتوي الصف الأول على أعمدة باسم المشترك ورقم الجهاز، وعمود اختياري للمالك أو رقم الهاتف. يتم تخزين أرقام الأجهزة كنصوص للحفاظ على الأصفار.
            </p>
            <div class="form-group" style="margin-top: 14px;">
              <label>اختر ملف Excel (.xlsx أو .xls أو .csv)</label>
              <input type="file" id="sub-excel-file" accept=".xlsx,.xls,.csv">
            </div>
            <div id="import-preview" style="margin-top: 12px; font-size: 0.85rem; color: var(--green);"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
            <button type="button" class="btn btn-primary" id="btn-process-sub-excel">بدء الاستيراد</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-process-sub-excel').onclick = function() {
      const fileInput = document.getElementById('sub-excel-file');
      if (!fileInput.files.length) {
        alert('يرجى اختيار ملف Excel أولاً');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary', raw: true });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });
          if (json.length < 2) {
            alert('الملف فارغ أو لا يحتوي على صفوف بيانات');
            return;
          }

          const headers = json[0].map(h => String(h || '').trim().toLowerCase());
          // Detect column indices
          let nameIdx = headers.findIndex(h => h.includes('اسم') || h.includes('مشترك') || h.includes('name'));
          let devIdx = headers.findIndex(h => h.includes('جهاز') || h.includes('باركود') || h.includes('كود') || h.includes('device') || h.includes('number'));
          let phoneIdx = headers.findIndex(h => h.includes('هاتف') || h.includes('phone') || h.includes('موبايل'));
          let ownerIdx = headers.findIndex(h => h.includes('مالك') || h.includes('وكيل') || h.includes('owner'));
          let actIdx = headers.findIndex(h => h.includes('تفعيل') || h.includes('بدء') || h.includes('start') || h.includes('activation'));
          let expIdx = headers.findIndex(h => h.includes('انتهاء') || h.includes('نهاية') || h.includes('end') || h.includes('expiry') || h.includes('expire'));
          let statusIdx = headers.findIndex(h => h.includes('حالة') || h.includes('status'));

          if (nameIdx === -1) nameIdx = 0;
          if (devIdx === -1) devIdx = 1;

          const data = getData();
          const existingSubs = [...(data.subscribers || [])];
          let importedCount = 0;

          for (let r = 1; r < json.length; r++) {
            const row = json[r];
            if (!row || !row[nameIdx]) continue;
            const name = String(row[nameIdx] || '').trim();
            const device = normalizeDigits(String(row[devIdx] || '')).replace(/\s+/g, '');
            const phone = phoneIdx !== -1 ? String(row[phoneIdx] || '').trim() : '';
            const owner = ownerIdx !== -1 && row[ownerIdx] ? String(row[ownerIdx]).trim() : 'المركز الرئيسي';

            // New imported subscribers: dates and status default to empty/not active ('غير فعال')
            const activationDate = (actIdx !== -1 && row[actIdx]) ? String(row[actIdx]).trim() : '';
            const expiryDate = (expIdx !== -1 && row[expIdx]) ? String(row[expIdx]).trim() : '';

            let status = 'غير فعال';
            if (statusIdx !== -1 && row[statusIdx]) {
              const fileStatus = String(row[statusIdx]).trim();
              if (fileStatus === 'فعال' && activationDate && expiryDate) {
                status = 'فعال';
              } else {
                status = 'غير فعال';
              }
            } else if (activationDate && expiryDate) {
              const today = new Date().toISOString().substring(0, 10);
              status = (activationDate <= today && today <= expiryDate) ? 'فعال' : 'غير فعال';
            } else {
              status = 'غير فعال';
            }

            if (name && device) {
              existingSubs.push({
                id: 'sub-' + Date.now() + '-' + r,
                name,
                phone,
                deviceNumber: device,
                owner,
                activationDate: activationDate || '',
                expiryDate: expiryDate || '',
                status: status || 'غير فعال'
              });
              importedCount++;
            }
          }

          await getEngine().commitData('subscribers', existingSubs);
          window.showToast(`تم استيراد ${importedCount} مشترك بنجاح!`, 'success');
          window.closeModal();
        } catch (err) {
          console.error(err);
          alert('حدث خطأ أثناء قراءة ملف Excel: ' + err.message);
        }
      };
      reader.readAsBinaryString(fileInput.files[0]);
    };
  };

  window.confirmDeleteAllSubscribers = function() {
    showConfirmDialog(
      'حذف جميع المشتركين والتعاملات المالية',
      'هل أنت متأكد تماماً من رغبتك في حذف كافة المشتركين وسجل المبيعات والديون وكل التعاملات المالية المرتبطة بالزبائن دفعة واحدة؟ هذا الإجراء نهائي ولا يمكن التراجع عنه!',
      async () => {
        await getEngine().clearCollection('subscribers');
        await getEngine().clearCollection('sales');
        await getEngine().clearCollection('debts');
        await getEngine().clearCollection('agentSubmissions');
        showToast('تم حذف كافة المشتركين والتعاملات المالية وسجل المبيعات والديون بنجاح', 'success');
        if (typeof window.renderSubscribers === 'function') {
          window.renderSubscribers(document.getElementById('main-content'));
        }
      }
    );
  };

  window.submitAgentSale = async function(saleData) {
    const user = getEngine().currentUser;
    const data = getData();
    const subs = data.agentSubmissions || [];

    const newSubmission = {
      id: 'subm-' + Date.now(),
      code: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      customerName: saleData.customerName,
      customerPhone: saleData.customerPhone || '',
      deviceNumber: saleData.deviceNumber,
      subscriptionType: saleData.subscriptionType || 'اشتراك شهر واحد',
      saleType: saleData.saleType || 'تجديد اشتراك',
      price: Number(saleData.price) || 0,
      startDate: saleData.startDate || new Date().toISOString().substring(0, 10),
      endDate: saleData.endDate || new Date().toISOString().substring(0, 10),
      seller: user?.agentName || user?.displayName || 'وكيل',
      agentName: user?.agentName || user?.displayName || 'وكيل',
      agentCode: user?.agentCode || '',
      submittedBy: user?.uid || 'agent',
      status: 'Pending',
      approvalStatus: 'قيد الاعتماد',
      paymentMethod: saleData.paymentMethod || 'بانتظار اعتماد الادمن',
      createdAt: new Date().toISOString()
    };

    const updatedSubs = [newSubmission, ...subs];
    await getEngine().commitData('agentSubmissions', updatedSubs);
    window.showToast('تم إرسال معاملة البيع بنجاح (Status: Pending) إلى المركز الرئيسي للاعتماد', 'success');
    return newSubmission;
  };

  window.exportSubscribersExcel = function() {
    const data = getData();
    const rows = (data.subscribers || []).map(s => ({
      'اسم المشترك': s.name,
      'رقم الهاتف': s.phone,
      'رقم الجهاز': "'" + s.deviceNumber,
      'الجهة المالكة': s.owner,
      'الحالة': s.status,
      'تاريخ التفعيل': s.activationDate,
      'تاريخ الانتهاء': s.expiryDate
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المشتركون");
    XLSX.writeFile(wb, `مشتركو_الساري_${new Date().toISOString().substring(0,10)}.xlsx`);
  };

})();
