import { carsData, modelsData } from '../data/cars-data.js';

// Текущая страница и количество элементов на странице
let currentPage = 1;
const itemsPerPage = 8;

function initCatalogPage() {
  loadCars(carsData);
  updateFilterOptions(carsData);
  initPriceSlider();
  updatePagination();
  updateHeaderCounters();
  applyUrlFilters();
  
  // Обработчики событий для фильтров
  document.getElementById('filterToggle').addEventListener('click', function(e) {
    e.stopPropagation();
    const panel = document.getElementById('filtersPanel');
    panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
  });
  
  // Закрытие фильтров при клике вне их
  document.addEventListener('click', function(e) {
    const panel = document.getElementById('filtersPanel');
    const button = document.getElementById('filterToggle');
    
    if (!panel.contains(e.target) && !button.contains(e.target)) {
      panel.style.display = 'none';
    }
  });
  
  // Обработчик поиска
  document.getElementById('search').addEventListener('input', function() {
    showSuggestions(this.value);
  });
  
  // Обработчик кнопки поиска
  document.getElementById('searchButton').addEventListener('click', performSearch);
  
  // Обработчики для слайдера цен
  document.getElementById('priceSlider').addEventListener('input', updatePriceInputs);
  document.getElementById('minPrice').addEventListener('change', updatePriceSlider);
  document.getElementById('maxPrice').addEventListener('change', filterCars);
  
  // Обработчики для сброса фильтров
  document.getElementById('resetFilters').addEventListener('click', function() {
    document.getElementById('brandSelect').value = '';
    document.getElementById('modelSelect').innerHTML = '<option value="" selected>Сначала выберите марку</option>';
    document.getElementById('modelSelect').disabled = true;
    document.getElementById('yearSelect').value = '';
    document.getElementById('bodyTypeSelect').value = '';
    document.getElementById('driveTypeSelect').value = '';
    document.getElementById('powerSelect').value = '';
    resetPriceFilter();
    document.getElementById('search').value = '';
    filterCars();
  });
}

// Загрузка автомобилей при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  loadCars(carsData);
  updateFilterOptions(carsData);
  initPriceSlider();
  updatePagination();
  updateHeaderCounters();
  applyUrlFilters();
});

// Инициализация слайдера цен
function initPriceSlider() {
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  const priceSlider = document.getElementById('priceSlider');
  
  // Установка минимального и максимального значений
  const min = 0;
  const max = 10000000;
  
  minPrice.min = min;
  minPrice.max = max;
  maxPrice.min = min;
  maxPrice.max = max;
  
  priceSlider.min = min;
  priceSlider.max = max;
}

// Обновление полей ввода при изменении слайдера
function updatePriceInputs() {
  const priceSlider = document.getElementById('priceSlider');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  
  minPrice.value = priceSlider.value;
  maxPrice.value = priceSlider.max;
  filterCars();
}

// Обновление слайдера при изменении полей ввода
function updatePriceSlider() {
  const minPrice = document.getElementById('minPrice');
  const priceSlider = document.getElementById('priceSlider');
  
  priceSlider.value = minPrice.value;
  filterCars();
}

// Функция загрузки автомобилей
function loadCars(cars) {
  const carGrid = document.getElementById('carGrid');
  carGrid.innerHTML = '';
  
  if (cars.length === 0) {
    carGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Автомобили по вашему запросу не найдены</p>';
    return;
  }
  
  // Пагинация
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCars = cars.slice(startIndex, startIndex + itemsPerPage);
  
  paginatedCars.forEach((car, index) => {
    const carCard = document.createElement('div');
    carCard.className = 'car-card';
    carCard.style.animationDelay = `${0.1 * index}s`;
    carCard.innerHTML = `
      <div class="car-status">${car.status}</div>
      <img src="${car.image}" alt="${car.brand} ${car.model}">
      <div class="car-info">
        <h3>${car.brand} ${car.model} ${car.year}</h3>
        <p>${car.description}</p>
        <div class="car-features">
          ${car.features.map(feature => `<span class="car-feature">${feature}</span>`).join('')}
        </div>
        <p class="car-price">${car.price.toLocaleString()} ₽</p>
      </div>
      <div class="card-buttons">
        <button class="favorite-btn">В избранное</button>
        <button class="cart-btn">В корзину</button>
        <button class="details-btn">Подробнее</button>
      </div>
    `;
    carCard.querySelector('.favorite-btn').addEventListener('click', () => addToFavorites(car.id));
    carCard.querySelector('.cart-btn').addEventListener('click', () => addToCart(car.id));
    carCard.querySelector('.details-btn').addEventListener('click', () => showCarDetails(car.id));
    
    carGrid.appendChild(carCard);
  });
  
  updatePagination();
}

