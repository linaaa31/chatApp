const express = require("express")
const path = require('path')
const http = require('http')
const bodyParser = require("body-parser")
const authRoutes = require("./app/routes/authRoutes")
const initilizeSocket = require("./app/socket/socketHandler")
require("dotenv").config()

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, "public")))
app.use("/", authRoutes)

const server = http.createServer(app)

initilizeSocket(server)

const PORT = 3000

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})