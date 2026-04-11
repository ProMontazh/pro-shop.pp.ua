/* ======================================================
   🧩 КАРТА КАТЕГОРІЙ
   ====================================================== */
const CATEGORY_MAP = {
    vnutrishni_kamery: { label: 'Внутрішні камери IMOU', icon: 'reviews_png/cam_indoor.png' },
    zovnishni_kamery: { label: 'Зовнішні камери IMOU', icon: 'reviews_png/cam_outdoor.png' },
    zovnishni_4G_kamery: { label: 'Зовнішні 4G камери IMOU', icon: 'reviews_png/cam_outdoor_4G.png' },
    microSD: { 
        label: 'Карти пам\'яті microSD', 
        icon: 'reviews_png/microsd.png' 
    },
    komplekty_syhnalizaciyi: { label: 'Комплекти сигналізації Ajax', icon: 'reviews_png/starterkit.png' },
    khuby: { label: 'Хаби, модулі Ajax', icon: 'reviews_png/hub.png' },
    vnutrishni_datchyky: { label: 'Внутрішня охорона Ajax', icon: 'reviews_png/motionprotect.png' },
    zovnishni_datchyky: { label: 'Зовнішня охорона Ajax', icon: 'reviews_png/motioncam_outdoor.png' },
    zakhyst_vid_potopu: { label: 'Захист від потопу Ajax', icon: 'reviews_png/waterstop.png' },
    pozhezhna_bezpeka: { label: 'Захист від пожежі Ajax', icon: 'reviews_png/manualcallpoint.png' },
    other: { label: 'Інше', icon: 'favicon.svg' }
};

/* ======================================================
   👆 СВАЙП НАВІГАЦІЯ — МІНІМАЛЬНА
   ====================================================== */
const CATEGORY_SLIDES = [
    { file: 'vnutrishni_kamery.html', key: 'vnutrishni_kamery' },
    { file: 'zovnishni_kamery.html', key: 'zovnishni_kamery' },
    { file: 'zovnishni_4G_kamery.html', key: 'zovnishni_4G_kamery' },
    { file: "karty_pam'yati.html", key: 'microSD' },
    { file: 'komplekty_syhnalizaciyi.html', key: 'komplekty_syhnalizaciyi' },
    { file: 'khuby.html', key: 'khuby' },
    { file: 'vnutrishni_datchyky.html', key: 'vnutrishni_datchyky' },
    { file: 'zovnishni_datchyky.html', key: 'zovnishni_datchyky' },
    { file: 'zakhyst_vid_potopu.html', key: 'zakhyst_vid_potopu' },
    { file: 'pozhezhna_bezpeka.html', key: 'pozhezhna_bezpeka' }
];

function initSwipeNavigation() {
    const currentFile = window.location.pathname.split('/').pop() || '';
    const currentIndex = CATEGORY_SLIDES.findIndex(cat => 
        currentFile.includes(cat.file.replace('.html', ''))
    );
    
    if (currentIndex === -1) return;

    // Оновлюємо індикатор
    const hintCurrent = document.querySelector('.swipe-hint .current');
    const hintPrev = document.querySelector('.swipe-hint span:first-child');
    const hintNext = document.querySelector('.swipe-hint span:last-child');
    
    if (hintCurrent) {
        hintCurrent.textContent = CATEGORY_MAP[CATEGORY_SLIDES[currentIndex].key]?.label || '';
    }
    if (hintPrev) hintPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    if (hintNext) hintNext.style.visibility = currentIndex < CATEGORY_SLIDES.length - 1 ? 'visible' : 'hidden';

    // Свайпи
    let startX = 0;
    let startY = 0;

    document.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const diffX = endX - startX;
        const diffY = Math.abs(endY - startY);
        
        if (diffY > Math.abs(diffX)) return;
        
        if (diffX < -50 && currentIndex < CATEGORY_SLIDES.length - 1) {
            window.location.href = CATEGORY_SLIDES[currentIndex + 1].file;
        } else if (diffX > 50 && currentIndex > 0) {
            window.location.href = CATEGORY_SLIDES[currentIndex - 1].file;
        }
    }, { passive: true });
}

