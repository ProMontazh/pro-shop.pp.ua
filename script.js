/* ======================================================
   🧩 КАРТА КАТЕГОРИЙ
   ====================================================== */
const CATEGORY_MAP = {
    indoor: {
        label: 'Внутрішні камери IMOU',
        icon: 'reviews_png/cam_indoor.png'
    },
    outdoor: {
        label: 'Зовнішні камери IMOU',
        icon: 'reviews_png/cam_outdoor.png'
    },
    outdoor_4G: {
        label: 'Зовнішні 4G камери IMOU',
        icon: 'reviews_png/cam_outdoor_4G.png'
    },
    alarm: {
        label: 'Комплекти сигналізації Ajax',
        icon: 'reviews_png/starterkit.png'
    },
    hub: {
        label: 'Хаби, модулі Ajax',
        icon: 'reviews_png/hub.png'
    },
    protect: {
        label: 'Внутрішня охорона Ajax',
        icon: 'reviews_png/motionprotect.png'
    },
    protect_outdoor: {
        label: 'Зовнішня охорона Ajax',
        icon: 'reviews_png/motioncam_outdoor.png'
    },
    waterstop: {
        label: 'Захист від потопу Ajax',
        icon: 'reviews_png/waterstop.png'
    },
    fire: {
        label: 'Захист від пожежі Ajax',
        icon: 'reviews_png/manualcallpoint.png'
    },
    other: {
        label: 'Інше',
        icon: 'favicon.svg'
    }
};

/* ======================================================
   👆 СВАЙП НАВІГАЦІЯ МІЖ КАТЕГОРІЯМИ
   ====================================================== */

// === КОНФІГУРАЦІЯ: порядок сторінок категорій ===
const CATEGORY_SLIDES = [
    { file: 'vnutrishni_kamery.html', key: 'indoor' },
    { file: 'zovnishni_kamery.html', key: 'outdoor' },
    { file: 'zovnishni_4G_kamery.html', key: 'outdoor_4G' },
    { file: 'karty_pam\'yati.html', key: 'microsd' },
    { file: 'komplekty_syhnalizaciyi.html', key: 'alarm' },
    { file: 'khuby.html', key: 'hub' },
    { file: 'vnutrishni_datchyky.html', key: 'protect' },
    { file: 'zovnishni_datchyky.html', key: 'protect_outdoor' },
    { file: 'zakhyst_vid_potopu.html', key: 'waterstop' },
    { file: 'pozhezhna_bezpeka.html', key: 'fire' }
];

// Ініціалізація свайп-навігації
function initSwipeNavigation() {
    const currentFile = window.location.pathname.split('/').pop() || '';
    const currentIndex = CATEGORY_SLIDES.findIndex(cat => 
        currentFile.includes(cat.file.replace('.html', ''))
    );
    
    // Не на сторінці категорії - виходимо
    if (currentIndex === -1) return;
    
    // Оновлюємо індикатор свайпу якщо є
    updateSwipeHint(currentIndex);
    
    // Додаємо CSS анімації якщо ще не додані
    addSwipeStyles();
    
    // Вхідна анімація
    handleEnterAnimation();
    
    // Налаштовуємо обробники свайпів
    setupSwipeHandlers(currentIndex);
    
    // Предзавантажуємо сусідні сторінки
    setTimeout(() => preloadAdjacentPages(currentIndex), 2000);
}

// Оновлення індикатора свайпу
function updateSwipeHint(currentIndex) {
    const hintCurrent = document.querySelector('.swipe-hint .current');
    const hintPrev = document.querySelector('.swipe-hint span:first-child');
    const hintNext = document.querySelector('.swipe-hint span:last-child');
    
    if (hintCurrent) {
        const category = CATEGORY_SLIDES[currentIndex];
        hintCurrent.textContent = CATEGORY_MAP[category.key]?.label || category.key;
    }
    
    if (hintPrev) {
        hintPrev.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    }
    
    if (hintNext) {
        hintNext.style.visibility = currentIndex < CATEGORY_SLIDES.length - 1 ? 'visible' : 'hidden';
    }
}

