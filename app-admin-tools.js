/**
 * Reports, Pricing, Users, Agent Dashboard, and Firebase Config Tools
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

  // --- Page 7: Reports ---
  window.renderReports = function(container) {
    const today = new Date().toISOString().substring(0, 10);
    const firstDayMonth = today.substring(0, 8) + '01';
    const engine = getEngine();
    const currentWhatsAppTemplate = engine?.data?.templates?.whatsapp || window.DEFAULT_WHATSAPP_TEMPLATE || `السلام عليكم ورحمة الله

• المشترك: «اسم الزبون»🌟

تمت عملية «تجديد اشتراك» بنجاح.
• المدة: «مدة تجديد اشتراك»
• المبلغ: «المبلغ» د.ع
• المدفوع: «المبلغ المدفوع» د.ع
• المتبقي: «المبلغ المتبقي» د.ع
• تاريخ الانتهاء: «تاريخ انتهاء الاشتراك»

شكراً لثقتكم — الساري للبث الأرضي - وكيل قنوات الرابعة الرياضية 📡`;

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">تقارير النشاط والبيانات المالية</span>
            <h1>التقارير والتصدير الشامل</h1>
            <p class="subtitle">توليد تقارير الأداء المالي، سجل المبيعات، وموقف ديون الوكلاء مع تصفية النطاق الزمني والتصدير</p>
          </div>
        </div>

        <!-- Date Range Filter Bar -->
        <div class="content-card" style="margin-bottom: 24px; padding: 18px 24px; background: var(--card-bg);">
          <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span style="font-weight: 700; color: var(--green); display: flex; align-items: center; gap: 6px;">
                <span>📅</span> <span>تصفية حسب النطاق الزمني:</span>
              </span>
              <div style="display: flex; align-items: center; gap: 6px;">
                <label style="font-size: 0.85rem; color: var(--muted);">من تاريخ:</label>
                <input type="date" id="rep-start-date" value="${firstDayMonth}" style="padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--line); background: var(--surface-alt); font-size: 0.9rem;">
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <label style="font-size: 0.85rem; color: var(--muted);">إلى تاريخ:</label>
                <input type="date" id="rep-end-date" value="${today}" style="padding: 6px 10px; border-radius: var(--radius-sm); border: 1px solid var(--line); background: var(--surface-alt); font-size: 0.9rem;">
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('rep-start-date').value=''; document.getElementById('rep-end-date').value=''; showToast('تم إزالة تصفية التاريخ', 'info');">إلغاء التصفية</button>
              <button class="btn btn-primary btn-sm" onclick="compareAgentsAndUsers()">🔍 مقارنة الوكلاء والمستخدمين</button>
              <button class="btn btn-primary btn-sm" onclick="exportFullBackupJSON()">📦 نسخة احتياطية كاملة (JSON)</button>
            </div>
          </div>
        </div>

        <div class="report-grid">
          <!-- Report 1: Subscribers -->
          <div class="report-card">
            <div style="font-size: 2.2rem; margin-bottom: 4px;">👥</div>
            <h3>تقرير وتصدير المشتركين</h3>
            <p style="color: var(--text-sub); font-size: 0.9rem;">
              تصدير بيانات المشتركين وتواريخ اشتراكهم وتفعيلهم حسب النطاق الزمني المحدد بصيغتي JSON أو Excel.
            </p>
            <div style="margin-top: auto; display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" onclick="exportSubscribersExcel()" style="flex: 1;">تنزيل Excel</button>
              <button class="btn btn-primary btn-sm" onclick="exportSubscribersJSON()" style="flex: 1;">تنزيل JSON</button>
            </div>
          </div>

          <!-- Report 2: Sales -->
          <div class="report-card">
            <div style="font-size: 2.2rem; margin-bottom: 4px;">📈</div>
            <h3>تقرير المبيعات والاشتراكات</h3>
            <p style="color: var(--text-sub); font-size: 0.9rem;">
              تصدير سجل المبيعات والاشتراكات وحركات الأجهزة للوكلاء والمركز الرئيسي ضمن النطاق الزمني المحدد.
            </p>
            <div style="margin-top: auto; display: flex; gap: 8px; width: 100%; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" onclick="exportSalesExcel()" style="flex: 1;">تنزيل Excel</button>
              <button class="btn btn-primary btn-sm" onclick="exportSalesJSON()" style="flex: 1;">تنزيل JSON</button>
            </div>
          </div>

          <!-- Report 3: Debts -->
          <div class="report-card">
            <div style="font-size: 2.2rem; margin-bottom: 4px;">⏳</div>
            <h3>تقرير الديون والمستحقات</h3>
            <p style="color: var(--text-sub); font-size: 0.9rem;">
              تقرير شامل بجميع المبالغ المتبقية في ذمة الزبائن والوكلاء وتواريخ الاستحقاق.
            </p>
            <div style="margin-top: auto; display: flex; gap: 8px; width: 100%;">
              <button class="btn btn-secondary btn-sm" onclick="exportDebtsExcel()" style="flex: 1;">تنزيل Excel</button>
              <button class="btn btn-primary btn-sm" onclick="window.print()" style="flex: 1;">طباعة / PDF</button>
            </div>
          </div>

          <!-- Report 4: Agents -->
          <div class="report-card">
            <div style="font-size: 2.2rem; margin-bottom: 4px;">🏆</div>
            <h3>تقرير حركة الوكلاء والتسديدات</h3>
            <p style="color: var(--text-sub); font-size: 0.9rem;">
              تقرير إحصائي لحجم مبيعات كل وكيل، رصيد الديون، وسجل التسديدات الدورية.
            </p>
            <div style="margin-top: auto; display: flex; gap: 8px; width: 100%;">
              <button class="btn btn-secondary btn-sm" onclick="exportAgentsExcel()" style="flex: 1;">تنزيل Excel</button>
              <button class="btn btn-primary btn-sm" onclick="window.print()" style="flex: 1;">طباعة / PDF</button>
            </div>
          </div>
        </div>

        <!-- WhatsApp Message Customization Template Section -->
        <div class="content-card" style="margin-top: 28px; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--card-bg); box-shadow: var(--shadow-sm);">
          <div class="card-header-bar" style="margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 1.8rem; background: rgba(37, 211, 102, 0.15); color: #25D366; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md);">💬</span>
              <div>
                <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--text);">نموذج تخصيص رسالة الواتساب للمشتركين</h3>
                <p style="margin: 3px 0 0 0; font-size: 0.88rem; color: var(--muted);">
                  تخصيص نص الرسالة التي تُرسل تلقائياً للزبائن والوكلاء عند تسجيل المبيعات أو تجديد الاشتراك
                </p>
              </div>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" onclick="resetWhatsAppTemplate()">
                <span>🔄</span> <span>استعادة النص الافتراضي</span>
              </button>
              <button class="btn btn-primary btn-sm" onclick="saveWhatsAppTemplate()">
                <span>💾</span> <span>حفظ النموذج</span>
              </button>
            </div>
          </div>

          <div style="background: var(--surface-alt); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 16px; font-size: 0.9rem; line-height: 1.6; border: 1px dashed var(--line);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
              <strong style="color: var(--green); display: flex; align-items: center; gap: 6px;">
                <span>✨</span> <span>المتغيرات التلقائية المتاحة (انقر على أي متغير لإدراجه في نص الرسالة):</span>
              </strong>
              <small style="color: var(--muted);">يتم استبدال كل رمز تلقائياً ببيانات المشترك الحقيقية</small>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="template-tags-container">
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«اسم الزبون»')">«اسم الزبون»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«تجديد اشتراك»')">«تجديد اشتراك»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«مدة تجديد اشتراك»')">«مدة تجديد اشتراك»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«المبلغ»')">«المبلغ»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«المبلغ المدفوع»')">«المبلغ المدفوع»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«المبلغ المتبقي»')">«المبلغ المتبقي»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«تاريخ انتهاء الاشتراك»')">«تاريخ انتهاء الاشتراك»</button>
              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.82rem; padding: 4px 10px;" onclick="insertTagIntoTemplate('«رقم الجهاز»')">«رقم الجهاز»</button>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 16px;">
            <label style="font-weight: 700; margin-bottom: 8px; display: block; color: var(--text);">نص رسالة الواتساب:</label>
            <textarea id="wa-template-input" rows="12" style="width: 100%; padding: 14px 16px; font-size: 0.95rem; line-height: 1.8; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--bg); color: var(--text); resize: vertical; direction: rtl; font-family: inherit; box-sizing: border-box;">${currentWhatsAppTemplate}</textarea>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 14px;">
            <button class="btn btn-secondary" onclick="previewWhatsAppTemplate()">
              <span>👁️</span> <span>معاينة الرسالة ببيانات افتراضية</span>
            </button>
            <button class="btn btn-primary" onclick="saveWhatsAppTemplate()">
              <span>💾</span> <span>حفظ نموذج الرسالة وتطبيقه في النظام</span>
            </button>
          </div>

          <!-- Preview Box -->
          <div id="wa-preview-box" style="display: none; margin-top: 18px; padding: 16px 20px; border-radius: var(--radius-md); background: #e7fedc; color: #111b21; border: 1px solid #b7ebb1; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.8; direction: rtl; box-shadow: var(--shadow-sm);"></div>
        </div>
      </div>
    `;
  };

  window.insertTagIntoTemplate = function(tag) {
    const textarea = document.getElementById('wa-template-input');
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + tag + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + tag.length;
  };

  window.saveWhatsAppTemplate = async function() {
    const textarea = document.getElementById('wa-template-input');
    if (!textarea) return;
    const val = textarea.value.trim();
    if (!val) {
      window.showToast('يرجى كتابة نص النموذج قبل الحفظ', 'error');
      return;
    }
    const engine = getEngine();
    if (!engine) return;
    const currentTemplates = engine.data.templates || {};
    const updated = {
      ...currentTemplates,
      id: 'main-templates',
      whatsapp: val,
      updatedAt: new Date().toISOString()
    };
    await engine.commitData('templates', updated);
    window.showToast('تم حفظ نموذج رسالة الواتساب بنجاح وتحديثه في النظام', 'success');
  };

  window.resetWhatsAppTemplate = function() {
    const textarea = document.getElementById('wa-template-input');
    if (textarea) {
      textarea.value = window.DEFAULT_WHATSAPP_TEMPLATE;
      window.showToast('تم استعادة النموذج الافتراضي، اضغط "حفظ النموذج" لتأكيد التغيير', 'info');
      const previewBox = document.getElementById('wa-preview-box');
      if (previewBox && previewBox.style.display !== 'none') {
        window.previewWhatsAppTemplate();
      }
    }
  };

  window.previewWhatsAppTemplate = function() {
    const textarea = document.getElementById('wa-template-input');
    const previewBox = document.getElementById('wa-preview-box');
    if (!textarea || !previewBox) return;
    const tpl = textarea.value;
    const sampleSale = {
      customerName: 'حيدر الكرخي',
      saleType: 'تجديد اشتراك',
      subscriptionType: 'اشتراك شهر واحد',
      price: 18000,
      paymentStatus: 'تم التسديد',
      agentPaid: 18000,
      endDate: '2026-11-04',
      deviceNumber: '1029384756102938'
    };
    const rendered = typeof window.formatWhatsAppMessage === 'function' ? 
      window.formatWhatsAppMessage(sampleSale, tpl) : tpl;
    previewBox.style.display = 'block';
    previewBox.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed rgba(0,0,0,0.15); padding-bottom: 6px;">
        <strong style="color: #0b6b2b; display: flex; align-items: center; gap: 6px;">
          <span>📱</span> <span>معاينة واقعية لشكل الرسالة في تطبيق WhatsApp:</span>
        </strong>
        <button class="btn btn-secondary btn-sm" style="font-size: 0.75rem; padding: 2px 8px;" onclick="document.getElementById('wa-preview-box').style.display='none'">إغلاق المعاينة ✕</button>
      </div>
      <div>${rendered.replace(/\n/g, '<br>')}</div>
    `;
  };

  function filterByDate(items, dateField, start, end) {
    if (!start && !end) return items;
    return items.filter(item => {
      const d = item[dateField];
      if (!d) return true;
      const dateStr = d.substring(0, 10);
      if (start && dateStr < start) return false;
      if (end && dateStr > end) return false;
      return true;
    });
  }

  window.compareAgentsAndUsers = function() {
    const data = getData();
    const agents = data.agents || [];
    const users = (data.users || []).filter(u => u.role !== 'admin' && u.username !== 'admin' && u.username !== 'abodsari');
    
    const missingUsers = agents.filter(a => !users.some(u => 
        u.username === a.username || 
        u.uid === a.id || 
        u.agentCode === a.code ||
        u.name === a.name
    ));
    
    const missingAgents = users.filter(u => !agents.some(a => 
        a.username === u.username || 
        a.id === u.uid || 
        a.code === u.agentCode ||
        a.name === u.name
    ));
    
    console.log("Agents without matching User:", missingUsers);
    console.log("Users without matching Agent:", missingAgents);
    
    let message = `نتائج المقارنة:\n\nوكلاء بدون مستخدم مطابق: ${missingUsers.length}\nمستخدمون بدون وكيل مطابق: ${missingAgents.length}\n\nيرجى مراجعة الـ Console للتفاصيل.`;
    alert(message);
  };

  window.togglePasswordVisibility = function(id, password) {
    const el = document.getElementById(`pass-${id}`);
    if (el) {
      if (el.textContent === '••••••••') {
        el.textContent = password;
      } else {
        el.textContent = '••••••••';
      }
    }
  };

  window.clearAllDataUI = async function() {
    if (!confirm('تنبيه: هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      window.showToast('جاري مسح البيانات، يرجى الانتظار...', 'info');
      await window.syncEngine.clearAllData();
      window.showToast('تم مسح جميع البيانات بنجاح', 'success');
      window.location.reload();
    } catch (e) {
      window.showToast('حدث خطأ أثناء مسح البيانات', 'error');
      console.error(e);
    }
  };

  window.exportSubscribersJSON = function() {
    const data = getData();
    const start = document.getElementById('rep-start-date')?.value || '';
    const end = document.getElementById('rep-end-date')?.value || '';
    const filtered = filterByDate(data.subscribers || [], 'activationDate', start, end);
    
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المشتركين_الساري_${start || 'all'}_إلى_${end || 'all'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('تم تصدير نسخة JSON للمشتركين بنجاح', 'success');
  };

  window.exportSubscribersExcel = function() {
    const data = getData();
    const start = document.getElementById('rep-start-date')?.value || '';
    const end = document.getElementById('rep-end-date')?.value || '';
    const filtered = filterByDate(data.subscribers || [], 'activationDate', start, end);

    const rows = filtered.map(s => ({
      'اسم المشترك': s.name,
      'رقم الهاتف': s.phone,
      'رقم الجهاز': s.deviceNumber,
      'جهة البيع': s.owner,
      'تاريخ التفعيل': s.activationDate,
      'تاريخ الانتهاء': s.expiryDate,
      'الحالة': s.status
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المشتركين");
    XLSX.writeFile(wb, `مشتركي_الساري_${start || 'all'}_إلى_${end || 'all'}.xlsx`);
    window.showToast('تم تصدير تقرير المشتركين Excel بنجاح', 'success');
  };

  window.exportSalesJSON = function() {
    const data = getData();
    const start = document.getElementById('rep-start-date')?.value || '';
    const end = document.getElementById('rep-end-date')?.value || '';
    const filtered = filterByDate(data.sales || [], 'startDate', start, end);

    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المبيعات_الساري_${start || 'all'}_إلى_${end || 'all'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('تم تصدير نسخة JSON للمبيعات بنجاح', 'success');
  };

  window.exportFullBackupJSON = function() {
    const data = getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_كاملة_الساري_${new Date().toISOString().substring(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('تم تصدير النسخة الاحتياطية الشاملة بنجاح', 'success');
  };

  window.exportAgentsExcel = function() {
    const data = getData();
    const rows = (data.agents || []).map(a => {
      const sales = (data.sales || []).filter(s => s.seller === a.name);
      const debts = (data.debts || []).filter(d => d.seller === a.name && d.remainingAmount > 0);
      return {
        'رمز الوكيل': a.code,
        'اسم الوكيل': a.name,
        'رقم الهاتف': a.phone,
        'سعر الجهاز المخصص': a.price,
        'عدد العمليات': sales.length,
        'إجمالي المبيعات (د.ع)': sales.reduce((s, x) => s + (x.price || 0), 0),
        'الديون القائمة (د.ع)': debts.reduce((s, x) => s + (x.remainingAmount || 0), 0)
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير_الوكلاء");
    XLSX.writeFile(wb, `وكلاء_الساري_${new Date().toISOString().substring(0,10)}.xlsx`);
  };

  // --- Page: Products (المنتجات والمخزن) ---
  let productFilter = { category: 'all', search: '' };

  function getCategoryIcon(cat) {
    if (!cat) return '📦';
    const c = cat.trim();
    if (c.includes('أريل') || c.includes('اريل')) return '📡';
    if (c.includes('كابل') || c.includes('سلك')) return '🔌';
    if (c.includes('ريمونت') || c.includes('تحكم')) return '📱';
    if (c.includes('فيش') || c.includes('كونكتر')) return '🔩';
    if (c.includes('جديد')) return '📦';
    if (c.includes('مستعمل')) return '🔄';
    return '📦';
  }

  window.setProductFilter = function(key, val) {
    productFilter[key] = val;
    const mainEl = document.getElementById('main-content');
    if (mainEl) window.renderProducts(mainEl);
  };

  window.onProductSearchInput = function(val) {
    productFilter.search = val || '';
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      window.renderProducts(mainEl);
      const searchBox = document.getElementById('product-search-input');
      if (searchBox) {
        searchBox.focus();
        const len = searchBox.value.length;
        searchBox.setSelectionRange(len, len);
      }
    }
  };

  window.renderProducts = function(container) {
    const user = getEngine().currentUser;
    const isAdmin = user && (user.role === 'admin' || user.role === 'أدمن' || user.role === 'مدير رئيسي');
    const data = getData();
    let products = data.products || window.DEFAULT_PRODUCTS || [];

    // Ensure all products have required attributes
    products = products.map(p => ({
      id: p.id || 'prod-' + Math.random().toString(36).substr(2, 9),
      code: p.code || 'PRD',
      name: p.name || 'منتج',
      category: p.category || 'عام',
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      unit: p.unit || 'قطعة',
      image: p.image || '',
      description: p.description || ''
    }));

    // Collect all unique categories
    const standardCategories = ['أريل', 'كابلات', 'ريمونت', 'فيش', 'اجهزة جديدة', 'اجهزة مستعملة'];
    const customCategories = Array.from(new Set(products.map(p => p.category))).filter(c => c && !standardCategories.includes(c));
    const allCategories = ['الكل', ...standardCategories, ...customCategories];

    // Filter products by category
    let filtered = [...products];
    if (productFilter.category !== 'all' && productFilter.category !== 'الكل') {
      filtered = filtered.filter(p => p.category === productFilter.category);
    }

    // Filter products by search input
    if (productFilter.search) {
      const qRaw = productFilter.search.trim();
      const qNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(qRaw) : qRaw.toLowerCase();
      filtered = filtered.filter(p => {
        const nameNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(p.name || '') : (p.name || '').toLowerCase();
        const codeNorm = (p.code || '').toLowerCase();
        const catNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(p.category || '') : (p.category || '').toLowerCase();
        const descNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(p.description || '') : (p.description || '').toLowerCase();

        return nameNorm.includes(qNorm) ||
               codeNorm.includes(qRaw.toLowerCase()) ||
               catNorm.includes(qNorm) ||
               descNorm.includes(qNorm);
      });
    }

    // Metrics calculations
    const totalItems = products.length;
    const totalStockQty = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalStockValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
    const lowStockCount = products.filter(p => Number(p.stock) <= 5).length;

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">${isAdmin ? 'لوحة تحكم المخزن المركزي' : 'دليل المنتجات والملحقات المتوفرة'}</span>
            <h1>دليل المنتجات والمخزن</h1>
            <p class="subtitle">${isAdmin ? 'إدارة المنتجات، تحديث أسعار المفرد والكميات المتوفرة في المخزن مع مزامنة لحظية فورية للوكلاء' : 'استعراض أصناف الملحقات والأجهزة وأسعار المفرد والكميات المتاحة في المركز'}</p>
          </div>
          <div class="header-actions">
            ${isAdmin ? `
              <button class="btn btn-primary" onclick="openProductModal()">
                <span>➕</span> <span>إضافة منتج جديد</span>
              </button>
            ` : `
              <div class="badge badge-success" style="font-size: 0.88rem; padding: 8px 14px; display: inline-flex; align-items: center; gap: 6px;">
                <span>🟢</span> <span>الأسعار والكميات متزامنة لحظياً مع المركز الرئيسي</span>
              </div>
            `}
          </div>
        </div>

        <!-- Summary Statistics Grid -->
        ${isAdmin ? `
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي الأصناف المسجلة</span><div class="stat-icon">📦</div></div>
            <div class="stat-value-group"><span class="stat-value">${totalItems}</span><span class="stat-unit">صنف</span></div>
            <div class="stat-footer"><span>المعروض حالياً: ${filtered.length} صنف</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي القطع في المخزن</span><div class="stat-icon">📊</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--green);">${formatNumber(totalStockQty)}</span><span class="stat-unit">قطعة</span></div>
            <div class="stat-footer"><span>رصيد المخزن الفعلي</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">القيمة الإجمالية للمخزن</span><div class="stat-icon">💰</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--primary);">${formatIQD(totalStockValue)}</span></div>
            <div class="stat-footer"><span>بسعر القطعة المفرد</span></div>
          </div>
          <div class="stat-card" style="${lowStockCount > 0 ? 'border: 2px solid var(--warning);' : ''}">
            <div class="stat-card-header"><span class="stat-title">أصناف تحتاج تزويداً</span><div class="stat-icon">⚠️</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: ${lowStockCount > 0 ? '#b45309' : 'var(--success)'};">${lowStockCount}</span><span class="stat-unit">أصناف</span></div>
            <div class="stat-footer"><span>الكمية المتبقية 5 أو أقل</span></div>
          </div>
        </div>
        ` : ''}

        <!-- Filter & Search Controls Bar -->
        <div class="content-card" style="margin-bottom: 24px;">
          <div class="filters-bar" style="flex-direction: column; align-items: stretch; gap: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <!-- Category Filter Chips -->
              <div class="filter-chips">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--muted); margin-left: 4px;">الفئة:</span>
                ${allCategories.map(cat => {
                  const isActive = productFilter.category === cat || (cat === 'الكل' && productFilter.category === 'all');
                  const targetVal = cat === 'الكل' ? 'all' : cat;
                  return `
                    <span class="chip ${isActive ? 'active' : ''}" onclick="setProductFilter('category', '${escapeHtml(targetVal)}')">
                      ${getCategoryIcon(cat)} ${escapeHtml(cat)}
                    </span>
                  `;
                }).join('')}
              </div>

              <!-- Instant Search Box -->
              <div class="search-box" style="position: relative; display: flex; align-items: center; min-width: 280px;">
                <span class="search-icon">🔍</span>
                <input type="text" id="product-search-input" placeholder="بحث باسم المنتج، الرمز، أو الفئة..." value="${escapeHtml(productFilter.search)}" oninput="onProductSearchInput(this.value)">
                ${productFilter.search ? `<button type="button" onclick="onProductSearchInput('')" style="position: absolute; left: 10px; background: none; border: none; cursor: pointer; color: var(--muted); font-size: 0.9rem; padding: 2px 6px;" title="إلغاء البحث">✕</button>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Products Cards Grid -->
        ${filtered.length === 0 ? `
          <div class="content-card" style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
            <h3 style="color: var(--text-main); margin-bottom: 6px;">لا توجد منتجات مطابقة للبحث أو الفلتر</h3>
            <p style="color: var(--muted); font-size: 0.9rem; max-width: 400px; margin: 0 auto 18px;">يرجى تجربة كلمات بحث أخرى أو إزالة الفلتر المختار.</p>
            <button class="btn btn-secondary" onclick="setProductFilter('category', 'all'); onProductSearchInput('');">إعادة ضبط الفلاتر</button>
          </div>
        ` : `
          <div class="products-grid">
            ${filtered.map(p => {
              const stockNum = Number(p.stock) || 0;
              let stockClass = 'in-stock';
              let stockLabel = `متوفر (${formatNumber(stockNum)})`;
              if (stockNum === 0) {
                stockClass = 'out-of-stock';
                stockLabel = 'نفدت الكمية';
              } else if (stockNum <= 5) {
                stockClass = 'low-stock';
                stockLabel = `كمية منخفضة (${formatNumber(stockNum)})`;
              }

              return `
                <div class="product-card" id="card-product-${p.id}">
                  <!-- Top Image with overlays -->
                  <div class="product-image-box">
                    ${p.image ? `
                      <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="product-image" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                      <div class="product-fallback-icon" style="display: none;">${getCategoryIcon(p.category)}</div>
                    ` : `
                      <div class="product-fallback-icon">${getCategoryIcon(p.category)}</div>
                    `}
                    <div class="product-category-badge">${escapeHtml(p.category)}</div>
                    <div class="product-stock-pill ${stockClass}">${stockLabel}</div>
                  </div>

                  <!-- Body with Name, Code, Description & Metrics -->
                  <div class="product-card-body">
                    <div class="product-header-info">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <h3 class="product-title">${escapeHtml(p.name)}</h3>
                        <span class="product-code-tag">${escapeHtml(p.code)}</span>
                      </div>
                      ${p.description ? `<p class="product-desc" title="${escapeHtml(p.description)}">${escapeHtml(p.description)}</p>` : ''}
                    </div>

                    <!-- Metrics: Unit Price & Stock Quantity clearly shown below image -->
                    <div class="product-metrics-box">
                      <div class="product-metric">
                        <span class="product-metric-label">سعر القطعة المفرد</span>
                        <span class="product-metric-value price">${formatIQD(p.price)}</span>
                      </div>
                      <div class="product-metric">
                        <span class="product-metric-label">الكمية في المخزن</span>
                        <span class="product-metric-value">${formatNumber(p.stock)} <span style="font-size: 0.75rem; color: var(--muted); font-weight: normal;">${escapeHtml(p.unit || 'قطعة')}</span></span>
                      </div>
                    </div>

                    <!-- Admin or View-Only Controls -->
                    ${isAdmin ? `
                      <div class="product-admin-actions">
                        <!-- Quick Quantity Adjusters -->
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-size: 0.75rem; color: var(--muted);">تعديل سريع:</span>
                          <div class="product-quick-qty">
                            <button type="button" class="product-quick-btn" onclick="quickAdjustStock('${p.id}', -1)" title="إنقاص الكمية (-1)">-</button>
                            <span style="font-size: 0.8rem; font-weight: 700; padding: 0 4px; font-family: monospace;">${stockNum}</span>
                            <button type="button" class="product-quick-btn" onclick="quickAdjustStock('${p.id}', 1)" title="زيادة الكمية (+1)">+</button>
                          </div>
                        </div>

                        <!-- Edit & Delete Buttons -->
                        <div style="display: flex; gap: 6px;">
                          <button class="btn btn-secondary btn-sm" onclick="openProductModal('${p.id}')" title="تعديل السعر والكمية والبيانات" style="font-size: 0.8rem; padding: 4px 10px;">
                            <span>✏️</span> تعديل
                          </button>
                          <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct('${p.id}')" title="حذف المنتج" style="font-size: 0.8rem; padding: 4px 8px;">
                            <span>🗑️</span>
                          </button>
                        </div>
                      </div>
                    ` : `
                      <div style="padding-top: 8px; border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.78rem; color: var(--muted);">حالة التوفر للوكلاء:</span>
                        <span class="badge ${stockNum > 0 ? 'badge-success' : 'badge-danger'}" style="font-size: 0.78rem;">
                          ${stockNum > 0 ? '🟢 متاح للاستلام والبيع' : '🔴 غير متوفر حالياً'}
                        </span>
                      </div>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  };

  // Quick quantity adjustment for Admin with immediate sync
  window.quickAdjustStock = async function(prodId, delta) {
    const data = getData();
    const products = [...(data.products || window.DEFAULT_PRODUCTS || [])];
    const idx = products.findIndex(p => p.id === prodId);
    if (idx === -1) return;

    const currentStock = Number(products[idx].stock) || 0;
    const newStock = Math.max(0, currentStock + delta);
    products[idx].stock = newStock;

    await getEngine().commitData('products', products);
    window.showToast(`تم تحديث كمية (${products[idx].name}): ${newStock} ${products[idx].unit || 'قطعة'}`, 'success');
  };

  // Open Add / Edit Product Modal (Admin restricted)
  window.openProductModal = function(prodId) {
    const data = getData();
    const products = data.products || window.DEFAULT_PRODUCTS || [];
    const existing = prodId ? products.find(p => p.id === prodId) : null;
    const modalContainer = document.getElementById('modal-container');

    const standardCategories = ['أريل', 'كابلات', 'ريمونت', 'فيش', 'اجهزة جديدة', 'اجهزة مستعملة'];
    const customCategories = Array.from(new Set(products.map(p => p.category))).filter(c => c && !standardCategories.includes(c));
    const categoriesList = [...standardCategories, ...customCategories];

    modalContainer.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3>${existing ? 'تعديل بيانات المنتج والمخزن' : 'إضافة منتج جديد للمخزن'}</h3>
            <button class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="product-form">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>اسم المنتج *</label>
                  <input type="text" id="pf-name" required placeholder="مثال: ريمونت شامل، أريل خارجي..." value="${escapeHtml(existing?.name || '')}">
                </div>
                <div class="form-group">
                  <label>رمز / كود المنتج *</label>
                  <input type="text" id="pf-code" required placeholder="مثال: ANT-01, RMT-02" value="${escapeHtml(existing?.code || '')}" style="font-family: monospace;">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>فئة المنتج *</label>
                  <div style="display: flex; gap: 8px;">
                    <select id="pf-category" onchange="const c = document.getElementById('pf-custom-cat'); if(this.value==='__custom__'){ c.style.display='block'; c.focus(); } else { c.style.display='none'; }">
                      ${categoriesList.map(cat => `
                        <option value="${escapeHtml(cat)}" ${existing?.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>
                      `).join('')}
                      <option value="__custom__">➕ فئة جديدة مخصصة...</option>
                    </select>
                  </div>
                  <input type="text" id="pf-custom-cat" placeholder="أدخل اسم الفئة الجديدة..." style="display: none; margin-top: 8px;">
                </div>
                <div class="form-group">
                  <label>وحدة القياس</label>
                  <input type="text" id="pf-unit" placeholder="قطعة، جهاز، بكرة، كيس..." value="${escapeHtml(existing?.unit || 'قطعة')}">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>سعر القطعة المفرد (د.ع) *</label>
                  <input type="number" id="pf-price" required min="0" step="500" placeholder="مثال: 15000" value="${existing ? existing.price : ''}" style="font-weight: 700; color: var(--green);">
                  <span class="form-help">السعر المعروض للبيع المفرد بالدينار العراقي</span>
                </div>
                <div class="form-group">
                  <label>الكمية المتوفرة في المخزن *</label>
                  <input type="number" id="pf-stock" required min="0" step="1" placeholder="مثال: 50" value="${existing ? existing.stock : ''}" style="font-weight: 700;">
                  <span class="form-help">الرصيد الفعلي المتوفر في المخزن الرئيسي</span>
                </div>
              </div>

              <div class="form-group">
                <label>رابط صورة المنتج (اختياري)</label>
                <input type="url" id="pf-image" placeholder="https://example.com/image.jpg" value="${escapeHtml(existing?.image || '')}">
                <div style="display: flex; gap: 6px; align-items: center; margin-top: 6px; flex-wrap: wrap;">
                  <span style="font-size: 0.75rem; color: var(--muted);">أو اختر نموذجاً سريعاً:</span>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('pf-image').value='https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'" style="font-size: 0.72rem; padding: 2px 6px;">📡 أريل</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('pf-image').value='https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80'" style="font-size: 0.72rem; padding: 2px 6px;">🔌 كابل</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('pf-image').value='https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=400&q=80'" style="font-size: 0.72rem; padding: 2px 6px;">📱 ريمونت</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('pf-image').value='https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80'" style="font-size: 0.72rem; padding: 2px 6px;">📦 جهاز</button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('pf-image').value=''" style="font-size: 0.72rem; padding: 2px 6px;">مسح الصورة</button>
                </div>
              </div>

              <div class="form-group">
                <label>مواصفات وملاحظات المنتج</label>
                <textarea id="pf-desc" rows="2" placeholder="وصف المنتج، الموديل، المواصفات الفنية...">${escapeHtml(existing?.description || '')}</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary">${existing ? 'حفظ التعديلات والمزامنة' : 'إضافة المنتج للمخزن'}</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('product-form').onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('pf-name').value.trim();
      const code = document.getElementById('pf-code').value.trim();
      const catSelect = document.getElementById('pf-category').value;
      const customCat = document.getElementById('pf-custom-cat').value.trim();
      const category = (catSelect === '__custom__' && customCat) ? customCat : catSelect;
      const unit = document.getElementById('pf-unit').value.trim() || 'قطعة';
      const price = Number(document.getElementById('pf-price').value) || 0;
      const stock = Number(document.getElementById('pf-stock').value) || 0;
      const image = document.getElementById('pf-image').value.trim();
      const description = document.getElementById('pf-desc').value.trim();

      const latestData = getData();
      let allProducts = [...(latestData.products || window.DEFAULT_PRODUCTS || [])];

      if (existing) {
        const pIdx = allProducts.findIndex(p => p.id === existing.id);
        if (pIdx !== -1) {
          allProducts[pIdx] = {
            ...allProducts[pIdx],
            name, code, category, unit, price, stock, image, description,
            updatedAt: new Date().toISOString()
          };
        }
        await getEngine().commitData('products', allProducts);
        window.showToast('تم تحديث بيانات المنتج والمخزن ومزامنتها بنجاح', 'success');
      } else {
        const newProd = {
          id: 'prod-' + Date.now(),
          name, code, category, unit, price, stock, image, description,
          createdAt: new Date().toISOString()
        };
        allProducts = [newProd, ...allProducts];
        await getEngine().commitData('products', allProducts);
        window.showToast('تمت إضافة المنتج الجديد للمخزن ومزامنته فوراً', 'success');
      }

      window.closeModal();
    };
  };

  // Delete product (Admin restricted)
  window.deleteProduct = function(prodId) {
    const data = getData();
    const products = data.products || window.DEFAULT_PRODUCTS || [];
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    window.showConfirmDialog('حذف المنتج', `هل تريد بالتأكيد حذف منتج (${prod.name}) من المخزن؟ سيتم حذفه من كافة الأجهزة.`, async () => {
      await getEngine().deleteItem('products', prodId);
      window.showToast(`تم حذف المنتج (${prod.name}) بنجاح`, 'success');
    });
  };

  // --- Page 8: Pricing (جدول الأسعار التفاعلي الديناميكي لجميع الوكلاء والمركز) ---
  window.renderPricing = function(container) {
    const data = getData();
    const agents = data.agents || [];
    const pricing = data.pricing || window.DEFAULT_PRICING || {};

    const hq = pricing.headquarters || {
      device: 50000,
      sub1: 25000,
      sub2: 50000,
      sub3: 75000,
      status: 'معتمدة'
    };

    const defAgent = pricing.agentDefault || pricing.agent || {
      device: 45000,
      sub1: 18000,
      sub2: 36000,
      sub3: 54000,
      status: 'معتمدة'
    };

    // Ensure agentPrices mapping exists
    if (!pricing.agentPrices) pricing.agentPrices = {};

    // Auto-populate any registered agent if missing in pricing table
    agents.forEach(ag => {
      if (!pricing.agentPrices[ag.id]) {
        pricing.agentPrices[ag.id] = {
          agentId: ag.id,
          agentName: ag.name,
          agentCode: ag.code,
          device: ag.price || defAgent.device || 45000,
          sub1: defAgent.sub1 || 18000,
          sub2: defAgent.sub2 || 36000,
          sub3: defAgent.sub3 || 54000,
          status: 'معتمدة'
        };
      } else {
        pricing.agentPrices[ag.id].agentName = ag.name;
        pricing.agentPrices[ag.id].agentCode = ag.code;
        if (!pricing.agentPrices[ag.id].status) pricing.agentPrices[ag.id].status = 'معتمدة';
      }
    });

    let approvedCount = 1; // HQ is always approved
    let draftCount = 0;
    agents.forEach(ag => {
      const ap = pricing.agentPrices[ag.id];
      if (ap && ap.status === 'معتمدة') approvedCount++;
      else draftCount++;
    });

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">جدول التسعير الرسمي الموحد</span>
            <h1>الأسعار والرسائل (جدول أسعار الوكلاء والمركز)</h1>
            <p class="subtitle">جدول تفاعلي شامل لتحديد أسعار الأجهزة وتجديد الاشتراكات لكل وكيل بشكل مستقل مع التثبيت الفوري في العمليات</p>
          </div>
          <div class="header-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="resetAllAgentsWholesale()">
              <span>🔄</span> <span>تطبيق أسعار الجملة للكل</span>
            </button>
            <button class="btn btn-primary" onclick="saveAllPricingTable()">
              <span>💾</span> <span>حفظ الأسعار</span>
            </button>
          </div>
        </div>

        <!-- Note Banner as requested -->
        <div class="content-card" style="margin-bottom: 20px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.28); padding: 14px 18px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 1.8rem;">💡</span>
          <div style="font-size: 0.93rem; color: var(--text); line-height: 1.6;">
            <strong style="color: #2563eb; display: block; margin-bottom: 2px; font-size: 1rem;">ملاحظة هامة حول تثبيت الأسعار:</strong>
            حفظ الأسعار لا يغيّر أي سعر محفوظ في عمليات سابقة - السعر الجديد يثبت داخل العملية الجديدة فقط من لحظة الحفظ.
          </div>
        </div>

        <!-- Summary Stats Grid -->
        <div class="stat-grid" style="margin-bottom: 20px;">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي جهات البيع</span><div class="stat-icon">🏢</div></div>
            <div class="stat-value-group"><span class="stat-value">${agents.length + 1}</span><span class="stat-unit">جهة</span></div>
            <div class="stat-footer"><span>المركز الرئيسي + ${agents.length} وكيل</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">الأسعار المعتمدة</span><div class="stat-icon">🟢</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--success);">${approvedCount}</span><span class="stat-unit">جهة معتمدة</span></div>
            <div class="stat-footer"><span>تُطبق فوراً عند إنشاء البيع</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">الأسعار المسودة</span><div class="stat-icon">🟡</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--warning);">${draftCount}</span><span class="stat-unit">مسودة</span></div>
            <div class="stat-footer"><span>لم تُعتمد بعد للبيع</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">سعر جهاز المركز (المرجع)</span><div class="stat-icon">📡</div></div>
            <div class="stat-value-group"><span class="stat-value">${formatNumber(hq.device || 50000)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>سعر البيع المباشر للمشترك</span></div>
          </div>
        </div>

        <!-- Interactive Dynamic Pricing Table -->
        <div class="content-card" style="padding: 0; overflow: hidden;">
          <div class="card-header-bar" style="padding: 16px 20px; border-bottom: 1px solid var(--line); margin-bottom: 0;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">📊</span>
              <h3 style="margin: 0;">جدول الأسعار التفاعلي لكافة الوكلاء والمركز الرئيسي (Inline Editing)</h3>
            </div>
            <small style="color: var(--muted);">يمكن تعديل أي حقل سعر مباشرة داخل الجدول ثم الضغط على "حفظ الأسعار"</small>
          </div>

          <div class="pricing-table-container">
            <table class="pricing-data-table">
              <thead>
                <tr>
                  <th>الجهة / الوكيل</th>
                  <th>جهاز جديد (د.ع)</th>
                  <th>شهر (د.ع)</th>
                  <th>شهرين (د.ع)</th>
                  <th>3 أشهر (د.ع)</th>
                  <th>الحالة</th>
                  <th style="text-align: center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <!-- 1. Headquarters Row (المركز الرئيسي - السعر المرجعي الأساسي) -->
                <tr class="tr-headquarters">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.3rem;">🏢</span>
                      <div>
                        <strong style="color: var(--green); display: block; font-size: 0.95rem;">المركز الرئيسي</strong>
                        <span class="badge badge-success" style="font-size: 0.72rem; padding: 2px 6px;">السعر المرجعي الأساسي</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input type="text" inputmode="numeric" class="inline-price-input" id="p-hq-device" value="${formatNumber(hq.device || 50000)}" oninput="formatInputWithCommas(this)" title="سعر الجهاز الجديد بالمركز">
                  </td>
                  <td>
                    <input type="text" inputmode="numeric" class="inline-price-input" id="p-hq-sub1" value="${formatNumber(hq.sub1 || 25000)}" oninput="formatInputWithCommas(this)" title="اشتراك شهر واحد بالمركز">
                  </td>
                  <td>
                    <input type="text" inputmode="numeric" class="inline-price-input" id="p-hq-sub2" value="${formatNumber(hq.sub2 || 50000)}" oninput="formatInputWithCommas(this)" title="اشتراك شهرين بالمركز">
                  </td>
                  <td>
                    <input type="text" inputmode="numeric" class="inline-price-input" id="p-hq-sub3" value="${formatNumber(hq.sub3 || 75000)}" oninput="formatInputWithCommas(this)" title="اشتراك 3 أشهر بالمركز">
                  </td>
                  <td>
                    <span class="badge badge-success" style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; font-size: 0.85rem;">
                      <span>🟢</span> <span>معتمدة (المرجع)</span>
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="resetHQToDefault()" style="font-size: 0.75rem; padding: 4px 8px;" title="استعادة أسعار المركز الافتراضية">
                      🔄 استعادة
                    </button>
                  </td>
                </tr>

                <!-- 2. Agents Rows (جميع الوكلاء المسجلين في النظام) -->
                ${agents.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; color: var(--muted); padding: 30px;">
                      لا يوجد وكلاء مسجلون حالياً. عند إضافة وكيل جديد من صفحة الوكلاء سيظهر هنا تلقائياً.
                    </td>
                  </tr>
                ` : agents.map((ag, idx) => {
                  const ap = pricing.agentPrices[ag.id] || {
                    device: ag.price || defAgent.device || 45000,
                    sub1: defAgent.sub1 || 18000,
                    sub2: defAgent.sub2 || 36000,
                    sub3: defAgent.sub3 || 54000,
                    status: 'معتمدة'
                  };
                  const isApproved = ap.status === 'معتمدة';

                  return `
                    <tr id="row-agent-${ag.id}">
                      <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; background: var(--surface-alt); border: 1px solid var(--line);">
                            #${idx + 1}
                          </div>
                          <div>
                            <strong style="display: block; font-size: 0.92rem;">${escapeHtml(ag.name)}</strong>
                            <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                              <span class="badge badge-neutral" style="font-family: monospace; font-size: 0.72rem; padding: 1px 5px;">${escapeHtml(ag.code || 'AG')}</span>
                              <span style="color: var(--muted); font-size: 0.75rem;">${escapeHtml(ag.phone || '')}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <input type="text" inputmode="numeric" class="inline-price-input" id="price-${ag.id}-device" value="${formatNumber(ap.device || 45000)}" oninput="formatInputWithCommas(this)">
                      </td>
                      <td>
                        <input type="text" inputmode="numeric" class="inline-price-input" id="price-${ag.id}-sub1" value="${formatNumber(ap.sub1 || 18000)}" oninput="formatInputWithCommas(this)">
                      </td>
                      <td>
                        <input type="text" inputmode="numeric" class="inline-price-input" id="price-${ag.id}-sub2" value="${formatNumber(ap.sub2 || 36000)}" oninput="formatInputWithCommas(this)">
                      </td>
                      <td>
                        <input type="text" inputmode="numeric" class="inline-price-input" id="price-${ag.id}-sub3" value="${formatNumber(ap.sub3 || 54000)}" oninput="formatInputWithCommas(this)">
                      </td>
                      <td>
                        <select class="status-badge-select ${isApproved ? 'approved' : 'draft'}" id="status-${ag.id}" onchange="this.className = 'status-badge-select ' + (this.value === 'معتمدة' ? 'approved' : 'draft')">
                          <option value="معتمدة" ${isApproved ? 'selected' : ''}>🟢 معتمدة (تُطبق في البيع)</option>
                          <option value="مسودة" ${!isApproved ? 'selected' : ''}>🟡 مسودة (لم تُعتمد)</option>
                        </select>
                      </td>
                      <td style="text-align: center;">
                        <div style="display: flex; gap: 4px; justify-content: center;">
                          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 7px;" onclick="copyHQToAgent('${ag.id}')" title="نسخ أسعار المركز لهذا الوكيل">
                            🏢 المركز
                          </button>
                          <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.72rem; padding: 4px 7px;" onclick="resetAgentToWholesale('${ag.id}')" title="استعادة أسعار الجملة القياسية">
                            🔄 جملة
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding: 16px 20px; background: var(--surface-alt); border-top: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="font-size: 0.85rem; color: var(--muted); display: flex; align-items: center; gap: 6px;">
              <span>ℹ️</span>
              <span>الأسعار بالدينار العراقي (د.ع). الوكيل الذي حالته "معتمدة" تُطبق أسعاره تلقائياً، والوكيل "مسودة" يُطبق أسعار الجملة الافتراضية.</span>
            </div>
            <button class="btn btn-primary" onclick="saveAllPricingTable()">
              <span>💾</span> <span>حفظ وتثبيت الأسعار لكافة الوكلاء والمركز</span>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  window.saveAllPricingTable = async function() {
    const data = getData();
    const agents = data.agents || [];

    const hqPrices = {
      device: parseNumber(document.getElementById('p-hq-device')?.value) || 50000,
      sub1: parseNumber(document.getElementById('p-hq-sub1')?.value) || 25000,
      sub2: parseNumber(document.getElementById('p-hq-sub2')?.value) || 50000,
      sub3: parseNumber(document.getElementById('p-hq-sub3')?.value) || 75000,
      status: 'معتمدة'
    };

    const updatedAgentPrices = {};
    agents.forEach(ag => {
      const dev = parseNumber(document.getElementById(`price-${ag.id}-device`)?.value) || 45000;
      const s1 = parseNumber(document.getElementById(`price-${ag.id}-sub1`)?.value) || 18000;
      const s2 = parseNumber(document.getElementById(`price-${ag.id}-sub2`)?.value) || 36000;
      const s3 = parseNumber(document.getElementById(`price-${ag.id}-sub3`)?.value) || 54000;
      const st = document.getElementById(`status-${ag.id}`)?.value || 'معتمدة';

      updatedAgentPrices[ag.id] = {
        agentId: ag.id,
        agentName: ag.name,
        agentCode: ag.code,
        device: dev,
        sub1: s1,
        sub2: s2,
        sub3: s3,
        status: st
      };
    });

    const newPricing = {
      headquarters: hqPrices,
      agentDefault: {
        device: 45000,
        sub1: 18000,
        sub2: 36000,
        sub3: 54000,
        status: 'معتمدة'
      },
      agent: {
        device: 45000,
        sub1: 18000,
        sub2: 36000,
        sub3: 54000
      },
      agentPrices: updatedAgentPrices,
      updatedAt: new Date().toISOString()
    };

    await getEngine().commitData('pricing', newPricing);
    window.showToast('تم حفظ واعتماد جدول الأسعار بنجاح! الأسعار الجديدة معتمدة للعمليات القادمة', 'success');
  };

  window.savePricingSettings = window.saveAllPricingTable;

  window.copyHQToAgent = function(agentId) {
    const dev = document.getElementById('p-hq-device')?.value || '50,000';
    const s1 = document.getElementById('p-hq-sub1')?.value || '25,000';
    const s2 = document.getElementById('p-hq-sub2')?.value || '50,000';
    const s3 = document.getElementById('p-hq-sub3')?.value || '75,000';

    const elDev = document.getElementById(`price-${agentId}-device`);
    const elS1 = document.getElementById(`price-${agentId}-sub1`);
    const elS2 = document.getElementById(`price-${agentId}-sub2`);
    const elS3 = document.getElementById(`price-${agentId}-sub3`);

    if (elDev) elDev.value = dev;
    if (elS1) elS1.value = s1;
    if (elS2) elS2.value = s2;
    if (elS3) elS3.value = s3;

    window.showToast('تم نسخ أسعار المركز لهذا الوكيل، انقر "حفظ الأسعار" للتثبيت', 'info');
  };

  window.resetAgentToWholesale = function(agentId) {
    const elDev = document.getElementById(`price-${agentId}-device`);
    const elS1 = document.getElementById(`price-${agentId}-sub1`);
    const elS2 = document.getElementById(`price-${agentId}-sub2`);
    const elS3 = document.getElementById(`price-${agentId}-sub3`);

    if (elDev) elDev.value = '45,000';
    if (elS1) elS1.value = '18,000';
    if (elS2) elS2.value = '36,000';
    if (elS3) elS3.value = '54,000';

    window.showToast('تم استعادة أسعار الجملة القياسية لهذا الوكيل', 'info');
  };

  window.resetAllAgentsWholesale = function() {
    const data = getData();
    const agents = data.agents || [];
    agents.forEach(ag => {
      window.resetAgentToWholesale(ag.id);
    });
    window.showToast('تم تطبيق أسعار الجملة الافتراضية لكافة الوكلاء، انقر "حفظ الأسعار" لتثبيتها', 'info');
  };

  window.resetHQToDefault = function() {
    const elDev = document.getElementById('p-hq-device');
    const elS1 = document.getElementById('p-hq-sub1');
    const elS2 = document.getElementById('p-hq-sub2');
    const elS3 = document.getElementById('p-hq-sub3');

    if (elDev) elDev.value = '50,000';
    if (elS1) elS1.value = '25,000';
    if (elS2) elS2.value = '50,000';
    if (elS3) elS3.value = '75,000';

    window.showToast('تم استعادة أسعار المركز الافتراضية', 'info');
  };

  // --- Page 9: Users ---
  window.renderUsers = function(container) {
    const data = getData();
    const users = data.users || [];
    const currentUser = getEngine().currentUser;
    const isMainAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'أدمن' || currentUser.role === 'مدير رئيسي');
    
    // Filter to only show relevant users
    const filteredUsers = users.filter(u => u.username === 'admin' || u.username === 'abodsari' || u.role === 'agent');

    const adminUsers = filteredUsers.filter(u => u.role === 'admin' || u.role === 'أدمن' || u.role === 'مدير رئيسي' || u.username === 'admin' || u.username === 'abodsari');

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">إدارة الحسابات والأدوار</span>
            <h1>المستخدمون وصلاحيات النظام</h1>
            <p class="subtitle">حسابات الدخول للأدمن وربطها مع Firebase Auth</p>
          </div>
        </div>

        <div class="content-card" style="margin-bottom: 24px;">
          <div class="card-header-bar">
            <h3>🛡️ جدول الأدمن والمدراء</h3>
            <span class="badge badge-primary">${adminUsers.length} حساب</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>المستخدم</th>
                  <th>اسم الحساب (Username)</th>
                  <th>الدور / الصلاحية</th>
                  <th>رمز الوكيل</th>
                  <th>كلمة المرور</th>
                </tr>
              </thead>
              <tbody>
                ${adminUsers.map((u) => `
                  <tr>
                    <td>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem;">
                          ${(u.displayName || u.username).substring(0, 1)}
                        </div>
                        <strong>${escapeHtml(u.displayName || u.username)}</strong>
                      </div>
                    </td>
                    <td><span style="font-family: monospace; font-size: 0.9rem;">${escapeHtml(u.username)}</span></td>
                    <td>
                      <span class="badge badge-primary">مدير رئيسي</span>
                    </td>
                    <td>${escapeHtml(u.agentCode || '-')}</td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span id="pass-${u.uid}" style="color: var(--muted); font-size: 0.85rem;">••••••••</span>
                        <button class="icon-btn" onclick="togglePasswordVisibility('${u.uid}', '${escapeHtml(u.password || '')}')" title="عرض/إخفاء كلمة المرور">👁️</button>
                        <button class="icon-btn" onclick="openUserModal('${u.uid}')" title="تعديل الحساب">✏️</button>
                        ${u.username !== 'admin' ? `<button class="icon-btn btn-del" onclick="deleteUser('${u.uid}')" title="حذف الحساب">🗑️</button>` : ''}
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

  window.openUserModal = function(uid) {
    const data = getData();
    const users = data.users || [];
    const agents = data.agents || [];
    const existing = uid ? users.find(u => u.uid === uid) : null;
    const modalContainer = document.getElementById('modal-container');

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${existing ? 'تعديل بيانات الحساب' : 'إضافة حساب جديد'}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="user-mgmt-form">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>اسم المستخدم (Username) *</label>
                  <input type="text" id="u-username" required placeholder="3-40 حرف..." value="${escapeHtml(existing?.username || '')}">
                  <span class="form-help">حروف إنجليزية وأرقام ونقاط فقط</span>
                </div>
                <div class="form-group">
                  <label>الاسم الظاهر الكامل *</label>
                  <input type="text" id="u-display" required value="${escapeHtml(existing?.displayName || '')}">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>نوع الصلاحية *</label>
                  <select id="u-role" onchange="toggleAgentUserFields(this.value)">
                    <option value="agent" ${existing?.role === 'agent' ? 'selected' : ''}>وكيل</option>
                    <option value="admin" ${existing?.role === 'admin' ? 'selected' : ''}>مدير رئيسي (أدمن)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>كلمة المرور ${existing ? '(اتركها فارغة لعدم التغيير)' : '*'}</label>
                  <input type="password" id="u-pass" placeholder="6 أحرف على الأقل..." ${existing ? '' : 'required'}>
                </div>
              </div>

              <div id="u-agent-extra" class="form-group" style="${existing?.role === 'admin' ? 'display: none;' : 'display: block;'}">
                <label>رمز الوكيل (Agent Code) *</label>
                <input type="text" id="u-agent-code" placeholder="مثال: AG-001" value="${escapeHtml(existing?.agentCode || '')}">
                <span class="form-help">أدخل كود أو رمز الوكيل يدوياً</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary">حفظ الحساب</button>
            </div>
          </form>
        </div>
      </div>
    `;

    window.toggleAgentUserFields = function(role) {
      const extra = document.getElementById('u-agent-extra');
      if (extra) extra.style.display = role === 'admin' ? 'none' : 'block';
    };

    document.getElementById('user-mgmt-form').onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById('u-username').value.trim().toLowerCase();
      const displayName = document.getElementById('u-display').value.trim();
      const role = document.getElementById('u-role').value;
      const password = document.getElementById('u-pass').value.trim();
      const agentCode = role === 'agent' ? document.getElementById('u-agent-code').value.trim() : '';
      const agentName = role === 'agent' ? displayName : '';

      const users = data.users || [];
      const agents = data.agents || [];

      let userObj;
      if (existing) {
        existing.username = username;
        existing.displayName = displayName;
        existing.role = role;
        existing.agentName = agentName;
        existing.agentCode = agentCode;
        if (password) {
          existing.password = password;
        }
        userObj = existing;
      } else {
        const newUid = 'u-' + Date.now();
        userObj = {
          id: newUid,
          uid: newUid,
          username,
          displayName,
          role,
          agentName,
          agentCode,
          password: password || 'agent123'
        };
        users.push(userObj);
      }

      // Sync with agents collection if role === agent
      if (role === 'agent') {
        const existingAgentIndex = agents.findIndex(a => a.id === userObj.uid || a.code === agentCode || a.username === username);
        if (existingAgentIndex >= 0) {
          agents[existingAgentIndex].name = displayName;
          agents[existingAgentIndex].code = agentCode || agents[existingAgentIndex].code;
          agents[existingAgentIndex].username = username;
          if (password) agents[existingAgentIndex].password = password;
        } else {
          agents.push({
            id: userObj.uid,
            name: displayName,
            code: agentCode || 'AG-' + Math.floor(100 + Math.random() * 900),
            phone: '',
            price: 45000,
            username,
            password: password || userObj.password || 'agent123',
            createdAt: new Date().toISOString()
          });
        }
        try {
          await getEngine().commitData('agents', agents);
        } catch (err) {
          console.warn('Failed to sync agent:', err);
        }
      }

      try {
        await getEngine().commitData('users', users);
        if (role === 'agent') {
          await getEngine().saveAgentCredentials(userObj.uid, username, password || userObj.password, { name: displayName, code: agentCode });
        }
        window.showToast('تم حفظ الحساب وتحديث البيانات الرئيسية بنجاح', 'success');
        window.closeModal();
        if (typeof window.renderUsers === 'function') {
          const mainEl = document.getElementById('main-content');
          if (mainEl) window.renderUsers(mainEl);
        }
      } catch (err) {
        console.error('Failed to save user:', err);
        window.showToast('حدث خطأ أثناء حفظ الحساب في القاعدة الرئيسية', 'error');
      }
    };
  };

  window.deleteUser = function(uid) {
    window.showConfirmModal('حذف الحساب', 'هل تريد حذف حساب المستخدم هذا نهائياً؟', async () => {
      await getEngine().deleteItem('users', uid);
      window.showToast('تم حذف الحساب', 'success');
      if (typeof window.renderUsers === 'function') {
        const mainEl = document.getElementById('main-content');
        if (mainEl) window.renderUsers(mainEl);
      }
    }, 'حذف الحساب', 'إلغاء', true);
  };

  window.activateLegacyAccounts = function() {
    const tempPass = prompt('أدخل كلمة المرور المؤقتة لتفعيل الحسابات القديمة (على الأقل 6 خانات):', 'sari123456');
    if (!tempPass || tempPass.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 خانات على الأقل');
      return;
    }
    window.showToast('تم تفعيل الحسابات القديمة بكلمة المرور المؤقتة المحددة', 'success');
  };

  // --- Agent Dashboard (role === 'agent') ---
  let agentFilter = { status: 'all', search: '' };

  window.setAgentFilter = function(key, val) {
    agentFilter[key] = val;
    const mainEl = document.getElementById('main-content');
    if (mainEl) window.renderAgentDashboard(mainEl);
  };

  window.onAgentSearchInput = function(val) {
    agentFilter.search = (val || '').trim().toLowerCase();
    // Re-filter and update without destroying focus if element exists
    const searchBox = document.getElementById('agent-search-input');
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      window.renderAgentDashboard(mainEl);
      const newSearchBox = document.getElementById('agent-search-input');
      if (newSearchBox) {
        newSearchBox.focus();
        newSearchBox.setSelectionRange(newSearchBox.value.length, newSearchBox.value.length);
      }
    }
  };

  window.isAgentRecord = function(record, user) {
    if (!record || !user) return false;
    const agentName = user.agentName || user.displayName || '';
    const agentCode = user.agentCode || '';
    const uid = user.uid || '';
    const username = (user.username || '').toLowerCase();

    if (record.submittedBy && uid && record.submittedBy === uid) return true;
    if (record.agentCode && agentCode && record.agentCode === agentCode) return true;
    if (record.seller && (record.seller === agentName || (username && record.seller.toLowerCase() === username))) return true;
    if (record.agentName && (record.agentName === agentName || (username && record.agentName.toLowerCase() === username))) return true;
    if (record.owner && (record.owner === agentName || record.owner === agentCode || (username && record.owner.toLowerCase() === username))) return true;

    if (window.resolveAgentName) {
      const resolved = window.resolveAgentName(record);
      if (resolved && agentName && resolved === agentName) return true;
    }

    return false;
  };

  window.renderAgentDashboard = function(container) {
    const user = getEngine().currentUser;
    const data = getData();
    const agentName = user.agentName || user.displayName;
    const today = new Date().toISOString().substring(0, 10);

    const allMySales = (data.sales || []).filter(s => window.isAgentRecord(s, user));
    const myDebts = (data.debts || []).filter(d => window.isAgentRecord(d, user) && d.remainingAmount > 0);
    const mySubmissions = (data.agentSubmissions || []).filter(s => window.isAgentRecord(s, user));
    const allMySubscribers = (data.subscribers || []).filter(s => window.isAgentRecord(s, user));

    // Apply agent filters
    let filteredSales = allMySales.map(s => {
      const isActive = s.endDate && s.endDate >= today;
      return { ...s, activeStatus: isActive ? 'فعال' : 'غير فعال' };
    });

    if (agentFilter.status !== 'all') {
      filteredSales = filteredSales.filter(s => s.activeStatus === agentFilter.status);
    }

    if (agentFilter.search) {
      const qRaw = agentFilter.search.trim();
      const qNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(qRaw) : qRaw.toLowerCase();
      const qDigits = qRaw.replace(/\D/g, '');

      filteredSales = filteredSales.filter(s => {
        const cNameNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(s.customerName || '') : (s.customerName || '').toLowerCase();
        const phoneClean = (s.customerPhone || '').replace(/\D/g, '');
        const devClean = (s.deviceNumber || '').replace(/\D/g, '');
        const devRaw = (s.deviceNumber || '').toLowerCase();

        return cNameNorm.includes(qNorm) ||
               (qDigits && (phoneClean.includes(qDigits) || devClean.includes(qDigits))) ||
               devRaw.includes(qRaw.toLowerCase()) ||
               (s.customerPhone || '').includes(qRaw);
      });
    }

    // Filter subscribers
    let filteredSubs = allMySubscribers.map(s => {
      const isActive = s.expiryDate && s.activationDate && s.activationDate <= today && today <= s.expiryDate;
      return { ...s, activeStatus: isActive ? 'فعال' : 'غير فعال' };
    });
    if (agentFilter.status !== 'all') {
      filteredSubs = filteredSubs.filter(s => s.activeStatus === agentFilter.status);
    }
    if (agentFilter.search) {
      const qRaw = agentFilter.search.trim();
      const qNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(qRaw) : qRaw.toLowerCase();
      const qDigits = qRaw.replace(/\D/g, '');

      filteredSubs = filteredSubs.filter(s => {
        const nameNorm = window.normalizeSearchQuery ? window.normalizeSearchQuery(s.name || '') : (s.name || '').toLowerCase();
        const phoneClean = (s.phone || '').replace(/\D/g, '');
        const devClean = (s.deviceNumber || '').replace(/\D/g, '');
        const devRaw = (s.deviceNumber || '').toLowerCase();

        return nameNorm.includes(qNorm) ||
               (qDigits && (phoneClean.includes(qDigits) || devClean.includes(qDigits))) ||
               devRaw.includes(qRaw.toLowerCase()) ||
               (s.phone || '').includes(qRaw);
      });
    }

    const totalSold = allMySales.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const totalDue = myDebts.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0);
    const totalPaid = allMySales.reduce((sum, s) => sum + (Number(s.agentPaid) || (s.paymentStatus === 'تم التسديد' ? Number(s.price) : 0)), 0);

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">أهلاً بك، الوكيل المعتمد</span>
            <h1>${escapeHtml(agentName)}</h1>
            <p class="subtitle">رمز الوكيل: ${escapeHtml(user.agentCode || 'AG')} | إدارة مبيعات الأجهزة والاشتراكات الميدانية</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-primary" onclick="openAgentSaleModal('جهاز جديد')">
              <span>📦</span> <span>بيع جهاز جديد</span>
            </button>
            <button class="btn btn-secondary" onclick="openAgentSaleModal('تجديد اشتراك')">
              <span>🔄</span> <span>تجديد اشتراك</span>
            </button>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">إجمالي المبيعات</span><div class="stat-icon">💰</div></div>
            <div class="stat-value-group"><span class="stat-value">${formatNumber(totalSold)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>عدد العمليات: ${allMySales.length}</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">المبالغ المسددة</span><div class="stat-icon">✅</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--success);">${formatNumber(totalPaid)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>الدفعات المستلمة</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">الديون المستحقة عليك</span><div class="stat-icon">⏳</div></div>
            <div class="stat-value-group"><span class="stat-value" style="color: var(--danger);">${formatNumber(totalDue)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>المتبقي للإدارة</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">طلبات بانتظار الاعتماد</span><div class="stat-icon">🔔</div></div>
            <div class="stat-value-group"><span class="stat-value">${mySubmissions.length}</span><span class="stat-unit">طلب</span></div>
            <div class="stat-footer"><span>قيد مراجعة الأدمن</span></div>
          </div>
        </div>

        <!-- Pending Submissions for this Agent -->
        ${mySubmissions.length > 0 ? `
          <div class="content-card" style="border: 2px solid var(--warning); background: var(--warning-bg); margin-bottom: 24px;">
            <div class="card-header-bar">
              <h3 style="color: var(--warning);">طلباتك المرسلة بانتظار اعتماد الأدمن (${mySubmissions.length})</h3>
            </div>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>الزبون</th>
                    <th>رقم الجهاز</th>
                    <th>نوع الاشتراك</th>
                    <th>فترة الاشتراك</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  ${mySubmissions.map(req => `
                    <tr>
                      <td><strong class="cell-title">${escapeHtml(req.customerName)}</strong></td>
                      <td style="font-family: monospace; font-size: 0.84rem;"><span style="cursor: pointer; color: var(--green); text-decoration: underline; font-weight: 700;" onclick="showDeviceBarcodeModal('${escapeHtml(req.deviceNumber)}')" title="انقر لعرض QR Code">${escapeHtml(req.deviceNumber)}</span></td>
                      <td>${escapeHtml(req.subscriptionType)}</td>
                      <td>
                        <div class="cell-date-range" style="direction: ltr;">
                          <span class="cell-date-from">بدء: ${escapeHtml(req.startDate || '-')}</span>
                          <span class="cell-date-to">انتهاء: ${escapeHtml(req.endDate || '-')}</span>
                        </div>
                      </td>
                      <td><strong>${formatIQD(req.price)}</strong></td>
                      <td><span class="badge badge-warning" style="display: inline-flex; align-items: center; gap: 4px;"><span>⏳</span> <span>قيد الاعتماد</span></span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- Filter Bar: Search by Name & Customer Status Filter -->
        <div class="content-card" style="margin-bottom: 24px;">
          <div class="card-header-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <h3>سجل عملياتك ومبيعاتك للزبائن</h3>
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <!-- Status Filter: All, Active, Inactive -->
              <div class="filter-chips">
                <span style="font-size: 0.85rem; font-weight: 600; color: var(--muted); margin-left: 4px;">حالة الزبون:</span>
                <span class="chip ${agentFilter.status === 'all' ? 'active' : ''}" onclick="setAgentFilter('status', 'all')">الكل</span>
                <span class="chip ${agentFilter.status === 'فعال' ? 'active' : ''}" onclick="setAgentFilter('status', 'فعال')">🟢 فعال</span>
                <span class="chip ${agentFilter.status === 'غير فعال' ? 'active' : ''}" onclick="setAgentFilter('status', 'غير فعال')">🔴 غير فعال</span>
              </div>
              <!-- Search Input: Search subscribers/customers by name -->
              <div class="search-box" style="position: relative; display: flex; align-items: center;">
                <span class="search-icon">🔍</span>
                <input type="text" id="agent-search-input" placeholder="بحث باسم المشترك، الهاتف، الجهاز..." value="${escapeHtml(agentFilter.search)}" oninput="onAgentSearchInput(this.value)">
                ${agentFilter.search ? `<button type="button" onclick="onAgentSearchInput('')" style="position: absolute; left: 10px; background: none; border: none; cursor: pointer; color: var(--muted); font-size: 0.9rem; padding: 2px 6px;" title="إلغاء البحث">✕</button>` : ''}
              </div>
            </div>
          </div>

          <!-- Agent's Sales History Table with Subscription Start & End Dates -->
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الفاتورة / الزبون</th>
                  <th>الجهاز / نوع العملية</th>
                  <th>فترة الاشتراك</th>
                  <th>حالة الاشتراك</th>
                  <th>المبلغ والدفع</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSales.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 30px;">لا توجد عمليات تطابق البحث أو الفلتر المحدد</td></tr>` : 
                  filteredSales.map(s => `
                    <tr>
                      <td>
                        <strong style="color: var(--green); font-size: 0.85rem;">${escapeHtml(s.code)}</strong>
                        <div class="cell-title">${escapeHtml(s.customerName)}</div>
                        <div class="cell-subtitle" style="direction: ltr; text-align: right;">${escapeHtml(s.customerPhone || '-')}</div>
                      </td>
                      <td>
                        <div style="font-family: monospace; font-size: 0.84rem;">
                          <span style="cursor: pointer; color: var(--green); text-decoration: underline; font-weight: 700;" onclick="showDeviceBarcodeModal('${escapeHtml(s.deviceNumber)}')" title="انقر لعرض QR Code">${escapeHtml(s.deviceNumber)}</span>
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
                        <span class="badge ${s.activeStatus === 'فعال' ? 'badge-success' : 'badge-danger'}">
                          ${escapeHtml(s.activeStatus)}
                        </span>
                      </td>
                      <td>
                        <strong class="cell-title">${formatIQD(s.price)}</strong>
                        <div style="margin-top: 2px;">
                          <span class="badge ${(s.paymentMethod === 'نقد' || s.paymentStatus === 'نقد' || s.paymentStatus === 'تم التسديد') ? 'badge-success' : 'badge-danger'}">
                            ${(s.paymentMethod === 'نقد' || s.paymentStatus === 'نقد') ? 'نقد' : ((s.paymentMethod === 'دين' || s.paymentStatus === 'دين') ? 'دين' : escapeHtml(s.paymentStatus || 'عليه دين'))}
                          </span>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Agent's Customers / Subscribers List -->
        <div class="content-card">
          <div class="card-header-bar">
            <h3>قائمة المشتركين والزبائن المسجلين لك (${filteredSubs.length})</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>المشترك / الهاتف</th>
                  <th>رقم الجهاز (16 خانة)</th>
                  <th>نوع البيع</th>
                  <th>فترة الاشتراك</th>
                  <th>حالة الاشتراك</th>
                  <th style="text-align: center;">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${filteredSubs.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 25px;">لا يوجد مشتركون مطابقون للبحث</td></tr>` : 
                  filteredSubs.map(sub => {
                    const isExpired = sub.activeStatus !== 'فعال';
                    return `
                    <tr>
                      <td>
                        <strong class="cell-title">${escapeHtml(sub.name)}</strong>
                        <div class="cell-subtitle" style="direction: ltr; text-align: right;">${escapeHtml(sub.phone || '-')}</div>
                      </td>
                      <td style="font-family: monospace; font-size: 0.84rem;"><span style="cursor: pointer; color: var(--green); text-decoration: underline; font-weight: 700;" onclick="showDeviceBarcodeModal('${escapeHtml(sub.deviceNumber)}')" title="انقر لعرض QR Code">${escapeHtml(sub.deviceNumber)}</span></td>
                      <td>${escapeHtml(sub.saleType || 'اشتراك')}</td>
                      <td>
                        <div class="cell-date-range" style="direction: ltr;">
                          <span class="cell-date-from">بدء: ${escapeHtml(sub.activationDate || '-')}</span>
                          <span class="cell-date-to">انتهاء: ${escapeHtml(sub.expiryDate || '-')}</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge ${sub.activeStatus === 'فعال' ? 'badge-success' : 'badge-danger'}">
                          ${escapeHtml(sub.activeStatus)}
                        </span>
                      </td>
                      <td style="text-align: center;">
                        ${isExpired ? `
                          <button class="btn btn-warning btn-sm" onclick="requestRenewal('${sub.id}')" style="font-size: 0.78rem; padding: 3px 8px;">
                            <span>🔄</span> تجديد
                          </button>
                        ` : ''}
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
  };

  window.renderAgentSales = function(container) {
    window.renderAgentDashboard(container);
  };

  // Agent Submit Sale Modal
  window.openAgentSaleModal = function(type) {
    const user = getEngine().currentUser;
    const agPricing = window.getAgentPricing ? window.getAgentPricing(user?.agentName || user?.displayName) : {};
    const defaultPrice = type === 'جهاز جديد' ? (agPricing.device || 45000) : (agPricing.sub1 || 18000);
    const modalContainer = document.getElementById('modal-container');
    const today = new Date().toISOString().substring(0, 10);
    const endDef = new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${type === 'جهاز جديد' ? 'طلب بيع جهاز جديد للزبون' : 'طلب تجديد اشتراك للزبون'}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="agent-sub-form">
            <div class="modal-body">
              <div class="form-group">
                <label>رقم الجهاز (16 رقم) *</label>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="as-device" required placeholder="16 خانة..." style="font-family: monospace;" oninput="onAgentDeviceInput(this.value)">
                  <button type="button" class="btn btn-secondary" onclick="openScannerModal((code) => { document.getElementById('as-device').value = code; onAgentDeviceInput(code); })">📷 مسح</button>
                </div>
              </div>

              <!-- Customer Name & Phone: Manually entered and NOT locked for New Device Sale -->
              <div class="form-row">
                <div class="form-group">
                  <label>اسم الزبون * ${type === 'جهاز جديد' ? '<span style="color: var(--green); font-size: 0.8rem; font-weight: normal;">(إدخال يدوي)</span>' : '<span style="color: var(--muted); font-size: 0.8rem; font-weight: normal;">(تلقائي/يدوي)</span>'}</label>
                  <input type="text" id="as-name" required placeholder="${type === 'جهاز جديد' ? 'أدخل اسم الزبون يدوياً...' : 'أدخل رقم الجهاز ليتم جلب اسم الزبون تلقائياً...'}" ${type !== 'جهاز جديد' ? 'readonly style="background: var(--surface-alt); cursor: not-allowed; font-weight: 600;"' : 'style="font-weight: 600;"'}>
                </div>
                <div class="form-group">
                  <label>رقم هاتف الزبون ${type === 'جهاز جديد' ? '<span style="color: var(--green); font-size: 0.8rem; font-weight: normal;">(إدخال يدوي)</span>' : ''}</label>
                  <input type="text" id="as-phone" placeholder="0770xxxxxxx" ${type !== 'جهاز جديد' ? 'readonly style="background: var(--surface-alt); cursor: not-allowed; font-weight: 600;"' : ''}>
                </div>
              </div>

              ${type === 'تجديد اشتراك' ? `
              <!-- Subscription Duration Selection (Automatically calculates End Date) -->
              <div class="form-row">
                <div class="form-group">
                  <label>فترة الاشتراك *</label>
                  <select id="as-sub" onchange="updateAgentSubPrice('${type}')">
                    <option value="اشتراك شهر واحد">اشتراك شهر واحد</option>
                    <option value="اشتراك شهرين">اشتراك شهرين</option>
                    <option value="اشتراك 3 أشهر">اشتراك 3 أشهر</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>المبلغ المتوقع (د.ع)</label>
                  <input type="text" id="as-price" value="${formatNumber(defaultPrice)}" readonly style="background: var(--surface-alt); font-weight: 700; color: var(--green);">
                </div>
              </div>

              <!-- Subscription Start & End Dates (Automatically calculated) -->
              <div class="form-row">
                <div class="form-group">
                  <label>تاريخ بدء الاشتراك *</label>
                  <input type="date" id="as-start" value="${today}" onchange="updateAgentSubPrice('${type}')" style="background: var(--surface); font-weight: 600;">
                </div>
                <div class="form-group">
                  <label>تاريخ انتهاء الاشتراك * <span style="font-size: 0.78rem; color: var(--muted);">(محسوب تلقائياً)</span></label>
                  <input type="date" id="as-end" value="${endDef}" readonly style="background: var(--surface-alt); cursor: not-allowed; font-weight: 600;">
                </div>
              </div>
              ` : `
              <!-- Price for New Device Sale -->
              <div class="form-group" style="margin-bottom: 12px;">
                <label>سعر الجهاز (د.ع) *</label>
                <input type="text" id="as-price" value="${formatNumber(defaultPrice)}" readonly style="background: var(--surface-alt); font-weight: 700; color: var(--green);">
              </div>
              `}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary">إرسال الطلب للاعتماد</button>
            </div>
          </form>
        </div>
      </div>
    `;

    window.onAgentDeviceInput = function(val) {
      // For New Device Sale: Customer Name and Phone Number must be entered manually by the agent (do not auto-fill or lock them)
      if (type === 'جهاز جديد') {
        const nameInput = document.getElementById('as-name');
        const phoneInput = document.getElementById('as-phone');
        if (nameInput) {
          nameInput.readOnly = false;
          nameInput.style.background = '';
          nameInput.style.cursor = '';
        }
        if (phoneInput) {
          phoneInput.readOnly = false;
          phoneInput.style.background = '';
          phoneInput.style.cursor = '';
        }
        return;
      }

      const cleanVal = (val || '').trim();
      if (!cleanVal || cleanVal.length < 5) return;
      const curData = getData();
      const subscribers = curData.subscribers || [];
      const sales = curData.sales || [];

      const foundSub = subscribers.find(s => s.deviceNumber === cleanVal);
      const foundSale = sales.find(s => s.deviceNumber === cleanVal);

      const nameInput = document.getElementById('as-name');
      const phoneInput = document.getElementById('as-phone');

      if (foundSub) {
        if (nameInput) {
          nameInput.value = foundSub.name || '';
          nameInput.readOnly = true;
          nameInput.style.background = 'var(--surface-alt)';
          nameInput.style.cursor = 'not-allowed';
        }
        if (phoneInput) {
          phoneInput.value = foundSub.phone || '';
          phoneInput.readOnly = true;
          phoneInput.style.background = 'var(--surface-alt)';
          phoneInput.style.cursor = 'not-allowed';
        }
      } else if (foundSale) {
        if (nameInput) {
          nameInput.value = foundSale.customerName || '';
          nameInput.readOnly = true;
          nameInput.style.background = 'var(--surface-alt)';
          nameInput.style.cursor = 'not-allowed';
        }
        if (phoneInput) {
          phoneInput.value = foundSale.customerPhone || '';
          phoneInput.readOnly = true;
          phoneInput.style.background = 'var(--surface-alt)';
          phoneInput.style.cursor = 'not-allowed';
        }
      }
    };

    window.updateAgentSubPrice = function(saleType) {
      const u = getEngine().currentUser;
      const agPr = window.getAgentPricing ? window.getAgentPricing(u?.agentName || u?.displayName) : {};
      let price = 45000;
      let months = 1;
      if (saleType === 'جهاز جديد') {
        price = agPr.device || 45000;
      } else {
        const subVal = document.getElementById('as-sub')?.value || 'اشتراك شهر واحد';
        if (subVal === 'اشتراك شهر واحد') { price = agPr.sub1 || 18000; months = 1; }
        else if (subVal === 'اشتراك شهرين') { price = agPr.sub2 || 36000; months = 2; }
        else if (subVal === 'اشتراك 3 أشهر') { price = agPr.sub3 || 54000; months = 3; }

        const start = document.getElementById('as-start')?.value || today;
        const endElem = document.getElementById('as-end');
        if (endElem && start) {
          if (typeof window.addMonthsToDate === 'function') {
            endElem.value = window.addMonthsToDate(start, months);
          } else {
            const parts = start.split('-').map(Number);
            const target = new Date(parts[0], parts[1] - 1 + months, parts[2]);
            if (target.getDate() !== parts[2]) target.setDate(0);
            endElem.value = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
          }
        }
      }
      const priceElem = document.getElementById('as-price');
      if (priceElem) priceElem.value = formatNumber(price);
    };

    window.updateAgentSubPrice(type);

    document.getElementById('agent-sub-form').onsubmit = async (e) => {
      e.preventDefault();
      const customerName = document.getElementById('as-name').value.trim();
      const customerPhone = document.getElementById('as-phone').value.trim();
      const deviceNumber = document.getElementById('as-device').value.trim();
      const isNewDev = type === 'جهاز جديد';
      const subscriptionType = isNewDev ? 'جهاز جديد' : (document.getElementById('as-sub')?.value || 'اشتراك شهر واحد');
      const price = parseNumber(document.getElementById('as-price').value) || defaultPrice;
      const startDate = isNewDev ? today : (document.getElementById('as-start')?.value || today);
      const endDate = isNewDev ? '-' : (document.getElementById('as-end')?.value || endDef);

      const latestData = getData();

      // Validation 1: Pending check
      const subs = latestData.agentSubmissions || [];
      const hasPending = subs.some(s => s.deviceNumber === deviceNumber);
      if (hasPending) {
        alert('هذا الجهاز لديه طلب معلق حالياً بانتظار اعتماد الأدمن!');
        return;
      }

      // Validation 2: Pre-assigned / allocated check in codes (non-blocking notification)
      const codes = latestData.codes || [];
      if (codes.length > 0) {
        const foundCode = codes.find(c => c.number === deviceNumber);
        if (!foundCode) {
          window.showToast('تنبيه: رقم الجهاز غير مسجل في الأكواد المسبقة، ولكن سيتم إرسال الطلب للأدمن للمراجعة', 'info');
        } else if (foundCode.assignedAgent && foundCode.assignedAgent !== user.agentName && foundCode.assignedAgent !== user.username) {
          window.showToast(`تنبيه: هذا الكود مخصص للوكيل (${foundCode.assignedAgent})، ولكن سيتم إرسال الطلب للأدمن للمراجعة`, 'info');
        }
      }

      // Validation 3: New device vs existing renewal check (non-blocking)
      if (type === 'جهاز جديد') {
        const isAlreadyRegistered = (latestData.subscribers || []).some(s => s.deviceNumber === deviceNumber);
        if (isAlreadyRegistered) {
          window.showToast('تنبيه: هذا الجهاز مسجل مسبقاً، سيتم إرسال طلب تجديده للأدمن للاعتماد', 'info');
        }
      } else {
        const isRegistered = (latestData.subscribers || []).some(s => s.deviceNumber === deviceNumber);
        if (!isRegistered) {
          window.showToast('تنبيه: هذا الجهاز غير مسجل كاشتراك سابق، سيتم إرسال الطلب للأدمن للاعتماد', 'info');
        }
      }

      try {
        await window.submitAgentSale({
          customerName,
          customerPhone,
          deviceNumber,
          subscriptionType,
          saleType: type,
          price,
          startDate,
          endDate
        });
      } catch (err) {
        console.error('Error submitting agent sale:', err);
      } finally {
        window.closeModal();
      }
    };
  };

})();
