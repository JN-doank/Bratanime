let currentImageUrl = '';
let currentText = '';

function formatUrl(text) {
    const encoded = encodeURIComponent(text).replace(/%20/g, '+');
    return `https://api.nexray.web.id/maker/bratanime?text=${encoded}`;
}

// Fungsi updateUrlDisplay tetap ada tapi tidak digunakan (karena URL display disembunyikan)
function updateUrlDisplay() {
    const inputText = document.getElementById('textInput').value;
    const urlDisplay = document.getElementById('urlDisplay');
    urlDisplay.textContent = `URL: ${formatUrl(inputText)}`;
}

document.getElementById('textInput').addEventListener('input', updateUrlDisplay);
updateUrlDisplay(); // Tetap dijalankan meski elemennya hidden

async function generateImage() {
    const inputText = document.getElementById('textInput').value;
    
    if (!inputText.trim()) {
        alert('Silakan masukkan teks terlebih dahulu!');
        return;
    }

    currentText = inputText;
    const apiUrl = formatUrl(inputText);
    
    const statusEl = document.getElementById('status');
    const imageContainer = document.getElementById('imageContainer');
    const actionButtons = document.getElementById('actionButtons');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const openBtn = document.getElementById('openBtn');

    imageContainer.style.display = 'flex';
    imageContainer.innerHTML = '<div class="loading-spinner"></div>';
    actionButtons.style.display = 'none';
    generateBtn.disabled = true;
    downloadBtn.disabled = true;
    openBtn.disabled = true;

    statusEl.innerHTML = `⏳ Mengakses API...`;

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        statusEl.innerHTML = `📡 Status: <strong>${response.status} OK</strong>`;

        const imageBlob = await response.blob();
        
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }
        
        currentImageUrl = URL.createObjectURL(imageBlob);
        
        const img = document.createElement('img');
        img.src = currentImageUrl;
        img.alt = `Brat Anime: ${inputText}`;
        img.onload = () => {
            imageContainer.innerHTML = '';
            imageContainer.appendChild(img);
            statusEl.innerHTML = `✅ Gambar berhasil dibuat!`;
            
            actionButtons.style.display = 'flex';
            downloadBtn.disabled = false;
            openBtn.disabled = false;
        };
        
        img.onerror = () => {
            throw new Error('Gagal memuat gambar');
        };

    } catch (error) {
        console.error('Error:', error);
        statusEl.innerHTML = `❌ Gagal: ${error.message}`;
        imageContainer.innerHTML = `
            <div class="error-message">
                ❌ Gagal memuat gambar<br>
                <small>${error.message}</small>
            </div>
        `;
    } finally {
        generateBtn.disabled = false;
    }
}

function downloadImage() {
    if (!currentImageUrl || !currentText) return;
    
    const link = document.createElement('a');
    link.href = currentImageUrl;
    link.download = `brat-anime-${currentText.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openInNewTab() {
    if (!currentImageUrl) return;
    window.open(currentImageUrl, '_blank');
}

window.addEventListener('beforeunload', () => {
    if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
    }
});

document.getElementById('textInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateImage();
    }
});
