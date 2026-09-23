const QR_TARGETS = {
  info: 'https://coordina.example.com/conoce-mas',
  attendance: 'https://coordina.example.com/asistencia'
};

const storedConfig = JSON.parse(localStorage.getItem('coordina-qr-config') || '{}');
QR_TARGETS.info = storedConfig.info || QR_TARGETS.info;
QR_TARGETS.attendance = storedConfig.attendance || QR_TARGETS.attendance;

function createQr(elementId, value, dark = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const key = elementId === 'info-qr' ? 'info' : 'attendance';
  const storedImage = storedConfig[`${key}Image`];
  if (storedImage) {
    showQrImage(element, storedImage);
    return;
  }

  tryFolderQr(element, key);
}

function showQrImage(element, source) {
  const image = document.createElement('img');
  image.src = source;
  image.alt = 'Código QR';
  image.addEventListener('error', () => { image.remove(); });
  element.appendChild(image);
}

function tryFolderQr(element, key) {
  const image = document.createElement('img');
  image.alt = `Código QR ${key}`;
  const baseName = key === 'info' ? 'qr1' : 'qr2';
  const sources = [`qr/${baseName}.svg`, `qr/${baseName}.png`];
  let sourceIndex = 0;
  image.src = sources[sourceIndex];
  image.addEventListener('error', () => {
    sourceIndex += 1;
    if (sourceIndex < sources.length) {
      image.src = sources[sourceIndex];
      return;
    }
    image.remove();
    showEmptyQr(element);
  });
  element.appendChild(image);
}

function showEmptyQr(element) {
  const emptyState = document.createElement('span');
  emptyState.className = 'qr-empty-state';
  emptyState.textContent = 'QR no configurado';
  element.appendChild(emptyState);
}

createQr('info-qr', QR_TARGETS.info);
createQr('attendance-qr', QR_TARGETS.attendance, true);

const toast = document.getElementById('toast');
let toastTimer;

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = QR_TARGETS[button.dataset.copy];
    try {
      await navigator.clipboard.writeText(target);
      toast.textContent = 'Enlace copiado';
    } catch {
      toast.textContent = target;
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  });
});
