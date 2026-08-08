const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
const shouldReduceData = navigator.connection?.saveData || false;
const isHamusataSubdomain = (host) => host.endsWith('.hamusata.f5.si');

(function() {
    const isMobile = isMobileDevice();
    const host = window.location.hostname.toLowerCase();
    if (!isHamusataSubdomain(host)) return;
    if (isMobile && !host.startsWith('www.m.')) {
        window.location.href = window.location.href.replace(host, 'www.m.' + host.replace('www.', ''));
    } else if (!isMobile && host.startsWith('www.m.')) {
        window.location.href = window.location.href.replace('www.m.', 'www.');
    }
})();

const loadImageCached = (fileName, callback) => {
    const cached = localStorage.getItem(fileName); 
    if (cached) { callback(cached); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL(fileName.endsWith('.ico') ? 'image/x-icon' : 'image/png');
        localStorage.setItem(fileName, dataURL);
        callback(dataURL);
    };
    img.src = `https://hamusata.f5.si/${fileName}`;
};

const cacheFavicon = () => {
    const link = document.getElementById('faviconLink');
    loadImageCached('favicon.ico', dataURL => {
        link.href = dataURL;
    });
};

document.addEventListener('DOMContentLoaded', cacheFavicon);

document.addEventListener('DOMContentLoaded', () => {
    const liteLink = document.getElementById('liteLink');
    if (!liteLink) return;
    const isMobile = isMobileDevice();
    const host = window.location.hostname.toLowerCase();
    if (!isHamusataSubdomain(host)) return;
    if (isMobile && !host.startsWith('www.m.')) {
        liteLink.href = liteLink.href.replace(host, 'www.m.' + host.replace('www.', ''));
    } else if (!isMobile && host.startsWith('www.m.')) {
        liteLink.href = liteLink.href.replace('www.m.', 'www.');
    }
});

const works = [
    { title: 'hamuzon.github.io', link: 'https://hamuzon.github.io', imgFileName: 'icon.svg' },
    { title: 'home.hamusata.f5.si', link: 'https://home.hamusata.f5.si', imgFileName: 'icon.svg' },
    { title: 'www.link-s.f5.si', link: 'https://www.link-s.f5.si/', imgFileName: 'icon.svg' }
];

function generateWorkCards() {
    const container = document.getElementById('worksContainer');
    if (!container) return;
    works.forEach(work => {
        const card = document.createElement('div');
        card.className = 'work-card';
        card.dataset.filename = work.imgFileName;
        card.innerHTML = `<h3>${work.title}</h3><a href="${work.link}">見る / View</a>`;
        container.appendChild(card);
    });
}

function updateYear() {
    const baseYear = 2025;
    const currentYear = new Date().getFullYear();
    document.getElementById('year').textContent = currentYear > baseYear ? `${baseYear}~${currentYear}` : `${baseYear}`;
}

let imagesShown = localStorage.getItem('imagesShown') === 'true';
if (shouldReduceData && localStorage.getItem('imagesShown') === null) {
    imagesShown = false;
}

function setBannerImage(show) {
    const banner = document.getElementById('bannerImg');
    if (show) loadImageCached('banner_icon_hamusata.png', url => banner.src = url);
    else banner.src = '';
}

function toggleWorkImages(show) {
    document.querySelectorAll('.work-card').forEach(card => {
        const fileName = card.dataset.filename;
        if (!fileName) return;
        let img = card.querySelector('img');
        if (show) {
            if (!img) {
                img = document.createElement('img');
                img.alt = card.querySelector('h3').textContent;
                img.loading = 'lazy';
                card.prepend(img);
            }
            if (!img.src || img.src.includes('data:')) loadImageCached(fileName, url => img.src = url);
            img.style.display = '';
        } else if (img) {
            img.style.display = 'none';
        }
    });
}

function updateImages() {
    setBannerImage(imagesShown);
    toggleWorkImages(imagesShown);
}

document.getElementById('showImages').addEventListener('click', () => {
    imagesShown = !imagesShown;
    localStorage.setItem('imagesShown', imagesShown);
    updateImages();
});

document.addEventListener('DOMContentLoaded', () => {
    generateWorkCards();
    updateYear();
    updateImages();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            /* no-op */
        });
    }
});
