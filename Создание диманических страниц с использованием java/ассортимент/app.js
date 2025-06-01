// app.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

// Настройки
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Данные
const cars = JSON.parse(fs.readFileSync("./data/cars.json", "utf-8"));

// Главная страница
app.get("/", (req, res) => {
  const brand = req.query.brand || null;
  const page = parseInt(req.query.page) || 1;
  const perPage = 16;

  let filteredCars = cars;
  if (brand) {
    filteredCars = cars.filter((car) => car.brand.toLowerCase() === brand.toLowerCase());
  }

  const totalPages = Math.ceil(filteredCars.length / perPage);
  const paginatedCars = filteredCars.slice((page - 1) * perPage, page * perPage);

  res.render("index", {
    cars: paginatedCars,
    page,
    totalPages,
    brand,
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

/*
├── public/
│   ├── images/
│   │   ├── s5.jpg
│   │   ├── skoda.jpg
│   │   └── lada.jpg
│   └── styles.css
├── views/
│   ├── index.ejs
│   └── partials/
│       ├── header.ejs
│       └── footer.ejs
├── data/
│   └── cars.json
*/
