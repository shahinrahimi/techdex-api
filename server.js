require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()
const path =  require('path')
const mongoose = require('mongoose')

const connectDB = require('./config/dbConn')
const corsOptions = require('./config/corsOptions')

const cookieParser = require('cookie-parser')
const cors = require('cors')

const errorHandler = require('./middleware/errorHandler')
const { logger, logEvent } = require('./middleware/logger')

const PORT = process.env.PORT || 3505

console.log(`Node: ${process.env.NODE_ENV}`)

connectDB()

// middleware
app.use(logger)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))

app.use("/", require('./routes/root'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
// app.use('/notes', require('./routes/noteRoutes'))




app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

mongoose.connection.once('open', ()=>{
  console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    // logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
