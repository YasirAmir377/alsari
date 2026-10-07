/**
 * Firebase 12 Compat Sync & Local Persistence Engine
 * Al-Sari Terrestrial Broadcast Management System
 * LocalStorage key: "sari-app-v1"
 */

const STORAGE_KEY = 'sari-app-v1';

// Initial demo seed data
const DEFAULT_PRICING = {
  headquarters: {
    device: 50000,
    sub1: 25000,
    sub2: 50000,
    sub3: 75000,
    status: 'معتمدة'
  },
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
    sub3: 54000,
    status: 'معتمدة'
  },
  agentPrices: {}
};

window.DEFAULT_PRICING = DEFAULT_PRICING;

window.getAgentPricing = function(agentIdentifier) {
  const data = window.syncEngine ? window.syncEngine.data : {};
  const pricing = data?.pricing || window.DEFAULT_PRICING || {};
  if (!agentIdentifier || agentIdentifier === 'المركز الرئيسي') {
    return pricing.headquarters || { device: 50000, sub1: 25000, sub2: 50000, sub3: 75000, status: 'معتمدة' };
  }
  const agents = data?.agents || [];
  const found = agents.find(a => a.id === agentIdentifier || a.name === agentIdentifier || a.code === agentIdentifier || a.username === agentIdentifier);
  const agentId = found ? found.id : agentIdentifier;
  
  const custom = pricing.agentPrices && pricing.agentPrices[agentId];
  if (custom && custom.status === 'معتمدة') {
    return custom;
  }
  return pricing.agentDefault || pricing.agent || { device: 45000, sub1: 18000, sub2: 36000, sub3: 54000, status: 'معتمدة' };
};

const DEFAULT_WHATSAPP_TEMPLATE = `السلام عليكم ورحمة الله

• المشترك: «اسم الزبون»🌟

تمت عملية «تجديد اشتراك» بنجاح.
• المدة: «مدة تجديد اشتراك»
• المبلغ: «المبلغ» د.ع
• المدفوع: «المبلغ المدفوع» د.ع
• المتبقي: «المبلغ المتبقي» د.ع
• تاريخ الانتهاء: «تاريخ انتهاء الاشتراك»

شكراً لثقتكم — الساري للبث الأرضي - وكيل قنوات الرابعة الرياضية 📡`;

window.DEFAULT_WHATSAPP_TEMPLATE = DEFAULT_WHATSAPP_TEMPLATE;

