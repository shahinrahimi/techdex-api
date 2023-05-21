require('dotenv').config()

const express = require('express')
const app = express()
const path =  require('path')
const mongoose = require('mongoose')

const connectDB = require('./config/dbConn')

const PORT = process.env.PORT || 3505

console.log(`Node: ${process.env.NODE_ENV}`)

connectDB()

mongoose.connection.once('open', ()=>{
  console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    // logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
