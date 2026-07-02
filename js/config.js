/**
 * ============================================================
 * CONFIG.JS — Bottle Battle global configuration
 * Central place for constants used across every page.
 * Edit API_BASE_URL after deploying the Google Apps Script
 * Web App (see README.md → Deployment).
 * ============================================================
 */

const CONFIG = Object.freeze({
  /** Google Apps Script Web App URL (ends with /exec). */
  API_BASE_URL: 'https://script.google.com/macros/s/AKfycbxhtpTn4aXTsW8MPvd_taZVJIdgGiZUdYWYhTw5HSUHLac9XpP1aJRicy6MKLcuRBzV6A/exec',

  /** Shared secret sent with write requests (must match Apps Script SETTINGS sheet). */
  API_KEY: 'SKMW_BOTTLE_2026',

  /** School branding. */
  SCHOOL_NAME: 'Saiyok Manikanjana Witthaya School',
  SCHOOL_NAME_TH: 'โรงเรียนไทรโยคมณีกาญจน์วิทยา',
  COMPETITION_NAME: 'Bottle Battle',
  COMPETITION_TAGLINE: 'ศึกขวดใส สู่เป้าหมายลดคาร์บอนต่ำ · PET Bottle Collection Competition',

  /** Classrooms participating in the competition. Edit to match your school. */
  CLASSROOMS: [
    'M.1/1', 'M.1/2', 'M.1/3', 'M.1/4',
    'M.2/1', 'M.2/2', 'M.2/3', 'M.2/4',
    'M.3/1', 'M.3/2', 'M.3/3', 'M.3/4',
    'M.4/1', 'M.4/2', 'M.4/3',
    'M.5/1', 'M.5/2', 'M.5/3',
    'M.6/1', 'M.6/2', 'M.6/3'
  ],

  /** Environmental conversion factors (used for display; source of truth is backend). */
  CO2_PER_KG_PET: 1.5,       // kg CO2e avoided per kg PET recycled
  KG_PET_PER_TREE: 20,       // kg PET equivalent to planting one tree (approximation)
  POINTS_PER_KG: 10,         // competition points earned per kg submitted

  /** Approximate total student headcount — used only to display a participation %. Edit to match your school. */
  TOTAL_STUDENTS: 1500,

  /**
   * The "Bottle Journey" programme pipeline shown on the dashboard.
   * Purely informational — edit copy to match your school's actual programme stages.
   */
  JOURNEY_STEPS: [
    { th: 'Bottle Start', sub: 'เริ่มต้นสร้างความใส่ใจ', icon: 'bottle' },
    { th: 'Bottle Battle', sub: 'แข่งขันเก็บขวดชิงความดี', icon: 'trophy' },
    { th: 'Bottle Bank', sub: 'ส่งขวดเข้าระบบจุดรับขวด', icon: 'bank' },
    { th: 'Bottle Data', sub: 'บันทึกข้อมูลคำนวณคาร์บอน', icon: 'data' },
    { th: 'Bottle Creative', sub: 'ต่อยอดสู่ไอเดียนวัตกรรม', icon: 'bulb' },
    { th: 'Bottle Culture', sub: 'พัฒนาสู่วัฒนธรรมโรงเรียนยั่งยืน', icon: 'tree' }
  ],

  /**
   * Physical collection points shown on the Bottle Map widget.
   * `x`/`y` are percentage positions (0-100) over the map illustration.
   * Edit to match your campus layout — weights are illustrative until
   * a per-point field is added to the COLLECTIONS sheet.
   */
  COLLECTION_POINTS: [
    { name: 'อาคาร 1', x: 30, y: 24 },
    { name: 'อาคาร 2', x: 30, y: 46 },
    { name: 'อาคาร 4', x: 72, y: 30 },
    { name: 'อาคาร 5', x: 22, y: 66 },
    { name: 'โรงอาหาร', x: 52, y: 62 }
  ],

  /** Gallery placeholders — replace with real activity photo URLs once available. */
  GALLERY_ITEMS: [
    { caption: 'กิจกรรมเก็บขวด', dateLabel: 'ล่าสุด' },
    { caption: 'แยกขวดพลาสติก', dateLabel: 'สัปดาห์นี้' },
    { caption: 'จุดรับขวดใหม่', dateLabel: 'สัปดาห์นี้' },
    { caption: 'อบรมกิจกรรมแยก', dateLabel: 'เดือนนี้' },
    { caption: 'รณรงค์ลดพลาสติก', dateLabel: 'เดือนนี้' },
    { caption: 'ประดิษฐ์จากขวด', dateLabel: 'เดือนนี้' }
  ],

  /** UI */
  TOAST_DURATION_MS: 4200,
  COUNTER_ANIMATION_MS: 1600,
  MAX_IMAGE_SIZE_MB: 4,
  HISTORY_PAGE_SIZE: 10,

  /** LocalStorage keys */
  STORAGE_KEYS: {
    THEME: 'bb_theme',
    LAST_LEADER: 'bb_last_leader',
    DRAFT_SUBMISSION: 'bb_draft_submission'
  }
});

// Freeze nested array too, defensive copy not required for a static config file.
