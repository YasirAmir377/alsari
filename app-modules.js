/**
 * Application Modules: Agents, Debts, Subscribers, Barcodes, Reports, Pricing, Users, Agent Dashboard
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

  // --- Page 3: Agents ---
  window.renderAgents = function(container) {
    const data = getData();
    let agents = [...(data.agents || [])];
    const sales = data.sales || [];
    const debts = data.debts || [];
    const settlements = data.agentSettlements || [];
    const pricing = data.pricing || {};

    const agentSalesCount = sales.filter(s => s.seller !== 'المركز الرئيسي').length;
    const agentSalesTotal = sales.filter(s => s.seller !== 'المركز الرئيسي').reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    const hqDirectPrice = pricing.headquarters?.device || 50000;

    container.innerHTML = `
      <div class="page-view">
        <div class="page-header">
          <div class="header-text">
            <span class="greeting-small">شبكة الموزعين والوكلاء</span>
            <h1>إدارة الوكلاء والمبيعات الميدانية</h1>
            <p class="subtitle">متابعة حسابات الوكلاء، تسديد الديون التراكمية، وإصدار فواتير الأجهزة</p>
          </div>
          <div class="header-actions">
            <button class="btn btn-secondary" onclick="openAgentInvoiceModal('اشتراكات')">
              <span>💳</span> <span>تسجيل بيع اشتراكات للوكيل</span>
            </button>
            <button class="btn btn-secondary" onclick="openAgentInvoiceModal('أجهزة جديدة')">
              <span>📦</span> <span>تسجيل بيع أجهزة جديدة للوكيل</span>
            </button>
            <button class="btn btn-primary" onclick="openAgentModal()">
              <span>➕</span> <span>إضافة وكيل جديد</span>
            </button>
          </div>
        </div>

        <!-- 4 Stat Cards -->
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">عدد الوكلاء</span><div class="stat-icon">👥</div></div>
            <div class="stat-value-group"><span class="stat-value">${agents.length}</span><span class="stat-unit">وكيل</span></div>
            <div class="stat-footer"><span>كافة المحافظات والمناطق</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">عمليات الوكلاء</span><div class="stat-icon">📦</div></div>
            <div class="stat-value-group"><span class="stat-value">${agentSalesCount}</span><span class="stat-unit">عملية</span></div>
            <div class="stat-footer"><span>أجهزة وتجديد اشتراكات</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">قيمة مبيعات الوكلاء</span><div class="stat-icon">💰</div></div>
            <div class="stat-value-group"><span class="stat-value">${formatNumber(agentSalesTotal)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>إجمالي حركات الوكلاء</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-card-header"><span class="stat-title">سعر المركز المباشر</span><div class="stat-icon">🏷️</div></div>
            <div class="stat-value-group"><span class="stat-value">${formatNumber(hqDirectPrice)}</span><span class="stat-unit">د.ع</span></div>
            <div class="stat-footer"><span>سعر بيع الجهاز الرئيسي</span></div>
          </div>
        </div>

        <!-- Agents Grid -->
        <div class="content-card">
          <div class="card-header-bar">
            <h3>قائمة الوكلاء المعتمدين</h3>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="sortAgents('asc')">ترتيب أ-ي</button>
              <button class="btn btn-secondary btn-sm" onclick="sortAgents('desc')">ترتيب ي-أ</button>
            </div>
          </div>

          <div class="agents-grid">
            ${agents.length === 0 ? `<p style="padding: 24px; color: var(--muted);">لا يوجد وكلاء مسجلون حالياً.</p>` : 
              agents.map(ag => {
                const agSales = sales.filter(s => s.seller === ag.name);
                const agSalesTotal = agSales.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
                const agDebts = debts.filter(d => d.seller === ag.name && d.remainingAmount > 0);
                const agDebtTotal = agDebts.reduce((sum, d) => sum + (Number(d.remainingAmount) || 0), 0);
                const initials = ag.name.split(' ').map(n => n[0]).join('').substring(0, 2);

                return `
                  <div class="agent-card">
                    <div>
                      <div class="agent-card-header">
                        <div class="agent-initials">${escapeHtml(initials)}</div>
                        <div class="agent-meta">
                          <h4>${escapeHtml(ag.name)}</h4>
                          <span class="agent-sub">${escapeHtml(ag.code || '')} · ${escapeHtml(ag.phone || '')}</span>
                        </div>
                      </div>

                      <div class="agent-kpis">
                        <div class="kpi-item">
                          <span class="kpi-label">سعر الوكيل للجهاز</span>
                          <span class="kpi-val">${formatIQD(ag.price || 45000)}</span>
                        </div>
                        <div class="kpi-item">
                          <span class="kpi-label">إجمالي المبيعات</span>
                          <span class="kpi-val">${formatIQD(agSalesTotal)}</span>
                        </div>
                      </div>

                      <div class="agent-debt-bar">
                        <span>المتبقي عليه ديون:</span>
                        <strong style="font-size: 1.05rem;">${formatIQD(agDebtTotal)}</strong>
                      </div>

                      <div class="agent-auth-box" style="margin-top: 10px; padding: 8px 12px; background: var(--surface-alt); border-radius: var(--radius-sm); border: 1px solid var(--line); font-size: 0.82rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span>👤 المستخدم: <strong style="color: var(--green);">${escapeHtml(ag.username || ag.code?.toLowerCase() || 'لم يحدد')}</strong></span>
                          <button type="button" class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 0.75rem;" onclick="openAgentCredentialsModal('${ag.id}')">
                            🔑 الرمز السري
                          </button>
                        </div>
                        <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center; color: var(--muted); font-size: 0.78rem;">
                          <span>الرمز السري: <code style="font-weight: 700; color: var(--ink); background: rgba(0,0,0,0.05); padding: 1px 4px; border-radius: 4px;">${escapeHtml(ag.password || 'agent123')}</code></span>
                          <span style="font-size: 0.72rem; color: var(--success);">● حساب نشط</span>
                        </div>
                      </div>
                    </div>

                    <div class="agent-actions">
                      <button class="btn btn-primary btn-sm" onclick="openDebtSettlementModal('${escapeHtml(ag.name)}')">
                        تسديد الديون (${agDebts.length})
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="openAgentModal('${ag.id}')">تعديل البيانات</button>
                      <button class="btn btn-outline-danger btn-sm" onclick="deleteAgent('${ag.id}')">حذف</button>
                      <button class="btn btn-secondary btn-sm" onclick="setSalesFilter('seller', '${escapeHtml(ag.name)}'); navigateTo('sales');">عرض المبيعات ←</button>
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>

        <!-- Settlements History Table -->
        <div class="content-card">
          <div class="card-header-bar">
            <h3>سجل تسديدات الوكلاء</h3>
            <span class="badge badge-neutral">${settlements.length} حركة تسديد</span>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>الوكيل / التاريخ</th>
                  <th>عدد البنود</th>
                  <th>المستحق والمستلم</th>
                  <th>الفارق / التباين</th>
                </tr>
              </thead>
              <tbody>
                ${settlements.length === 0 ? `<tr><td colspan="4" style="text-align: center; color: var(--muted); padding: 24px;">لا توجد تسديدات مسجلة بعد</td></tr>` : 
                  settlements.map(st => `
                    <tr>
                      <td>
                        <strong class="cell-title">${escapeHtml(st.agentName)}</strong>
                        <div class="cell-subtitle" style="direction: ltr; text-align: right;">${escapeHtml(st.date)}</div>
                      </td>
                      <td>${st.linesCount} بند</td>
                      <td>
                        <div style="font-size: 0.78rem;"><span style="color: var(--muted);">المستحق:</span> ${formatIQD(st.dueAmount)}</div>
                        <div style="font-size: 0.78rem; color: var(--success); font-weight: 600;"><span style="color: var(--muted);">المستلم:</span> ${formatIQD(st.receivedAmount)}</div>
                      </td>
                      <td>
                        <span class="badge ${st.variance >= 0 ? 'badge-success' : 'badge-danger'}">
                          ${st.variance > 0 ? '+' : ''}${formatIQD(st.variance)}
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
  };

  window.sortAgents = function(order) {
    const data = getData();
    const agents = [...(data.agents || [])];
    agents.sort((a, b) => order === 'asc' ? a.name.localeCompare(b.name, 'ar') : b.name.localeCompare(a.name, 'ar'));
    data.agents = agents;
    getEngine().saveLocal();
    window.renderAgents(document.getElementById('main-content'));
  };

  window.deleteAgent = function(id) {
    window.showConfirmModal('حذف الوكيل', 'هل تريد حذف هذا الوكيل بشكل نهائي من النظام مع كافة بياناته وسجلاته المرتبطة؟', async () => {
      const data = getData();
      const agentToDelete = (data.agents || []).find(a => 
        a.id === id || 
        a.code === id || 
        (a.code && a.code.toLowerCase() === String(id).toLowerCase()) || 
        (a.username && a.username.toLowerCase() === String(id).toLowerCase())
      );
      const primaryAgentId = agentToDelete ? agentToDelete.id : id;
      const agentName = agentToDelete ? (agentToDelete.name || '') : '';
      const agentUsername = agentToDelete ? (agentToDelete.username || '') : '';
      const agentCode = agentToDelete ? (agentToDelete.code || '') : '';

      // 1. Delete agent via deleteItem (strictly by ID)
      if (primaryAgentId) await getEngine().deleteItem('agents', primaryAgentId);

      // 2. Find and delete corresponding user(s) via deleteItem
      const matchingUsers = (data.users || []).filter(u => {
        if (u.role === 'admin' || u.username === 'admin' || u.username === 'abodsari') return false;
        return (primaryAgentId && (u.uid === primaryAgentId || u.id === primaryAgentId)) || 
               (agentUsername && ((u.uid && u.uid.toLowerCase() === agentUsername.toLowerCase()) || (u.username && u.username.toLowerCase() === agentUsername.toLowerCase())));
      });

      for (const u of matchingUsers) {
        if (u.uid) await getEngine().deleteItem('users', u.uid);
      }

      // 3. Remove pricing mapping completely (use the unique ID)
      if (data.pricing && data.pricing.agentPrices) {
        if (primaryAgentId) delete data.pricing.agentPrices[primaryAgentId];
        await getEngine().commitData('pricing', data.pricing);
      }

      // 4. Cascade delete agent sales and debts only for this specific agent (by agentName)
      if (agentName && agentName.trim() !== '') {
        const agentSales = (data.sales || []).filter(s => s.seller === agentName || s.agentName === agentName || (agentUsername && s.seller === agentUsername));
        for (const s of agentSales) {
          await getEngine().deleteItem('sales', s.id);
        }

        const agentDebts = (data.debts || []).filter(d => d.seller === agentName || d.agentName === agentName || (agentUsername && d.seller === agentUsername));
        for (const d of agentDebts) {
          await getEngine().deleteItem('debts', d.id);
        }
      }

      // 5. Cascade delete agent settlements & submissions
      if (agentName && agentName.trim() !== '') {
        if (data.agentSettlements) {
          const settlementsToDelete = data.agentSettlements.filter(st => st.agentName === agentName || (agentUsername && st.agentName === agentUsername));
          for (const st of settlementsToDelete) {
            await getEngine().deleteItem('agentSettlements', st.id);
          }
        }

        if (data.agentSubmissions) {
          const submissionsToDelete = data.agentSubmissions.filter(sub => sub.seller === agentName || sub.agentName === agentName || (agentUsername && sub.seller === agentUsername));
          for (const sub of submissionsToDelete) {
            if (typeof getEngine().deleteFirestoreSubmission === 'function') { await getEngine().deleteFirestoreSubmission(sub.submittedBy, sub.id); } else { await getEngine().deleteItem('agentSubmissions', sub.id); }
          }
        }
      }

      window.showToast('تم حذف الوكيل وكافة تعاملاته وسجلاته نهائياً بنجاح', 'success');
      if (typeof window.navigateTo === 'function') {
        window.navigateTo('agents');
      } else {
        const mainEl = document.getElementById('main-content');
        if (mainEl && typeof window.renderAgents === 'function') window.renderAgents(mainEl);
      }
    }, 'حذف الوكيل', 'إلغاء', true);
  };

  // Agent Add/Edit Modal
  window.openAgentModal = function(agentId) {
    const data = getData();
    const existing = agentId ? (data.agents || []).find(a => a.id === agentId) : null;
    const modalContainer = document.getElementById('modal-container');

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${existing ? 'تعديل بيانات الوكيل' : 'إضافة وكيل جديد'}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="agent-form">
            <div class="modal-body">
              <div class="form-group">
                <label>اسم الوكيل الكامل *</label>
                <input type="text" id="ag-name" required value="${escapeHtml(existing?.name || '')}">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>رمز الوكيل (الكود) *</label>
                  <input type="text" id="ag-code" placeholder="AG-004" required value="${escapeHtml(existing?.code || '')}">
                </div>
                <div class="form-group">
                  <label>رقم الهاتف *</label>
                  <input type="text" id="ag-phone" placeholder="0770xxxxxxx" required value="${escapeHtml(existing?.phone || '')}">
                </div>
              </div>
              <div class="form-group">
                <label>سعر بيع الجهاز للوكيل (د.ع) *</label>
                <input type="text" inputmode="numeric" id="ag-price" required value="${formatNumber(existing?.price || 45000)}" oninput="formatInputWithCommas(this)">
              </div>

              <!-- حساب الدخول للوكيل -->
              <div style="margin-top: 14px; padding: 14px; background: var(--surface-alt); border-radius: var(--radius-md); border: 1px solid var(--line);">
                <h4 style="font-size: 0.92rem; margin-bottom: 8px; color: var(--green); display: flex; align-items: center; gap: 6px;">
                  <span>🔐</span> <span>بيانات حساب الدخول للوكيل في التطبيق</span>
                </h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>اسم المستخدم للدخول *</label>
                    <input type="text" id="ag-user" placeholder="مثال: omar" required value="${escapeHtml(existing?.username || (existing?.code ? existing.code.toLowerCase() : ''))}">
                  </div>
                  <div class="form-group">
                    <label>الرمز السري / كلمة المرور *</label>
                    <div style="display: flex; gap: 6px;">
                      <input type="password" id="ag-pass" placeholder="••••••••" required value="${escapeHtml(existing?.password || 'agent123')}">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="const p = document.getElementById('ag-pass'); p.type = p.type === 'password' ? 'text' : 'password';" title="إظهار/إخفاء الرمز">👁️</button>
                    </div>
                  </div>
                </div>
                <small class="form-help">يستخدم الوكيل هذا الحساب والرمز السري لتسجيل الدخول إلى حسابه في التطبيق ورفع المبيعات.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" id="btn-save-agent">حفظ الوكيل</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('agent-form').onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-agent') || e.target.querySelector('button[type="submit"]');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'جاري الحفظ...';
      }

      try {
        const name = document.getElementById('ag-name').value.trim();
        const code = document.getElementById('ag-code').value.trim();
        const phone = document.getElementById('ag-phone').value.trim();
        const price = parseNumber(document.getElementById('ag-price').value) || 45000;
        const username = document.getElementById('ag-user').value.trim().toLowerCase();
        const password = document.getElementById('ag-pass').value.trim();

        if (!name || !code) {
          window.showToast('يرجى ملء جميع الحقول المطلوبة', 'warning');
          if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'حفظ الوكيل'; }
          return;
        }

        const agents = data.agents || [];
        if (existing) {
          const oldName = existing.name;
          const newName = name;
          const agentId = existing.id;
          const agentCode = code;

          existing.name = name;
          existing.code = code;
          existing.phone = phone;
          existing.price = price;
          existing.username = username;
          existing.password = password;

          const batchUpdates = [];

          // Propagate agent name change across all collections dynamically
          if (oldName && oldName !== newName) {
            // 1. Sales
            if (Array.isArray(data.sales)) {
              data.sales.forEach(s => {
                if (s.seller === oldName || s.agentName === oldName) {
                  s.seller = newName;
                  s.agentName = newName;
                }
              });
              batchUpdates.push({ collectionName: 'sales', items: data.sales });
            }

            // 2. Debts
            if (Array.isArray(data.debts)) {
              data.debts.forEach(d => {
                if (d.seller === oldName || d.agentName === oldName) {
                  d.seller = newName;
                  d.agentName = newName;
                }
              });
              batchUpdates.push({ collectionName: 'debts', items: data.debts });
            }

            // 3. Subscribers
            if (Array.isArray(data.subscribers)) {
              data.subscribers.forEach(sub => {
                if (sub.agentName === oldName || sub.seller === oldName) {
                  sub.agentName = newName;
                  sub.seller = newName;
                }
              });
              batchUpdates.push({ collectionName: 'subscribers', items: data.subscribers });
            }

            // 4. Agent Settlements
            if (Array.isArray(data.agentSettlements)) {
              data.agentSettlements.forEach(st => {
                if (st.agentName === oldName) {
                  st.agentName = newName;
                }
              });
              batchUpdates.push({ collectionName: 'agentSettlements', items: data.agentSettlements });
            }

            // 5. Users
            if (Array.isArray(data.users)) {
              data.users.forEach(u => {
                if (u.agentName === oldName || u.uid === agentId) {
                  u.agentName = newName;
                  if (u.role === 'agent') {
                    u.displayName = newName;
                  }
                }
              });
              batchUpdates.push({ collectionName: 'users', items: data.users });
            }
          }

          // Update pricing entry if exists
          const curPricing = data.pricing || {};
          if (curPricing.agentPrices && curPricing.agentPrices[agentId]) {
            curPricing.agentPrices[agentId].agentName = newName;
            curPricing.agentPrices[agentId].agentCode = code;
            batchUpdates.push({ collectionName: 'pricing', items: curPricing });
          }

          batchUpdates.push({ collectionName: 'agents', items: agents });
          await getEngine().batchCommitData(batchUpdates);
          try {
            await getEngine().saveAgentCredentials(agentId, username, password, { name, code, phone, price });
          } catch(e) {
            console.warn('Agent credentials save note:', e);
          }
          window.showToast('تم تحديث وحفظ بيانات وحساب الوكيل بنجاح', 'success');
        } else {
          // Check for duplicate agent code
          if ((data.agents || []).some(a => a.code === code)) {
            window.showToast('خطأ: رمز الوكيل موجود مسبقاً، يرجى اختيار رمز آخر.', 'error');
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'حفظ الوكيل'; }
            return;
          }

          const newAg = { 
            id: 'ag-' + Date.now(), 
            name, 
            code, 
            phone, 
            price, 
            username, 
            password, 
            createdAt: new Date().toISOString() 
          };
          const updatedAgents = [newAg, ...agents];
          const batchUpdates = [{ collectionName: 'agents', items: updatedAgents }];

          // Auto-add new agent into pricing table with default editable prices
          const curPricing = data.pricing || {};
          const agentPrices = curPricing.agentPrices || {};
          const defAgentPrices = curPricing.agentDefault || curPricing.agent || {
            device: price || 45000,
            sub1: 18000,
            sub2: 36000,
            sub3: 54000
          };
          agentPrices[newAg.id] = {
            agentId: newAg.id,
            agentName: newAg.name,
            agentCode: newAg.code,
            device: price || defAgentPrices.device || 45000,
            sub1: defAgentPrices.sub1 || 18000,
            sub2: defAgentPrices.sub2 || 36000,
            sub3: defAgentPrices.sub3 || 54000,
            status: 'معتمدة'
          };
          curPricing.agentPrices = agentPrices;
          batchUpdates.push({ collectionName: 'pricing', items: curPricing });

          await getEngine().batchCommitData(batchUpdates);
          try {
            await getEngine().saveAgentCredentials(newAg.id, username, password);
          } catch(e) {
            console.warn('Agent credentials save note:', e);
          }

          window.showToast('تم إضافة الوكيل وحساب الدخول وإدراجه في جدول الأسعار بنجاح', 'success');
        }
      } catch (err) {
        console.error('Error saving agent:', err);
        window.showToast('حدث خطأ أثناء حفظ بيانات الوكيل', 'error');
      } finally {
        // ALWAYS DISMISS MODAL IMMEDIATELY
        window.closeModal();

        // Refresh agent table if view is active
        if (typeof window.renderAgents === 'function') {
          const mainEl = document.getElementById('main-content');
          if (mainEl) window.renderAgents(mainEl);
        }
      }
    };
  };

  // Dedicated Agent Credentials Management Modal
  window.openAgentCredentialsModal = function(agentId) {
    const data = getData();
    const ag = (data.agents || []).find(a => a.id === agentId || a.code === agentId);
    if (!ag) return;

    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" style="max-width: 440px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>إدارة حساب الوكيل والرمز السري</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="agent-cred-form">
            <div class="modal-body">
              <div style="padding: 10px 14px; background: rgba(36, 91, 137, 0.08); border-radius: var(--radius-md); border: 1px solid rgba(36, 91, 137, 0.2); margin-bottom: 12px;">
                <strong style="color: var(--ink); font-size: 1rem;">الوكيل: ${escapeHtml(ag.name)}</strong>
                <div style="font-size: 0.82rem; color: var(--muted); margin-top: 2px;">الكود: ${escapeHtml(ag.code)} · هاتف: ${escapeHtml(ag.phone)}</div>
              </div>

              <div class="form-group" style="margin-bottom: 12px;">
                <label>اسم المستخدم للدخول *</label>
                <input type="text" id="cred-username" required value="${escapeHtml(ag.username || ag.code.toLowerCase())}">
              </div>

              <div class="form-group">
                <label>الرمز السري / كلمة المرور *</label>
                <div style="display: flex; gap: 6px;">
                  <input type="password" id="cred-password" required value="${escapeHtml(ag.password || 'agent123')}">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="const p = document.getElementById('cred-password'); p.type = p.type === 'password' ? 'text' : 'password';" title="إظهار/إخفاء الرمز">👁️</button>
                </div>
                <small class="form-help">سيتمكن الوكيل من تسجيل الدخول مباشرة باستخدام هذا الاسم والرمز السري.</small>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" id="btn-save-cred">حفظ وتحديث الرمز السري</button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById('agent-cred-form').onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save-cred');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'جاري الحفظ...'; }
      try {
        const u = document.getElementById('cred-username').value.trim().toLowerCase();
        const p = document.getElementById('cred-password').value.trim();
        if (!u || !p) {
          window.showToast('يرجى ملء جميع الحقول', 'warning');
          if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'حفظ وتحديث الرمز السري'; }
          return;
        }

        await getEngine().saveAgentCredentials(ag.id, u, p, { name: ag.name, code: ag.code, phone: ag.phone, price: ag.price });
        window.showToast(`تم حفظ وتثبيت حساب الوكيل ${ag.name} وكلمة المرور بنجاح`, 'success');
      } catch (err) {
        console.error('Error saving credentials:', err);
        window.showToast('حدث خطأ أثناء حفظ بيانات الدخول', 'error');
      } finally {
        window.closeModal();
        if (typeof window.renderAgents === 'function') {
          window.renderAgents(document.getElementById('main-content'));
        }
      }
    };
  };

  // Agent Invoice Sale Modal ("تسجيل عملية بيع للوكيل - اشتراكات أو أجهزة جديدة")
  window.openAgentInvoiceModal = function(invoiceType = 'أجهزة جديدة') {
    const isSub = invoiceType === 'اشتراكات';
    const data = getData();
    const agents = data.agents || [];
    const pricing = data.pricing || {};
    const defaultDevicePrice = pricing.agent?.device || 45000;
    const defaultSubPrice = pricing.agent?.sub1 || 18000;
    const defaultUnitPrice = isSub ? defaultSubPrice : defaultDevicePrice;
    const modalContainer = document.getElementById('modal-container');
    const today = new Date().toISOString().substring(0, 10);

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>${isSub ? 'تسجيل فاتورة بيع اشتراكات للوكيل' : 'تسجيل فاتورة بيع أجهزة جديدة للوكيل'}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="agent-inv-form">
            <div class="modal-body">
              <div class="form-row">
                <div class="form-group">
                  <label>اختيار الوكيل *</label>
                  <select id="aiv-agent" required onchange="updateAgentInvoiceCalc()">
                    ${agents.map(a => `<option value="${escapeHtml(a.name)}" data-price="${a.price || defaultDevicePrice}">${escapeHtml(a.name)} (${escapeHtml(a.code || '')})</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>تاريخ الفاتورة *</label>
                  <input type="date" id="aiv-date" value="${today}" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>${isSub ? 'فترة الاشتراك المطلوبة *' : 'نوع المادة'}</label>
                  ${isSub ? `
                    <select id="aiv-sub-tier" onchange="updateAgentInvoiceCalc()">
                      <option value="اشتراك شهر واحد" data-price="${pricing.agent?.sub1 || 18000}">اشتراك شهر واحد (${formatIQD(pricing.agent?.sub1 || 18000)})</option>
                      <option value="اشتراك شهرين" data-price="${pricing.agent?.sub2 || 36000}">اشتراك شهرين (${formatIQD(pricing.agent?.sub2 || 36000)})</option>
                      <option value="اشتراك 3 أشهر" data-price="${pricing.agent?.sub3 || 54000}">اشتراك 3 أشهر (${formatIQD(pricing.agent?.sub3 || 54000)})</option>
                    </select>
                  ` : `
                    <input type="text" id="aiv-type" value="أجهزة جديدة" readonly style="background: var(--surface-alt);">
                  `}
                </div>
                <div class="form-group">
                  <label>سعر المفرد (د.ع) - محدد تلقائياً</label>
                  <input type="text" id="aiv-unit-price" value="${formatNumber(defaultUnitPrice)}" readonly style="background: var(--surface-alt); font-weight: 700; color: var(--green);">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>${isSub ? 'الكمية (عدد الاشتراكات) *' : 'الكمية (عدد الأجهزة) *'}</label>
                  <input type="number" id="aiv-qty" value="10" min="1" max="1000" required oninput="updateAgentInvoiceCalc()">
                </div>
                <div class="form-group">
                  <label>الإجمالي الكلي (د.ع)</label>
                  <input type="text" id="aiv-total" value="${formatIQD(10 * defaultUnitPrice)}" readonly style="background: var(--surface-alt); font-size: 1.1rem; font-weight: 800; color: var(--green);">
                </div>
              </div>

              <div style="background: var(--warning-bg); border: 1px solid var(--warning-border); padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.84rem; color: var(--ink);">
                ℹ️ يتم تسجيل الفاتورة بنظام الدين التلقائي للوكيل، وتاريخ استحقاقها في نهاية الشهر الحالي.
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-inv">إصدار الفاتورة وتسجيل الدين</button>
            </div>
          </form>
        </div>
      </div>
    `;

    window.updateAgentInvoiceCalc = function() {
      let unitPrice = defaultUnitPrice;
      if (isSub) {
        const tierSel = document.getElementById('aiv-sub-tier');
        if (tierSel) {
          const opt = tierSel.options[tierSel.selectedIndex];
          unitPrice = Number(opt.getAttribute('data-price')) || defaultSubPrice;
        }
      } else {
        const sel = document.getElementById('aiv-agent');
        if (sel) {
          const opt = sel.options[sel.selectedIndex];
          unitPrice = Number(opt.getAttribute('data-price')) || defaultDevicePrice;
        }
      }
      const unitInput = document.getElementById('aiv-unit-price');
      if (unitInput) unitInput.value = formatNumber(unitPrice);
      const qty = Number(document.getElementById('aiv-qty')?.value) || 0;
      const total = qty * unitPrice;
      const totalInput = document.getElementById('aiv-total');
      if (totalInput) totalInput.value = formatIQD(total);
    };

    updateAgentInvoiceCalc();

    document.getElementById('agent-inv-form').onsubmit = async (e) => {
      e.preventDefault();
      const agentName = document.getElementById('aiv-agent').value;
      const dateVal = document.getElementById('aiv-date').value;
      const unitPrice = parseNumber(document.getElementById('aiv-unit-price').value) || defaultUnitPrice;
      const qty = Number(document.getElementById('aiv-qty').value) || 1;
      const totalAmount = unitPrice * qty;
      const saleCode = 'SR-' + Math.floor(10000 + Math.random() * 90000);
      const parts = (dateVal || new Date().toISOString().substring(0, 10)).split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const endOfMonth = new Date(year, month, 0);
      const y = endOfMonth.getFullYear();
      const m = String(endOfMonth.getMonth() + 1).padStart(2, '0');
      const d = String(endOfMonth.getDate()).padStart(2, '0');
      const dueDate = `${y}-${m}-${d}`;

      const subTier = isSub ? (document.getElementById('aiv-sub-tier')?.value || 'اشتراك شهر واحد') : 'أجهزة جديدة';
      const itemDesc = isSub ? `دفعة (${qty} اشتراكات - ${subTier})` : `دفعة (${qty} أجهزة جديدة)`;

      const newSale = {
        id: 'sale-' + Date.now(),
        code: saleCode,
        customerName: `${agentName} (${isSub ? 'دفعة اشتراكات' : 'دفعة أجهزة'})`,
        customerPhone: '',
        seller: agentName,
        saleType: 'فاتورة وكيل',
        deviceNumber: itemDesc,
        subscriptionType: isSub ? subTier : 'أجهزة جديدة',
        startDate: dateVal,
        endDate: dueDate,
        price: totalAmount,
        paymentStatus: 'عليه دين',
        paymentMethod: 'دين',
        agentPaid: 0,
        createdAt: new Date().toISOString()
      };

      const newDebt = {
        id: 'debt-' + Date.now(),
        saleId: newSale.id,
        saleCode: saleCode,
        customerName: `${agentName} (وكيل)`,
        seller: agentName,
        totalAmount: totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        dueDate: dueDate,
        notes: `فاتورة ${itemDesc}`,
        createdAt: dateVal
      };

      const sales = [newSale, ...(data.sales || [])];
      const debts = [newDebt, ...(data.debts || [])];

      try {
        await getEngine().batchCommitData([
          { collectionName: 'sales', items: sales },
          { collectionName: 'debts', items: debts }
        ]);
        window.showToast(`تم إصدار فاتورة الوكيل ${agentName} بنجاح`, 'success');
      } catch (err) {
        console.error('Error in agent invoice:', err);
        window.showToast('حدث خطأ أثناء إصدار الفاتورة', 'error');
      } finally {
        window.closeModal();
      }
    };
  };

  // Sequential Debt Settlement Modal for Agent
  window.openDebtSettlementModal = function(agentName) {
    const data = getData();
    const debts = (data.debts || []).filter(d => d.seller === agentName && d.remainingAmount > 0);
    const modalContainer = document.getElementById('modal-container');

    if (debts.length === 0) {
      window.showToast(`لا توجد ديون مستحقة على الوكيل ${agentName}`, 'info');
      return;
    }

    const totalDue = debts.reduce((sum, d) => sum + d.remainingAmount, 0);

    modalContainer.innerHTML = `
      <div class="modal-overlay active" onclick="if (event.target === this) closeModal()">
        <div class="modal-dialog" style="max-width: 620px;" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>تسديد ديون الوكيل: ${escapeHtml(agentName)}</h3>
            <button type="button" class="modal-close" onclick="closeModal()">✕</button>
          </div>
          <form id="settlement-form">
            <div class="modal-body">
              <div style="background: var(--surface-alt); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--line); display: flex; justify-content: space-between;">
                <span>إجمالي الديون القائمة:</span>
                <strong style="color: var(--danger); font-size: 1.15rem;">${formatIQD(totalDue)}</strong>
              </div>

              <div class="form-group">
                <label>المبلغ المستلم فعلياً من الوكيل (د.ع) *</label>
                <input type="text" inputmode="numeric" id="settle-amount" required value="${formatNumber(totalDue)}" oninput="formatInputWithCommas(this); updateSettlementVariance(${totalDue});">
              </div>

              <div style="font-size: 0.88rem; color: var(--text-sub); display: flex; justify-content: space-between;">
                <span>الفارق (التباين):</span>
                <strong id="settle-variance-label" style="color: var(--success);">0 د.ع</strong>
              </div>

              <div class="form-group">
                <label>البنود المراد تسديدها بالتسلسل:</label>
                <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--line); border-radius: var(--radius-md); padding: 8px;">
                  ${debts.map((d, i) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid var(--line);">
                      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" class="settle-item-check" data-debt-id="${d.id}" checked>
                        <span><strong>#${i + 1}</strong> ${escapeHtml(d.notes || d.saleCode)} (${escapeHtml(d.dueDate || '')})</span>
                      </label>
                      <span style="font-weight: 700; color: var(--danger);">${formatIQD(d.remainingAmount)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal()">إلغاء</button>
              <button type="submit" class="btn btn-primary" id="btn-settle-save">تأكيد التسديد وتحديث السجل</button>
            </div>
          </form>
        </div>
      </div>
    `;

    window.updateSettlementVariance = function(due) {
      const rec = parseNumber(document.getElementById('settle-amount')?.value) || 0;
      const diff = rec - due;
      const el = document.getElementById('settle-variance-label');
      if (el) {
        el.textContent = (diff > 0 ? '+' : '') + formatIQD(diff);
        el.style.color = diff >= 0 ? 'var(--success)' : 'var(--danger)';
      }
    };

    document.getElementById('settlement-form').onsubmit = async (e) => {
      e.preventDefault();
      const received = parseNumber(document.getElementById('settle-amount').value) || 0;
      let remainingMoney = received;
      const allDebts = data.debts || [];
      const allSales = data.sales || [];
      let linesCount = 0;

      debts.forEach(d => {
        if (remainingMoney <= 0) return;
        linesCount++;
        const toPay = Math.min(d.remainingAmount, remainingMoney);
        d.paidAmount += toPay;
        d.remainingAmount -= toPay;
        if (d.remainingAmount <= 0 && !d.paymentDate) {
          d.paymentDate = new Date().toISOString().substring(0, 10);
        }
        remainingMoney -= toPay;

        // Also update corresponding sale agentPaid
        const matchedSale = allSales.find(s => s.id === d.saleId || s.code === d.saleCode);
        if (matchedSale) {
          matchedSale.agentPaid = (matchedSale.agentPaid || 0) + toPay;
          if (matchedSale.agentPaid >= matchedSale.price) {
            matchedSale.paymentStatus = 'تم التسديد';
          }
        }
      });

      // Filter out fully paid debts or keep updated
      const updatedDebts = allDebts.map(d => {
        const found = debts.find(x => x.id === d.id);
        return found || d;
      });

      // Log settlement record
      const settlementRecord = {
        id: 'settle-' + Date.now(),
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        agentName,
        linesCount,
        dueAmount: totalDue,
        receivedAmount: received,
        variance: received - totalDue
      };

      const allSettlements = [settlementRecord, ...(data.agentSettlements || [])];

      try {
        await getEngine().batchCommitData([
          { collectionName: 'debts', items: updatedDebts },
          { collectionName: 'sales', items: allSales },
          { collectionName: 'agentSettlements', items: allSettlements }
        ]);
        window.showToast(`تم تسجيل تسديد ديون ${agentName} بنجاح`, 'success');
      } catch (err) {
        console.error('Error settling debt:', err);
        window.showToast('حدث خطأ أثناء تسجيل التسديد', 'error');
      } finally {
        window.closeModal();
      }
    };
  };

})();