// Добавление в избранное
function addToFavorites(carId) {
  const car = carsData.find(c => c.id === carId);
  if (car) {
    const state = JSON.parse(localStorage.getItem('futureAutoState')) || { cart: [], favorites: [] };
    
    if (!state.favorites.includes(carId)) {
      state.favorites.push(carId);
      localStorage.setItem('futureAutoState', JSON.stringify(state));
      
      // Анимация иконки
      const favIcon = document.getElementById('favorites-icon');
      favIcon.classList.add('bounce-animation');
      setTimeout(() => favIcon.classList.remove('bounce-animation'), 500);
      
      updateHeaderCounters();
      showNotification(`Автомобиль ${car.brand} ${car.model} добавлен в избранное!`);
    } else {
      showNotification(`Автомобиль ${car.brand} ${car.model} уже в избранном!`);
    }
  }
}

// Добавление в корзину
function addToCart(carId) {
  const car = carsData.find(c => c.id === carId);
  if (car) {
    const state = JSON.parse(localStorage.getItem('futureAutoState')) || { cart: [], favorites: [] };
    
    if (!state.cart.includes(carId)) {
      state.cart.push(carId);
      localStorage.setItem('futureAutoState', JSON.stringify(state));
      
      // Анимация иконки
      const cartIcon = document.getElementById('cart-icon');
      cartIcon.classList.add('bounce-animation');
      setTimeout(() => cartIcon.classList.remove('bounce-animation'), 500);
      
      updateHeaderCounters();
      showNotification(`Автомобиль ${car.brand} ${car.model} добавлен в корзину!`);
    } else {
      showNotification(`Автомобиль ${car.brand} ${car.model} уже в корзине!`);
    }
  }
}

// ОБНОВЛЕННАЯ ФУНКЦИЯ ДЛЯ ПЕРЕХОДА НА СТРАНИЦУ АВТОМОБИЛЯ
function showCarDetails(carId) {
  // Сохраняем ID автомобиля в localStorage
  const state = JSON.parse(localStorage.getItem('futureAutoState')) || {};
  state.currentCarId = carId;
  localStorage.setItem('futureAutoState', JSON.stringify(state));
  
  // Переходим на страницу автомобиля
  window.location.href = '#car-page';
}

// Функция для обновления доступных опций в селектах
function updateFilterOptions(filteredCars) {
  // Обновляем модели
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const selectedBrand = brandSelect.value.toLowerCase();
  
  if (selectedBrand) {
    modelSelect.innerHTML = '<option value="" selected>Выберите модель</option>';
    modelsData[selectedBrand].forEach(model => {
      const option = document.createElement('option');
      option.value = model.name.toLowerCase();
      option.textContent = model.name;
      option.dataset.image = model.image;
      modelSelect.appendChild(option);
    });
  }
  
  // Обновляем годы выпуска
  const yearSelect = document.getElementById('yearSelect');
  const availableYears = [...new Set(filteredCars.map(car => car.year))].sort((a, b) => b - a);
  yearSelect.innerHTML = '<option value="" selected>Любой</option>';
  availableYears.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
  
  // Обновляем типы привода
  const driveSelect = document.getElementById('driveTypeSelect');
  const availableDrives = [...new Set(filteredCars.map(car => car.drive))];
  driveSelect.innerHTML = '<option value="" selected>Любой</option>';
  availableDrives.forEach(drive => {
    const option = document.createElement('option');
    option.value = drive;
    option.textContent = 
      drive === 'front' ? 'Передний' : 
      drive === 'rear' ? 'Задний' : 'Полный';
    driveSelect.appendChild(option);
  });
  
  // Обновляем диапазон мощностей (теперь статический, так как диапазон расширен)
  const powerSelect = document.getElementById('powerSelect');
  powerSelect.innerHTML = `
    <option value="" selected>Любая</option>
    <option value="50">До 50</option>
    <option value="100">50-100</option>
    <option value="150">100-150</option>
    <option value="200">150-200</option>
    <option value="300">200-300</option>
    <option value="500">300-500</option>
    <option value="750">500-750</option>
    <option value="1000">750-1000</option>
    <option value="1001">1000+</option>
  `;
  
  // Обновляем ценовой диапазон
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const priceSlider = document.getElementById('priceSlider');
  const minPrice = Math.min(...filteredCars.map(car => car.price));
  const maxPrice = Math.max(...filteredCars.map(car => car.price));
  
  minPriceInput.min = minPrice;
  minPriceInput.placeholder = `от ${minPrice.toLocaleString()}`;
  maxPriceInput.placeholder = `до ${maxPrice.toLocaleString()}`;
  priceSlider.min = minPrice;
  priceSlider.max = maxPrice;
}

