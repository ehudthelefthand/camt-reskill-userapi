const { verifyToken } = require('../token')
const User = require('../models/user')

const jwtKey = process.env.JWT_KEY

module.exports = async (req, res, next) => {
    const token = req.headers['authorization'].slice('Bearer '.length)

    let data
    try {
        data = verifyToken(jwtKey, token)
    } catch (e) {
        console.log(e)
        res.sendStatus(401)
        return
    }
    
    if (!data) {
        res.sendStatus(401)
        return
    }

    if (data.type !== 'access') {
        res.sendStatus(401)
        return
    }
    try {
        const user = await User.findOne({ _id: data._id }).exec()
        req.User = user
        next()
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
}