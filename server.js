const express = require('express')
const dotenv = require('dotenv')

// Load env vars
dotenv.config({path:'./config/config.env'})

const app = express()

app.get('/', (req, res) => {
    // res.status(200).json({success: true, data:{id: 1}})
    res.send('<h1>hello from express</h1>')
})

const PORT=process.env.PORT
app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT))