/**
 * culture-db.js
 * IndexedDB storage for Culture monuments with 5-slot multi-angle gallery
 * Database: 'RusHistoryTrainerDB', Store: 'cultureGallery'
 */

(function() {
  'use strict';

  // =====================================================================
  //  1. GUARANTEED CSS INJECTION FOR 5-SLOT GALLERY & LIGHTBOX NAV
  // =====================================================================
  function ensureCultureStyles() {
    if (document.getElementById('culture-gallery-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'culture-gallery-styles';
    styleEl.textContent = `
      /* Culture 5-slot angles bar */
      .cult-angles-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        margin: 10px auto 4px auto;
        padding: 6px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 12px;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        width: fit-content;
        max-width: 100%;
        user-select: none;
        z-index: 5;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      }
      .cult-angles-bar.compact {
        margin: 4px auto 0 auto;
        padding: 4px 6px;
        gap: 5px;
        background: rgba(14, 20, 36, 0.85);
        border-color: rgba(201, 168, 76, 0.25);
      }
      .cult-angle-slot {
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: 8px;
        border: 2px solid rgba(255, 255, 255, 0.18);
        background: rgba(0, 0, 0, 0.45);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
        flex-shrink: 0;
      }
      .cult-angles-bar.compact .cult-angle-slot {
        width: 28px;
        height: 28px;
        border-radius: 6px;
      }
      .cult-angle-slot:hover {
        transform: translateY(-2px);
        border-color: rgba(245, 158, 11, 0.7);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      }
      .cult-angle-slot.active {
        border-color: #f59e0b;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.5), inset 0 0 6px rgba(245, 158, 11, 0.35);
      }
      .cult-angle-slot img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
      }
      .cult-angle-slot .slot-num {
        position: absolute;
        top: 2px;
        left: 2px;
        font-size: 9px;
        font-weight: 700;
        line-height: 1;
        padding: 2px 4px;
        background: rgba(0, 0, 0, 0.75);
        color: #fbbf24;
        border-radius: 4px;
        pointer-events: none;
      }
      .cult-angles-bar.compact .cult-angle-slot .slot-num {
        font-size: 7px;
        padding: 1px 3px;
        top: 1px;
        left: 1px;
      }
      .cult-angle-slot .slot-del-btn {
        position: absolute;
        top: 1px;
        right: 1px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.9);
        color: #fff;
        border: none;
        font-size: 10px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s, transform 0.15s;
        padding: 0;
        z-index: 2;
      }
      .cult-angle-slot:hover .slot-del-btn {
        opacity: 1;
      }
      .cult-angle-slot .slot-del-btn:hover {
        background: #ef4444;
        transform: scale(1.18);
      }
      .cult-angle-slot.slot-add {
        border: 2px dashed rgba(245, 158, 11, 0.5);
        color: #f59e0b;
        font-size: 17px;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.08);
      }
      .cult-angles-bar.compact .cult-angle-slot.slot-add {
        font-size: 13px;
      }
      .cult-angle-slot.slot-add:hover {
        background: rgba(245, 158, 11, 0.22);
        border-color: #f59e0b;
        color: #fbbf24;
      }
      .cult-angle-slot.slot-empty {
        border: 1px dashed rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.02);
        color: rgba(255, 255, 255, 0.25);
        cursor: pointer;
      }
      .cult-angle-slot.slot-empty:hover {
        border-color: rgba(245, 158, 11, 0.35);
        background: rgba(245, 158, 11, 0.05);
      }
      .cult-angle-slot.drag-hover {
        border-color: #f59e0b !important;
        background: rgba(245, 158, 11, 0.3) !important;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.6) !important;
      }
      .bst-mon-thumb-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .lightbox-nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(20, 20, 30, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.22);
        color: #fff;
        font-size: 22px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10001;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .lightbox-nav-btn:hover {
        background: rgba(245, 158, 11, 0.9);
        color: #000;
        border-color: #f59e0b;
        box-shadow: 0 0 16px rgba(245, 158, 11, 0.55);
        transform: translateY(-50%) scale(1.1);
      }
      #lightbox-prev { left: 24px; }
      #lightbox-next { right: 24px; }
      #lightbox-counter {
        position: absolute;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: #f59e0b;
        padding: 4px 14px;
        border-radius: 20px;
        border: 1px solid rgba(245, 158, 11, 0.4);
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.5px;
        z-index: 10001;
        pointer-events: none;
      }
      @media (max-width: 600px) {
        .cult-angle-slot { width: 38px; height: 38px; }
        #lightbox-prev { left: 10px; width: 40px; height: 40px; font-size: 18px; }
        #lightbox-next { right: 10px; width: 40px; height: 40px; font-size: 18px; }
      }
    `;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  ensureCultureStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureCultureStyles);
  }

  // =====================================================================
  //  2. INDEXEDDB CONFIG & PROMISES
  // =====================================================================
  const IDB_CULT_DB = 'RusHistoryTrainerDB';
  const IDB_CULT_STORE = 'cultureGallery';
  const IDB_CULT_VER = 2;

  let _cultIdbPromise = null;
  function getCultureIDB() {
    if (!_cultIdbPromise) {
      _cultIdbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
          return reject(new Error('IndexedDB не поддерживается браузером'));
        }
        const req = indexedDB.open(IDB_CULT_DB, IDB_CULT_VER);
        req.onupgradeneeded = function(e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_CULT_STORE)) {
            db.createObjectStore(IDB_CULT_STORE);
          }
          if (!db.objectStoreNames.contains('cultureImages')) {
            db.createObjectStore('cultureImages');
          }
        };
        req.onblocked = function() {
          console.warn('RusHistoryTrainerDB upgrade blocked. Closing connection...');
        };
        req.onsuccess = function() {
          const db = req.result;
          db.onversionchange = function() {
            try { db.close(); } catch(e) {}
            _cultIdbPromise = null;
          };
          resolve(db);
        };
        req.onerror = function() {
          _cultIdbPromise = null;
          reject(req.error);
        };
      });
    }
    return _cultIdbPromise;
  }

  async function idbSaveCultureGallery(cultId, dataUrlArr) {
    try {
      const db = await getCultureIDB();
      const arr = Array.isArray(dataUrlArr) ? dataUrlArr : (dataUrlArr ? [dataUrlArr] : []);
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_CULT_STORE, 'readwrite');
        const store = tx.objectStore(IDB_CULT_STORE);
        store.put(arr, cultId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('idbSaveCultureGallery error:', err);
      return false;
    }
  }

  async function idbGetAllCultureGallery() {
    try {
      const db = await getCultureIDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_CULT_STORE, 'readonly');
        const store = tx.objectStore(IDB_CULT_STORE);
        const res = {};
        const req = store.openCursor();
        req.onsuccess = function(e) {
          const cursor = e.target.result;
          if (cursor) {
            res[cursor.key] = cursor.value;
            cursor.continue();
          } else {
            resolve(res);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('idbGetAllCultureGallery error:', err);
      return {};
    }
  }

  async function idbGetAllLegacyCultureImages() {
    try {
      const db = await getCultureIDB();
      if (!db.objectStoreNames.contains('cultureImages')) return {};
      return new Promise((resolve) => {
        try {
          const tx = db.transaction('cultureImages', 'readonly');
          const store = tx.objectStore('cultureImages');
          const res = {};
          const req = store.openCursor();
          req.onsuccess = function(e) {
            const cursor = e.target.result;
            if (cursor) {
              res[cursor.key] = cursor.value;
              cursor.continue();
            } else {
              resolve(res);
            }
          };
          req.onerror = () => resolve({});
        } catch (err) {
          resolve({});
        }
      });
    } catch (err) {
      return {};
    }
  }

  // =====================================================================
  //  3. IN-MEMORY STATE & ADAPTIVE GETTERS
  // =====================================================================
  window.CUSTOM_CULTURE_GALLERY = window.CUSTOM_CULTURE_GALLERY || {};
  window.CUSTOM_CULTURE_IMAGES = window.CUSTOM_CULTURE_IMAGES || {};
  window.monumentActiveAngle = window.monumentActiveAngle || {};
  window._pendingCultId = null;
  window._pendingAngleSlot = null;

  function getActiveMode() {
    if (typeof window.getCurrentMode === 'function') {
      try { const m = window.getCurrentMode(); if (m) return m; } catch(e) {}
    }
    const activeBtn = document.querySelector('.mode-btn.active');
    return activeBtn ? activeBtn.dataset.mode : 'dates';
  }

  function getActiveCard() {
    if (typeof window.getCurrentCard === 'function') {
      try { const c = window.getCurrentCard(); if (c) return c; } catch(e) {}
    }
    const disp = (typeof window.getDisplayEvents === 'function' ? window.getDisplayEvents() : null) || window.displayEvents;
    const idx = (typeof window.getCardIdx === 'function' ? window.getCardIdx() : null) ?? window.cardIdx;
    if (disp && typeof idx === 'number' && disp[idx]) {
      return disp[idx];
    }
    return null;
  }

  function getCurrentCultureId() {
    const mode = getActiveMode();
    if (mode === 'culture') {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
      if (activeTab === 'cards') {
        const c = getActiveCard();
        if (c && c.id) return c.id;
        return window._activeCultureId || window._pendingCultId || null;
      } else if (activeTab === 'quiz') {
        const q = (typeof window.getQuizQuestion === 'function' ? window.getQuizQuestion() : null) || window.quizQuestion;
        if (q && q.target && q.target.id) return q.target.id;
        return window._activeCultureId || window._pendingCultId || null;
      } else if (activeTab === 'input') {
        const inp = (typeof window.getInputQuestion === 'function' ? window.getInputQuestion() : null) || window.inputQuestion;
        if (inp && inp.target && inp.target.id) return inp.target.id;
        return window.activeCultureMonumentId || window._activeCultureId || window._pendingCultId || null;
      }
    } else if (mode === 'bestiary') {
      return window.activeCultureMonumentId || window._pendingCultId || window._activeCultureId || null;
    }
    return window._pendingCultId || window.activeCultureMonumentId || window._activeCultureId || null;
  }

  function getCultureImages(item) {
    if (!item) return [];
    const id = typeof item === 'string' ? item : item.id;
    if (!id) return (item && item.image) ? [item.image] : [];

    if (window.CUSTOM_CULTURE_GALLERY && Array.isArray(window.CUSTOM_CULTURE_GALLERY[id]) && window.CUSTOM_CULTURE_GALLERY[id].length > 0) {
      return window.CUSTOM_CULTURE_GALLERY[id];
    }
    if (window.CUSTOM_CULTURE_IMAGES && window.CUSTOM_CULTURE_IMAGES[id]) {
      const val = window.CUSTOM_CULTURE_IMAGES[id];
      return Array.isArray(val) ? val : [val];
    }
    if (item && item.image) return [item.image];
    return [];
  }

  function getCultureImage(item, angleIdx) {
    if (!item) return '';
    const imgs = getCultureImages(item);
    if (!imgs || imgs.length === 0) return (item && item.image) || '';
    if (typeof angleIdx === 'number' && angleIdx >= 0 && angleIdx < imgs.length) {
      return imgs[angleIdx];
    }
    const id = typeof item === 'string' ? item : item.id;
    const activeIdx = id && typeof window.monumentActiveAngle[id] === 'number' ? window.monumentActiveAngle[id] : 0;
    return imgs[activeIdx] || imgs[0] || (item && item.image) || '';
  }

  function compressImageFile(file, maxDim = 900, quality = 0.80) {
    return new Promise((resolve, reject) => {
      if (!file || !(file instanceof Blob)) {
        return reject(new Error('Не изображение'));
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.onload = function(e) {
        const img = new Image();
        img.onerror = () => reject(new Error('Не удалось декодировать картинку'));
        img.onload = function() {
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (!w || !h) {
            return reject(new Error('Некорректный размер картинки'));
          }
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // =====================================================================
  //  4. SAVING, DELETING & SELECTING SLOTS
  // =====================================================================
  function triggerCulturePhotoUpload(cultId, event, targetSlotIdx = null) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const targetId = cultId || getCurrentCultureId();
    if (!targetId) {
      console.warn('triggerCulturePhotoUpload: monument id not determined');
      return;
    }
    window._pendingCultId = targetId;
    const activeAngle = (typeof window.monumentActiveAngle[targetId] === 'number') ? window.monumentActiveAngle[targetId] : 0;
    window._pendingAngleSlot = (typeof targetSlotIdx === 'number') ? targetSlotIdx : activeAngle;
    const inp = document.getElementById('quick-cult-upload');
    if (inp) {
      inp.value = '';
      inp.click();
    }
  }

  async function handleQuickCultUpload(inputEl) {
    const file = inputEl && inputEl.files && inputEl.files[0];
    const cultId = window._pendingCultId || getCurrentCultureId();
    const slotIdx = window._pendingAngleSlot;
    if (!file || !cultId) {
      if (inputEl) inputEl.value = '';
      window._pendingCultId = null;
      window._pendingAngleSlot = null;
      return;
    }
    try {
      const dataUrl = await compressImageFile(file, 900, 0.80);
      await saveCultureAngle(cultId, dataUrl, slotIdx);
    } catch (err) {
      console.error('Ошибка загрузки фото культуры:', err);
      alert('Не удалось обработать изображение: ' + (err.message || err));
    } finally {
      if (inputEl) inputEl.value = '';
      window._pendingCultId = null;
      window._pendingAngleSlot = null;
    }
  }

  async function saveCultureAngle(cultId, dataUrl, slotIdx = null) {
    if (!cultId || !dataUrl) return false;

    if (!window.CUSTOM_CULTURE_GALLERY) window.CUSTOM_CULTURE_GALLERY = {};
    let list = Array.isArray(window.CUSTOM_CULTURE_GALLERY[cultId]) 
      ? [...window.CUSTOM_CULTURE_GALLERY[cultId]] 
      : [];

    let savedSlotNum = 1;
    if (typeof slotIdx === 'number' && slotIdx >= 0 && slotIdx < 5) {
      if (slotIdx < list.length) {
        list[slotIdx] = dataUrl;
        savedSlotNum = slotIdx + 1;
      } else {
        if (list.length < 5) {
          list.push(dataUrl);
          savedSlotNum = list.length;
        } else {
          list[4] = dataUrl;
          savedSlotNum = 5;
        }
      }
      window.monumentActiveAngle[cultId] = Math.min(slotIdx, list.length - 1);
    } else {
      const activeIdx = (typeof window.monumentActiveAngle[cultId] === 'number') ? window.monumentActiveAngle[cultId] : 0;
      if (list.length === 0) {
        list.push(dataUrl);
        savedSlotNum = 1;
        window.monumentActiveAngle[cultId] = 0;
      } else if (activeIdx < list.length) {
        list[activeIdx] = dataUrl;
        savedSlotNum = activeIdx + 1;
      } else if (list.length < 5) {
        list.push(dataUrl);
        savedSlotNum = list.length;
        window.monumentActiveAngle[cultId] = list.length - 1;
      } else {
        list[4] = dataUrl;
        savedSlotNum = 5;
        window.monumentActiveAngle[cultId] = 4;
      }
    }

    if (list.length > 5) list = list.slice(0, 5);

    window.CUSTOM_CULTURE_GALLERY[cultId] = list;
    if (!window.CUSTOM_CULTURE_IMAGES) window.CUSTOM_CULTURE_IMAGES = {};
    window.CUSTOM_CULTURE_IMAGES[cultId] = list[0] || dataUrl;

    // 1. Primary IndexedDB save
    await idbSaveCultureGallery(cultId, list);

    // 2. LocalStorage cache fallback
    try {
      localStorage.setItem('rus-trainer-cult-gallery-v1', JSON.stringify(window.CUSTOM_CULTURE_GALLERY));
      localStorage.setItem('rus-trainer-cult-imgs-v1', JSON.stringify(window.CUSTOM_CULTURE_IMAGES));
    } catch(e) {}

    // 3. Audio & Toast feedback
    if (typeof window.soundCorrect === 'function') {
      try { window.soundCorrect(); } catch(e) {}
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`✓ Ракурс сохранен (${savedSlotNum}/5)`);
    }

    // 4. Instant view refresh
    refreshAllCultureViews(cultId, dataUrl);
    return true;
  }

  async function deleteCultureAngle(cultId, slotIdx, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!confirm(`Удалить ракурс ${slotIdx + 1}?`)) return;

    let list = Array.isArray(window.CUSTOM_CULTURE_GALLERY[cultId]) 
      ? [...window.CUSTOM_CULTURE_GALLERY[cultId]] 
      : [];

    if (slotIdx >= 0 && slotIdx < list.length) {
      list.splice(slotIdx, 1);
    }

    window.CUSTOM_CULTURE_GALLERY[cultId] = list;
    if (!window.CUSTOM_CULTURE_IMAGES) window.CUSTOM_CULTURE_IMAGES = {};
    window.CUSTOM_CULTURE_IMAGES[cultId] = list[0] || '';

    if (window.monumentActiveAngle[cultId] >= list.length) {
      window.monumentActiveAngle[cultId] = Math.max(0, list.length - 1);
    }

    // Update IndexedDB
    await idbSaveCultureGallery(cultId, list);

    // Update LocalStorage cache
    try {
      localStorage.setItem('rus-trainer-cult-gallery-v1', JSON.stringify(window.CUSTOM_CULTURE_GALLERY));
      localStorage.setItem('rus-trainer-cult-imgs-v1', JSON.stringify(window.CUSTOM_CULTURE_IMAGES));
    } catch(e) {}

    if (typeof window.soundClick === 'function') {
      try { window.soundClick(); } catch(e) {}
    }
    if (typeof window.showToast === 'function') {
      window.showToast('✓ Ракурс удален');
    }

    refreshAllCultureViews(cultId);
  }

  function selectCultureAngle(cultId, slotIdx, event) {
    if (event) {
      event.stopPropagation();
    }
    window.monumentActiveAngle[cultId] = slotIdx;
    if (typeof window.soundClick === 'function') {
      try { window.soundClick(); } catch(e) {}
    }
    const mode = getActiveMode();
    if (mode === 'culture') {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
      if (activeTab === 'cards' && typeof window.renderCard === 'function') {
        window.renderCard();
      }
    } else if (mode === 'bestiary') {
      if (typeof window.renderBestiary === 'function') window.renderBestiary();
    }
    updateFlashcardAnglesBar(cultId);
    updateBestiaryAnglesBars();
  }

  // =====================================================================
  //  5. DRAG & DROP AND PASTE (CTRL+V) HANDLERS
  // =====================================================================
  async function handleCultDrop(event, cultId) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-hover');
    const targetId = cultId || getCurrentCultureId();
    if (!targetId) return;

    const dt = event.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const dataUrl = await compressImageFile(file, 900, 0.80);
      const activeIdx = (typeof window.monumentActiveAngle[targetId] === 'number') ? window.monumentActiveAngle[targetId] : 0;
      await saveCultureAngle(targetId, dataUrl, activeIdx);
    } catch(err) {
      console.error('Ошибка Drag & Drop изображения:', err);
      alert('Не удалось обработать перетащенное изображение: ' + (err.message || err));
    }
  }

  async function handleCultureAngleSlotDrop(event, cultId, slotIdx) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-hover');
    if (!cultId) return;

    const dt = event.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const dataUrl = await compressImageFile(file, 900, 0.80);
      await saveCultureAngle(cultId, dataUrl, slotIdx);
    } catch(err) {
      console.error('Ошибка Drag & Drop в слот ракурса:', err);
      alert('Не удалось обработать изображение: ' + (err.message || err));
    }
  }

  async function handleCultureSlotDrop(event, slotType) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-hover');

    let cultId = null;
    if (slotType === 'fc') {
      const c = getActiveCard();
      cultId = c ? c.id : null;
    } else if (slotType === 'quiz') {
      const q = (typeof window.getQuizQuestion === 'function' ? window.getQuizQuestion() : null) || window.quizQuestion;
      cultId = q?.target?.id;
    } else if (slotType === 'inp') {
      const inp = (typeof window.getInputQuestion === 'function' ? window.getInputQuestion() : null) || window.inputQuestion;
      cultId = inp?.target?.id;
    }
    if (!cultId) cultId = getCurrentCultureId();
    if (!cultId) return;

    const dt = event.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const dataUrl = await compressImageFile(file, 900, 0.80);
      const activeIdx = (typeof window.monumentActiveAngle[cultId] === 'number') ? window.monumentActiveAngle[cultId] : 0;
      await saveCultureAngle(cultId, dataUrl, activeIdx);
    } catch(err) {
      console.error('Ошибка Drag & Drop изображения:', err);
      alert('Не удалось обработать перетащенное изображение: ' + (err.message || err));
    }
  }

  document.addEventListener('paste', async function(e) {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    let imageFile = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        imageFile = items[i].getAsFile();
        break;
      }
    }
    if (!imageFile) return;

    const targetId = getCurrentCultureId();
    if (!targetId) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    try {
      const dataUrl = await compressImageFile(imageFile, 900, 0.80);
      const activeIdx = (typeof window.monumentActiveAngle[targetId] === 'number') ? window.monumentActiveAngle[targetId] : 0;
      await saveCultureAngle(targetId, dataUrl, activeIdx);
    } catch(err) {
      console.error('Ошибка вставки фото культуры:', err);
      alert('Не удалось обработать вставленное изображение: ' + (err.message || err));
    }
  }, true);

  // =====================================================================
  //  6. HTML GENERATOR FOR 5-SLOT ANGLES BAR
  // =====================================================================
  function createAnglesBarInnerHtml(cultId) {
    if (!cultId) return '';
    const imgs = getCultureImages(cultId);
    const activeIdx = (typeof window.monumentActiveAngle[cultId] === 'number') ? window.monumentActiveAngle[cultId] : 0;
    
    let slotsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < imgs.length) {
        const isActive = (i === activeIdx);
        const imgSrc = imgs[i];
        slotsHtml += `
          <div class="cult-angle-slot ${isActive ? 'active' : ''}" onclick="selectCultureAngle('${cultId}', ${i}, event)" ondblclick="triggerCulturePhotoUpload('${cultId}', event, ${i})" ondragover="handleCultDragOver(event)" ondragleave="handleCultDragLeave(event)" ondrop="handleCultureAngleSlotDrop(event, '${cultId}', ${i})" title="Ракурс ${i+1} (клик — выбор, 2-й клик — замена, перетащите файл)">
            <span class="slot-num">${i+1}</span>
            <img src="${imgSrc}" alt="Ракурс ${i+1}">
            <button class="slot-del-btn" onclick="deleteCultureAngle('${cultId}', ${i}, event)" title="Удалить ракурс ${i+1}">✕</button>
          </div>
        `;
      } else if (i === imgs.length) {
        slotsHtml += `
          <div class="cult-angle-slot slot-add" onclick="triggerCulturePhotoUpload('${cultId}', event, ${i})" ondragover="handleCultDragOver(event)" ondragleave="handleCultDragLeave(event)" ondrop="handleCultureAngleSlotDrop(event, '${cultId}', ${i})" title="Добавить ракурс ${i+1} (до 5, перетащите файл сюда)">
            <span class="slot-num">${i+1}</span>
            <span>➕</span>
          </div>
        `;
      } else {
        slotsHtml += `
          <div class="cult-angle-slot slot-empty" onclick="triggerCulturePhotoUpload('${cultId}', event, ${i})" ondragover="handleCultDragOver(event)" ondragleave="handleCultDragLeave(event)" ondrop="handleCultureAngleSlotDrop(event, '${cultId}', ${i})" title="Слот ${i+1} (клик для добавления)">
            <span class="slot-num">${i+1}</span>
          </div>
        `;
      }
    }
    return slotsHtml;
  }

  function createAnglesBarHtml(cultId, variant = 'full') {
    if (!cultId) return '';
    const inner = createAnglesBarInnerHtml(cultId);
    return `<div class="cult-angles-bar ${variant === 'compact' ? 'compact' : ''}" id="bst-angles-${cultId}" data-monument-id="${cultId}" onclick="event.stopPropagation()">${inner}</div>`;
  }

  function updateFlashcardAnglesBar(passedCultId) {
    const mode = getActiveMode();
    if (mode !== 'culture') {
      const existing = document.getElementById('fc-angles-bar');
      if (existing) existing.style.display = 'none';
      return;
    }
    const frontEl = document.getElementById('fc-culture-front');
    if (!frontEl) return;

    const card = getActiveCard();
    const cultId = passedCultId || (card && card.id) || getCurrentCultureId();
    if (!cultId) return;

    let barEl = document.getElementById('fc-angles-bar');
    if (!barEl) {
      barEl = document.createElement('div');
      barEl.id = 'fc-angles-bar';
      barEl.className = 'cult-angles-bar';
      barEl.onclick = (e) => e.stopPropagation();
      frontEl.appendChild(barEl);
    }
    barEl.style.display = 'flex';
    barEl.innerHTML = createAnglesBarInnerHtml(cultId);

    const activeImg = getCultureImage(cultId);
    const imgEl = document.getElementById('fc-cult-img');
    const placeholderEl = document.getElementById('fc-cult-placeholder');
    const replaceBtn = document.getElementById('fc-cult-replace');
    const zoomHint = document.getElementById('fc-cult-zoom');
    if (activeImg) {
      if (imgEl) { imgEl.src = activeImg; imgEl.style.display = 'block'; }
      if (placeholderEl) placeholderEl.style.display = 'none';
      if (replaceBtn) replaceBtn.style.display = '';
      if (zoomHint) zoomHint.style.display = '';
    } else {
      if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
      if (placeholderEl) placeholderEl.style.display = 'flex';
      if (replaceBtn) replaceBtn.style.display = 'none';
      if (zoomHint) zoomHint.style.display = 'none';
    }
  }

  function updateBestiaryAnglesBars() {
    const container = document.getElementById('bst-content');
    if (!container) return;
    const cards = container.querySelectorAll('.bst-mon-card');
    cards.forEach(card => {
      const cultId = card.dataset.monId || card.querySelector('[ondrop*="handleCultDrop"]')?.getAttribute('ondrop')?.match(/['"]([^'"]+)['"]/)?.[1];
      if (!cultId) return;

      const activeImg = getCultureImage(cultId);
      const thumb = card.querySelector('.bst-mon-thumb');
      if (thumb) {
        const thumbImg = thumb.querySelector('img');
        if (thumbImg && activeImg) {
          thumbImg.src = activeImg;
        }
      }

      let bar = card.querySelector('.cult-angles-bar');
      if (bar) {
        bar.innerHTML = createAnglesBarInnerHtml(cultId);
      } else if (thumb) {
        const barWrap = document.createElement('div');
        barWrap.innerHTML = createAnglesBarHtml(cultId, 'compact');
        thumb.insertAdjacentElement('afterend', barWrap.firstElementChild);
      }
    });
  }

  function refreshAllCultureViews(cultId, activeImgSrc) {
    if (typeof window.renderCard === 'function') {
      try { window.renderCard(); } catch(e) {}
    }
    if (typeof window.renderBestiary === 'function') {
      try { window.renderBestiary(); } catch(e) {}
    }
    updateFlashcardAnglesBar(cultId);
    updateBestiaryAnglesBars();

    const targetId = cultId || getCurrentCultureId();
    if (!targetId) return;
    const src = activeImgSrc || getCultureImage(targetId);

    // Quiz media update
    const qzImg = document.getElementById('qz-img');
    const qzPlaceholder = document.getElementById('qz-placeholder');
    const qzReplace = document.getElementById('qz-replace');
    const qzZoom = document.getElementById('qz-zoom');
    if (qzImg) {
      const qTarget = (typeof window.getQuizQuestion === 'function' ? window.getQuizQuestion()?.target : null) || window.quizQuestion?.target;
      if (qTarget && qTarget.id === targetId) {
        if (src) {
          qzImg.src = src;
          qzImg.style.display = 'block';
          if (qzPlaceholder) qzPlaceholder.style.display = 'none';
          if (qzReplace) qzReplace.style.display = '';
          if (qzZoom) qzZoom.style.display = '';
        } else {
          qzImg.src = '';
          qzImg.style.display = 'none';
          if (qzPlaceholder) qzPlaceholder.style.display = 'flex';
          if (qzReplace) qzReplace.style.display = 'none';
          if (qzZoom) qzZoom.style.display = 'none';
        }
      }
    }

    // Input question media update
    const inpImg = document.getElementById('inp-img');
    const inpPlaceholder = document.getElementById('inp-placeholder');
    const inpReplace = document.getElementById('inp-replace');
    const inpZoom = document.getElementById('inp-zoom');
    if (inpImg) {
      const iTarget = (typeof window.getInputQuestion === 'function' ? window.getInputQuestion()?.target : null) || window.inputQuestion?.target;
      if (iTarget && iTarget.id === targetId) {
        if (src) {
          inpImg.src = src;
          inpImg.style.display = 'block';
          if (inpPlaceholder) inpPlaceholder.style.display = 'none';
          if (inpReplace) inpReplace.style.display = '';
          if (inpZoom) inpZoom.style.display = '';
        } else {
          inpImg.src = '';
          inpImg.style.display = 'none';
          if (inpPlaceholder) inpPlaceholder.style.display = 'flex';
          if (inpReplace) inpReplace.style.display = 'none';
          if (inpZoom) inpZoom.style.display = 'none';
        }
      }
    }

    if (typeof window.refreshCurrentCultureView === 'function') {
      try { window.refreshCurrentCultureView(targetId, src); } catch(e) {}
    }
  }

  // =====================================================================
  //  7. LIGHTBOX MULTI-ANGLE NAVIGATION
  // =====================================================================
  let currentLightboxMonumentId = null;
  let currentLightboxAngleIdx = 0;

  function updateLightboxView(src, title) {
    const imgEl = document.getElementById('lightbox-img');
    const capEl = document.getElementById('lightbox-caption');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const counterEl = document.getElementById('lightbox-counter');

    if (imgEl) imgEl.src = src;
    if (capEl) capEl.textContent = title || '';

    const imgs = currentLightboxMonumentId ? getCultureImages(currentLightboxMonumentId) : [];
    if (imgs.length > 1) {
      if (prevBtn) prevBtn.style.display = 'flex';
      if (nextBtn) nextBtn.style.display = 'flex';
      if (counterEl) {
        counterEl.style.display = 'block';
        counterEl.textContent = `Ракурс ${currentLightboxAngleIdx + 1} из ${imgs.length}`;
      }
    } else {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (counterEl) counterEl.style.display = 'none';
    }
  }

  function stepLightboxAngle(delta) {
    if (!currentLightboxMonumentId) return;
    const imgs = getCultureImages(currentLightboxMonumentId);
    if (imgs.length <= 1) return;

    currentLightboxAngleIdx = (currentLightboxAngleIdx + delta + imgs.length) % imgs.length;
    const newSrc = imgs[currentLightboxAngleIdx];
    const capEl = document.getElementById('lightbox-caption');
    const title = capEl ? capEl.textContent : '';

    if (typeof window.soundClick === 'function') window.soundClick();
    updateLightboxView(newSrc, title);
  }

  function openLightbox(src, title, cultId = null, angleIdx = 0) {
    if (!src) return;
    if (typeof window.soundClick === 'function') window.soundClick();
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    const targetId = cultId || getCurrentCultureId();
    currentLightboxMonumentId = targetId;
    currentLightboxAngleIdx = (typeof angleIdx === 'number') 
      ? angleIdx 
      : (targetId && typeof window.monumentActiveAngle[targetId] === 'number' ? window.monumentActiveAngle[targetId] : 0);

    updateLightboxView(src, title);
    modal.classList.add('open');
  }

  function openLightboxFromCard(event) {
    if (event) event.stopPropagation();
    const card = getActiveCard();
    if (!card) return;
    const src = getCultureImage(card);
    if (src) {
      const activeAngle = window.monumentActiveAngle[card.id] || 0;
      openLightbox(src, `${card.title} (${card.year})`, card.id, activeAngle);
    }
  }

  function handleCultureSlotClick(event, slotType) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    let cultId = null;
    let imgSrc = null;
    let title = '';

    if (slotType === 'fc') {
      const card = getActiveCard();
      if (!card) return;
      cultId = card.id;
      imgSrc = getCultureImage(card);
      title = `${card.title} (${card.year})`;
    } else if (slotType === 'quiz') {
      const q = (typeof window.getQuizQuestion === 'function' ? window.getQuizQuestion() : null) || window.quizQuestion;
      if (!q || !q.target) return;
      cultId = q.target.id;
      imgSrc = getCultureImage(q.target);
      title = `${q.target.title} (${q.target.year})`;
    } else if (slotType === 'inp') {
      const inp = (typeof window.getInputQuestion === 'function' ? window.getInputQuestion() : null) || window.inputQuestion;
      if (!inp || !inp.target) return;
      cultId = inp.target.id;
      imgSrc = getCultureImage(inp.target);
      title = `${inp.target.title} (${inp.target.year})`;
    }

    if (!cultId) cultId = getCurrentCultureId();

    if (imgSrc) {
      const activeIdx = cultId ? (window.monumentActiveAngle[cultId] || 0) : 0;
      openLightbox(imgSrc, title, cultId, activeIdx);
    } else if (cultId) {
      triggerCulturePhotoUpload(cultId, event, 0);
    }
  }

  document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('lightbox-modal');
    if (!modal || !modal.classList.contains('open')) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepLightboxAngle(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepLightboxAngle(1);
    }
  });

  // =====================================================================
  //  8. BACKUP EXPORT & IMPORT
  // =====================================================================
  async function exportBackup() {
    const statusEl = document.getElementById('ed-export-status');
    let allCultGallery = { ...(window.CUSTOM_CULTURE_GALLERY || {}) };
    try {
      const idbGal = await idbGetAllCultureGallery();
      if (idbGal && typeof idbGal === 'object') {
        Object.assign(allCultGallery, idbGal);
      }
    } catch(e) {}

    const payload = {
      version: 4,
      exportedAt: new Date().toISOString(),
      custom: JSON.parse(localStorage.getItem('rus-trainer-custom-v1') || '{}'),
      learned: JSON.parse(localStorage.getItem('rus-trainer-learned-v1') || '[]'),
      streak: JSON.parse(localStorage.getItem('rus-trainer-streak-v1') || '{}'),
      cultGallery: allCultGallery,
      cultImages: window.CUSTOM_CULTURE_IMAGES || {},
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history-trainer-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (typeof window.showEdStatus === 'function') {
      window.showEdStatus(statusEl, 'ok', 'Файл резервной копии скачан!');
    }
  }

  function importBackup(event) {
    const statusEl = document.getElementById('ed-export-status');
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        const payload = JSON.parse(e.target.result);
        if (!payload || typeof payload !== 'object') throw new Error('Некорректный формат файла');
        if (payload.custom) localStorage.setItem('rus-trainer-custom-v1', JSON.stringify(payload.custom));
        if (Array.isArray(payload.learned)) {
          window.learnedKeys = new Set(payload.learned);
          if (typeof window.saveLearnedLS === 'function') window.saveLearnedLS();
          const learnedEl = document.getElementById('learned-count');
          if (learnedEl) learnedEl.textContent = window.learnedKeys.size;
        }
        if (payload.streak && typeof payload.streak === 'object') {
          localStorage.setItem('rus-trainer-streak-v1', JSON.stringify(payload.streak));
          if (typeof window.loadStreakLS === 'function') window.loadStreakLS();
        }
        if (payload.cultGallery && typeof payload.cultGallery === 'object') {
          for (const [cid, val] of Object.entries(payload.cultGallery)) {
            const arr = Array.isArray(val) ? val : (typeof val === 'string' && val ? [val] : []);
            if (cid && arr.length > 0) {
              window.CUSTOM_CULTURE_GALLERY[cid] = arr;
              await idbSaveCultureGallery(cid, arr);
            }
          }
        } else if (payload.cultImages && typeof payload.cultImages === 'object') {
          for (const [cid, cDataUrl] of Object.entries(payload.cultImages)) {
            if (cid && cDataUrl) {
              const arr = Array.isArray(cDataUrl) ? cDataUrl : [cDataUrl];
              window.CUSTOM_CULTURE_GALLERY[cid] = arr;
              await idbSaveCultureGallery(cid, arr);
            }
          }
        }
        if (!window.CUSTOM_CULTURE_IMAGES) window.CUSTOM_CULTURE_IMAGES = {};
        for (const [cid, arr] of Object.entries(window.CUSTOM_CULTURE_GALLERY)) {
          if (Array.isArray(arr) && arr[0]) {
            window.CUSTOM_CULTURE_IMAGES[cid] = arr[0];
          }
        }
        try {
          localStorage.setItem('rus-trainer-cult-gallery-v1', JSON.stringify(window.CUSTOM_CULTURE_GALLERY));
          localStorage.setItem('rus-trainer-cult-imgs-v1', JSON.stringify(window.CUSTOM_CULTURE_IMAGES));
        } catch(e) {}

        if (typeof window.loadCustomCards === 'function') window.loadCustomCards();
        if (typeof window.rebuildAndRefresh === 'function') window.rebuildAndRefresh();
        refreshAllCultureViews();
        if (typeof window.showEdStatus === 'function') {
          window.showEdStatus(statusEl, 'ok', 'Данные восстановлены успешно!');
        }
      } catch(err) {
        if (typeof window.showEdStatus === 'function') {
          window.showEdStatus(statusEl, 'err', 'Ошибка чтения файла: ' + err.message);
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // =====================================================================
  //  9. STARTUP ASYNC LOAD FROM INDEXEDDB (F5 PERSISTENCE)
  // =====================================================================
  let _initDbPromise = null;
  function initCultureGalleryFromDB() {
    if (_initDbPromise) return _initDbPromise;
    _initDbPromise = (async () => {
      try {
        const idbGallery = await idbGetAllCultureGallery();
        if (idbGallery && typeof idbGallery === 'object') {
          for (const [id, val] of Object.entries(idbGallery)) {
            if (Array.isArray(val) && val.length > 0) {
              window.CUSTOM_CULTURE_GALLERY[id] = val;
            } else if (typeof val === 'string' && val) {
              window.CUSTOM_CULTURE_GALLERY[id] = [val];
            }
          }
        }

        // Legacy store migration
        try {
          const legacyImages = await idbGetAllLegacyCultureImages();
          for (const [id, val] of Object.entries(legacyImages)) {
            if (val && (!window.CUSTOM_CULTURE_GALLERY[id] || !window.CUSTOM_CULTURE_GALLERY[id].length)) {
              window.CUSTOM_CULTURE_GALLERY[id] = [val];
              await idbSaveCultureGallery(id, [val]);
            }
          }
        } catch(e) {}

        // LocalStorage fallback migration
        try {
          const lsGal = JSON.parse(localStorage.getItem('rus-trainer-cult-gallery-v1') || '{}');
          for (const [id, val] of Object.entries(lsGal)) {
            if (!window.CUSTOM_CULTURE_GALLERY[id] || !window.CUSTOM_CULTURE_GALLERY[id].length) {
              const arr = Array.isArray(val) ? val : [val];
              if (arr.length > 0) {
                window.CUSTOM_CULTURE_GALLERY[id] = arr;
                await idbSaveCultureGallery(id, arr);
              }
            }
          }
          const lsImgs = JSON.parse(localStorage.getItem('rus-trainer-cult-imgs-v1') || '{}');
          for (const [id, val] of Object.entries(lsImgs)) {
            if (!window.CUSTOM_CULTURE_GALLERY[id] || !window.CUSTOM_CULTURE_GALLERY[id].length) {
              if (val) {
                window.CUSTOM_CULTURE_GALLERY[id] = [val];
                await idbSaveCultureGallery(id, [val]);
              }
            }
          }
        } catch(e) {}

        if (!window.CUSTOM_CULTURE_IMAGES) window.CUSTOM_CULTURE_IMAGES = {};
        for (const [id, arr] of Object.entries(window.CUSTOM_CULTURE_GALLERY)) {
          if (Array.isArray(arr) && arr[0]) {
            window.CUSTOM_CULTURE_IMAGES[id] = arr[0];
          }
        }
      } catch (err) {
        console.warn('initCultureGalleryFromDB error:', err);
      }

      try {
        refreshAllCultureViews();
      } catch(e) {
        console.warn('Error refreshing views after DB load:', e);
      }
    })();
    return _initDbPromise;
  }

  // =====================================================================
  //  10. ATTACH EXPORTS TO WINDOW
  // =====================================================================
  window.getCultureIDB = getCultureIDB;
  window.idbSaveCultureGallery = idbSaveCultureGallery;
  window.idbGetAllCultureGallery = idbGetAllCultureGallery;
  window.getCultureImages = getCultureImages;
  window.getCultureImage = getCultureImage;
  window.getCultureImageOverride = getCultureImage;
  window.saveCultureAngle = saveCultureAngle;
  window.deleteCultureAngle = deleteCultureAngle;
  window.selectCultureAngle = selectCultureAngle;
  window.createAnglesBarHtml = createAnglesBarHtml;
  window.renderCardAnglesBar = updateFlashcardAnglesBar;
  window.updateFlashcardAnglesBar = updateFlashcardAnglesBar;
  window.updateBestiaryAnglesBars = updateBestiaryAnglesBars;
  window.onCardRendered = updateFlashcardAnglesBar;
  window.onBestiaryRendered = updateBestiaryAnglesBars;
  window.refreshAllCultureViews = refreshAllCultureViews;
  window.triggerCulturePhotoUpload = triggerCulturePhotoUpload;
  window.triggerCulturePhotoUploadOverride = triggerCulturePhotoUpload;
  window.handleQuickCultUpload = handleQuickCultUpload;
  window.handleQuickCultUploadOverride = handleQuickCultUpload;
  window.handleCultDrop = handleCultDrop;
  window.handleCultureAngleSlotDrop = handleCultureAngleSlotDrop;
  window.handleCultureSlotDrop = handleCultureSlotDrop;
  window.openLightbox = openLightbox;
  window.openCultureLightbox = openLightbox;
  window.openLightboxFromCard = openLightboxFromCard;
  window.handleCultureSlotClick = handleCultureSlotClick;
  window.handleCultureSlotClickOverride = handleCultureSlotClick;
  window.prevLightboxAngle = () => stepLightboxAngle(-1);
  window.nextLightboxAngle = () => stepLightboxAngle(1);
  window.exportBackup = exportBackup;
  window.exportCultureBackup = exportBackup;
  window.importBackup = importBackup;
  window.importCultureBackup = importBackup;
  window.initCultureGalleryFromDB = initCultureGalleryFromDB;

  // Execute startup load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCultureGalleryFromDB);
  } else {
    initCultureGalleryFromDB();
  }

})();
