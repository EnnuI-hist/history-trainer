/**
 * culture-db.js
 * IndexedDB storage for Culture monuments with 5-slot multi-angle gallery
 * Database: 'RusHistoryTrainerDB', Store: 'cultureGallery'
 */

(function() {
  'use strict';

  // =====================================================================
  //  1. CSS STYLES FOR 5-SLOT GALLERY & LIGHTBOX NAV
  // =====================================================================
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
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      width: fit-content;
      max-width: 100%;
      user-select: none;
      z-index: 5;
    }
    .cult-angle-slot {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.16);
      background: rgba(0, 0, 0, 0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
      flex-shrink: 0;
    }
    .cult-angle-slot:hover {
      transform: translateY(-2px);
      border-color: rgba(245, 158, 11, 0.6);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    }
    .cult-angle-slot.active {
      border-color: #f59e0b;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.45), inset 0 0 6px rgba(245, 158, 11, 0.3);
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
      background: rgba(0, 0, 0, 0.7);
      color: #fbbf24;
      border-radius: 4px;
      pointer-events: none;
    }
    .cult-angle-slot .slot-del-btn {
      position: absolute;
      top: 1px;
      right: 1px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.88);
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
      transform: scale(1.15);
    }
    .cult-angle-slot.slot-add {
      border: 2px dashed rgba(245, 158, 11, 0.45);
      color: #f59e0b;
      font-size: 17px;
      font-weight: 700;
      background: rgba(245, 158, 11, 0.08);
    }
    .cult-angle-slot.slot-add:hover {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #fbbf24;
    }
    .cult-angle-slot.slot-empty {
      border: 1px dashed rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
      color: rgba(255, 255, 255, 0.2);
      cursor: default;
    }

    /* Bestiary thumbnail compact slots */
    .bst-mon-thumb-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .bst-mon-thumb-wrap .cult-angles-bar {
      margin: 0;
      padding: 4px 6px;
      gap: 5px;
    }
    .bst-mon-thumb-wrap .cult-angle-slot {
      width: 28px;
      height: 28px;
      border-radius: 6px;
    }
    .bst-mon-thumb-wrap .cult-angle-slot .slot-num {
      font-size: 7px;
      padding: 1px 3px;
    }
    .bst-mon-thumb-wrap .cult-angle-slot.slot-add {
      font-size: 13px;
    }

    /* Lightbox nav buttons & counter */
    .lightbox-nav-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(20, 20, 30, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.2);
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
      background: rgba(245, 158, 11, 0.85);
      color: #000;
      border-color: #f59e0b;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.5);
      transform: translateY(-50%) scale(1.1);
    }
    #lightbox-prev { left: 24px; }
    #lightbox-next { right: 24px; }

    #lightbox-counter {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.65);
      color: #f59e0b;
      padding: 4px 14px;
      border-radius: 20px;
      border: 1px solid rgba(245, 158, 11, 0.35);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      z-index: 10001;
      pointer-events: none;
    }

    @media (max-width: 600px) {
      .cult-angle-slot {
        width: 38px;
        height: 38px;
      }
      #lightbox-prev { left: 10px; width: 40px; height: 40px; font-size: 18px; }
      #lightbox-next { right: 10px; width: 40px; height: 40px; font-size: 18px; }
    }
  `;
  document.head.appendChild(styleEl);

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
        req.onsuccess = function() {
          resolve(req.result);
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
  //  3. IN-MEMORY STATE & HELPERS
  // =====================================================================
  window.CUSTOM_CULTURE_GALLERY = window.CUSTOM_CULTURE_GALLERY || {};
  window.CUSTOM_CULTURE_IMAGES = window.CUSTOM_CULTURE_IMAGES || {};
  window.monumentActiveAngle = window.monumentActiveAngle || {};

  window._pendingAngleSlot = null;

  window.getCultureImages = function(item) {
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
  };

  window.getCultureImage = function(item, angleIdx) {
    if (!item) return '';
    const imgs = window.getCultureImages(item);
    if (!imgs || imgs.length === 0) return (item && item.image) || '';
    if (typeof angleIdx === 'number' && angleIdx >= 0 && angleIdx < imgs.length) {
      return imgs[angleIdx];
    }
    const id = typeof item === 'string' ? item : item.id;
    const activeIdx = id && typeof window.monumentActiveAngle[id] === 'number' ? window.monumentActiveAngle[id] : 0;
    return imgs[activeIdx] || imgs[0] || (item && item.image) || '';
  };

  window.compressImageFile = function(file, maxDim = 900, quality = 0.80) {
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
  };

  function getCurrentCultureId() {
    if (window.currentMode === 'culture') {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
      if (activeTab === 'cards') {
        return (window.displayEvents && window.displayEvents[window.cardIdx] && window.displayEvents[window.cardIdx].id)
          ? window.displayEvents[window.cardIdx].id : null;
      } else if (activeTab === 'quiz') {
        return (window.quizQuestion && window.quizQuestion.target && window.quizQuestion.target.id)
          ? window.quizQuestion.target.id : null;
      } else if (activeTab === 'input') {
        return (window.inputQuestion && window.inputQuestion.target && window.inputQuestion.target.id)
          ? window.inputQuestion.target.id : null;
      }
    } else if (window.currentMode === 'bestiary') {
      return window._pendingCultId || window._activeCultureId || window.activeCultureMonumentId || null;
    }
    return window._pendingCultId || window._activeCultureId || window.activeCultureMonumentId || null;
  }

  // =====================================================================
  //  4. SAVING & DELETING SLOTS
  // =====================================================================
  window.triggerCulturePhotoUpload = function(cultId, event, targetSlotIdx = null) {
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
    window._pendingAngleSlot = (typeof targetSlotIdx === 'number') ? targetSlotIdx : null;
    const inp = document.getElementById('quick-cult-upload');
    if (inp) {
      inp.value = '';
      inp.click();
    }
  };

  window.handleQuickCultUpload = async function(inputEl) {
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
      const dataUrl = await window.compressImageFile(file, 900, 0.80);
      await saveCultureAngle(cultId, dataUrl, slotIdx);
    } catch (err) {
      console.error('Ошибка загрузки фото культуры:', err);
      alert('Не удалось обработать изображение: ' + (err.message || err));
    } finally {
      if (inputEl) inputEl.value = '';
      window._pendingCultId = null;
      window._pendingAngleSlot = null;
    }
  };

  window.saveCultureAngle = async function(cultId, dataUrl, slotIdx = null) {
    if (!cultId || !dataUrl) return;

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
      const activeIdx = window.monumentActiveAngle[cultId] || 0;
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
      }
    }

    if (list.length > 5) list = list.slice(0, 5);

    window.CUSTOM_CULTURE_GALLERY[cultId] = list;
    if (window.CUSTOM_CULTURE_IMAGES) {
      window.CUSTOM_CULTURE_IMAGES[cultId] = list[0] || dataUrl;
    }

    // 1. IndexedDB primary save
    await idbSaveCultureGallery(cultId, list);

    // 2. LocalStorage cache fallback
    try {
      localStorage.setItem('rus-trainer-cult-gallery-v1', JSON.stringify(window.CUSTOM_CULTURE_GALLERY));
      if (window.CUSTOM_CULTURE_IMAGES) {
        localStorage.setItem('rus-trainer-cult-imgs-v1', JSON.stringify(window.CUSTOM_CULTURE_IMAGES));
      }
    } catch(e) {}

    // 3. Audio & Toast feedback
    if (typeof window.soundCorrect === 'function') {
      try { window.soundCorrect(); } catch(e) {}
    }
    if (typeof window.showToast === 'function') {
      window.showToast(`✓ Ракурс сохранен (${savedSlotNum}/5)`);
    }

    // 4. Instant view refresh
    if (typeof window.renderCard === 'function') window.renderCard();
    if (typeof window.renderBestiary === 'function') window.renderBestiary();
    if (typeof window.refreshCurrentCultureView === 'function') {
      window.refreshCurrentCultureView(cultId, dataUrl);
    }
  };

  window.deleteCultureAngle = async function(cultId, slotIdx, event) {
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
    if (window.CUSTOM_CULTURE_IMAGES) {
      window.CUSTOM_CULTURE_IMAGES[cultId] = list[0] || '';
    }

    if (window.monumentActiveAngle[cultId] >= list.length) {
      window.monumentActiveAngle[cultId] = Math.max(0, list.length - 1);
    }

    // Update IndexedDB
    await idbSaveCultureGallery(cultId, list);

    // Update LocalStorage cache
    try {
      localStorage.setItem('rus-trainer-cult-gallery-v1', JSON.stringify(window.CUSTOM_CULTURE_GALLERY));
      if (window.CUSTOM_CULTURE_IMAGES) {
        localStorage.setItem('rus-trainer-cult-imgs-v1', JSON.stringify(window.CUSTOM_CULTURE_IMAGES));
      }
    } catch(e) {}

    if (typeof window.soundClick === 'function') {
      try { window.soundClick(); } catch(e) {}
    }
    if (typeof window.showToast === 'function') {
      window.showToast('✓ Ракурс удален');
    }

    if (typeof window.renderCard === 'function') window.renderCard();
    if (typeof window.renderBestiary === 'function') window.renderBestiary();
    if (typeof window.refreshCurrentCultureView === 'function') {
      window.refreshCurrentCultureView(cultId);
    }
  };

  window.selectCultureAngle = function(cultId, slotIdx, event) {
    if (event) {
      event.stopPropagation();
    }
    window.monumentActiveAngle[cultId] = slotIdx;
    if (typeof window.soundClick === 'function') {
      try { window.soundClick(); } catch(e) {}
    }
    if (window.currentMode === 'culture') {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
      if (activeTab === 'cards' && typeof window.renderCard === 'function') {
        window.renderCard();
      }
    } else if (window.currentMode === 'bestiary') {
      if (typeof window.renderBestiary === 'function') window.renderBestiary();
    }
  };

  // =====================================================================
  //  5. DRAG & DROP AND PASTE (CTRL+V) HANDLERS
  // =====================================================================
  window.handleCultDrop = async function(event, cultId) {
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
      const dataUrl = await window.compressImageFile(file, 900, 0.80);
      const activeIdx = window.monumentActiveAngle[targetId] || 0;
      await window.saveCultureAngle(targetId, dataUrl, activeIdx);
    } catch(err) {
      console.error('Ошибка Drag & Drop изображения:', err);
      alert('Не удалось обработать перетащенное изображение: ' + (err.message || err));
    }
  };

  window.handleCultureSlotDrop = async function(event, slotType) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('drag-hover');

    let cultId = null;
    if (slotType === 'fc') {
      cultId = window.displayEvents && window.displayEvents[window.cardIdx]?.id;
    } else if (slotType === 'quiz') {
      cultId = window.quizQuestion?.target?.id;
    } else if (slotType === 'inp') {
      cultId = window.inputQuestion?.target?.id;
    }
    if (!cultId) cultId = getCurrentCultureId();
    if (!cultId) return;

    const dt = event.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const dataUrl = await window.compressImageFile(file, 900, 0.80);
      const activeIdx = window.monumentActiveAngle[cultId] || 0;
      await window.saveCultureAngle(cultId, dataUrl, activeIdx);
    } catch(err) {
      console.error('Ошибка Drag & Drop изображения:', err);
      alert('Не удалось обработать перетащенное изображение: ' + (err.message || err));
    }
  };

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
      const dataUrl = await window.compressImageFile(imageFile, 900, 0.80);
      const activeIdx = window.monumentActiveAngle[targetId] || 0;
      await window.saveCultureAngle(targetId, dataUrl, activeIdx);
    } catch(err) {
      console.error('Ошибка вставки фото культуры:', err);
      alert('Не удалось обработать вставленное изображение: ' + (err.message || err));
    }
  }, true);

  // =====================================================================
  //  6. HTML GENERATOR FOR 5-SLOT ANGLES BAR
  // =====================================================================
  function createAnglesBarHtml(cultId) {
    if (!cultId) return '';
    const imgs = window.getCultureImages(cultId);
    const activeIdx = (typeof window.monumentActiveAngle[cultId] === 'number') ? window.monumentActiveAngle[cultId] : 0;
    
    let slotsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < imgs.length) {
        const isActive = (i === activeIdx);
        const imgSrc = imgs[i];
        slotsHtml += `
          <div class="cult-angle-slot ${isActive ? 'active' : ''}" onclick="selectCultureAngle('${cultId}', ${i}, event)" title="Ракурс ${i+1} (клик для выбора)">
            <span class="slot-num">${i+1}</span>
            <img src="${imgSrc}" alt="Ракурс ${i+1}">
            <button class="slot-del-btn" onclick="deleteCultureAngle('${cultId}', ${i}, event)" title="Удалить ракурс ${i+1}">✕</button>
          </div>
        `;
      } else if (i === imgs.length) {
        slotsHtml += `
          <div class="cult-angle-slot slot-add" onclick="triggerCulturePhotoUpload('${cultId}', event, ${i})" title="Добавить ракурс ${i+1} (до 5)">
            <span class="slot-num">${i+1}</span>
            <span>➕</span>
          </div>
        `;
      } else {
        slotsHtml += `
          <div class="cult-angle-slot slot-empty" title="Слот ${i+1} (пусто)">
            <span class="slot-num">${i+1}</span>
          </div>
        `;
      }
    }

    return `<div class="cult-angles-bar" data-monument-id="${cultId}">${slotsHtml}</div>`;
  }

  function updateFlashcardAnglesBar() {
    if (window.currentMode !== 'culture') {
      const existing = document.getElementById('fc-angles-bar');
      if (existing) existing.style.display = 'none';
      return;
    }
    const frontEl = document.getElementById('fc-culture-front');
    if (!frontEl) return;
    if (!window.displayEvents || !window.displayEvents.length || window.cardIdx >= window.displayEvents.length) return;
    const e = window.displayEvents[window.cardIdx];
    if (!e || !e.id) return;

    let barEl = document.getElementById('fc-angles-bar');
    if (!barEl) {
      barEl = document.createElement('div');
      barEl.id = 'fc-angles-bar';
      frontEl.appendChild(barEl);
    }
    barEl.style.display = '';
    barEl.innerHTML = createAnglesBarHtml(e.id);

    const activeImg = window.getCultureImage(e);
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
    if (window.currentMode !== 'bestiary' && window.bestiarySubTab !== 'culture') return;
    const container = document.getElementById('bst-content');
    if (!container) return;
    const cards = container.querySelectorAll('.bst-mon-card');
    cards.forEach(card => {
      const thumb = card.querySelector('.bst-mon-thumb');
      if (!thumb) return;
      
      const match = thumb.getAttribute('ondrop')?.match(/handleCultDrop\(event,\s*['"]([^'"]+)['"]\)/)
                 || thumb.getAttribute('onclick')?.match(/triggerCulturePhotoUpload\(['"]([^'"]+)['"]/);
      const cultId = match ? match[1] : null;
      if (!cultId) return;

      const activeImg = window.getCultureImage(cultId);
      const thumbImg = thumb.querySelector('img');
      if (thumbImg && activeImg) {
        thumbImg.src = activeImg;
      }

      let existingBar = card.querySelector('.cult-angles-bar');
      if (existingBar) existingBar.remove();

      const barWrap = document.createElement('div');
      barWrap.innerHTML = createAnglesBarHtml(cultId);
      thumb.insertAdjacentElement('afterend', barWrap.firstElementChild);
    });
  }

  // Hook renderCard and renderBestiary
  if (typeof window.renderCard === 'function') {
    const origRenderCard = window.renderCard;
    window.renderCard = function() {
      origRenderCard.apply(this, arguments);
      updateFlashcardAnglesBar();
    };
  }
  if (typeof window.renderBestiary === 'function') {
    const origRenderBestiary = window.renderBestiary;
    window.renderBestiary = function() {
      origRenderBestiary.apply(this, arguments);
      updateBestiaryAnglesBars();
    };
  }

  // Hook Quiz and Input for smart random angle selection
  if (typeof window.generateQuiz === 'function') {
    const origGenerateQuiz = window.generateQuiz;
    window.generateQuiz = function() {
      origGenerateQuiz.apply(this, arguments);
      if (window.currentMode === 'culture' && window.quizQuestion && window.quizQuestion.target) {
        const target = window.quizQuestion.target;
        const imgs = window.getCultureImages(target);
        if (imgs.length > 1) {
          const randIdx = Math.floor(Math.random() * imgs.length);
          const qzImg = document.getElementById('qz-img');
          if (qzImg) qzImg.src = imgs[randIdx];
        }
      }
    };
  }

  if (typeof window.nextInputQuestion === 'function') {
    const origNextInput = window.nextInputQuestion;
    window.nextInputQuestion = function() {
      origNextInput.apply(this, arguments);
      if (window.currentMode === 'culture' && window.inputQuestion && window.inputQuestion.target) {
        const target = window.inputQuestion.target;
        const imgs = window.getCultureImages(target);
        if (imgs.length > 1) {
          const randIdx = Math.floor(Math.random() * imgs.length);
          const inpImg = document.getElementById('inp-img');
          if (inpImg) inpImg.src = imgs[randIdx];
        }
      }
    };
  }

  // =====================================================================
  //  7. LIGHTBOX MULTI-ANGLE NAVIGATION
  // =====================================================================
  let currentLightboxMonumentId = null;
  let currentLightboxAngleIdx = 0;

  function initLightboxNavElements() {
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    if (!document.getElementById('lightbox-prev')) {
      const prevBtn = document.createElement('button');
      prevBtn.id = 'lightbox-prev';
      prevBtn.className = 'lightbox-nav-btn';
      prevBtn.innerHTML = '◀';
      prevBtn.title = 'Предыдущий ракурс (Стрелка влево)';
      prevBtn.onclick = function(e) {
        e.stopPropagation();
        stepLightboxAngle(-1);
      };
      modal.appendChild(prevBtn);
    }

    if (!document.getElementById('lightbox-next')) {
      const nextBtn = document.createElement('button');
      nextBtn.id = 'lightbox-next';
      nextBtn.className = 'lightbox-nav-btn';
      nextBtn.innerHTML = '▶';
      nextBtn.title = 'Следующий ракурс (Стрелка вправо)';
      nextBtn.onclick = function(e) {
        e.stopPropagation();
        stepLightboxAngle(1);
      };
      modal.appendChild(nextBtn);
    }

    if (!document.getElementById('lightbox-counter')) {
      const counter = document.createElement('div');
      counter.id = 'lightbox-counter';
      modal.appendChild(counter);
    }
  }

  function updateLightboxView(src, title) {
    const imgEl = document.getElementById('lightbox-img');
    const capEl = document.getElementById('lightbox-caption');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const counterEl = document.getElementById('lightbox-counter');

    if (imgEl) imgEl.src = src;
    if (capEl) capEl.textContent = title || '';

    const imgs = currentLightboxMonumentId ? window.getCultureImages(currentLightboxMonumentId) : [];
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
    const imgs = window.getCultureImages(currentLightboxMonumentId);
    if (imgs.length <= 1) return;

    currentLightboxAngleIdx = (currentLightboxAngleIdx + delta + imgs.length) % imgs.length;
    const newSrc = imgs[currentLightboxAngleIdx];
    const capEl = document.getElementById('lightbox-caption');
    const title = capEl ? capEl.textContent : '';

    if (typeof window.soundClick === 'function') window.soundClick();
    updateLightboxView(newSrc, title);
  }

  window.openLightbox = function(src, title, cultId = null, angleIdx = 0) {
    if (!src) return;
    if (typeof window.soundClick === 'function') window.soundClick();
    const modal = document.getElementById('lightbox-modal');
    if (!modal) return;

    const targetId = cultId || getCurrentCultureId();
    currentLightboxMonumentId = targetId;
    currentLightboxAngleIdx = (typeof angleIdx === 'number') 
      ? angleIdx 
      : (targetId && typeof window.monumentActiveAngle[targetId] === 'number' ? window.monumentActiveAngle[targetId] : 0);

    initLightboxNavElements();
    updateLightboxView(src, title);
    modal.classList.add('open');
  };

  window.openLightboxFromCard = function(event) {
    if (event) event.stopPropagation();
    if (!window.displayEvents || !window.displayEvents.length) return;
    const e = window.displayEvents[window.cardIdx];
    const src = window.getCultureImage(e);
    if (src) {
      const activeAngle = window.monumentActiveAngle[e.id] || 0;
      window.openLightbox(src, `${e.title} (${e.year})`, e.id, activeAngle);
    }
  };

  window.handleCultureSlotClick = function(event, slotType) {
    if (event) event.stopPropagation();
    let cultId = null;
    let imgSrc = null;
    let title = '';

    if (slotType === 'fc') {
      if (!window.displayEvents || !window.displayEvents.length) return;
      const e = window.displayEvents[window.cardIdx];
      cultId = e.id;
      imgSrc = window.getCultureImage(e);
      title = `${e.title} (${e.year})`;
    } else if (slotType === 'quiz') {
      if (!window.quizQuestion || !window.quizQuestion.target) return;
      cultId = window.quizQuestion.target.id;
      imgSrc = window.getCultureImage(window.quizQuestion.target);
      title = `${window.quizQuestion.target.title} (${window.quizQuestion.target.year})`;
    } else if (slotType === 'inp') {
      if (!window.inputQuestion || !window.inputQuestion.target) return;
      cultId = window.inputQuestion.target.id;
      imgSrc = window.getCultureImage(window.inputQuestion.target);
      title = `${window.inputQuestion.target.title} (${window.inputQuestion.target.year})`;
    }

    if (imgSrc) {
      const activeIdx = cultId ? (window.monumentActiveAngle[cultId] || 0) : 0;
      window.openLightbox(imgSrc, title, cultId, activeIdx);
    } else if (cultId) {
      window.triggerCulturePhotoUpload(cultId, event, 0);
    }
  };

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
  window.exportBackup = async function() {
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
  };

  window.importBackup = function(event) {
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
        if (typeof window.refreshCurrentCultureView === 'function') window.refreshCurrentCultureView();
        if (typeof window.renderCard === 'function') window.renderCard();
        if (typeof window.renderBestiary === 'function') window.renderBestiary();
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
  };

  // =====================================================================
  //  9. STARTUP ASYNC LOAD FROM INDEXEDDB
  // =====================================================================
  async function initCultureGalleryFromDB() {
    try {
      // 1. Fetch from IndexedDB 'cultureGallery'
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

      // 2. Migration from legacy 'cultureImages' store if present
      try {
        const legacyImages = await idbGetAllLegacyCultureImages();
        for (const [id, val] of Object.entries(legacyImages)) {
          if (val && (!window.CUSTOM_CULTURE_GALLERY[id] || !window.CUSTOM_CULTURE_GALLERY[id].length)) {
            window.CUSTOM_CULTURE_GALLERY[id] = [val];
            await idbSaveCultureGallery(id, [val]);
          }
        }
      } catch(e) {}

      // 3. Migration from localStorage caches
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

      // 4. Sync window.CUSTOM_CULTURE_IMAGES
      if (!window.CUSTOM_CULTURE_IMAGES) window.CUSTOM_CULTURE_IMAGES = {};
      for (const [id, arr] of Object.entries(window.CUSTOM_CULTURE_GALLERY)) {
        if (Array.isArray(arr) && arr[0]) {
          window.CUSTOM_CULTURE_IMAGES[id] = arr[0];
        }
      }
    } catch (err) {
      console.warn('initCultureGalleryFromDB error:', err);
    }

    // Immediately re-render cards and bestiary
    try {
      if (typeof window.renderCard === 'function') window.renderCard();
      if (typeof window.renderBestiary === 'function') window.renderBestiary();
      if (typeof window.refreshCurrentCultureView === 'function') {
        window.refreshCurrentCultureView();
      }
    } catch(e) {
      console.warn('Error refreshing view on init:', e);
    }
  }

  // Execute startup load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCultureGalleryFromDB);
  } else {
    initCultureGalleryFromDB();
  }

})();
