/**
 * ТокиЁ — основной скрипт
 * Функционал: корзина (localStorage), фильтрация, навигация, заказы
 */

// ===== ДАННЫЕ =====
const products = [
  { id: 1, name: 'Филадельфия', desc: 'Лосось, сливочный сыр, огурец', weight: '250 г', price: 699, category: 'rolls', img: '🍣' },
  { id: 2, name: 'Калифорния', desc: 'Краб, авокадо, огурец, тобико', weight: '240 г', price: 650, category: 'rolls', img: '🍱' },
  { id: 3, name: 'Суши с лососем', desc: 'Нежный лосось, рис, васаби', weight: '180 г', price: 390, category: 'sushi', img: '🍣' },
  { id: 4, name: 'Суши с угрем', desc: 'Угорь, соус унаги, кунжут', weight: '190 г', price: 450, category: 'sushi', img: '🍣' },
  { id: 5, name: 'Пицца Маргарита', desc: 'Томаты, моцарелла, базилик', weight: '450 г', price: 590, category: 'pizza', img: '🍕' },
  { id: 6, name: 'Пицца Пепперони', desc: 'Пепперони, сыр, томатный соус', weight: '470 г', price: 690, category: 'pizza', img: '🍕' },
  { id: 7, name: 'Сет для двоих', desc: '2 ролла, суши, пицца', weight: '950 г', price: 1290, category: 'sets', img: '🍱' },
  { id: 8, name: 'Сет недели', desc: 'Филадельфия, Калифорния, суши', weight: '750 г', price: 1090, category: 'promo', img: '🔥' },
  { id: 9, name: 'Комбо для двоих', desc: 'Пицца + роллы + напиток', weight: '900 г', price: 1390, category: 'promo', img: '🔥' },
];

// ===== СОСТОЯНИЕ =====
let cart = JSON.parse(localStorage.getItem('tokyoCart')) || [];
let currentPage = 'home';

// ===== DOM-ЭЛЕМЕНТЫ =====
const cartCountEl = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartItemsList = document.getElementById('cartItemsList');
const cartTotal = document.getElementById('cartTotal');
const cartMinMsg = document.getElementById('cartMinMessage');
const popularGrid = document.getElementById('popularGrid');
const menuGrid = document.getElementById('menuGrid');
const promoGrid = document.getElementById('promoGrid');
const filterTabs = document.getElementById('filterTabs');

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

/** Обновление счётчика корзины */
function renderCartCount() {
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = count;
  localStorage.setItem('tokyoCart', JSON.stringify(cart));
}

/** Общая сумма корзины */
function getTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/** Показать всплывающее сообщение */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/** Добавление товара в корзину */
function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCartCount();
  showToast(`${product.name} добавлен в корзину`);
}

// ===== ОТРИСОВКА КАРТОЧЕК ТОВАРОВ =====

/**
 * Рендерит карточки товаров в контейнер
 * @param {HTMLElement} container - контейнер
 * @param {Array} items - массив товаров
 * @param {number} [limit] - лимит (опционально)
 */
function renderProductCards(container, items, limit) {
  const list = limit ? items.slice(0, limit) : items;
  container.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 200 150\\" width=\\"200\\" height=\\"150\\"><rect width=\\"200\\" height=\\"150\\" fill=\\"%23f5f2ee\\"/><text x=\\"60\\" y=\\"95\\" font-family=\\"Arial\\" font-size=\\"48\\" fill=\\"%23444\\">${p.img}</text></svg>');"></div>
      <h4>${p.name}</h4>
      <div class="desc">${p.desc}</div>
      <div class="weight">${p.weight}</div>
      <div class="price">${p.price} ₽</div>
      <button class="add-to-cart" data-id="${p.id}">Добавить в корзину</button>
    </div>
  `).join('');

  // Обработчики для кнопок "В корзину"
  container.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      const prod = products.find(p => p.id === id);
      if (prod) addToCart(prod);
    });
  });
}

// ===== ОТРИСОВКА КОРЗИНЫ (МОДАЛКА) =====

function renderCartModal() {
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<p style="color:#888;">Корзина пуста</p>';
    cartTotal.textContent = 'Итого: 0 ₽';
    cartMinMsg.style.display = 'none';
    return;
  }

  let html = '';
  cart.forEach((item, idx) => {
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <span>${item.name}</span>
          <span>${item.price} ₽</span>
        </div>
        <div>
          <button data-idx="${idx}" class="cart-qty-dec">−</button>
          ${item.qty}
          <button data-idx="${idx}" class="cart-qty-inc">+</button>
          <button data-idx="${idx}" class="cart-remove">✕</button>
        </div>
      </div>
    `;
  });
  cartItemsList.innerHTML = html;

  const total = getTotal();
  cartTotal.textContent = `Итого: ${total} ₽`;

  if (total < 1000) {
    cartMinMsg.style.display = 'block';
    cartMinMsg.textContent = `Минимальная сумма заказа — 1000 ₽ (не хватает ${1000 - total} ₽)`;
  } else {
    cartMinMsg.style.display = 'none';
  }

  // ===== Обработчики внутри корзины =====
  document.querySelectorAll('.cart-qty-inc').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.idx);
      cart[idx].qty += 1;
      renderCartModal();
      renderCartCount();
    };
  });

  document.querySelectorAll('.cart-qty-dec').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.idx);
      if (cart[idx].qty > 1) {
        cart[idx].qty -= 1;
        renderCartModal();
        renderCartCount();
      }
    };
  });

  document.querySelectorAll('.cart-remove').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.idx);
      cart.splice(idx, 1);
      renderCartModal();
      renderCartCount();
    };
  });
}