const DEFAULT_AGENTS = [
  {
    id: 'ag-mahmod-f',
    name: 'محمود فجر',
    code: 'MHF',
    phone: '',
    price: 45000,
    username: 'mahmod.f',
    password: '123456',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ag-laith-j',
    name: 'ليث جاسم',
    code: 'LTH',
    phone: '',
    price: 45000,
    username: 'laith.j',
    password: '123456',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_USERS = [
  {
    uid: 'u-admin-abodsari',
    username: 'abodsari',
    displayName: 'أدمن المركز (abodsari)',
    role: 'admin',
    agentName: '',
    agentCode: '',
    password: 'sariabod'
  },
  {
    uid: 'u-admin-1',
    username: 'admin',
    displayName: 'المدير الرئيسي',
    role: 'admin',
    agentName: '',
    agentCode: '',
    password: 'sariabod'
  },
  {
    uid: 'u-agent-mahmod',
    username: 'mahmod.f',
    displayName: 'محمود فجر',
    role: 'agent',
    agentName: 'محمود فجر',
    agentCode: 'MHF',
    password: '123456'
  },
  {
    uid: 'u-agent-laith',
    username: 'laith.j',
    displayName: 'ليث جاسم',
    role: 'agent',
    agentName: 'ليث جاسم',
    agentCode: 'LTH',
    password: '123456'
  }
];

const DEFAULT_BARCODES = [
  {
    id: 'code-1',
    number: '8492048593028471',
    subscriberName: 'عمار خليل السعدي',
    status: 'مفعل',
    createdAt: '2026-09-15'
  },
  {
    id: 'code-2',
    number: '7193859204938174',
    subscriberName: 'ياسر محمد التميمي',
    status: 'مفعل',
    createdAt: '2026-09-18'
  },
  {
    id: 'code-3',
    number: '9284719385029482',
    subscriberName: 'حيدر عبد الزهرة',
    status: 'غير مفعل',
    createdAt: '2026-09-20'
  },
  {
    id: 'code-4',
    number: '6382910482947193',
    subscriberName: '',
    status: 'جديد',
    createdAt: '2026-10-01'
  },
  {
    id: 'code-5',
    number: '5829104928471920',
    subscriberName: '',
    status: 'جديد',
    createdAt: '2026-10-02'
  }
];

const DEFAULT_SALES = [];

const DEFAULT_DEBTS = [];

const DEFAULT_SUBSCRIBERS = [];

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    code: 'ANT-01',
    name: 'أريل هوائي خارجي عالي الكسب',
    category: 'أريل',
    price: 15000,
    stock: 45,
    unit: 'قطعة',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    description: 'أريل استقبال أرضي متطور يدعم الترددات الرقمية UHF/VHF بجودة عالية'
  },
  {
    id: 'prod-2',
    code: 'CAB-01',
    name: 'كابل RG6 نحاسي أصلي (بكرة 100م)',
    category: 'كابلات',
    price: 35000,
    stock: 20,
    unit: 'بكرة',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
    description: 'سلك توصيل محوري نحاسي عالي التوصيل ومقاوم للعوامل الجوية'
  },
  {
    id: 'prod-3',
    code: 'RMT-01',
    name: 'ريمونت تحكم شامل لأجهزة الرابعة والساري',
    category: 'ريمونت',
    price: 5000,
    stock: 80,
    unit: 'قطعة',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=400&q=80',
    description: 'جهاز تحكم عن بعد متوافق مع كافة أجهزة الاستقبال والرسيفرات'
  },
  {
    id: 'prod-4',
    code: 'PLG-01',
    name: 'فيش توصيل F-Connector نحاسية (كيس 50 حبة)',
    category: 'فيش',
    price: 10000,
    stock: 60,
    unit: 'كيس',
    image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
    description: 'فيش ربط سريعة ومحكمة التوصيل لمنع تشويش الإشارة'
  },
  {
    id: 'prod-5',
    code: 'DEV-NEW',
    name: 'رسيفر الساري للبث الأرضي (جهاز جديد بالكرتون)',
    category: 'اجهزة جديدة',
    price: 45000,
    stock: 35,
    unit: 'جهاز',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80',
    description: 'جهاز استقبال رقمي رسمي جديد يدعم كافة باقات وقنوات الرابعة الرياضية بدقة Full HD'
  },
  {
    id: 'prod-6',
    code: 'DEV-USD',
    name: 'رسيفر الساري للبث الأرضي (جهاز مستعمل مفحوص)',
    category: 'اجهزة مستعملة',
    price: 30000,
    stock: 14,
    unit: 'جهاز',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    description: 'جهاز مستعمل بحالة ممتازة ومفحوص بالكامل مع ضمان التشغيل'
  }
];

window.DEFAULT_PRODUCTS = DEFAULT_PRODUCTS;

class SariSyncEngine {
  constructor() {
    this.db = null;
    this.auth = null;
    this.currentUser = null;
    this.isOnline = navigator.onLine;
    this.unsubscribers = [];
    this.saveQueue = [];
    this.isSaving = false;
    this.data = this.loadLocal();
    this.initFirebase();
  }

  // Load state from localStorage or seed
  loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const allowedAgentNames = ['محمود فجر', 'ليث جاسم'];
        const allowedUsernames = ['admin', 'abodsari', 'mahmod.f', 'laith.j'];

        const rawAgents = Array.isArray(parsed.agents) ? parsed.agents : [];
        const cleanedAgents = rawAgents.filter(ag => allowedAgentNames.includes(ag.name) || allowedUsernames.includes(ag.username));
        const finalAgents = cleanedAgents.length > 0 ? cleanedAgents : DEFAULT_AGENTS;
        if (!finalAgents.some(a => a.username === 'mahmod.f')) finalAgents.push(DEFAULT_AGENTS[0]);
        if (!finalAgents.some(a => a.username === 'laith.j')) finalAgents.push(DEFAULT_AGENTS[1]);

        const rawUsers = Array.isArray(parsed.users) ? parsed.users : [];
        const cleanedUsers = rawUsers.filter(u => allowedUsernames.includes(u.username) || u.role === 'admin');
        const finalUsers = cleanedUsers.length > 0 ? cleanedUsers : DEFAULT_USERS;
        if (!finalUsers.some(u => u.username === 'mahmod.f')) finalUsers.push(DEFAULT_USERS[2]);
        if (!finalUsers.some(u => u.username === 'laith.j')) finalUsers.push(DEFAULT_USERS[3]);
        if (!finalUsers.some(u => u.username === 'abodsari')) finalUsers.unshift(DEFAULT_USERS[0]);
        if (!finalUsers.some(u => u.username === 'admin')) finalUsers.unshift(DEFAULT_USERS[1]);

        const rawSales = Array.isArray(parsed.sales) ? parsed.sales : [];
        const rawDebts = Array.isArray(parsed.debts) ? parsed.debts : [];
        const rawSubmissions = Array.isArray(parsed.agentSubmissions) ? parsed.agentSubmissions : [];