// Автодополнение поиска
const carData = ["Toyota Camry", "Audi A6", "Skoda Superb", "BMW X5", "Toyota RAV4", "Audi Q5", "BMW 3 Series", "Skoda Octavia"];

function showSuggestions(value) {
  const suggestions = document.getElementById('suggestions');
  suggestions.innerHTML = '';
  if (!value) return;
  
  const filteredSuggestions = carData.filter(car => 
    car.toLowerCase().includes(value.toLowerCase())
  );
  
  filteredSuggestions.forEach(suggestion => {
    const suggestionDiv = document.createElement('div');
    suggestionDiv.textContent = suggestion;
    suggestionDiv.onclick = function() {
      document.getElementById('search').value = suggestion;
      suggestions.innerHTML = '';
      filterCars();
    };
    suggestions.appendChild(suggestionDiv);
  });
}

// Управление фильтрами
document.getElementById('filterToggle').addEventListener('click', function(e) {
  e.stopPropagation();
  const panel = document.getElementById('filtersPanel');
  panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
});

// Закрытие фильтров при клике вне их
document.addEventListener('click', function(e) {
  const panel = document.getElementById('filtersPanel');
  const button = document.getElementById('filterToggle');
  
  if (!panel.contains(e.target) && !button.contains(e.target)) {
    panel.style.display = 'none';
  }
});

// Обновление моделей при выборе марки
function updateModels() {
  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const selectedBrand = brandSelect.value.toLowerCase();
  
  modelSelect.innerHTML = '<option value="" selected>Выберите модель</option>';
  modelSelect.disabled = !selectedBrand;
  
  if (selectedBrand) {
    modelsData[selectedBrand].forEach(model => {
      const option = document.createElement('option');
      option.value = model.name.toLowerCase();
      option.textContent = model.name;
      option.dataset.image = model.image;
      modelSelect.appendChild(option);
    });
  }
  
  filterCars();
}

// Фильтрация по типу кузова с обновлением других параметров
function filterByBodyType() {
  const bodyTypeSelect = document.getElementById('bodyTypeSelect');
  const bodyType = bodyTypeSelect.value;
  
  let filteredCars = carsData;
  if (bodyType) {
    filteredCars = carsData.filter(car => car.bodyType === bodyType);
  }
  
  // Обновляем доступные опции в других фильтрах
  updateFilterOptions(filteredCars);
  
  // Применяем фильтрацию
  filterCars();
}
    
// Основная функция фильтрации
function filterCars() {
  const brand = document.getElementById('brandSelect').value.toLowerCase();
  const model = document.getElementById('modelSelect').value;
  const year = document.getElementById('yearSelect').value;
  const bodyType = document.getElementById('bodyTypeSelect').value;
  const driveType = document.getElementById('driveTypeSelect').value;
  const power = document.getElementById('powerSelect').value;
  const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;
  const searchText = document.getElementById('search').value.toLowerCase();
  
  const filteredCars = carsData.filter(car => {
    // Фильтрация по марке
    if (brand && car.brand.toLowerCase() !== brand) return false;
    
    // Фильтрация по модели
    if (model && car.model.toLowerCase() !== model) return false;
    
    // Фильтрация по году
    if (year && car.year !== parseInt(year)) return false;
    
    // Фильтрация по типу кузова
    if (bodyType && car.bodyType !== bodyType) return false;
    
    // Фильтрация по приводу
    if (driveType && car.drive !== driveType) return false;
    
    // Фильтрация по мощности (обновленная логика для расширенного диапазона)
    if (power) {
      const powerValue = parseInt(power);
      if (powerValue === 50 && car.power > 50) return false;
      if (powerValue === 100 && (car.power <= 50 || car.power > 100)) return false;
      if (powerValue === 150 && (car.power <= 100 || car.power > 150)) return false;
      if (powerValue === 200 && (car.power <= 150 || car.power > 200)) return false;
      if (powerValue === 300 && (car.power <= 200 || car.power > 300)) return false;
      if (powerValue === 500 && (car.power <= 300 || car.power > 500)) return false;
      if (powerValue === 750 && (car.power <= 500 || car.power > 750)) return false;
      if (powerValue === 1000 && (car.power <= 750 || car.power > 1000)) return false;
      if (powerValue === 1001 && car.power <= 1000) return false;
    }
    
    // Фильтрация по цене
    if (car.price < minPrice || car.price > maxPrice) return false;
    
    // Фильтрация по поисковому запросу
    if (searchText) {
      const carName = `${car.brand} ${car.model}`.toLowerCase();
      if (!carName.includes(searchText)) return false;
    }
    
    return true;
  });
  
  currentPage = 1; // Сбрасываем на первую страницу при фильтрации
  loadCars(filteredCars);
}
    
