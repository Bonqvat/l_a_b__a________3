// app.js - общие функции для всех страниц
const cart = {
    items: JSON.parse(localStorage.getItem('cart')) || [],
    
    addItem(item) {
        this.items.push(item);
        this.save();
    },
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },
    
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    },
    
    getCount() {
        return this.items.length;
    }
};

const favorites = {
    items: JSON.parse(localStorage.getItem('favorites')) || [],
    
    addItem(item) {
        if (!this.items.some(fav => fav.id === item.id)) {
            this.items.push(item);
            this.save();
        }
    },
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.save();
    },
    
    save() {
        localStorage.setItem('favorites', JSON.stringify(this.items));
    },
    
    getCount() {
        return this.items.length;
    }
};

function updateCartCounter() {
    const counter = document.querySelector('.cart-counter');
    if (counter) {
        counter.textContent = cart.getCount();
    }
}

function updateFavoritesCounter() {
    const counter = document.querySelector('.favorites-counter');
    if (counter) {
        counter.textContent = favorites.getCount();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
    updateFavoritesCounter();
});