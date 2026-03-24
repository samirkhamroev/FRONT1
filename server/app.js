const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Данные магазина мерча Эминема
let products = [
    {
        id: "1",
        name: "Slim Shady LP Anniversary T-Shirt",
        category: "Clothing",
        description: "Official limited edition 25th anniversary SSLP tee.",
        price: 35,
        stock: 50,
        image: "http://localhost:5173/images/Slim%20Shady%20LP%20Anniversary%20T-Shirt.webp"
    },
    {
        id: "2",
        name: "Marshall Mathers LP Vinyl",
        category: "Music",
        description: "Classic double vinyl edition of MMLP.",
        price: 45,
        stock: 20,
        image: "http://localhost:5173/images/Marshall%20Mathers%20LP%20Vinyl.webp"
    },
    {
        id: "3",
        name: "Eminem Logo Snapback",
        category: "Accessories",
        description: "Black snapback with embroidered 'E' logo.",
        price: 30,
        stock: 15,
        image: "http://localhost:5173/images/Eminem%20Logo%20Snapback.webp"
    },
    {
        id: "4",
        name: "The Death of Slim Shady (Coup de Grâce) CD",
        category: "Music",
        description: "Newest studio album on physical CD.",
        price: 15,
        stock: 100,
        image: "http://localhost:5173/images/The%20Death%20of%20Slim%20Shady%20(Coup%20de%20Gr%C3%A2ce)%20CD.webp"
    },
    {
        id: "5",
        name: "The Eminem Show - Expanded Edition Vinyl",
        category: "Music",
        description: "Deluxe 4LP set featuring bonus tracks.",
        price: 90,
        stock: 10,
        image: "http://localhost:5173/images/The%20Eminem%20Show%20-%20Expanded%20Edition%20Vinyl.jpg"
    },
    {
        id: "6",
        name: "Shady Records Grey Hoodie",
        category: "Clothing",
        description: "Classic grey hoodie with Shady Records logo.",
        price: 65,
        stock: 30,
        image: "http://localhost:5173/images/Shady%20Records%20Grey%20Hoodie.jpg"
    },
    {
        id: "7",
        name: "Recovery Anniversary T-Shirt",
        category: "Clothing",
        description: "Black tee celebrating the Recovery era.",
        price: 35,
        stock: 45,
        image: "http://localhost:5173/images/Recovery%20Anniversary%20T-Shirt.webp"
    },
    {
        id: "8",
        name: "Curtain Call 2 - 2CD Set",
        category: "Music",
        description: "Greatest hits collection on 2 discs.",
        price: 20,
        stock: 60,
        image: "http://localhost:5173/images/Curtain%20Call%202%20-%202CD%20Set.webp"
    },
    {
        id: "9",
        name: "Kamikaze Red Vinyl",
        category: "Music",
        description: "Limited edition translucent red vinyl.",
        price: 38,
        stock: 25,
        image: "http://localhost:5173/images/Kamikaze%20Red%20Vinyl.webp"
    },
    {
        id: "10",
        name: "Slim Shady Beanie",
        category: "Accessories",
        description: "Knitted beanie with SSLP logo embroidery.",
        price: 25,
        stock: 40,
        image: "http://localhost:5173/images/Slim%20Shady%20Beanie.webp"
    },
    {
        id: "11",
        name: "Relapse: Refill CD",
        category: "Music",
        description: "The complete Relapse experience with extra tracks.",
        price: 18,
        stock: 55,
        image: "http://localhost:5173/images/Relapse%20Refill%20CD.webp"
    }
];

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Eminem Store API',
            version: '1.0.0',
            description: 'API for Managing Eminem Brand Store Merch',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./app.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: number
 *         image:
 *           type: string
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns the list of all products
 *     responses:
 *       200:
 *         description: The list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data
 *       404:
 *         description: Product not found
 */
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 */
app.post('/api/products', (req, res) => {
    const newProduct = {
        id: nanoid(6),
        ...req.body
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index !== -1) {
        products[index] = { ...products[index], ...req.body };
        res.json(products[index]);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
app.delete('/api/products/:id', (req, res) => {
    const initialLength = products.length;
    products = products.filter(p => p.id !== req.params.id);
    if (products.length < initialLength) {
        res.json({ message: "Product deleted" });
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

/**
 * @swagger
 * /api/exchange:
 *   get:
 *     summary: Get current exchange rate (USD to RUB)
 *     responses:
 *       200:
 *         description: Exchange rate data
 */
app.get('/api/exchange', async (req, res) => {
    try {
        // Задание 3: Работа с внешним API
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        res.json({ rate: response.data.rates.RUB });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch exchange rate" });
    }
});

app.listen(port, () => {
    console.log(`Eminem Store API running at http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
