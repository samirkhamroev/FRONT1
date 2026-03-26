const axios = require('axios');

const sellers = [
    { username: 'seller2', password: 'seller123', role: 'seller' },
    { username: 'seller3', password: 'seller123', role: 'seller' },
    { username: 'seller4', password: 'seller123', role: 'seller' }
];

async function createSellers() {
    for (const seller of sellers) {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', seller);
            console.log(`Продавец ${seller.username} создан:`, response.data);
        } catch (error) {
            console.error(`Ошибка при создании ${seller.username}:`, error.response?.data || error.message);
        }
    }
}

createSellers();
