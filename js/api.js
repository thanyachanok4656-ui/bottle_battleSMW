/**
 * ============================================================
 * API.JS — Bottle Battle API client
 * Thin wrapper around fetch() for talking to the Google Apps
 * Script Web App backend. All functions return Promises that
 * resolve to plain JS data or throw an Error with a readable
 * message on failure.
 *
 * NOTE on CORS: Google Apps Script Web Apps do not support
 * custom request headers on preflighted requests, so:
 *  - GET requests pass parameters in the query string.
 *  - POST requests send a text/plain body containing a JSON
 *    string (text/plain does not trigger a CORS preflight).
 * The Apps Script backend (backend/Code.gs) parses both.
 * ============================================================
 */

const Api = (() => {
  /**
   * Build a full URL for a GET request.
   * @param {string} action - backend action name
   * @param {Object} params - query parameters
   * @returns {string}
   */
  function buildUrl(action, params = {}) {
    const url = new URL(CONFIG.API_BASE_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  }

  /**
   * Perform a GET request against the backend.
   */
  async function get(action, params = {}) {
    const url = buildUrl(action, params);
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    return parseResponse(response);
  }

  /**
   * Perform a POST request (JSON payload sent as text/plain to avoid CORS preflight).
   */
  async function post(action, payload = {}) {
    const body = JSON.stringify({ action, apiKey: CONFIG.API_KEY, ...payload });
    const response = await fetch(CONFIG.API_BASE_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body
    });
    return parseResponse(response);
  }

  /**
   * Parse a fetch Response, normalising backend errors into thrown Errors.
   */
  async function parseResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch (err) {
      throw new Error('Unexpected response from server. Please try again.');
    }
    if (!response.ok || data.success === false) {
      throw new Error((data && data.message) || `Request failed (${response.status})`);
    }
    return data.data !== undefined ? data.data : data;
  }

  return {
    /** Dashboard KPI summary: totals, CO2, trees, leader, participants. */
    getSummary() {
      return get('getSummary');
    },

    /** Full classroom ranking list, sorted by weight/points descending. */
    getRanking() {
      return get('getRanking');
    },

    /** Monthly / weekly statistics for charts. */
    getStatistics(range = 'monthly') {
      return get('getStatistics', { range });
    },

    /** Carbon reduction breakdown (total + per classroom). */
    getCarbonReduction() {
      return get('getCarbonReduction');
    },

    /** Today's totals, a short daily trend, and the top classroom of the day. */
  getDailyOverview(date) {
  return get('getDailyOverview', { date });
},

    /**
     * Paginated / filterable collection history.
     * @param {Object} filters { search, classroom, dateFrom, dateTo, sortBy, sortDir, page, pageSize }
     */
    getHistory(filters = {}) {
      return get('getHistory', filters);
    },

    /**
     * Submit a new PET bottle collection record.
     * @param {Object} record { studentName, classroom, weightKg, collectionDate, notes, imageId }
     */
    submitCollection(record) {
      return post('submitCollection', { record });
    },

       /**
     * Upload an evidence image (base64) to Drive.
     */
    uploadImage(file) {
      return post('uploadImage', { file });
    },

    /**
     * โหลดคลังกิจกรรม
     */
    getGallery(filters = {}) {
      return get('getGallery', filters);
    },

    /**
     * อัปโหลดรูปกิจกรรมหลายรูป
     */
    uploadGalleryImages(payload) {
      return post('uploadGalleryImages', payload);
    },

    /**
     * แก้ไขข้อมูลรูปกิจกรรม
     */
    updateGalleryItem(item) {
      return post('updateGalleryItem', { item });
    },

    /**
     * ลบรูปกิจกรรม
     */
    deleteGalleryItem(galleryId) {
      return post('deleteGalleryItem', { galleryId });
    },

    /**
     * ปักหมุดรูปเด่น
     */
    setGalleryFeatured(galleryId, isFeatured) {
      return post('setGalleryFeatured', {
        galleryId,
        isFeatured
      });
    }

  };

})();
