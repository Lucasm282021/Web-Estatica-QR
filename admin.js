const DEFAULT_CONFIG = {
  info: 'https://coordina.example.com/conoce-mas',
  attendance: 'https://coordina.example.com/asistencia'
};

const STORAGE_KEY = 'coordina-qr-config';
const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
const config = { ...DEFAULT_CONFIG, ...savedConfig };

const fields = {
  info: { url: document.getElementById('url-info'), image: document.getElementById('image-info'), preview: document.getElementById('preview-info'), state: document.getElementById('state-info') },
  attendance: { url: document.getElementById('url-attendance'), image: document.getElementById('image-attendance'), preview: document.getElementById('preview-attendance'), state: document.getElementById('state-attendance') }
};

function renderGeneratedQr(key) {
  const field = fields[key];
  field.preview.innerHTML = '';
  new QRCode(field.preview, { text: field.url.value, width: 150, height: 150, colorDark: key === 'attendance' ? '#ffffff' : '#082b4f', colorLight: key === 'attendance' ? '#082b4f' : '#ffffff', correctLevel: QRCode.CorrectLevel.H });
  field.state.textContent = 'Generado desde el enlace';
}

function renderSavedImage(key, imageData) {
  const field = fields[key];
  field.preview.innerHTML = '';
  const image = document.createElement('img');
  image.src = imageData;
  image.alt = `Vista previa del ${key === 'info' ? 'QR informativo' : 'QR de asistencia'}`;
  field.preview.appendChild(image);
  field.state.textContent = 'Imagen personalizada guardada';
}

Object.entries(fields).forEach(([key, field]) => {
  field.url.value = config[key];
  const savedImage = savedConfig[`${key}Image`];
  if (savedImage) renderSavedImage(key, savedImage);
  else renderGeneratedQr(key);

  field.url.addEventListener('input', () => {
    if (!savedConfig[`${key}Image`]) renderGeneratedQr(key);
  });

  field.image.addEventListener('change', () => {
    const file = field.image.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => renderSavedImage(key, reader.result));
    reader.readAsDataURL(file);
  });
});

document.getElementById('qr-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const nextConfig = { info: fields.info.url.value.trim(), attendance: fields.attendance.url.value.trim() };
  Object.entries(fields).forEach(([key, field]) => {
    const file = field.image.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        nextConfig[`${key}Image`] = reader.result;
        saveConfig(nextConfig);
      });
      reader.readAsDataURL(file);
    }
  });
  saveConfig(nextConfig);
});

document.getElementById('reset-images').addEventListener('click', () => {
  delete savedConfig.infoImage;
  delete savedConfig.attendanceImage;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfig));
  Object.keys(fields).forEach((key) => {
    fields[key].image.value = '';
    renderGeneratedQr(key);
  });
  showMessage('Se restauraron los QR generados.');
});

function saveConfig(nextConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextConfig));
  showMessage('Cambios guardados correctamente.');
}

function showMessage(message) {
  const messageElement = document.getElementById('save-message');
  messageElement.textContent = message;
  window.setTimeout(() => { messageElement.textContent = ''; }, 3500);
}
