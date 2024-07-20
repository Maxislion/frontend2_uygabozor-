const sheetId = '1sodiFGkqHyvauYriiKElW_f1gecn9kQjayQCTOioTY4'; // ID вашего Google Sheets
const apiKey = 'AIzaSyAZzFim9R5HRDS9ITXTPxIqSG71miGskpk'; // Ваш API-ключ
const sheets = ['Свежие продукты', 'Бакалея', 'Орехи-Сухофрукты', 'Салаты', 'Яйца', 'Мясо', 'Крупы', 'Кисло-молочное', 'Специи', 'Хлеб и пекарня']; // Замените на ваши листы

let allData = []; // Хранить все данные для поиска
let cart = []; // Хранить товары в корзине

// Функция для получения данных из определенного листа
async function getSheetData(sheetName) {
    const sheetRange = `${sheetName}!A1:G`; // Замените на ваш диапазон данных
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.values;
}

// Функция для создания таблицы на веб-странице
function createTable(data, sheetName) {
    const container = document.getElementById('tables-container');
    container.innerHTML = ''; // Очистить контейнер перед добавлением новой таблицы

    const table = document.createElement('table');
    table.className = 'data-table';

    const caption = document.createElement('caption');
    caption.textContent = sheetName;
    table.appendChild(caption);

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.slice(1).forEach(row => {
        const tableRow = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tableRow.appendChild(td);
        });
        // Добавить кнопку "Добавить в корзину" в конце каждой строки
        const addToCartButton = document.createElement('button');
        addToCartButton.className = 'add-to-cart';
        addToCartButton.textContent = 'Добавить в корзину';
        addToCartButton.onclick = () => addToCart(row);
        const td = document.createElement('td');
        td.appendChild(addToCartButton);
        tableRow.appendChild(td);
        
        tbody.appendChild(tableRow);
    });
    table.appendChild(tbody);

    container.appendChild(table);
}

// Функция для добавления товара в корзину
function addToCart(item) {
    cart.push(item);
    updateCart();
}

// Функция для обновления корзины
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item[0]} - ${item[1]} сум`;
        total += parseInt(item[1]);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Удалить';
        removeButton.onclick = () => removeFromCart(index);
        listItem.appendChild(removeButton);

        cartItems.appendChild(listItem);
    });

    document.getElementById('cart-total').textContent = `Итого: ${total} сум`;
}

// Функция для удаления товара из корзины
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Функция для фильтрации таблицы
function filterTable(query) {
    const filteredData = allData.filter((row, index) => {
        if (index === 0) return true; // Оставить заголовок
        return row.some(cell => cell.toString().toLowerCase().includes(query.toLowerCase()));
    });
    createTable(filteredData, "Результаты поиска");
}

// Функция для загрузки всех данных
async function loadAllData() {
    let data = [];
    for (const sheet of sheets) {
        const sheetData = await getSheetData(sheet);
        if (data.length === 0) {
            data = sheetData; // Инициализация с заголовками
        } else {
            data = data.concat(sheetData.slice(1)); // Добавить без заголовков
        }
    }
    allData = data;
    createTable(allData, "Все продукты");
}

// Функция для создания ссылок на листы
function createSheetLinks() {
    const linksContainer = document.getElementById('sheet-links');
    sheets.forEach(sheetName => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = sheetName;
        link.onclick = async (e) => {
            e.preventDefault();
            try {
                const data = await getSheetData(sheetName);
                createTable(data, sheetName);
            } catch (error) {
                console.error('Error fetching or displaying data:', error);
            }
        };
        linksContainer.appendChild(link);
    });
}

// Добавление обработчика события для поиска
document.getElementById('search-input').addEventListener('input', (e) => {
    filterTable(e.target.value);
});

createSheetLinks();
loadAllData(); // Загрузить все данные при инициализации
