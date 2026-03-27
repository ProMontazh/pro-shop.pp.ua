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

(() => {
    // === 🛒 КОШИК ===
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCart() {
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

    window.increaseQuantity = function(id, event) {
        if (event) event.stopPropagation();
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity++;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    };

    window.decreaseQuantity = function(id, event) {
        if (event) event.stopPropagation();
        const item = cart.find(i => i.id === id);
        if (item) {
            if (item.quantity > 1) {
                item.quantity--;
            } else {
                cart = cart.filter(i => i.id !== id);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    };

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    window.addToCart = function(event, item) {
        if (event && event.stopPropagation) event.stopPropagation();
        const existingItem = cart.find(ci => ci.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            item.quantity = 1;
            cart.push(item);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        showToast(`${item.name} додано до кошика!`);
    };

    window.addToCartFromProductPage = function(event, item) {
        if (event) event.stopPropagation();
        const existingItem = cart.find(ci => ci.id === item.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            item.quantity = 1;
            cart.push(item);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        showToast(`${item.name} додано до кошика!`);
    };

    window.clearCart = function() {
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
        showToast('Кошик очищено');
    };

    window.toggleCart = function() {
        const cartContent = document.getElementById('cart-content');
        if (!cartContent) return;
        const isHidden = getComputedStyle(cartContent).display === 'none';
        cartContent.style.display = isHidden ? 'block' : 'none';
    };

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

        // Витягуємо ID з дужок, наприклад: details_indoor_2(IPC-C32EP).html
        const match = url.match(/\(([^)]+)\)/);
        if (match && match[1]) return match[1];

        // Альтернативний спосіб - беремо ім'я файлу без розширення
        const filename = url.split('/').pop().split('?')[0].split('#')[0];
        return filename.replace(/\.[^.]+$/, '') || filename;
    }

    window.openProductDetails = function(pageUrl) {
        const prodId = extractProductIdFromUrl(pageUrl);

        // Зберігаємо поточну категорію та позицію прокрутки
        localStorage.setItem('lastProductId', prodId);
        localStorage.setItem('lastScroll', String(window.scrollY || 0));

        // Ховаємо банер на мобільних пристроях
        const mainBanner = document.getElementById('main-banner');
        if (window.innerWidth <= 768 && mainBanner) {
            mainBanner.style.display = 'none';
        }

        window.location.href = pageUrl;
    };

    // === 🎵 ЗВУК "НАЗАД" ===
    const backSound = document.getElementById('back-sound');
    if (backSound) {
        backSound.volume = 0.3;
    }

    // Ініціалізація кошика при завантаженні сторінки
    updateCart();
})();
