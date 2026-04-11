// ⚠️ ВСТАВТЕ ВАШ GOOGLE SCRIPT URL ТУТ ⚠️
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHkIMm6k0BCBRDUPBbicKiqwRTv4BMlLu8ZEbYfIGvJ5pmXrir2q-CWqgrs8LJsB_5/exec';

// ✅ ДОБАВЛЕНО: CATEGORY_MAP (был отсутствующий)
const CATEGORY_MAP = {
    'vnutrishni_kamery': { label: 'Внутрішні камери', icon: '/icons/camera.svg' },
    'zovnishni_kamery': { label: 'Зовнішні камери', icon: '/icons/camera.svg' },
    'zovnishni_4G_kamery': { label: '4G камери', icon: '/icons/4g.svg' },
    'komplekty_syhnalizaciyi': { label: 'Комплекти сигналізації', icon: '/icons/alarm.svg' },
    'khuby': { label: 'Хаби', icon: '/icons/hub.svg' },
    'vnutrishni_datchyky': { label: 'Внутрішні датчики', icon: '/icons/sensor.svg' },
    'zovnishni_datchyky': { label: 'Зовнішні датчики', icon: '/icons/sensor.svg' },
    'zakhyst_vid_potopu': { label: 'Захист від потопу', icon: '/icons/water.svg' },
    'pozhezhna_bezpeka': { label: 'Пожежна безпека', icon: '/icons/fire.svg' },
    'other': { label: 'Інше', icon: '/icons/default.svg' }
};

let selectedRating = 0;
let allReviews = [];

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', function() {
    initStarRating();
    loadReviewsForWidget();
});

// Завантаження для віджету
async function loadReviewsForWidget() {
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        if (data.success && data.reviews) {
            allReviews = data.reviews;
            updateWidget(data.reviews);
        } else {
            updateWidget([]);
        }
    } catch (error) {
        updateWidget([]);
    }
}

// Оновлення віджету
function updateWidget(reviews) {
    const widgetRating = document.getElementById('widgetRating');
    const widgetCount = document.getElementById('widgetCount');
    const widgetStars = document.getElementById('widgetStars');
    
    if (!widgetRating || !widgetCount || !widgetStars) return;

    const count = reviews.length;
    const avgRating = count > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / count 
        : 0;

    widgetRating.textContent = avgRating.toFixed(1);

    const countText = count === 0 ? 'Немає відгуків' :
                     count === 1 ? '1 відгук' :
                     count < 5 ? `${count} відгуки` :
                     `${count} відгуків`;
    widgetCount.textContent = countText;

    renderWidgetStars(avgRating);
}

// Відображення зірок віджету з частковим заповненням
function renderWidgetStars(rating) {
    const container = document.getElementById('widgetStars');
    if (!container) return;
    
    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'widget-star';
        star.innerHTML = '★';

        if (rating >= i) {
            const filled = document.createElement('span');
            filled.className = 'widget-star-filled';
            filled.style.width = '100%';
            filled.innerHTML = '★';
            star.appendChild(filled);
        } else if (rating > i - 1) {
            const filled = document.createElement('span');
            filled.className = 'widget-star-filled';
            const percentage = ((rating - (i - 1)) * 100).toFixed(0);
            filled.style.width = percentage + '%';
            filled.innerHTML = '★';
            star.appendChild(filled);
        }

        container.appendChild(star);
    }
}

// Відкрити модальне вікно
function openReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    history.pushState({ reviewsModal: true }, '', '#reviews');
    
    loadReviews();
}

// ✅ ИСПРАВЛЕНО: Закрити модальне вікно (полная очистка)
function closeReviewsModal() {
    const modal = document.getElementById('reviewsModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    if (window.location.hash === '#reviews') {
        history.back();
    }
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'reviewsModal') {
        closeReviewsModal();
    }
}

// Обробник Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeReviewsModal();
    }
});

// ✅ ИСПРАВЛЕНО: popstate обробник (чистая логика)
window.addEventListener('popstate', (e) => {
    const modal = document.getElementById('reviewsModal');
    if (modal && modal.classList.contains('active')) {
        if (!e.state || !e.state.reviewsModal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
    }
});

// Перемикання вкладок
function switchTab(tab) {
    const tabs = document.querySelectorAll('.reviews-tab');
    const contents = document.querySelectorAll('.reviews-tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'read') {
        tabs[0].classList.add('active');
        document.getElementById('readTab').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('writeTab').classList.add('active');
    }
}

// Ініціалізація рейтингу форми
function initStarRating() {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('reviewRating').value = selectedRating;
            updateStars(selectedRating);
        });
    });
}

function updateStars(rating) {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// Показати повідомлення
function showFormMessage(text, type) {
    const msg = document.getElementById('formMessage');
    if (!msg) return;
    
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 5000);
}

