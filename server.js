require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { TokenExpiredError } = require('jsonwebtoken')
const db = require('./db')
const User = require('./models/user')
const auth = require('./middlewares/auth')
const { 
    verifyToken,
    generateRefreshToken, 
    generateAccessToken 
} = require('./token')

const cost = 10
const dbHost = process.env.MONGO_URL
const port = process.env.PORT
const jwtKey = process.env.JWT_KEY

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => res.send('hello'))

app.post('/register', async (req, res) => {
    const { 
        firstname, 
        lastname, 
        username, 
        password 
    } = req.body

    try {
        const hash = await bcrypt.hash(password, cost)
        await User.create({
            firstname,
            lastname,
            username,
            password: hash,
        })
        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

app.post('/login', async (req, res) => {
    const {
        username,
        password
    } = req.body

    try {
        const user = await User.findOne({ username }).select('+password').exec()
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
            res.sendStatus(401)
            return
        }
        const refreshToken = generateRefreshToken(jwtKey, { _id: user._id })
        const accessToken = generateAccessToken(jwtKey, { _id: user._id })

        res.json({
            ...user.toJSON(),
            refresh: refreshToken,
            access: accessToken
        })
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

app.post('/refresh', async (req, res) => {
    const { refresh } = req.body
    console.log(req.body)
    console.log(refresh)
    
    try {
        const data = verifyToken(jwtKey, refresh)
        if (data.type !== 'refresh') {
            res.sendStatus(401)
            return
        }

        const user = await User.findOne({ _id: data._id }).exec()
        if (!user) {
            res.sendStatus(401)
            return
        }
        res.json({
            access: generateAccessToken(jwtKey, { _id: user._id })
        })
    } catch (e) {
        console.log(e)
        if (e instanceof TokenExpiredError) {
            res.sendStatus(401)
        } else {
            res.sendStatus(500)
        }
    }
})

app.get('/users', async (req, res) => {
    try {
        const users = await User.find().exec()
        res.json(users)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

app.get('/me', auth, async (req, res) => {
    try {
        res.json(req.User)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

app.post('/reset', async (req, res) => {
    for (let collectionName in mongoose.connection.collections) {
        mongoose.connection.collections[collectionName].drop(err => {
            console.log(err)
        })
    }
    res.sendStatus(200)
})


db.connect(dbHost).then(() => {
    app.listen(port, console.log(`server started at ${port}`))
})
