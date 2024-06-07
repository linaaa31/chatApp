const path = require('path')
const fs = require("fs")
const jwt = require("jsonwebtoken")
const { hashPass, comparePass } = require("../utils/bcrypt")
const url = require('url')
const uuid = require("uuid")

const usersFilePath = path.join(__dirname, "../../public/users.json")

require("dotenv").config()
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const signUp = (req, res) => {
  const username = req.body.username
  const password = req.body.password

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      const statusMessage = `Internal server error: ${err}`
      const status = "fail"
      return res.status(500).redirect(url.format({
        pathname: "/",
        query: {
          "message": statusMessage,
          "status": status
        }
      }))
    }

    let users = []
    if (data) {
      try {
        users = JSON.parse(data)
      } catch (parseError) {
        const statusMessage = `Internal server error: ${parseError}`
        const status = "fail"
        return res.status(500).redirect(url.format({
          pathname: "/",
          query: {
            "message": statusMessage,
            "status": status
          }
        }))
      }

      const existingUser = users.find((user) => user.username === username)

      if (existingUser) {
        const statusMessage = "Username already exists"
        const status = "fail"
        return res.status(400).redirect(url.format({
          pathname: "/sign_up.html",
          query: {
            "message": statusMessage,
            "status": status
          }
        }))
      }
    }

    hashPass(password).then((bcryptedPassword) => {
      const token = jwt.sign({ username }, JWT_SECRET_KEY)
      const id = uuid.v4()
      const newUser = { id, username, password: bcryptedPassword, token }
      users.push(newUser)

      fs.writeFile(usersFilePath, JSON.stringify(users), "utf8", (writeErr) => {
        if (writeErr) {
          console.error("Error writing users file:", writeErr)
          const statusMessage = "Internal server error"
          const status = "fail"
          return res.status(500).redirect(url.format({
            pathname: "/",
            query: {
              "message": successMessage,
              "status": status
            }
          }))
        }
        const statusMessage = "User registered successfully"
        const status = "success"
        res.status(201).redirect(url.format({
          pathname: "/",
          query: {
            "message": statusMessage,
            "status": status
          }
        }))
      })
    })
  })
}


const signIn = (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const room = req.body.room

  fs.readFile(usersFilePath, "utf8", (err, data) => {
    if (err) {
      const statusMessage = `Internal server error: ${err}`
      const status = "fail"
      return res.status(500).redirect(url.format({
        pathname: "/",
        query: {
          "message": statusMessage,
          "status": status
        }
      }))
    }

    let users = []
    if (data) {
      try {
        users = JSON.parse(data)
      } catch (parseError) {
        const statusMessage = `Internal server error: ${parseError}`
        const status = "fail"
        return res.status(500).redirect(url.format({
          pathname: "/",
          query: {
            "message": statusMessage,
            "status": status
          }
        }))
      }

      const existingUser = users.find((user) => user.username === username)

      if (!existingUser) {
        const statusMessage = "Wrong username"
        const status = "fail"
        return res.status(404).redirect(url.format({
          pathname: "/",
          query: {
            "message": statusMessage,
            "status": status
          }
        }))
      }

      comparePass(password, existingUser.password).then((match) => {
        const token = jwt.sign({ username, room }, JWT_SECRET_KEY)
        if (match) {
          const statusMessage = "Success sign in"
          const status = "success"

          return res.status(400).redirect(url.format({
            pathname: "/chat.html",
            query: {
              "username": username,
              "room": room,
              "token": token
            }
          }))
        }

        const statusMessage = "Some of your creditals are wrong"
        const status = "fail"
        return res.status(400).redirect(url.format({
          pathname: "/",
          query: {
            "message": statusMessage,
            "status": status
          }
        }))
      }).catch((err) => {
        if (err) {
          const statusMessage = `Internal server error: ${err}`
          const status = "fail"

          return res.status(500).redirect(url.format({
            pathname: "/",
            query: {
              "message": statusMessage,
              "status": status
            }
          }))
        }

      })
    }
  })
}
module.exports = { signUp, signIn }