const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();
const emailRoutes = require('./routes/email')
const usersRouter = require('./routes/users');

const uri = `${process.env.MONGO_URI}`;
const port = (process.env.PORT || 3001);
mongoose.connect(uri, {  useNewUrlParser: true })
    .then(() => {
        const app = express();
        app.use(cors());
        app.use(express.json());
        app.use('/api', router);
        app.options('*', cors());
        app.get('/info', async (req, res) => {
            res.send({ name: 'Portfolio API', version: '0.0.1 BETA' });
        });
        const server = app.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`Server has started on ${port}!`);
        });
        router.use('/email', emailRoutes);
        router.use('/users', usersRouter);
    })