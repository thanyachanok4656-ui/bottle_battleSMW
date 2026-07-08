/**
 * ============================================================
 * GALLERY.JS — Gallery Module V2
 * Part 3.1: Core + API + Rendering + Masonry
 * ============================================================
 */

const GalleryPage = (() => {
  let allItems = [];
  let filteredItems = [];
  let selectedFiles = [];
  let currentLightboxItem = null;

  const CATEGORY_LABELS = {
    "กิจกรรม": "กิจกรรม",
    "ธนาคารขยะ": "ธนาคารขยะ",
    "รางวัล": "รางวัล",
    "ประชาสัมพันธ์": "ประชาสัมพันธ์"
  };

  function $(id) {
    return document.getElementById(id);
  }

  function q(selector, root = document) {
    return root.querySelector(selector);
  }

  function qa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatThaiDate(value) {
    if (!value) return "–";

    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];

    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  }

  function setGalleryState(message, type = "normal") {
    const state = $("galleryState");
    if (!state) return;

    if (!message) {
      state.classList.add("is-hidden");
      state.classList.remove("is-error");
      state.textContent = "";
      return;
    }

    state.classList.remove("is-hidden");
    state.classList.toggle("is-error", type === "error");
    state.textContent = message;
  }

  function getFilters() {
    return {
      category: $("galleryCategoryFilter")?.value || "",
      featured: $("galleryFeaturedFilter")?.value || "",
      search: ($("gallerySearch")?.value || "").trim().toLowerCase()
    };
  }

  function applyLocalFilters() {
    const filters = getFilters();

    filteredItems = allItems.filter((item) => {
      const categoryOk = !filters.category || item.category === filters.category;
      const featuredOk = !filters.featured || item.isFeatured === true;

      const searchText = [
        item.title,
        item.description,
        item.category
      ].join(" ").toLowerCase();

      const searchOk = !filters.search || searchText.includes(filters.search);

      return categoryOk && featuredOk && searchOk;
    });

    renderGallery(filteredItems);
  }

  function buildGalleryCard(item) {
    const featuredClass = item.isFeatured ? " is-featured" : "";
    const featuredBadge = item.isFeatured
      ? `<div class="gallery-featured" title="รูปเด่น">⭐</div>`
      : "";

    return `
      <article class="school-gallery-card${featuredClass}" data-id="${escapeHtml(item.galleryId)}">
        ${featuredBadge}

        <div class="gallery-category">
          ${escapeHtml(item.category || "กิจกรรม")}
        </div>

        <img
          src="${escapeHtml(item.imageUrl)}"
          alt="${escapeHtml(item.title || "รูปกิจกรรม")}"
          loading="lazy"
        >

        <div class="gallery-card-actions">
          <button type="button" data-action="view" data-id="${escapeHtml(item.galleryId)}" title="ดูรูปใหญ่">🔍</button>
          <button type="button" data-action="feature" data-id="${escapeHtml(item.galleryId)}" title="ปักหมุด / ยกเลิก">
            ${item.isFeatured ? "⭐" : "☆"}
          </button>
          <button type="button" data-action="edit" data-id="${escapeHtml(item.galleryId)}" title="แก้ไข">✏️</button>
          <button type="button" data-action="delete" data-id="${escapeHtml(item.galleryId)}" title="ลบ">🗑️</button>
        </div>

        <div class="school-gallery-caption">
          <span>${escapeHtml(item.category || "กิจกรรม")}</span>
          <strong>${escapeHtml(item.title || "ไม่มีชื่อกิจกรรม")}</strong>
          <p>${escapeHtml(item.description || "")}</p>
          <div class="gallery-date">📅 ${escapeHtml(formatThaiDate(item.timestamp))}</div>
        </div>
      </article>
    `;
  }

  function renderSkeleton() {
    const grid = $("galleryGrid");
    if (!grid) return;

    grid.innerHTML = Array.from({ length: 8 })
      .map(() => `<div class="gallery-skeleton"></div>`)
      .join("");
  }

  function renderGallery(items) {
    const grid = $("galleryGrid");
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = `
        <div class="gallery-empty">
          ยังไม่มีรูปกิจกรรมในหมวดนี้
        </div>
      `;
      setGalleryState("");
      return;
    }

    grid.innerHTML = items.map(buildGalleryCard).join("");
    setGalleryState("");
  }

  async function loadGallery() {
    try {
      renderSkeleton();
      setGalleryState("กำลังโหลดรูปกิจกรรม…");

      const filters = getFilters();

      const apiFilters = {};
      if (filters.category) apiFilters.category = filters.category;
      if (filters.featured) apiFilters.featured = filters.featured;

      const data = await Api.getGallery(apiFilters);

      allItems = Array.isArray(data) ? data : [];
      filteredItems = allItems.slice();

      applyLocalFilters();
    } catch (err) {
      console.error(err);
      setGalleryState(`โหลดคลังกิจกรรมไม่สำเร็จ: ${err.message}`, "error");

      const grid = $("galleryGrid");
      if (grid) grid.innerHTML = "";
    }
  }

  function findItem(id) {
    return allItems.find((item) => String(item.galleryId) === String(id));
  }
    /**
   * ============================================================
   * Part 3.2: Multi Upload + Drag & Drop + Preview
   * ============================================================
   */

  function openUploadModal() {
    const modal = $("galleryModal");
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeUploadModal() {
    const modal = $("galleryModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    selectedFiles = [];

    if ($("galleryImageInput")) $("galleryImageInput").value = "";
    if ($("galleryTitle")) $("galleryTitle").value = "";
    if ($("galleryDesc")) $("galleryDesc").value = "";
    if ($("galleryCategory")) $("galleryCategory").value = "กิจกรรม";
    if ($("galleryFeatured")) $("galleryFeatured").checked = false;
    if ($("galleryPreviewList")) $("galleryPreviewList").innerHTML = "";

    setUploadProgress(0, false);
  }

  function setUploadProgress(percent, visible = true) {
    const wrap = $("galleryUploadProgress");
    if (!wrap) return;

    const bar = wrap.querySelector("div");
    wrap.classList.toggle("is-visible", visible);

    if (bar) {
      bar.style.width = `${Math.max(0, Math.min(percent, 100))}%`;
    }
  }

  function isValidImage(file) {
    return file && file.type && file.type.startsWith("image/");
  }

  function addFiles(files) {
    const incoming = Array.from(files || []).filter(isValidImage);

    if (!incoming.length) {
      Toast?.warning?.("กรุณาเลือกรูปภาพเท่านั้น");
      return;
    }

    const existingKeys = new Set(
      selectedFiles.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
    );

    incoming.forEach((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (!existingKeys.has(key)) {
        selectedFiles.push(file);
        existingKeys.add(key);
      }
    });

    renderPreview();
  }

  function removeSelectedFile(index) {
    selectedFiles.splice(index, 1);
    renderPreview();
  }

  function renderPreview() {
    const box = $("galleryPreviewList");
    if (!box) return;

    if (!selectedFiles.length) {
      box.innerHTML = "";
      return;
    }

    box.innerHTML = selectedFiles.map((file, index) => {
      const url = URL.createObjectURL(file);

      return `
        <div class="gallery-preview-item">
          <button
            type="button"
            class="gallery-preview-remove"
            data-preview-remove="${index}"
            title="ลบรูปนี้"
          >×</button>

          <img src="${url}" alt="${escapeHtml(file.name)}">
          <span>${escapeHtml(file.name)}</span>
        </div>
      `;
    }).join("");
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;

        resolve({
          fileName: file.name,
          mimeType: file.type || "image/jpeg",
          base64
        });
      };

      reader.onerror = () => reject(new Error(`อ่านไฟล์ไม่สำเร็จ: ${file.name}`));
      reader.readAsDataURL(file);
    });
  }

  function setUploadButtonLoading(isLoading) {
    const btn = $("submitGalleryImage");
    if (!btn) return;

    btn.disabled = isLoading;
    btn.textContent = isLoading ? "กำลังอัปโหลด..." : "อัปโหลดรูป";
  }

  async function uploadSelectedFiles() {
    if (!selectedFiles.length) {
      Toast?.warning?.("กรุณาเลือกรูปภาพก่อน");
      return;
    }

    try {
      setUploadButtonLoading(true);
      setUploadProgress(8, true);

      const files = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const converted = await fileToBase64(selectedFiles[i]);
        files.push(converted);

        const progress = 8 + Math.round(((i + 1) / selectedFiles.length) * 42);
        setUploadProgress(progress, true);
      }

      const payload = {
        title: $("galleryTitle")?.value || "",
        description: $("galleryDesc")?.value || "",
        category: $("galleryCategory")?.value || "กิจกรรม",
        isFeatured: Boolean($("galleryFeatured")?.checked),
        files
      };

      setUploadProgress(66, true);

      await Api.uploadGalleryImages(payload);

      setUploadProgress(100, true);
      Toast?.success?.("อัปโหลดรูปกิจกรรมสำเร็จ");

      closeUploadModal();
      await loadGallery();
    } catch (err) {
      console.error(err);
      Toast?.error?.(`อัปโหลดไม่สำเร็จ: ${err.message}`);
    } finally {
      setUploadButtonLoading(false);

      setTimeout(() => {
        setUploadProgress(0, false);
      }, 600);
    }
  }

  function bindUploadEvents() {
    $("openGalleryUpload")?.addEventListener("click", openUploadModal);
    $("openGalleryUpload2")?.addEventListener("click", openUploadModal);
    $("closeGalleryUpload")?.addEventListener("click", closeUploadModal);
    $("cancelGalleryUpload")?.addEventListener("click", closeUploadModal);
    $("submitGalleryImage")?.addEventListener("click", uploadSelectedFiles);

    $("galleryImageInput")?.addEventListener("change", (event) => {
      addFiles(event.target.files);
    });

    $("galleryPreviewList")?.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-preview-remove]");
      if (!btn) return;

      removeSelectedFile(Number(btn.dataset.previewRemove));
    });

    const dropZone = $("galleryDropZone");
    if (!dropZone) return;

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove("is-dragover");
      });
    });

    dropZone.addEventListener("drop", (event) => {
      addFiles(event.dataTransfer.files);
    });
  }
    /**
   * ============================================================
   * Part 3.3: Edit / Delete / Featured + Search + Filter
   * ============================================================
   */

  function openEditModal(item) {
    if (!item) return;

    const modal = $("galleryEditModal");
    if (!modal) return;

    $("editGalleryId").value = item.galleryId || "";
    $("editGalleryTitle").value = item.title || "";
    $("editGalleryDesc").value = item.description || "";
    $("editGalleryCategory").value = item.category || "กิจกรรม";
    $("editGalleryFeatured").checked = Boolean(item.isFeatured);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeEditModal() {
    const modal = $("galleryEditModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function setEditButtonLoading(isLoading) {
    const btn = $("saveGalleryEdit");
    if (!btn) return;

    btn.disabled = isLoading;
    btn.textContent = isLoading ? "กำลังบันทึก..." : "บันทึก";
  }

  async function saveEdit() {
    const galleryId = $("editGalleryId")?.value;

    if (!galleryId) {
      Toast?.error?.("ไม่พบรหัสรูปกิจกรรม");
      return;
    }

    const item = {
      galleryId,
      title: $("editGalleryTitle")?.value || "",
      description: $("editGalleryDesc")?.value || "",
      category: $("editGalleryCategory")?.value || "กิจกรรม"
    };

    const isFeatured = Boolean($("editGalleryFeatured")?.checked);

    try {
      setEditButtonLoading(true);

      await Api.updateGalleryItem(item);
      await Api.setGalleryFeatured(galleryId, isFeatured);

      Toast?.success?.("บันทึกข้อมูลรูปกิจกรรมสำเร็จ");
      closeEditModal();
      await loadGallery();
    } catch (err) {
      console.error(err);
      Toast?.error?.(`บันทึกไม่สำเร็จ: ${err.message}`);
    } finally {
      setEditButtonLoading(false);
    }
  }

  async function toggleFeatured(id) {
    const item = findItem(id);
    if (!item) return;

    try {
      await Api.setGalleryFeatured(id, !item.isFeatured);
      Toast?.success?.(item.isFeatured ? "ยกเลิกปักหมุดแล้ว" : "ปักหมุดรูปเด่นแล้ว");
      await loadGallery();
    } catch (err) {
      console.error(err);
      Toast?.error?.(`ปักหมุดไม่สำเร็จ: ${err.message}`);
    }
  }

  async function deleteItem(id) {
    const item = findItem(id);
    if (!item) return;

    const ok = confirm(`ต้องการลบรูป "${item.title || "ไม่มีชื่อกิจกรรม"}" ใช่ไหม?\n\nรูปจะถูกย้ายไปถังขยะใน Google Drive และซ่อนจาก Gallery`);
    if (!ok) return;

    try {
      await Api.deleteGalleryItem(id);
      Toast?.success?.("ลบรูปกิจกรรมแล้ว");
      await loadGallery();
    } catch (err) {
      console.error(err);
      Toast?.error?.(`ลบไม่สำเร็จ: ${err.message}`);
    }
  }

  function handleGalleryAction(event) {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    event.stopPropagation();

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const item = findItem(id);

    if (!item) return;

    if (action === "view") {
      openLightbox(item);
      return;
    }

    if (action === "edit") {
      openEditModal(item);
      return;
    }

    if (action === "delete") {
      deleteItem(id);
      return;
    }

    if (action === "feature") {
      toggleFeatured(id);
    }
  }

  function bindFilterEvents() {
    $("galleryCategoryFilter")?.addEventListener("change", loadGallery);

    $("galleryFeaturedFilter")?.addEventListener("change", loadGallery);

    $("gallerySearch")?.addEventListener("input", () => {
      applyLocalFilters();
    });
  }

  function bindEditEvents() {
    $("closeGalleryEdit")?.addEventListener("click", closeEditModal);
    $("cancelGalleryEdit")?.addEventListener("click", closeEditModal);
    $("saveGalleryEdit")?.addEventListener("click", saveEdit);
  }

  function bindGridEvents() {
    $("galleryGrid")?.addEventListener("click", handleGalleryAction);
  }
    /**
   * ============================================================
   * Part 3.4
   * Lightbox + Event Binding + Init
   * ============================================================
   */

  function openLightbox(item) {

    currentLightboxItem = item;

    const modal = $("galleryLightbox");

    if (!modal) return;

    $("galleryLightboxImage").src = item.imageUrl || "";
    $("galleryLightboxTitle").textContent = item.title || "ไม่มีชื่อกิจกรรม";
    $("galleryLightboxDesc").textContent = item.description || "";
    $("galleryLightboxCategory").textContent = item.category || "กิจกรรม";
    $("galleryLightboxDate").textContent = formatThaiDate(item.timestamp);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

  }

  function closeLightbox() {

    const modal = $("galleryLightbox");

    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    currentLightboxItem = null;

  }

  function bindLightboxEvents() {

    $("galleryLightboxClose")?.addEventListener(
      "click",
      closeLightbox
    );

    $("galleryLightbox")?.addEventListener(
      "click",
      (e)=>{

        if(e.target.id==="galleryLightbox"){

          closeLightbox();

        }

      }
    );

  }

  function bindKeyboard() {

    document.addEventListener("keydown",(e)=>{

      if(e.key==="Escape"){

        closeLightbox();
        closeUploadModal();
        closeEditModal();

      }

    });

  }

  function bindGlobalButtons(){

    $("openGalleryUpload")
      ?.addEventListener(
        "click",
        openUploadModal
      );

    $("openGalleryUpload2")
      ?.addEventListener(
        "click",
        openUploadModal
      );

  }

  function init(){

    bindUploadEvents();

    bindFilterEvents();

    bindEditEvents();

    bindGridEvents();

    bindLightboxEvents();

    bindKeyboard();

    bindGlobalButtons();

    loadGallery();

  }

  return{

    init,

    reload:loadGallery

  };

})();

document.addEventListener(

"DOMContentLoaded",

()=>{

GalleryPage.init();

}

);
