(() => {
  const form = document.getElementById('qr-form');
  const input = document.getElementById('url-input');
  const generateButton = document.getElementById('generate-btn');
  const resultArea = document.getElementById('result-area');
  const qrTarget = document.getElementById('qr-code');
  const status = document.getElementById('status-message');
  const resultUrl = document.getElementById('result-url');
  const downloadButton = document.getElementById('download-qr');
  const resetButton = document.getElementById('reset-btn');
  let currentUrl = '';

  function normalizeUrl(value) {
    const trimmed = value.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('http 또는 https 주소를 입력해 주세요.');
    return parsed.href;
  }

  function setStatus(message, isError = true) {
    status.textContent = message;
    status.style.color = isError ? '#b45061' : '#369a82';
  }

  function downloadJpg() {
    if (!currentUrl || !qrTarget.firstElementChild) {
      setStatus('먼저 QR 코드를 생성해 주세요.');
      return;
    }
    const canvas = qrTarget.querySelector('canvas');
    const image = qrTarget.querySelector('img');
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 800;
    exportCanvas.height = 800;
    const context = exportCanvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 800, 800);
    if (canvas) {
      context.drawImage(canvas, 40, 40, 720, 720);
      triggerDownload(exportCanvas.toDataURL('image/jpeg', 0.95));
    } else if (image && image.complete) {
      context.drawImage(image, 40, 40, 720, 720);
      triggerDownload(exportCanvas.toDataURL('image/jpeg', 0.95));
    } else if (image) {
      image.onload = () => {
        context.drawImage(image, 40, 40, 720, 720);
        triggerDownload(exportCanvas.toDataURL('image/jpeg', 0.95));
      };
    } else {
      setStatus('QR 이미지를 준비하지 못했습니다. 다시 생성해 주세요.');
    }
  }

  function triggerDownload(dataUrl) {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = 'url2qr-code.jpg';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setStatus('QR 코드 JPG 파일을 저장했어요.', false);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = '';
    let url;
    try {
      url = normalizeUrl(input.value);
    } catch (error) {
      setStatus('올바른 URL을 입력해 주세요. 예: https://example.com');
      input.focus();
      return;
    }
    if (typeof window.QRCode === 'undefined') {
      setStatus('QR 생성 라이브러리를 불러오지 못했습니다. 인터넷 연결 후 새로고침해 주세요.');
      return;
    }
    currentUrl = url;
    qrTarget.replaceChildren();
    resultArea.hidden = false;
    resultUrl.textContent = url;
    generateButton.disabled = true;
    generateButton.textContent = '생성 중...';
    try {
      new QRCode(qrTarget, { text: url, width: 240, height: 240, colorDark: '#17233a', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
      setStatus('QR 코드가 생성되었습니다. 코드를 누르면 JPG로 저장됩니다.', false);
      resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      currentUrl = '';
      resultArea.hidden = true;
      setStatus('QR 코드를 생성하지 못했습니다. 주소를 확인하고 다시 시도해 주세요.');
    } finally {
      generateButton.disabled = false;
      generateButton.innerHTML = 'QR 생성하기 <span aria-hidden="true">↗</span>';
    }
  });
  downloadButton.addEventListener('click', downloadJpg);
  qrTarget.addEventListener('click', downloadJpg);
  resetButton.addEventListener('click', () => {
    input.value = '';
    currentUrl = '';
    qrTarget.replaceChildren();
    resultArea.hidden = true;
    status.textContent = '';
    input.focus();
  });
  document.addEventListener('pointermove', (event) => {
    document.body.style.setProperty('--x', `${Math.round(event.clientX / window.innerWidth * 100)}%`);
    document.body.style.setProperty('--y', `${Math.round(event.clientY / window.innerHeight * 100)}%`);
  }, { passive: true });
})();