// Відправка відгуку
async function submitReview(event) {
    event.preventDefault();

    if (selectedRating === 0) {
        showFormMessage('Будь ласка, оберіть оцінку!', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправка...';

    const review = {
        name: document.getElementById('reviewName').value.trim(),
        product: document.getElementById('reviewProduct').value,
        rating: selectedRating,
        text: document.getElementById('reviewText').value.trim(),
        date: new Date().toLocaleDateString('uk-UA', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    };

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(review)
        });

        showFormMessage('✓ Дякуємо! Ваш відгук успішно додано!', 'success');

        document.getElementById('reviewName').value = '';
        document.getElementById('reviewProduct').value = '';
        document.getElementById('reviewText').value = '';
        selectedRating = 0;
        updateStars(0);

        setTimeout(() => {
            switchTab('read');
            loadReviews();
            loadReviewsForWidget();
        }, 2000);

    } catch (error) {
        showFormMessage('Помилка відправки. Спробуйте ще раз.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Відправити відгук';
    }
}

// Завантаження відгуків у модальне вікно
async function loadReviews() {
    const loading = document.getElementById('loading');
    const list = document.getElementById('reviewsList');
    const noReviews = document.getElementById('noReviews');

    if (!loading || !list || !noReviews) return;

    loading.style.display = 'block';
    list.style.display = 'none';
    noReviews.style.display = 'none';

    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();

        loading.style.display = 'none';

        if (data.success && data.reviews && data.reviews.length > 0) {
            updateModalStats(data.reviews);
            displayReviews(data.reviews);
        } else {
            updateModalStats([]);
            noReviews.style.display = 'block';
        }
    } catch (error) {
        loading.style.display = 'none';
        noReviews.style.display = 'block';
    }
}

// Оновлення статистики модального вікна
function updateModalStats(reviews) {
    const modalRating = document.getElementById('modalRating');
    const modalCount = document.getElementById('modalCount');
    const modalStars = document.getElementById('modalStars');
    
    if (!modalRating || !modalCount || !modalStars) return;

    const count = reviews.length;
    const avgRating = count > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / count 
        : 0;

    modalRating.textContent = avgRating.toFixed(1);

    const countText = count === 0 ? 'Немає відгуків' :
                     count === 1 ? '1 відгук' :
                     count < 5 ? `${count} відгуки` :
                     `${count} відгуків`;
    modalCount.textContent = countText;

    renderModalStars(avgRating);
}

// Відображення зірок у модальному вікні
function renderModalStars(rating) {
    const container = document.getElementById('modalStars');
    if (!container) return;
    
    container.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'modal-star';
        star.innerHTML = '★';

        if (rating >= i) {
            const filled = document.createElement('span');
            filled.className = 'modal-star-filled';
            filled.style.width = '100%';
            filled.innerHTML = '★';
            star.appendChild(filled);
        } else if (rating > i - 1) {
            const filled = document.createElement('span');
            filled.className = 'modal-star-filled';
            const percentage = ((rating - (i - 1)) * 100).toFixed(0);
            filled.style.width = percentage + '%';
            filled.innerHTML = '★';
            star.appendChild(filled);
        }

        container.appendChild(star);
    }
}

// Відображення списку відгуків
function displayReviews(reviews) {
    const list = document.getElementById('reviewsList');
    if (!list) return;
    
    list.style.display = 'grid';
    list.innerHTML = '';

    reviews.forEach(review => {
        if (!review.name || !review.text) return;

        const initials = review.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

        const stars = Array(5).fill(0)
            .map((_, i) => `<span class="star ${i >= review.rating ? 'empty' : ''}">★</span>`)
            .join('');

        // ✅ ИСПРАВЛЕНО: безопасное получение категории
        const cat = CATEGORY_MAP[review.product] || CATEGORY_MAP['other'];

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <div class="review-avatar">${initials}</div>
                <div class="review-info">
                    <div class="review-name">${escapeHtml(review.name)}</div>
                    <div class="review-date">${escapeHtml(review.date)}</div>
                </div>
            </div>
            <div class="review-stars">${stars}</div>
            <div class="review-text">${escapeHtml(review.text)}</div>
            <div class="review-product" onclick="goToCategoryFromReview('${review.product}')" style="cursor: pointer;">
                <img src="${cat.icon}" alt="${cat.label}" onerror="this.style.display='none'">
                <span>${cat.label}</span>
            </div>
        `;

        list.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ✅ ИСПРАВЛЕНО: Переход на страницу категории
function goToCategoryFromReview(categoryId) {
    // Проверка существования категории
    if (!CATEGORY_MAP[categoryId]) {
        console.warn('Невідома категорія:', categoryId);
        categoryId = 'other';
    }
    
    // Закрываем модалку
    closeReviewsModal();
    
    // URL категорий
    const categoryUrls = {
        'vnutrishni_kamery': 'vnutrishni_kamery.html',
        'zovnishni_kamery': 'zovnishni_kamery.html',
        'zovnishni_4G_kamery': 'zovnishni_4G_kamery.html',
        'komplekty_syhnalizaciyi': 'komplekty_syhnalizaciyi.html',
        'khuby': 'khuby.html',
        'vnutrishni_datchyky': 'vnutrishni_datchyky.html',
        'zovnishni_datchyky': 'zovnishni_datchyky.html',
        'zakhyst_vid_potopu': 'zakhyst_vid_potopu.html',
        'pozhezhna_bezpeka': 'pozhezhna_bezpeka.html',
        'other': 'index.html'
    };

    const targetUrl = categoryUrls[categoryId] || 'index.html';
    
    // Задержка для анимации закрытия
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 300);
}
