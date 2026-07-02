/**
 * ============================================================
 * SUBMIT.JS — Collection form validation, image upload, submit flow
 * ============================================================
 */

const SubmitPage = (() => {
  let form, dropzone, imageInput, previewWrap, previewImage, submitBtn;
  let selectedFile = null;

  /** Populate the classroom <select> from CONFIG.CLASSROOMS. */
  function populateClassrooms() {
    const select = document.getElementById('classroom');
    CONFIG.CLASSROOMS.forEach((room) => {
      const opt = document.createElement('option');
      opt.value = room;
      opt.textContent = room;
      select.appendChild(opt);
    });
  }

  /** Restrict the date picker to today or earlier. */
  function limitDateToToday() {
    const dateInput = document.getElementById('collectionDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.max = today;
    dateInput.value = today;
  }

  /** Show/hide a single field's error state. */
  function setFieldError(fieldEl, hasError) {
    const group = fieldEl.closest('.form-group');
    if (group) group.classList.toggle('has-error', hasError);
    return !hasError;
  }

  /** Validate the whole form; returns true if valid. */
  function validateForm() {
    const studentName = document.getElementById('studentName');
    const classroom = document.getElementById('classroom');
    const weightKg = document.getElementById('weightKg');
    const collectionDate = document.getElementById('collectionDate');

    let valid = true;
    valid = setFieldError(studentName, studentName.value.trim().length < 2) && valid;
    valid = setFieldError(classroom, !classroom.value) && valid;
    valid = setFieldError(weightKg, !weightKg.value || parseFloat(weightKg.value) <= 0) && valid;

    const today = new Date().toISOString().split('T')[0];
    const dateInvalid = !collectionDate.value || collectionDate.value > today;
    valid = setFieldError(collectionDate, dateInvalid) && valid;

    const imageGroup = document.getElementById('imageError');
    const imageInvalid = !selectedFile;
    imageGroup.style.display = imageInvalid ? 'block' : 'none';
    dropzone.classList.toggle('has-error', imageInvalid);
    valid = !imageInvalid && valid;

    return valid;
  }

  /** Update the live points estimate as the weight field changes. */
  function updatePointsPreview() {
    const weightKg = parseFloat(document.getElementById('weightKg').value) || 0;
    const points = Math.round(weightKg * CONFIG.POINTS_PER_KG);
    document.getElementById('pointsPreview').textContent = `${points.toLocaleString()} pts`;
  }

  /** Read a File as a base64 data URL string (without the "data:...;base64," prefix). */
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Toast.error('Please choose an image file.');
      return;
    }
    if (file.size > CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      Toast.error(`Image must be under ${CONFIG.MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewWrap.classList.add('has-image');
      document.getElementById('imageError').style.display = 'none';
      dropzone.classList.remove('has-error');
    };
    reader.readAsDataURL(file);
  }

  function initDropzone() {
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });
    imageInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    document.getElementById('previewRemove').addEventListener('click', (e) => {
      e.stopPropagation();
      selectedFile = null;
      imageInput.value = '';
      previewWrap.classList.remove('has-image');
    });
  }

  function setLoading(isLoading) {
    submitBtn.classList.toggle('is-loading', isLoading);
    submitBtn.disabled = isLoading;
  }

  function openSuccessModal(record) {
    document.getElementById('successMessage').textContent =
      `${record.classroom} logged ${record.weightKg.toFixed(1)} kg — ${Math.round(record.weightKg * CONFIG.POINTS_PER_KG)} points earned.`;
    document.getElementById('successModal').classList.add('is-open');
  }

  function resetForm() {
    form.reset();
    limitDateToToday();
    selectedFile = null;
    previewWrap.classList.remove('has-image');
    document.querySelectorAll('.form-group').forEach((g) => g.classList.remove('has-error'));
    updatePointsPreview();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) {
      Toast.warning('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload the evidence image first.
      const base64 = await fileToBase64(selectedFile);
      const uploadResult = await Api.uploadImage({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        base64
      });

      // 2. Submit the collection record referencing the uploaded image.
      const record = {
        studentName: document.getElementById('studentName').value.trim(),
        classroom: document.getElementById('classroom').value,
        weightKg: parseFloat(document.getElementById('weightKg').value),
        collectionDate: document.getElementById('collectionDate').value,
        notes: document.getElementById('notes').value.trim(),
        imageId: uploadResult ? uploadResult.imageId : ''
      };
      await Api.submitCollection(record);

      openSuccessModal(record);
      resetForm();
    } catch (err) {
      Toast.error(`Submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function initModal() {
    document.getElementById('modalCloseBtn').addEventListener('click', () => {
      document.getElementById('successModal').classList.remove('is-open');
    });
  }

  function init() {
    form = document.getElementById('submitForm');
    dropzone = document.getElementById('dropzone');
    imageInput = document.getElementById('imageInput');
    previewWrap = document.getElementById('previewWrap');
    previewImage = document.getElementById('previewImage');
    submitBtn = document.getElementById('submitBtn');

    populateClassrooms();
    limitDateToToday();
    initDropzone();
    initModal();
    updatePointsPreview();

    document.getElementById('weightKg').addEventListener('input', updatePointsPreview);
    form.addEventListener('submit', handleSubmit);
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', SubmitPage.init);
