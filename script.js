let stream = null;
let selectedTheme = 'cute'; // Default theme
let isCameraReady = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedTheme = this.dataset.theme;
        });
    });

    // Form listeners
    ['nama', 'noHP', 'confirmPayment'].forEach(id => {
        document.getElementById(id).addEventListener('input', checkForm);
        document.getElementById(id).addEventListener('change', checkForm);
    });

    // File upload
    document.getElementById('buktiTransfer').addEventListener('change', handleFileUpload);
}

// 🔥 KAMERA FUNCTION - FULLY OPTIMIZED
async function initCamera() {
    const status = document.getElementById('cameraStatus');
    const openBtn = document.getElementById('openCameraBtn');
    
    try {
        // Update status
        status.textContent = '🔄 Memulai kamera...';
        status.className = 'status-message status-loading';
        openBtn.disabled = true;
        openBtn.textContent = '⏳ Loading...';

        // Request camera with optimal settings
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user', // Front camera
                frameRate: { ideal: 30 }
            },
            audio: false
        });

        // Setup video
        const video = document.getElementById('videoElement');
        video.srcObject = stream;
        
        // Wait for video ready
        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                resolve();
            };
        });

        // Show video & capture button
        video.style.display = 'block';
        document.getElementById('captureBtn').style.display = 'inline-block';
        status.textContent = '✅ Kamera siap! Ambil foto sekarang!';
        status.className = 'status-message status-ready';
        isCameraReady = true;

    } catch (error) {
        console.error('Camera error:', error);
        
        status.textContent = `❌ Kamera gagal: ${getCameraErrorMessage(error)}`;
        status.className = 'status-message status-error';
        openBtn.disabled = false;
        openBtn.textContent = '🔓 BUKA KAMERA';
        
        // Fallback: Ask user to check settings
        showCameraTroubleshoot();
    }
}

function getCameraErrorMessage(error) {
    switch(error.name) {
        case 'NotAllowedError':
            return 'Izin kamera ditolak. Klik ikon kamera di address bar & izinkan.';
        case 'NotFoundError':
            return 'Kamera tidak ditemukan. Cek koneksi perangkat.';
        case 'NotReadableError':
            return 'Kamera sedang digunakan app lain. Tutup app lain.';
        case 'OverconstrainedError':
            return 'Kamera tidak support resolusi ini. Coba lagi.';
        default:
            return error.message;
    }
}

function showCameraTroubleshoot() {
    alert('🔧 TROUBLESHOOT KAMERA:\n\n' +
          '1. ✅ Gunakan CHROME/FIREFOX\n' +
          '2. 📱 Gunakan HP/Laptop dengan kamera\n' +
          '3. 🔒 Izinkan akses kamera (klik ikon kamera)\n' +
          '4. 📵 Tutup app kamera lain\n' +
          '5. 🔄 Refresh halaman\n\n' +
          'Masih error? Coba browser lain!');
}

function capturePhoto() {
    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('canvas');
    
    if (!video.videoWidth) {
        alert('⏳ Tunggu kamera stabil...');
        return;
    }

    // Setup canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Draw image
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply theme overlay
    ctx.fillStyle = getThemeColor();
    ctx.globalAlpha = 0.25;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    // Add text overlay
    addTextOverlay(ctx, canvas);

    // Show result
    canvas.style.display = 'block';
    video.style.display = 'none';
    document.getElementById('captureBtn').style.display = 'none';
    document.getElementById('retakeBtn').style.display = 'inline-block';
    document.getElementById('downloadBtn').style.display = 'block';
}

function addTextOverlay(ctx, canvas) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;

    // Main text
    const mainText = document.getElementById('teksFoto').value;
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.strokeText(mainText, canvas.width/2, canvas.height - 100);
    ctx.fillText(mainText, canvas.width/2, canvas.height - 100);

    // Name
    const name = document.getElementById('nama').value;
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.strokeText(name, canvas.width/2, 60);
    ctx.fillText(name, canvas.width/2, 60);
}

function getThemeColor() {
    const colors = {
        'cute': '#FFB6C1',
        'vintage': '#CD853F', 
        'korean': '#FFC0CB',
        'birthday': '#FFD700'
    };
    return colors[selectedTheme] || '#87CEEB';
}

function retakePhoto() {
    document.getElementById('canvas').style.display = 'none';
    document.getElementById('videoElement').style.display = 'block';
    document.getElementById('captureBtn').style.display = 'inline-block';
    document.getElementById('retakeBtn').style.display = 'none';
    document.getElementById('downloadBtn').style.display = 'none';
}

function downloadPhoto() {
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    const fileName = `photobooth_${document.getElementById('nama').value.replace(/[^a-zA-Z0-9]/g,'_')}_${Date.now()}.png`;
    
    link.download = fileName;
    link.href = canvas.toDataURL('image/png', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`✅ Foto berhasil diunduh!\n📁 ${fileName}`);
}

function startSession() {
    alert('🎉 SESSION DIMULAI!\n📸 Ambil foto terbaik Anda!');
}

function checkForm() {
    const nama = document.getElementById('nama').value.trim();
    const noHP = document.getElementById('noHP').value.trim();
    const confirmPayment = document.getElementById('confirmPayment').checked;
    
    document.getElementById('startBtn').disabled = !nama || !noHP || !confirmPayment;
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('uploadPreview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            checkForm();
        };
        reader.readAsDataURL(file);
    }
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