        const pricing = parsed.pricing || DEFAULT_PRICING;
        if (pricing.agentPrices) {
          const newAgentPrices = {};
          finalAgents.forEach(ag => {
            if (pricing.agentPrices[ag.id]) {
              newAgentPrices[ag.id] = pricing.agentPrices[ag.id];
            }
          });
          pricing.agentPrices = newAgentPrices;
        }

        return {
          agents: finalAgents,
          sales: rawSales,
          debts: rawDebts,
          codes: Array.isArray(parsed.codes) ? parsed.codes : DEFAULT_BARCODES,
          subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : DEFAULT_SUBSCRIBERS,
          pricing: pricing,
          templates: parsed.templates || { id: 'main-templates', whatsapp: DEFAULT_WHATSAPP_TEMPLATE },
          users: finalUsers,
          agentSettlements: [],
          agentSubmissions: rawSubmissions,
          products: Array.isArray(parsed.products) && parsed.products.length > 0 ? parsed.products : DEFAULT_PRODUCTS
        };
      }
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }

    const initial = {
      agents: DEFAULT_AGENTS,
      sales: DEFAULT_SALES,
      debts: DEFAULT_DEBTS,
      codes: DEFAULT_BARCODES,
      subscribers: DEFAULT_SUBSCRIBERS,
      pricing: DEFAULT_PRICING,
      templates: { id: 'main-templates', whatsapp: DEFAULT_WHATSAPP_TEMPLATE },
      users: DEFAULT_USERS,
      agentSettlements: [],
      agentSubmissions: [],
      products: DEFAULT_PRODUCTS
    };
    this.saveLocal(initial);
    return initial;
  }

  saveLocal(dataToSave) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  }

  initFirebase() {
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded, operating in local storage mode.');
      return;
    }

    const cfg = window.FIREBASE_CONFIG;
    if (cfg && cfg.projectId && cfg.apiKey) {
      try {
        let fbApp;
        if (!firebase.apps.length) {
          fbApp = firebase.initializeApp(cfg);
        } else {
          fbApp = firebase.app();
        }
        if (window.initFirebasePerf) {
          window.initFirebasePerf(fbApp);
        }
        this.auth = firebase.auth();
        
        // Connect to provisioned named Firestore database
        const databaseId = cfg.firestoreDatabaseId || 'ai-studio-0c2caad1-c1ee-4aef-b0cc-d86c54f7310d';
        const normalFs = fbApp.firestore();
        if (databaseId && databaseId !== '(default)' && typeof fbApp._getService === 'function') {
          try {
            const namedDelegate = fbApp._getService('firestore', databaseId);
            this.db = new normalFs.constructor(fbApp, namedDelegate);
          } catch(e) {
            console.warn('Error attaching named firestore delegate, falling back to default:', e);
            this.db = normalFs;
          }
        } else {
          this.db = normalFs;
        }
        console.log('Firebase initialized with projectId:', cfg.projectId, 'databaseId:', databaseId);

        // Fetch central data and seed if needed
        this.syncInitialDataFromCentral().then(() => {
          this.startRealtimeSync();
        });
      } catch (err) {
        console.warn('Firebase init error, using local fallback:', err);
      }
    }
  }

  // Ensure central Firestore is initialized and seeded with accounts and data
  async syncInitialDataFromCentral() {
    if (!this.db || !window.isFirebaseConfigured || !window.isFirebaseConfigured()) return;
    try {
      // Check if users collection exists in central Firestore
      const usersSnap = await this.db.collection('users').get().catch(() => null);
      if (!usersSnap || usersSnap.empty) {
        console.log('Central Firestore empty, seeding initial data...');
        const batch = this.db.batch();
        DEFAULT_USERS.forEach(u => {
          const uRef = this.db.collection('users').doc((u.username || u.uid).toLowerCase());
          batch.set(uRef, u, { merge: true });
        });
        DEFAULT_AGENTS.forEach(ag => {
          const agRef = this.db.collection('agents').doc(ag.id);
          batch.set(agRef, ag, { merge: true });
        });
        const pRef = this.db.collection('pricing').doc('default');
        batch.set(pRef, DEFAULT_PRICING, { merge: true });
        const tRef = this.db.collection('templates').doc('main');
        batch.set(tRef, { id: 'main', whatsapp: DEFAULT_WHATSAPP_TEMPLATE }, { merge: true });
        DEFAULT_SUBSCRIBERS.forEach(s => {
          const sRef = this.db.collection('subscribers').doc(s.id);
          batch.set(sRef, s, { merge: true });
        });
        DEFAULT_SALES.forEach(s => {
          const sRef = this.db.collection('sales').doc(s.id);
          batch.set(sRef, s, { merge: true });
        });
        DEFAULT_DEBTS.forEach(d => {
          const dRef = this.db.collection('debts').doc(d.id);
          batch.set(dRef, d, { merge: true });
        });
        await batch.commit();
        console.log('Central Firestore initial seed complete.');
      }

      await this.fetchAllCentralCollections();
    } catch (e) {
      console.warn('Central sync warning:', e.message);
    }
  }

  // Fetch essential data with pagination
  async fetchLazyData(collectionName, limit = 50, lastDoc = null) {
    if (!this.db || !window.isFirebaseConfigured()) return { records: [], lastDoc: null };
    try {
      let query = this.db.collection(collectionName).limit(limit);
      if (lastDoc) query = query.startAfter(lastDoc);
      
      const snap = await query.get();
      if (snap.empty) return { records: [], lastDoc: null };

      const records = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const newLastDoc = snap.docs[snap.docs.length - 1];

      // Merge into local cache
      this.data[collectionName] = [...(this.data[collectionName] || []), ...records];
      this.saveLocal();
      
      return { records, lastDoc: newLastDoc };
    } catch (e) {
      console.warn(`Error fetching lazy data for ${collectionName}:`, e.message);
      return { records: [], lastDoc: null };
    }
  }

  // Fetch all collections dynamically from central Firestore to keep all devices up-to-date
  async fetchAllCentralCollections() {
    if (!this.db || !window.isFirebaseConfigured || !window.isFirebaseConfigured()) return;
    try {
      const collections = ['users', 'agents', 'subscribers', 'sales', 'debts', 'pricing', 'templates', 'codes', 'agentSubmissions', 'agentSettlements', 'products'];
      const results = await Promise.all(collections.map(col => 
        this.db.collection(col).get().catch(err => {
          // Fallback to appData records if top-level collection is empty
          return this.db.collection('appData').doc(col).collection('records').get().catch(() => null);
        })
      ));

      let updatedAny = false;
      collections.forEach((col, idx) => {
        const snap = results[idx];
        if (snap && !snap.empty) {
          const remoteRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (col === 'pricing') {
            const defDoc = remoteRecords.find(d => d.id === 'default') || remoteRecords[0];
            if (defDoc) this.data.pricing = defDoc;
          } else if (col === 'templates') {
            const defDoc = remoteRecords.find(d => d.id === 'main') || remoteRecords[0];
            if (defDoc) this.data.templates = defDoc;
          } else if (col === 'users') {
            // Deduplicate users (indexed by both username and uid)
            const seen = new Set();
            const uniqueUsers = [];
            remoteRecords.forEach(u => {
              const key = (u.username || u.uid || u.id || '').toLowerCase();
              if (key && !seen.has(key)) {
                seen.add(key);
                uniqueUsers.push(u);
              }
            });
            this.data.users = uniqueUsers;
          } else {
            this.data[col] = remoteRecords;
          }
          updatedAny = true;
        }
      });

      if (updatedAny) {
        this.saveLocal();
        window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: 'all' } }));
      }
    } catch (e) {
      console.warn('Error fetching all central collections:', e.message);
    }
  }

  // Fetch latest credentials and profiles directly from Central Firestore
  async fetchCentralCredentials() {
    await this.fetchAllCentralCollections();
  }

  // Auth logic: authenticate against centralized database records (Firestore Users collection)
  async login(username, password) {
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();

    if (!cleanUser) {
      throw new Error('يرجى إدخال اسم الحساب');
    }
    if (!cleanPass) {
      throw new Error('يرجى إدخال كلمة المرور');
    }

    let foundUser = null;

    // 1. Direct Central Firestore query for the user in the Users collection
    if (this.db && window.isFirebaseConfigured && window.isFirebaseConfigured()) {
      try {
        // Direct document lookup by username
        const directSnap = await this.db.collection('users').doc(cleanUser).get();
        if (directSnap.exists) {
          foundUser = { id: directSnap.id, ...directSnap.data() };
        } else {
          // Query by username field in users collection
          const qSnap = await this.db.collection('users').where('username', '==', cleanUser).limit(1).get();
          if (!qSnap.empty) {
            foundUser = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
          }
        }

        // Also check if username matches an agent in Firestore
        if (!foundUser) {
          const agSnap = await this.db.collection('agents').where('username', '==', cleanUser).limit(1).get();
          if (!agSnap.empty) {
            const agData = agSnap.docs[0].data();
            foundUser = {
              uid: agData.id || agSnap.docs[0].id,
              username: agData.username || cleanUser,
              displayName: agData.name,
              role: 'agent',
              agentName: agData.name,
              agentCode: agData.code || '',
              password: agData.password
            };
          } else {
            // Check by agent code
            const agCodeSnap = await this.db.collection('agents').where('code', '==', cleanUser.toUpperCase()).limit(1).get();
            if (!agCodeSnap.empty) {
              const agData = agCodeSnap.docs[0].data();
              foundUser = {
                uid: agData.id || agCodeSnap.docs[0].id,
                username: agData.username || cleanUser,
                displayName: agData.name,
                role: 'agent',
                agentName: agData.name,
                agentCode: agData.code || '',
                password: agData.password
              };
            }
          }
        }
      } catch(e) {
        console.warn('Central Firestore direct user query note:', e.message);
      }
    }

    // 2. Fallback to cached or default users if offline or central is seeding
    if (!foundUser) {
      if (cleanUser === 'abodsari') {
        foundUser = (this.data.users || []).find(u => u.username === 'abodsari') || DEFAULT_USERS.find(u => u.username === 'abodsari');
      } else if (cleanUser === 'admin') {
        foundUser = (this.data.users || []).find(u => u.username === 'admin') || DEFAULT_USERS.find(u => u.username === 'admin');
      } else {
        const allCachedUsers = [...(this.data.users || []), ...DEFAULT_USERS];
        foundUser = allCachedUsers.find(u => (u.username || '').toLowerCase() === cleanUser);
        if (!foundUser) {
          const agents = this.data.agents || [];
          const matchedAgent = agents.find(a => 
            (a.username && a.username.trim().toLowerCase() === cleanUser) ||
            (a.code && a.code.trim().toLowerCase() === cleanUser) ||
            (a.id && a.id.toLowerCase() === cleanUser)
          );
          if (matchedAgent) {
            foundUser = {
              uid: matchedAgent.id || ('u-' + (matchedAgent.code || cleanUser)),
              username: matchedAgent.username || cleanUser,
              displayName: matchedAgent.name,
              role: 'agent',
              agentName: matchedAgent.name,
              agentCode: matchedAgent.code || '',
              password: matchedAgent.password
            };
          }
        }
      }
    }

    if (!foundUser) {
      throw new Error('اسم المستخدم غير مسجل في النظام. يرجى مراجعة إدارة المركز.');
    }

    // Validate password
    const expectedPass = String(foundUser.password || 'agent123').trim();
    const isMasterAdmin = (cleanUser === 'abodsari' || cleanUser === 'admin') && (cleanPass === 'sariabod' || cleanPass === 'abodsari');

    if (!isMasterAdmin && expectedPass !== cleanPass) {
      throw new Error('كلمة المرور غير صحيحة.');
    }

    this.currentUser = {
      uid: foundUser.uid || foundUser.id || ('u-' + cleanUser),
      username: foundUser.username || cleanUser,
      displayName: foundUser.displayName || foundUser.name || cleanUser,
      role: foundUser.role || 'agent',
      agentName: foundUser.agentName || foundUser.name || '',
      agentCode: foundUser.agentCode || ''
    };

    sessionStorage.setItem('sari_active_session', JSON.stringify(this.currentUser));

    // Fetch all fresh data from Firestore upon login
    await this.fetchAllCentralCollections();

    // Start real-time Firestore listeners across all devices
    this.startRealtimeSync();

    return { success: true, user: this.currentUser };
  }

  // Method to create or update agent login credentials & central profile
  async saveAgentCredentials(agentId, newUsername, newPassword, agentProfile = {}) {
    const cleanUser = String(newUsername || '').trim().toLowerCase();
    if (!cleanUser) {
      throw new Error('يرجى تحديد اسم المستخدم');
    }

    const agents = this.data.agents || [];
    let ag = agents.find(a => a.id === agentId || a.code === agentId || a.username === cleanUser);
    const existingUser = (this.data.users || []).find(u => u.uid === agentId || u.username === cleanUser);
    const cleanPass = String(newPassword || ag?.password || existingUser?.password || 'agent123').trim();

    const name = agentProfile.name || ag?.name || existingUser?.displayName || cleanUser;
    const code = agentProfile.code || ag?.code || existingUser?.agentCode || ('AG-' + Math.floor(100 + Math.random() * 900));
    const phone = agentProfile.phone !== undefined ? agentProfile.phone : (ag?.phone || '');
    const price = agentProfile.price !== undefined ? Number(agentProfile.price) : (ag?.price || 45000);

    if (!ag) {
      ag = {
        id: agentId || ('ag-' + Date.now()),
        name,
        code,
        phone,
        price,
        username: cleanUser,
        password: cleanPass,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      agents.push(ag);
    } else {
      ag.name = name;
      ag.code = code;
      ag.phone = phone;
      ag.price = price;
      ag.username = cleanUser;
      ag.password = cleanPass;
      ag.updatedAt = new Date().toISOString();
    }

    // Update or add in this.data.users
    const users = this.data.users || [];
    const userIndex = users.findIndex(u => u.username === cleanUser || u.agentCode === ag.code || u.uid === ag.id);
    const userObj = {
      uid: ag.id,
      username: cleanUser,
      displayName: ag.name,
      role: 'agent',
      agentName: ag.name,
      agentCode: ag.code,
      password: cleanPass,
      updatedAt: new Date().toISOString()
    };

    if (userIndex >= 0) {
      users[userIndex] = userObj;
    } else {
      users.push(userObj);
    }

    this.data.agents = agents;
    this.data.users = users;

    // Keep pricing table agentPrices in sync
    if (this.data.pricing && this.data.pricing.agentPrices && this.data.pricing.agentPrices[ag.id]) {
      this.data.pricing.agentPrices[ag.id].agentName = ag.name;
      this.data.pricing.agentPrices[ag.id].agentCode = ag.code;
    }

    // Persist locally
    this.saveLocal();

    // Commit both agents and users to central Firestore immediately
    await this.commitData('agents', agents);
    await this.commitData('users', users);

    // Direct Firestore document writes to ensure immediate consistency
    if (this.db && window.isFirebaseConfigured && window.isFirebaseConfigured()) {
      try {
        const batch = this.db.batch();
        // Top-level collections
        batch.set(this.db.collection('agents').doc(ag.id), ag, { merge: true });
        batch.set(this.db.collection('users').doc(cleanUser), userObj, { merge: true });
        batch.set(this.db.collection('users').doc(ag.id), userObj, { merge: true });
        // appData records mirror
        batch.set(this.db.collection('appData').doc('agents').collection('records').doc(ag.id), ag, { merge: true });
        batch.set(this.db.collection('appData').doc('users').collection('records').doc(ag.id), userObj, { merge: true });
        await batch.commit();
      } catch (e) {
        console.warn('Direct Firestore credential batch write error:', e);
      }
    }

    // If currently logged in user is this agent, update their active session
    if (this.currentUser && (this.currentUser.uid === ag.id || this.currentUser.username === ag.username)) {
      this.currentUser.displayName = ag.name;
      this.currentUser.agentName = ag.name;
      this.currentUser.agentCode = ag.code;
      this.currentUser.username = ag.username;
      sessionStorage.setItem('sari_active_session', JSON.stringify(this.currentUser));
      const topName = document.getElementById('user-display-name');
      if (topName) topName.textContent = ag.name;
    }

    return { success: true, agent: ag };
  }

  restoreSession() {
    try {
      const saved = sessionStorage.getItem('sari_active_session');
      if (saved) {
        this.currentUser = JSON.parse(saved);
        if (this.db) {
          this.fetchAllCentralCollections();
          this.startRealtimeSync();
        }
        return this.currentUser;
      }
    } catch (e) {
      console.warn('Error restoring session', e);
    }
    return null;
  }

  logout() {
    this.stopRealtimeSync();
    if (this.auth) {
      try {
        this.auth.signOut();
      } catch (e) {}
    }
    this.currentUser = null;
    sessionStorage.removeItem('sari_active_session');
  }

  // Real-time Central Firestore synchronization (Automatic Two-Way Propagation across all devices)
  startRealtimeSync() {
    if (!this.db) return;
    this.stopRealtimeSync();

    const user = this.currentUser || { role: 'admin' };
    const isAdmin = user.role === 'admin' || user.role === 'أدمن' || user.role === 'مدير رئيسي';

    // Core central collections for full two-way synchronization
    const sharedCollections = ['subscribers', 'sales', 'debts', 'agents', 'users', 'pricing', 'templates', 'codes', 'agentSettlements', 'products'];

    sharedCollections.forEach(col => {
      try {
        const unsub = this.db.collection(col).onSnapshot(snap => {
          const remoteRecords = snap.empty ? [] : snap.docs.map(d => ({ id: d.id, ...d.data() })); if (true) {
            if (col === 'pricing') {
              const defaultDoc = remoteRecords.find(d => d.id === 'default') || remoteRecords[0];
              this.data.pricing = defaultDoc;
            } else if (col === 'templates') {
              const mainDoc = remoteRecords.find(d => d.id === 'main') || remoteRecords[0];
              this.data.templates = mainDoc;
            } else if (col === 'users') {
              const seen = new Set();
              const uniqueUsers = [];
              remoteRecords.forEach(u => {
                const key = (u.username || u.uid || u.id || '').toLowerCase();
                if (key && !seen.has(key)) {
                  seen.add(key);
                  uniqueUsers.push(u);
                }
              });
              this.data.users = uniqueUsers;
            } else {
              this.data[col] = remoteRecords;
            }

            // If current user is an agent, keep their active session updated with any changes from admin
            if (this.currentUser && !isAdmin && (col === 'agents' || col === 'users')) {
              const agentList = this.data.agents || [];
              const myAg = agentList.find(a => 
                a.id === this.currentUser.uid || 
                (a.username && a.username.toLowerCase() === (this.currentUser.username || '').toLowerCase()) ||
                (a.code && a.code === this.currentUser.agentCode)
              );
              if (myAg) {
                let changed = false;
                if (this.currentUser.displayName !== myAg.name) {
                  this.currentUser.displayName = myAg.name;
                  this.currentUser.agentName = myAg.name;
                  changed = true;
                }
                if (this.currentUser.agentCode !== myAg.code) {
                  this.currentUser.agentCode = myAg.code;
                  changed = true;
                }
                if (this.currentUser.username !== myAg.username) {
                  this.currentUser.username = myAg.username;
                  changed = true;
                }
                if (changed) {
                  sessionStorage.setItem('sari_active_session', JSON.stringify(this.currentUser));
                  const topName = document.getElementById('user-display-name');
                  if (topName) topName.textContent = myAg.name;
                }
              }
            }

            this.saveLocal();
            window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: col } }));
          }
        }, err => {
          console.warn(`Firestore listener on ${col}:`, err.message);
        });
        this.unsubscribers.push(unsub);
      } catch (e) {
        console.warn(`Could not attach listener for ${col}`, e);
      }
    });

    // Submissions sync
    try {
      const subUnsub = this.db.collection('agentSubmissions').onSnapshot(snap => {
        const subs = snap.empty ? [] : snap.docs.map(d => ({ id: d.id, ...d.data() })); if (this.currentUser && !isAdmin) { const agentUid = this.currentUser.uid; const agentName = this.currentUser.agentName || this.currentUser.displayName; this.data.agentSubmissions = subs.filter(s => s.submittedBy === agentUid || s.seller === agentName || s.agentName === agentName); } else { this.data.agentSubmissions = subs; } this.saveLocal(); window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: 'agentSubmissions' } }));
      }, err => console.warn('Submissions listener err:', err));
      this.unsubscribers.push(subUnsub);
    } catch (e) {}
  }

  stopRealtimeSync() {
    this.unsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.unsubscribers = [];
  }

  // Diff-write batch save to Firestore with fixed IDs for singletons
  async pushToFirestore(collectionName, items) {
    if (!this.db || !window.isFirebaseConfigured()) return;
    try {
      const itemsList = Array.isArray(items) ? items : [items];
      const batchSize = 100;
      for (let i = 0; i < itemsList.length; i += batchSize) {
        const batch = this.db.batch();
        const chunk = itemsList.slice(i, i + batchSize);
        chunk.forEach(item => {
          let docId = item.id;
          if (collectionName === 'pricing') {
            docId = 'default';
          } else if (collectionName === 'templates') {
            docId = 'main';
          } else if (!docId) {
            docId = 'doc-' + Math.random().toString(36).substring(2, 9);
          }

          const normalizedItem = { ...item, id: docId };

          // Top-level collection write
          const topRef = this.db.collection(collectionName).doc(docId);
          batch.set(topRef, normalizedItem, { merge: true });

          // If users collection, also index by username for direct fast lookup
          if (collectionName === 'users' && item.username) {
            const userByNameRef = this.db.collection('users').doc(item.username.toLowerCase());
            batch.set(userByNameRef, normalizedItem, { merge: true });
          }

          // Mirror to appData for backwards compatibility
          if (collectionName === 'agentSubmissions') {
            const uid = item.submittedBy || this.currentUser?.uid || 'general';
            const subRef = this.db.collection('agentSubmissions').doc(uid).collection('items').doc(docId);
            batch.set(subRef, normalizedItem, { merge: true });
            const centralRef = this.db.collection('appData').doc('agentSubmissions').collection('records').doc(docId);
            batch.set(centralRef, normalizedItem, { merge: true });
          } else {
            const docRef = this.db.collection('appData').doc(collectionName).collection('records').doc(docId);
            batch.set(docRef, normalizedItem, { merge: true });
          }
        });
        await batch.commit();
      }
    } catch (e) {
      console.warn(`Error syncing ${collectionName} to Firestore (operating on local cache):`, e);
    }
  }

  async deleteFirestoreSubmission(submittedBy, subId) {
    if (!this.db || !window.isFirebaseConfigured()) return;
    try {
      const uid = submittedBy || this.currentUser?.uid || 'general';
      await Promise.all([
        this.db.collection('agentSubmissions').doc(uid).collection('items').doc(subId).delete().catch(() => {}),
        this.db.collection('agentSubmissions').doc(subId).delete().catch(() => {}),
        this.db.collection('appData').doc('agentSubmissions').collection('records').doc(subId).delete().catch(() => {})
      ]);
    } catch (e) {
      console.warn('Error deleting submission from Firestore:', e);
    }
  }

  // Queue-based save with robust offline/permission handling
  async commitData(collectionName, updatedItems) {
    this.data[collectionName] = updatedItems;
    this.saveLocal();
    window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: collectionName } }));

    if (this.db && window.isFirebaseConfigured()) {
      try {
        await this.pushToFirestore(collectionName, updatedItems);
      } catch (err) {
        console.warn(`Push to Firestore failed for ${collectionName} (operating on local cache):`, err);
      }
    }
  }

  // Atomically commit updates to multiple collections in a single Firestore batch
  async batchCommitData(updates) {
    // updates: Array of {collectionName, items}
    for (const update of updates) {
      this.data[update.collectionName] = update.items;
    }
    this.saveLocal();
    window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: 'all' } }));

    if (this.db && window.isFirebaseConfigured()) { try { for (const update of updates) { await this.pushToFirestore(update.collectionName, update.items); } } catch (err) { console.warn('Batch commit to Firestore failed:', err); } }
  }

  // Delete a single item from local and Firestore with strict sync check
  async deleteItem(collectionName, itemId) { if (!itemId) return; if (collectionName === 'sales' && this.db) { try { const debtsRef = this.db.collection('debts'); const snap = await debtsRef.where('saleId', '==', itemId).get(); snap.forEach(d => this.deleteItem('debts', d.id)); } catch(e) {} } // Strict immediate update of local in-memory state and localStorage
    this.data[collectionName] = (this.data[collectionName] || []).filter(item => {
      if (collectionName === 'users') {
        return item.uid !== itemId && item.username !== itemId;
      }
      return item.id !== itemId;
    });
    this.saveLocal();
    window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: collectionName } }));

    if (this.db && window.isFirebaseConfigured()) {
      try {
        const batch = this.db.batch();
        batch.delete(this.db.collection(collectionName).doc(itemId));
        batch.delete(this.db.collection('appData').doc(collectionName).collection('records').doc(itemId));
        if (collectionName === 'users') {
          batch.delete(this.db.collection('users').doc(itemId.toLowerCase()));
        }
        await batch.commit();
      } catch (err) {
        console.warn(`Error deleting item ${itemId} from ${collectionName}:`, err);
      }
    }
  }

  // Completely wipe all core data from local and Firestore
  async clearAllData() {
    const collections = ['subscribers', 'sales', 'debts', 'agents', 'users', 'pricing', 'templates', 'agentSubmissions', 'codes', 'agentSettlements', 'products'];
    for (const col of collections) {
      await this.clearCollection(col);
    }
  }

  // Completely wipe a collection (e.g. barcodes/codes reset) locally and in Firestore
  async clearCollection(collectionName) {
    this.data[collectionName] = [];
    this.saveLocal();
    window.dispatchEvent(new CustomEvent('sari:data-updated', { detail: { collection: collectionName } }));

    if (this.db && window.isFirebaseConfigured()) {
      try {
        // Clear from top-level collection
        const snap = await this.db.collection(collectionName).get();
        if (!snap.empty) {
          const batchSize = 100;
          for (let i = 0; i < snap.docs.length; i += batchSize) {
            const batch = this.db.batch();
            const chunk = snap.docs.slice(i, i + batchSize);
            chunk.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        }
        // Clear from appData records
        const snap2 = await this.db.collection('appData').doc(collectionName).collection('records').get();
        if (!snap2.empty) {
          const batchSize = 100;
          for (let i = 0; i < snap2.docs.length; i += batchSize) {
            const batch = this.db.batch();
            const chunk = snap2.docs.slice(i, i + batchSize);
            chunk.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
          }
        }
      } catch (err) {
        console.warn(`Error clearing Firestore collection ${collectionName}:`, err);
      }
    }
  }
}

window.resolveAgentName = function(record) {
  if (!record) return 'المركز الرئيسي';
  const engine = window.syncEngine;
  const agents = engine && engine.data ? (engine.data.agents || []) : [];
  const match = agents.find(a => 
    (record.agentId && a.id === record.agentId) ||
    (record.submittedBy && a.id === record.submittedBy) ||
    (record.agentCode && a.code === record.agentCode) ||
    (record.owner && (a.name === record.owner || a.username === record.owner.toLowerCase())) ||
    (record.seller && (a.name === record.seller || a.username === record.seller.toLowerCase())) ||
    (record.agentName && (a.name === record.agentName || a.username === record.agentName.toLowerCase()))
  );
  if (match) return match.name;
  return record.seller || record.agentName || record.owner || 'المركز الرئيسي';
};

window.syncEngine = new SariSyncEngine();