// === 🛒 КОШИК ===
let cart = [];

function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
    loadCart();
    
    const cartItems = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const cartCountElement = document.getElementById('cart-count');
    const stockWarning = document.getElementById('stock-warning');

    if (!cartItems || !totalPriceElement || !cartCountElement) return;

    cartItems.innerHTML = '';
    let total = 0;
    let totalQuantity = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalQuantity += item.quantity;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:30px;height:auto;margin-right:5px;">
            <span>${item.name} - ${item.price} грн</span>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="decreaseQuantity('${item.id}', event)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="increaseQuantity('${item.id}', event)">+</button>
            </div>
        `;
        cartItems.appendChild(div);
    });

    totalPriceElement.textContent = total.toFixed(2);
    cartCountElement.textContent = totalQuantity;
    if (stockWarning) {
        stockWarning.textContent = totalQuantity > 10 ? "Увага! Обмежена кількість товару" : "";
    }

    const discountMessage = document.getElementById('discount-message');
    if (discountMessage) {
        discountMessage.style.display = total >= 1000 ? 'inline' : 'none';
        discountMessage.textContent = total >= 1000 ? "Доступна знижка!" : "";
    }
}

function increaseQuantity(id, event) {
    if (event) event.stopPropagation();
    loadCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveCart();
        updateCart();
    }
}

function decreaseQuantity(id, event) {
    if (event) event.stopPropagation();
    loadCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity > 1 ? item.quantity-- : cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCart();
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function addToCart(event, item) {
    if (event?.stopPropagation) event.stopPropagation();
    loadCart();
    
    const existing = cart.find(ci => ci.id === item.id);
    existing ? existing.quantity++ : cart.push({...item, quantity: 1});
    
    saveCart();
    updateCart();
    showToast(`${item.name} додано до кошика!`);
}

function addToCartFromProductPage(event, item) {
    addToCart(event, item);
}

function clearCart() {
    cart = [];
    saveCart();
    updateCart();
    showToast('Кошик очищено');
}

function toggleCart() {
    const cartContent = document.getElementById('cart-content');
    if (!cartContent) return;
    updateCart();
    cartContent.style.display = getComputedStyle(cartContent).display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', (ev) => {
    const cartContent = document.getElementById('cart-content');
    const cartButton = document.querySelector('.cart');
    if (cartContent && cartButton && !cartContent.contains(ev.target) && !cartButton.contains(ev.target)) {
        cartContent.style.display = 'none';
    }
});

function extractProductIdFromUrl(url) {
    if (!url) return '';
    const match = url.match(/\(([^)]+)\)/);
    if (match) return match[1];
    return url.split('/').pop().split('?')[0].split('#')[0].replace(/\.[^.]+$/, '');
}

function openProductDetails(pageUrl) {
    localStorage.setItem('lastProductId', extractProductIdFromUrl(pageUrl));
    localStorage.setItem('lastScroll', String(window.scrollY || 0));
    
    const mainBanner = document.getElementById('main-banner');
    if (window.innerWidth <= 768 && mainBanner) {
        mainBanner.style.display = 'none';
    }
    window.location.href = pageUrl;
}

// === 🚀 ІНІЦІАЛІЗАЦІЯ ===
function initApp() {
    loadCart();
    updateCart();
    initSwipeNavigation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

window.addEventListener('pageshow', () => {
    loadCart();
    updateCart();
});

window.addEventListener('focus', () => {
    loadCart();
    updateCart();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        loadCart();
        updateCart();
    }
});

// Глобальні функції
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.addToCartFromProductPage = addToCartFromProductPage;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.openProductDetails = openProductDetails;
