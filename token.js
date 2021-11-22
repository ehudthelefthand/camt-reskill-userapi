const jwt = require('jsonwebtoken')

const generateToken = (jwtKey, data, options) => {
    return jwt.sign(data, jwtKey, options)
}

const generateRefreshToken = (jwtKey, data) => {
    const fiveMins = 60 * 5
    return generateToken(jwtKey, { ...data, type: 'refresh' }, { expiresIn: fiveMins })
}

const generateAccessToken = (jwtKey, data) => {
    const twoMins = 60 * 2
    return generateToken(jwtKey, { ...data, type: 'access' }, { expiresIn: twoMins })
}

const verifyToken = (jwtKey, token) => {
    return jwt.verify(token, jwtKey)
}

module.exports = {
    generateRefreshToken,
    generateAccessToken,
    verifyToken,
}