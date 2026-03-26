const axios = require('axios');

const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'seller', password: 'seller123', role: 'seller' },
    { username: 'user', password: 'user123', role: 'user' }
];

async function createUsers() {
    for (const user of users) {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', user);
            console.log(`Пользователь ${user.username} создан:`, response.data);
        } catch (error) {
            console.error(`Ошибка при создании ${user.username}:`, error.response?.data || error.message);
        }
    }
}

createUsers();