// Применение фильтров
function applyFilters() {
  filterCars();
  document.getElementById('filtersPanel').style.display = 'none';
}

// Функция поиска
function performSearch() {
  filterCars();
}

// Сброс фильтра
function resetFilter(filterId) {
  const element = document.getElementById(filterId);
  if (element.tagName === 'SELECT') {
    element.value = '';
  }
  filterCars();
  
  // Если сбрасываем марку, нужно также сбросить модели
  if (filterId === 'brandSelect') {
    const modelSelect = document.getElementById('modelSelect');
    modelSelect.innerHTML = '<option value="" selected>Сначала выберите марку</option>';
    modelSelect.disabled = true;
  }
}

// Сброс ценового фильтра
function resetPriceFilter() {
  document.getElementById('minPrice').value = '300000';
  document.getElementById('maxPrice').value = '10000000';
  document.getElementById('priceSlider').value = '300000';
  filterCars();
}

// Пагинация
function changePage(page) {
  if (page === -1 && currentPage > 1) {
    currentPage--;
  } else if (page === 1 && currentPage < Math.ceil(carsData.length / itemsPerPage)) {
    currentPage++;
  } else if (page > 0) {
    currentPage = page;
  }
  
  loadCars(carsData);
}

function updatePagination() {
  const pagination = document.getElementById('pagination');
  const totalPages = Math.ceil(carsData.length / itemsPerPage);
  
  // Очищаем кнопки пагинации, кроме первой и последней
  while (pagination.children.length > 2) {
    pagination.removeChild(pagination.children[1]);
  }
  
  // Добавляем кнопки страниц
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.onclick = function() { changePage(i); };
    if (i === currentPage) {
      button.classList.add('active-page');
    }
    pagination.insertBefore(button, pagination.lastElementChild);
  }
  
  // Обновляем состояние кнопок "Предыдущие" и "Следующие"
  const prevButton = pagination.firstElementChild;
  const nextButton = pagination.lastElementChild;
  
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Применение фильтров из URL
function applyUrlFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Бренд
  const urlBrand = urlParams.get('brand');
  if (urlBrand) {
    document.getElementById('brandSelect').value = urlBrand.toLowerCase();
    updateModels();
  }
  
  // Модель
  const urlModel = urlParams.get('model');
  if (urlModel) {
    // Ждем обновления списка моделей
    setTimeout(() => {
      document.getElementById('modelSelect').value = urlModel.toLowerCase();
    }, 100);
  }
  
  // Максимальная цена
  const urlPrice = urlParams.get('maxPrice');
  if (urlPrice) {
    document.getElementById('maxPrice').value = urlPrice;
  }
  
  // Тип кузова
  const urlBodyType = urlParams.get('bodyType');
  if (urlBodyType) {
    document.getElementById('bodyTypeSelect').value = urlBodyType;
  }
  
  // Применяем фильтры
  setTimeout(() => filterCars(), 200);
}

function getBodyType(type) {
const types = {
  'sedan': 'Седан',
  'hatchback': 'Хэтчбэк',
  'suv': 'Кроссовер',
  'crossover': 'Внедорожник',
  'coupe': 'Купе'
};
return types[type] || type;
}

function getDriveType(type) {
  const types = {
    'front': 'Передний',
    'rear': 'Задний',
    'full': 'Полный'
  };
  return types[type] || type;
}

