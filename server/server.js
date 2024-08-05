const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');
const readData = () => {
    try {
        const jsonData = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(jsonData);
    } catch (err) {
        console.error('Error reading or parsing db.json:', err);
        return null;
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('Error writing to db.json:', err);
    }
};

app.get('/users', (req, res) => {
    const data = readData();
    if (data) {
        res.json(data.users);
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});
app.get('/users/:id', (req, res) => {
    const data = readData();
    if (data) {
        const user = data.users.find(u => u.id === req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.get('/plants', (req, res) => {
    const data = readData();
    if (data) {
        res.json(data.plants);
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.get('/popular-plants', (req, res) => {
    const data = readData();
    if (data) {
        res.json(data['popular-plants']);
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.get('/new-arrivals', (req, res) => {
    const data = readData();
    if (data) {
        res.json(data['new-arrivals']);
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.get('/plants/:id', (req, res) => {
    const data = readData();
    if (data) {
        const plant = data.plants.find(p => p.id === req.params.id);
        if (plant) {
            res.json(plant);
        } else {
            res.status(404).json({ message: 'Plant not found' });
        }
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.get('/cart/:userId', (req, res) => {
    const data = readData();
    if (data && data.cart) {
        const userCart = data.cart.find(cart => cart.userId === req.params.userId);
        if (userCart) {
            res.json(userCart.items);
        } else {
            res.json([]);
        }
    } else {
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.post('/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    const item = req.body;

    const data = readData();
    if (!data) {
        return res.status(500).json({ message: 'Error reading data' });
    }

    if (!data.cart) {
        data.cart = [];
    }

    let userCart = data.cart.find(cart => cart.userId === userId);
    if (!userCart) {
        userCart = { userId, items: [] };
        data.cart.push(userCart);
    }
    userCart.items.push(item);

    writeData(data);
    res.status(201).json({ message: 'Item added to cart', item: newItem });
});

app.delete('/cart/:userId/:itemId', (req, res) => {
    const userId = req.params.userId;
    const itemId = req.params.itemId;

    const data = readData();
    if (!data || !data.cart) {
        return res.status(500).json({ message: 'Error reading data' });
    }

    const userCartIndex = data.cart.findIndex(cart => cart.userId === userId);
    if (userCartIndex === -1) {
        return res.status(404).json({ message: 'Cart not found' });
    }

    data.cart[userCartIndex].items = data.cart[userCartIndex].items.filter(item => item.id !== itemId);
    writeData(data);
    res.json({ message: 'Item removed from cart' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
