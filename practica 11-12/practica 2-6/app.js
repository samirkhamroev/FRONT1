const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const ACCESS_SECRET = 'shady_secret_2026';
const REFRESH_SECRET = 'shady_refresh_2026';

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
// Обслуживание статических файлов (изображений)
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// --- Настройка хранилища для Multer ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../client/public/images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

let products = [
    { id: "1", title: "Kamikaze Red Vinyl", category: "Music", description: "Ограниченное издание.", price: 38, stock: 25, image: "http://localhost:5173/images/Kamikaze%20Red%20Vinyl.webp" },
    { id: "2", title: "Slim Shady LP", category: "Music", description: "Классический альбом.", price: 30, stock: 15, image: "http://localhost:5173/images/Marshall%20Mathers%20LP%20Vinyl.webp" }
];

let users = [];
const refreshTokens = new Set();

// --- Аутентификация ---
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Пользователь уже существует' });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), username, passwordHash, role: role || 'user' };
    users.push(newUser);
    res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const accessToken = jwt.sign({ sub: user.id, username: user.username, role: user.role }, ACCESS_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role } });
});

// --- Middleware (Прослойки) ---
const auth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Токен отсутствует' });
    try { req.user = jwt.verify(token, ACCESS_SECRET); next(); }
    catch (e) { res.status(401).json({ error: 'Невалидный токен' }); }
};

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Доступ запрещен' });
    next();
};

// --- Загрузка файлов ---
app.post('/api/upload', auth, checkRole(['seller', 'admin']), upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    const imageUrl = `http://localhost:5173/images/${req.file.filename}`;
    res.json({ imageUrl });
});

// --- Маршруты товаров ---
app.get('/api/products', (req, res) => res.json(products));
app.post('/api/products', auth, checkRole(['seller', 'admin']), (req, res) => {
    const p = { id: Date.now().toString(), ...req.body };
    products.push(p);
    res.status(201).json(p);
});
app.delete('/api/products/:id', auth, checkRole(['admin']), (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

// --- Управление пользователями ---
app.get('/api/users', auth, checkRole(['admin']), (req, res) => res.json(users));
app.delete('/api/users/:id', auth, checkRole(['admin']), (req, res) => {
    users = users.filter(u => u.id !== req.params.id);
    res.status(204).send();
});

app.listen(port, () => console.log(`Сервер запущен на http://localhost:${port}`));