// Додавання CSS стилів для анімацій
function addSwipeStyles() {
    if (document.getElementById('swipe-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'swipe-styles';
    styles.textContent = `
        body {
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        body.slide-out-left {
            transform: translateX(-30%);
            opacity: 0;
        }
        
        body.slide-out-right {
            transform: translateX(30%);
            opacity: 0;
        }
        
        @keyframes slideInFromLeft {
            from { transform: translateX(-30%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideInFromRight {
            from { transform: translateX(30%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        body.slide-in-left {
            animation: slideInFromLeft 0.3s ease;
        }
        
        body.slide-in-right {
            animation: slideInFromRight 0.3s ease;
        }
        
        .swipe-hint {
            display: none;
            text-align: center;
            padding: 8px 15px;
            color: #666;
            font-size: 0.8em;
            background: #2a2a2a;
            border-bottom: 1px solid #444;
            user-select: none;
        }
        
        @media (max-width: 768px) {
            .swipe-hint {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
        }
        
        .swipe-hint span {
            color: #800000;
            opacity: 0.6;
            font-size: 0.85em;
        }
        
        .swipe-hint .current {
            color: #fff;
            font-weight: 600;
            opacity: 1;
            font-size: 0.9em;
        }
    `;
    document.head.appendChild(styles);
}

// Обробка вхідної анімації
function handleEnterAnimation() {
    const enterDirection = sessionStorage.getItem('slideEnter');
    if (!enterDirection) return;
    
    document.body.classList.add(enterDirection === 'left' ? 'slide-in-left' : 'slide-in-right');
    sessionStorage.removeItem('slideEnter');
    
    setTimeout(() => {
        document.body.classList.remove('slide-in-left', 'slide-in-right');
    }, 300);
}

// Налаштування обробників свайпів
function setupSwipeHandlers(currentIndex) {
    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = false;
    const minSwipeDistance = 50;
    const maxVerticalDistance = 100;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        isHorizontalSwipe = false;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        const currentX = e.changedTouches[0].screenX;
        const currentY = e.changedTouches[0].screenY;
        const diffX = Math.abs(currentX - touchStartX);
        const diffY = Math.abs(currentY - touchStartY);
        
        if (diffX > diffY && diffX > 20) {
            isHorizontalSwipe = true;
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        if (!isHorizontalSwipe) return;
        
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = Math.abs(touchEndY - touchStartY);
        
        if (diffY > maxVerticalDistance) return;
        
        handleSwipe(diffX, currentIndex);
    }, { passive: true });
}

// Обробка свайпу
function handleSwipe(distance, currentIndex) {
    const minSwipeDistance = 50;
    
    // Свайп вліво → наступна категорія
    if (distance < -minSwipeDistance) {
        if (currentIndex < CATEGORY_SLIDES.length - 1) {
            navigateToCategory(CATEGORY_SLIDES[currentIndex + 1].file, 'left');
        } else {
            bounceEffect('left');
        }
    }
    // Свайп вправо → попередня категорія
    else if (distance > minSwipeDistance) {
        if (currentIndex > 0) {
            navigateToCategory(CATEGORY_SLIDES[currentIndex - 1].file, 'right');
        } else {
            bounceEffect('right');
        }
    }
}

// Перехід до категорії з анімацією
function navigateToCategory(url, direction) {
    document.body.classList.add(direction === 'left' ? 'slide-out-left' : 'slide-out-right');
    sessionStorage.setItem('slideEnter', direction === 'left' ? 'right' : 'left');
    
    setTimeout(() => {
        window.location.href = url;
    }, 250);
}

// Ефект відскоку при досягненні межі
function bounceEffect(direction) {
    const offset = direction === 'left' ? '-15px' : '15px';
    document.body.style.transform = `translateX(${offset})`;
    
    setTimeout(() => {
        document.body.style.transition = 'transform 0.2s ease';
        document.body.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            document.body.style.transition = '';
        }, 200);
    }, 100);
}

// Предзавантаження сусідніх сторінок
function preloadAdjacentPages(currentIndex) {
    const preload = (index) => {
        if (index < 0 || index >= CATEGORY_SLIDES.length) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = CATEGORY_SLIDES[index].file;
        document.head.appendChild(link);
    };
    
    preload(currentIndex - 1);
    preload(currentIndex + 1);
}

// === 🛒 КОШИК - Глобальные переменные ===
let cart = [];

// Функция загрузки корзины из localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        cart = [];
    }
}

