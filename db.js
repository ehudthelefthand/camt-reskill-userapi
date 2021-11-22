const mongoose = require('mongoose')

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
    } catch (e) {
        return e
    }
}

const disconnect = async () => {
    try {
        await mongoose.disconnect()
    } catch (e) {
        return e
    }
}

module.exports = {
    connect,
    disconnect
}