// Генерация характеристик для автомобиля
function generateCarDetails(car) {
  // Генерация объема двигателя на основе мощности
  const engineVolume = (car.power / 90).toFixed(1) + ' л';
  
  // Генерация разгона 0-100 км/ч
  const acceleration = (10 - car.power / 50).toFixed(1) + ' с';
  
  // Генерация расхода топлива
  const fuelConsumption = (car.power / 35).toFixed(1) + ' л / 100 км';
  
  // Определение страны производителя
  const countryMap = {
    'Toyota': 'Япония',
    'Audi': 'Германия',
    'BMW': 'Германия',
    'Skoda': 'Чехия'
  };
  const country = countryMap[car.brand] || 'Китай';
  
  // Определение количества дверей
  const doors = car.bodyType === 'sedan' ? '4' : '5';
  
  return {
    engineVolume,
    acceleration,
    fuelConsumption,
    country,
    doors,
    torque: (car.power * 1.7).toFixed(0) + ' Нм'
  };
}

document.addEventListener('DOMContentLoaded', function() {
  // Загрузка данных автомобиля
  const state = JSON.parse(localStorage.getItem('futureAutoState'));
  const carId = state?.currentCarId;
  
  if (carId) {
    const car = carsData.find(c => c.id === carId);
    
    if (car) {
      renderCar(car);
    } else {
      showError('Автомобиль не найден');
    }
  } else {
    showError('Не выбран автомобиль для просмотра');
  }

  // Обработчики форм
  document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Ваш заказ успешно оформлен! С вами свяжется менеджер для подтверждения.');
    closeModal('orderModal');
  });

  document.getElementById('testDriveForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Вы успешно записаны на тест-драйв! С вами свяжется менеджер для подтверждения.');
    closeModal('testDriveModal');
  });
});

function showError(message) {
  const container = document.querySelector('.container');
  container.innerHTML = `<div class="error">${message}</div>`;
}

// Функция отображения данных автомобиля
function renderCar(car) {
  // Генерация дополнительных характеристик
  const details = generateCarDetails(car);
  
  // Обновляем данные на странице
  document.getElementById('car-title').textContent = `${car.brand} ${car.model}`;
  document.getElementById('car-price').textContent = `${car.price.toLocaleString('ru-RU')}₽`;
  document.getElementById('car-description').textContent = car.description;
  
  // Устанавливаем изображение автомобиля (с заглушкой при ошибке)
  const img = document.getElementById('mainImage');
  img.src = car.image;
  img.alt = `${car.brand} ${car.model}`;
  img.onerror = function() {
    // Если изображение не загрузилось, используем заглушку
    const carIndex = car.id % 8; // Получаем число от 0 до 7
    this.src = `images/image${carIndex}.png`;
  };
  
  // Обновляем характеристики
  document.getElementById('specs-main').innerHTML = `
    <tr><td>Мощность двигателя</td><td>${car.power} л.с.</td></tr>
    <tr><td>Объем двигателя</td><td>${details.engineVolume}</td></tr>
    <tr><td>Разгон 0-100 км/ч</td><td>${details.acceleration}</td></tr>
    <tr><td>Расход топлива</td><td>${details.fuelConsumption}</td></tr>
    <tr><td>Привод</td><td>${getDriveType(car.drive)}</td></tr>
  `;
  
  document.getElementById('specs-engine').innerHTML = `
    <tr><td>Рабочий объем</td><td>${details.engineVolume}</td></tr>
    <tr><td>Тип двигателя</td><td>Бензиновый</td></tr>
    <tr><td>Конфигурация</td><td>Рядный</td></tr>
    <tr><td>Обороты макс.</td><td>6500 об/мин</td></tr>
    <tr><td>Крутящий момент</td><td>${details.torque}</td></tr>
  `;
  
  document.getElementById('specs-general').innerHTML = `
    <tr><td>Страна</td><td>${details.country}</td></tr>
    <tr><td>Год</td><td>${car.year}</td></tr>
    <tr><td>Кузов</td><td>${getBodyType(car.bodyType)}</td></tr>
    <tr><td>Комплектация</td><td>Flagship Sport</td></tr>
    <tr><td>Количество дверей</td><td>${details.doors}</td></tr>
  `;
}

// Функция смены цвета автомобиля
function changeColor(color, imageUrl) {
  document.getElementById('mainImage').src = imageUrl;
  
  // Обновление активного цвета
  const colors = document.querySelectorAll('.color');
  colors.forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
}

function showOrderModal() {
  document.getElementById('orderModal').style.display = 'block';
}

function showTestDriveModal() {
  document.getElementById('testDriveModal').style.display = 'block';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};

window.initCatalogPage = initCatalogPage;