// Функция сохранения корзины
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
    // Перезагружаем корзину из localStorage для синхронизации между вкладками
    loadCart();
    
    const cartItems = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const cartCountElement = document.getElementById('cart-count');
    const stockWarning = document.getElementById('stock-warning');

    if (!cartItems || !totalPriceElement || !cartCountElement || !stockWarning) return;

    cartItems.innerHTML = '';
    let total = 0;
    let totalQuantity = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalQuantity += item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" style="width:30px;height:auto;margin-right:5px;">
            <span>${item.name} - ${item.price} грн</span>
            <div class="quantity-control">
                <button class="quantity-btn" onclick="decreaseQuantity('${item.id}', event)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="increaseQuantity('${item.id}', event)">+</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });

    totalPriceElement.textContent = total.toFixed(2);
    cartCountElement.textContent = totalQuantity;
    stockWarning.textContent = totalQuantity > 10 
        ? "Увага! Обмежена кількість товару. Наявність уточнюйте" 
        : "";

    // 💰 Перевірка на знижку
    const discountMessage = document.getElementById('discount-message');
    if (discountMessage) {
        if (total >= 1000) {
            discountMessage.textContent = "Доступна знижка!";
            discountMessage.style.display = "inline";
        } else {
            discountMessage.textContent = "";
            discountMessage.style.display = "none";
        }
    }
}

function increaseQuantity(id, event) {
    if (event) event.stopPropagation();
    loadCart(); // Перезагружаем перед изменением
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveCart();
        updateCart();
    }
}

function decreaseQuantity(id, event) {
    if (event) event.stopPropagation();
    loadCart(); // Перезагружаем перед изменением
    const item = cart.find(i => i.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity--;
        } else {
            cart = cart.filter(i => i.id !== id);
        }
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
    if (event && event.stopPropagation) event.stopPropagation();
    
    loadCart(); // Перезагружаем перед добавлением
    
    const existingItem = cart.find(ci => ci.id === item.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        item.quantity = 1;
        cart.push(item);
    }
    
    saveCart();
    updateCart();
    showToast(`${item.name} додано до кошика!`);
}

function addToCartFromProductPage(event, item) {
    addToCart(event, item); // Используем ту же функцию
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
    
    // Обновляем корзину перед показом
    updateCart();
    
    const isHidden = getComputedStyle(cartContent).display === 'none';
    cartContent.style.display = isHidden ? 'block' : 'none';
}

// Закриття кошика при кліку поза ним
document.addEventListener('click', (ev) => {
    const cartContent = document.getElementById('cart-content');
    const cartButton = document.querySelector('.cart');
    if (!cartContent || !cartButton) return;

    if (!cartContent.contains(ev.target) && !cartButton.contains(ev.target)) {
        cartContent.style.display = 'none';
    }
});

// Витягування ID продукту з URL
function extractProductIdFromUrl(url) {
    if (!url) return '';

    const match = url.match(/\(([^)]+)\)/);
    if (match && match[1]) return match[1];

    const filename = url.split('/').pop().split('?')[0].split('#')[0];
    return filename.replace(/\.[^.]+$/, '') || filename;
}

function openProductDetails(pageUrl) {
    const prodId = extractProductIdFromUrl(pageUrl);

    localStorage.setItem('lastProductId', prodId);
    localStorage.setItem('lastScroll', String(window.scrollY || 0));

    const mainBanner = document.getElementById('main-banner');
    if (window.innerWidth <= 768 && mainBanner) {
        mainBanner.style.display = 'none';
    }

    window.location.href = pageUrl;
}

// === 🎵 ЗВУК "НАЗАД" ===
const backSound = document.getElementById('back-sound');
if (backSound) {
    backSound.volume = 0.3;
}

// === 🚀 ИНИЦІАЛІЗАЦІЯ ===

// Функция инициализации всего
function initApp() {
    loadCart();
    updateCart();
    initSwipeNavigation(); // 👆 Додаємо ініціалізацію свайпів
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ✅ КЛЮЧЕВОЕ: Обновление при показе страницы (включая назад/вперед)
window.addEventListener('pageshow', (event) => {
    // event.persisted = true когда страница восстановлена из кэша bfcache
    if (event.persisted) {
        console.log('Page restored from bfcache, updating cart...');
    }
    loadCart();
    updateCart();
});

// Обновление при получении фокуса (для синхронизации между вкладками)
window.addEventListener('focus', () => {
    loadCart();
    updateCart();
});

// Слушаем изменения localStorage из других вкладок
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        loadCart();
        updateCart();
    }
});

// Делаем функции глобальными
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.addToCartFromProductPage = addToCartFromProductPage;
window.clearCart = clearCart;
window.toggleCart = toggleCart;
window.openProductDetails = openProductDetails;
