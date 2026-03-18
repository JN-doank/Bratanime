// Variabel global
let currentImageUrl = '';
let currentText = '';

// Format URL dengan teks yang diinput
function formatUrl(text) {
    const encoded = encodeURIComponent(text).replace(/%20/g, '+');
    return `https://api.nexray.web.id/maker/bratanime?text=${encoded}`;
}

// Fungsi utama generate gambar
async function generateImage() {
    const inputText = document.getElementById('textInput').value.trim();
    
    if (!inputText) {
        alert('Silakan masukkan teks terlebih dahulu!');
        return;
    }

    currentText = inputText;
    const apiUrl = formatUrl(inputText);
    
    const statusEl = document.getElementById('status');
    const statusText = statusEl.querySelector('.status-text');
    const statusDot = statusEl.querySelector('.status-dot');
    const imageContainer = document.getElementById('imageContainer');
    const actionButtons = document.getElementById('actionButtons');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const openBtn = document.getElementById('openBtn');

    // Reset UI
    imageContainer.innerHTML = '<div class="loading-spinner"></div>';
    imageContainer.classList.remove('has-image');
    actionButtons.style.display = 'none';
    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    openBtn.disabled = true;

    statusText.textContent = `Memproses: "${inputText}"...`;
    statusDot.style.background = '#f59e0b';

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        const imageBlob = await response.blob();
        
        // Bersihkan URL lama jika ada
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }
        
        currentImageUrl = URL.createObjectURL(imageBlob);
        
        // Tampilkan gambar
        const img = document.createElement('img');
        img.src = currentImageUrl;
        img.alt = `Brat Anime: ${inputText}`;
        img.loading = 'lazy';
        
        img.onload = () => {
            imageContainer.innerHTML = '';
            imageContainer.appendChild(img);
            imageContainer.classList.add('has-image');
            
            statusText.textContent = 'Gambar berhasil dibuat!';
            statusDot.style.background = '#22c55e';
            
            actionButtons.style.display = 'flex';
            downloadBtn.disabled = false;
            openBtn.disabled = false;
            generateBtn.disabled = false;
        };
        
        img.onerror = () => {
            throw new Error('Gagal memuat gambar');
        };

    } catch (error) {
        console.error('Error:', error);
        
        imageContainer.innerHTML = `
            <div class="error-message">
                ❌ Gagal memuat gambar
                <small>${error.message}</small>
            </div>
        `;
        imageContainer.classList.remove('has-image');
        
        statusText.textContent = 'Error: ' + error.message;
        statusDot.style.background = '#ef4444';
        
        generateBtn.disabled = false;
    }
}

// Download gambar
function downloadImage() {
    if (!currentImageUrl || !currentText) return;
    
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `brat-anime-${currentText.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Buka gambar di tab baru
function openInNewTab() {
    if (!currentImageUrl) return;
    window.open(currentImageUrl, '_blank');
}

// Event listener untuk Enter key
document.getElementById('textInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateImage();
    }
});

// Bersihkan URL objek saat halaman ditutup
window.addEventListener('beforeunload', () => {
    if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
    }
});

// Update status awal
document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.querySelector('.status-text');
    statusText.textContent = 'Siap menghasilkan gambar';
});
