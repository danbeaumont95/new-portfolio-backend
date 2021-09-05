const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const validator = require('validator');
const User = require('../models/User');
const Session = require('../models/Session');
require('dotenv').config();


const generateAccessToken = (user) => jwt.sign(
    {
        exp: Math.floor(Date.now() / 1000) + (6 * (60 * 60)),
        data: {
            id: user._id,
            username: user.username,
            email: user.email
        },
    },
    process.env.TOKEN_SECRET,
);

exports.refreshToken = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    try {
       const findSession = await Session.findOne({ sessionToken: token });
       if (findSession) {
           const user = await User.findById(findSession.userId);
           const newToken = generateAccessToken(user);
           await Session.findByIdAndDelete(findSession._id);
           return res.status(200).json({ newToken })
       }
       return res.status(500).json({ error: 'Cant_find' })
    } catch (ex) {
        res.status(401).json('Session Issue');
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('test', email, 'password', password);
    try {
        const user = await User.findOne({ email });
        if (!user) throw new Error('Username does not exist');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Password is incorrect');
        console.log('Got HEREEEEE')
        const token = generateAccessToken(user);
        console.log(token, 'token')
        const session = new Session({
            _id: mongoose.Types.ObjectId(),
            userId: user._id,
            sessionToken: token
        });
        await session.save();
        const userData = {
            user, session
        }
        return res
            .status(200)
            .json({ ...userData })
    } catch (error) {
        console.log(error);
        res.send({ error: `${error.message}` })
    }
};

const createUser = async (username, password, email, firstName = '', lastName = '', onMailingList) => {
    const dataObj = {
        info: {
            firstName,
            lastName
        }
    }
    try {
        const emailFound = await User.findOne({ email });
        if (emailFound) return new Error('Email already exists');
        const user = new User({
            _id: mongoose.Types.ObjectId(),
            username, 
            password: bcrypt.hashSync(password, 10),
            email,
            data: dataObj,
            onMailingList
        });
        await user.save();
        const msg = {
            to: email,
            from: 'danibeamo@hotmail.com',
            subject: 'Thanks for signing up to my website',
            html: `Hello from Dan!

            <br />You have successfully signed up to my website.
            <br />Please click "log in" and enter the following details
            <br />Username: ${email}
            <br />Password: ${password}
            <br />If you have any questions, please email danibeamo@hotmail.com
            <br />Thank you!`,
        };
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent')
            })
            .catch((error) => {
                console.error(error.reponse.body)
            });
            return user;
    } catch (ex) {
        console.log('ERROR', ex);
        return new Error(ex)
    }
};

exports.createUser = async (username, password, email, firstName = '', lastName = '', onMailingList) => createUser(username, password, email, firstName, lastName, onMailingList);

exports.register = async (req, res) => {
    const {
        username, password, email, firstName, lastName, onMailingList
    } = req.body;
    console.log(req.body);
    try {
        const userFound = await User.findOne({ email });
        if (userFound) return res.status(200).json({ error: 'User found', msg: 'This email already exists' });
        const user = await createUser(username, password, email, firstName, lastName, onMailingList);
        console.log('registered');
        const ourMessage = {
            to: 'danielbeaumont95@hotmail.co.uk',
            from: 'danibeamo@hotmail.com',
            subject: 'An account has been registered',
            html: `New user registered!
            <br />Company: ${username}
            <br />Email: ${email},`
        };
        sgMail
            .send(ourMessage)
            .then(() => {
                console.log('Email sent');
            })
            .catch((error) => {
                console.error(error.response.body);
            });
            return res.status(200).json({
                msg: `User ${email} from ${user} has successfully been registered \n`,
                user
            });
    } catch (error) {
        res.send({ error: `${error.message}` })
    }
}