// ===== НАВИГАЦИЯ =====

/** Переключение между страницами */
window.navigateTo = function(page) {
  // Скрываем все секции
  document.querySelectorAll('section[id^="page-"]').forEach(el => el.style.display = 'none');
  const target = document.getElementById('page-' + page);
  if (target) target.style.display = 'block';

  currentPage = page;

  // Закрываем мобильное меню
  document.getElementById('mainNav').classList.remove('active');

  // Рендерим контент в зависимости от страницы
  if (page === 'menu') renderMenuFilter('all');
  if (page === 'promo') renderPromo();
  if (page === 'home') renderPopular();
  if (page === 'reviews') renderReviews();
};

/** Рендер популярных товаров (главная) */
function renderPopular() {
  const popular = products.filter(p => p.id <= 4);
  renderProductCards(popularGrid, popular);
}

/** Рендер меню с фильтром */
function renderMenuFilter(filter) {
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  renderProductCards(menuGrid, filtered);
}

/** Рендер акций */
function renderPromo() {
  const promo = products.filter(p => p.category === 'promo');
  renderProductCards(promoGrid, promo);
}

/** Рендер отзывов */
function renderReviews() {
  const reviews = [
    { name: 'Анна', rating: 5, text: 'Очень вкусно! Быстрая доставка, горячая пицца.', date: '12.02.2026' },
    { name: 'Дмитрий', rating: 4, text: 'Роллы свежие, но немного подождал доставку.', date: '10.02.2026' },
    { name: 'Екатерина', rating: 5, text: 'Лучшие суши в Твери! Заказываю уже третий раз.', date: '05.02.2026' },
  ];

  document.getElementById('reviewsContainer').innerHTML = reviews.map(r => `
    <div style="background:#fff; border-radius:28px; padding:20px; box-shadow:0 4px 16px rgba(0,0,0,0.04);">
      <div style="font-weight:600;">${r.name}</div>
      <div style="color:#d32f2f;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <p style="margin:10px 0;">${r.text}</p>
      <div style="color:#999;font-size:0.8rem;">${r.date}</div>
    </div>
  `).join('');
}

// ===== СОБЫТИЯ =====

/** Клик по вкладкам фильтра */
filterTabs.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    filterTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderMenuFilter(e.target.dataset.filter);
  }
});

/** Открытие корзины */
document.getElementById('cartIcon').addEventListener('click', () => {
  renderCartModal();
  cartModal.style.display = 'flex';
});

/** Закрытие корзины */
document.getElementById('closeCartBtn').addEventListener('click', () => {
  cartModal.style.display = 'none';
});

/** Закрытие корзины по клику на фон */
cartModal.addEventListener('click', (e) => {
  if (e.target === cartModal) cartModal.style.display = 'none';
});

/** Очистка корзины */
document.getElementById('clearCartBtn').addEventListener('click', () => {
  cart = [];
  renderCartModal();
  renderCartCount();
  showToast('Корзина очищена');
});

/** Переход к оформлению заказа */
document.getElementById('checkoutBtn').addEventListener('click', () => {
  const total = getTotal();
  if (total < 1000) {
    showToast('Минимальная сумма заказа 1000 ₽');
    return;
  }
  cartModal.style.display = 'none';
  document.getElementById('orderFormContainer').style.display = 'block';
  document.getElementById('page-home').style.display = 'none';
});

/** Переключение полей доставки */
document.getElementById('orderDeliveryType').addEventListener('change', function() {
  document.getElementById('deliveryFields').style.display = this.value === 'delivery' ? 'grid' : 'none';
});

/** Оформление заказа (отправка) */
document.getElementById('submitOrderBtn').addEventListener('click', () => {
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();

  if (!name || !phone) {
    showToast('Заполните имя и телефон');
    return;
  }

  const total = getTotal();
  if (total < 1000) {
    showToast('Минимальная сумма заказа 1000 ₽');
    return;
  }

  // ===== ЗАГЛУШКА: здесь будет отправка на email =====
  // В будущем: fetch('/api/order', { method: 'POST', body: JSON.stringify({ ... }) })

  showToast('Спасибо за заказ! Мы скоро свяжемся с вами для подтверждения.');

  // Очищаем корзину и форму
  cart = [];
  renderCartCount();
  document.getElementById('orderFormContainer').style.display = 'none';
  navigateTo('home');
});

/** Мобильное меню */
document.getElementById('mobileToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('active');
});

/** Профиль: сохранение в localStorage */
document.getElementById('profileIcon').addEventListener('click', () => {
  const saved = JSON.parse(localStorage.getItem('tokyoUser')) || { name: '', phone: '' };
  const name = prompt('Ваше имя (сохраняется)', saved.name);
  if (name !== null) saved.name = name;
  const phone = prompt('Телефон', saved.phone);
  if (phone !== null) saved.phone = phone;
  localStorage.setItem('tokyoUser', JSON.stringify(saved));
  showToast('Данные профиля сохранены');
});

/** Навигация по ссылкам в шапке и футере */
document.querySelectorAll('nav a, .footer-links a').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const page = a.dataset.page;
    if (page) navigateTo(page);
  });
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
renderPopular();
renderCartCount();
navigateTo('home');