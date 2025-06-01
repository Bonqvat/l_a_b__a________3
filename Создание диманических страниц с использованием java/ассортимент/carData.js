// Массив данных автомобилей
const carData = [
  { brand: "Toyota", model: "Camry", year: 2024, bodyType: "sedan", driveType: "front", price: 25000 },
  { brand: "Audi", model: "A6", year: 2023, bodyType: "sedan", driveType: "all", price: 45000 },
  { brand: "Skoda", model: "Superb", year: 2024, bodyType: "sedan", driveType: "front", price: 30000 },
  { brand: "BMW", model: "X5", year: 2025, bodyType: "crossover", driveType: "all", price: 60000 },
  { brand: "Mercedes", model: "C-Class", year: 2023, bodyType: "sedan", driveType: "rear", price: 50000 },
];

// Текущая страница и количество элементов на странице
let currentPage = 1;
const itemsPerPage = 8;

// Функция для отображения автомобилей
function renderCars(cars) {
  const carGrid = document.getElementById("car-grid");
  carGrid.innerHTML = "";
  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "car-card";
    card.innerHTML = `
      <img src="https://via.placeholder.com/220x140.png?text=${car.brand}+${car.model}" alt="${car.brand} ${car.model}">
      <div class="car-info">
        <h3>${car.brand} ${car.model} (${car.year})</h3>
        <p>Тип кузова: ${car.bodyType}</p>
        <p>Привод: ${car.driveType}</p>
        <p>Цена: $${car.price}</p>
      </div>
      <div class="card-buttons">
        <button>Записаться на тест-драйв</button>
        <button>Получить предложение</button>
      </div>
    `;
    carGrid.appendChild(card);
  });
}

// Функция для фильтрации автомобилей
function filterCars() {
  const searchValue = document.getElementById("search").value.toLowerCase();
  const brandFilter = document.getElementById("brand-filter").value.toLowerCase();
  const modelFilter = document.getElementById("model-filter").value.toLowerCase();
  const yearFilter = parseInt(document.getElementById("year-filter").value);
  const bodyTypeFilter = document.getElementById("body-type-filter").value.toLowerCase();
  const driveTypeFilter = document.getElementById("drive-type-filter").value.toLowerCase();
  const priceMin = parseInt(document.getElementById("price-min").value);
  const priceMax = parseInt(document.getElementById("price-max").value);

  const filteredCars = carData.filter(car => {
    return (
      (car.brand.toLowerCase().includes(searchValue) || car.model.toLowerCase().includes(searchValue)) &&
      (brandFilter === "" || car.brand.toLowerCase() === brandFilter) &&
      (modelFilter === "" || car.model.toLowerCase() === modelFilter) &&
      (yearFilter === null || car.year === yearFilter) &&
      (bodyTypeFilter === "" || car.bodyType.toLowerCase() === bodyTypeFilter) &&
      (driveTypeFilter === "" || car.driveType.toLowerCase() === driveTypeFilter) &&
      (!isNaN(priceMin) ? car.price >= priceMin : true) &&
      (!isNaN(priceMax) ? car.price <= priceMax : true)
    );
  });

  // Обновление страницы
  currentPage = 1;
  updatePagination(filteredCars);
}

// Функция для обновления пагинации
function updatePagination(cars) {
  const totalPages = Math.ceil(cars.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedCars = cars.slice(start, end);

  renderCars(paginatedCars);
  document.getElementById("page-number").textContent = currentPage;

  if (currentPage === 1) {
    document.querySelector(".pagination button:first-child").disabled = true;
  } else {
    document.querySelector(".pagination button:first-child").disabled = false;
  }

  if (currentPage === totalPages) {
    document.querySelector(".pagination button:last-child").disabled = true;
  } else {
    document.querySelector(".pagination button:last-child").disabled = false;
  }
}

// Функция для изменения страницы
function changePage(direction) {
  currentPage += direction;
  if (currentPage < 1) currentPage = 1;
  filterCars();
}

// Инициализация
filterCars();