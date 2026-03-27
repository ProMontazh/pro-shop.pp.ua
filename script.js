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

// === 🚀 ИНИЦИАЛИЗАЦИЯ ===

// Функция инициализации всего
function initApp() {
    loadCart();
    updateCart();
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
