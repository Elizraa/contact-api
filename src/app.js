require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ClientError = require('./Commons/exceptions/ClientError');

const app = express()
const port = process.env.PORT
console.log(port)

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const contactAPI = require("./routes/contact/contact.js")

app.use('/contact', contactAPI)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})