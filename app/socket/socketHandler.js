const socket = require("socket.io")
const jwt = require("jsonwebtoken")
const formatMessage = require("../utils/messages")
const { userJoin, userLeave, getRoomUsers } = require("../utils/users")

require("dotenv").config()
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const initilizeSocket = (server) => {
  const io = socket(server)

  io.on("connection", (socket) => {
    socket.on("joinRoom", (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY)
        const { username, room } = decoded;

        const user = userJoin(socket.id, username, room)
        socket.join(room)

        socket.emit("message", formatMessage("Chat", `Welcome, ${username}!`))
        socket.broadcast.emit("message", formatMessage("Chat", `User ${username} has just joined!`))

        io.to(user.room).emit("usersInRoom", { room: user.room, usersList: getRoomUsers(user.room) })
      }
      catch (error) {
        console.log(error);
      }


    })

    socket.on("chatMsg", (data) => {
      const { messageText, token } = data;
      try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY)
        const { username, room } = decoded
        io.to(room).emit("message", formatMessage(username, messageText))
      } catch (error) {
        console.error(error);
      }
    })

    socket.on("disconnect", () => {
      const user = userLeave(socket.id)
      if (user) {
        io.to(user.room).emit("message", formatMessage("Chat", `${user.username} has just left the chat`))
        io.to(user.room).emit("usersInRoom", { room: user.room, usersList: getRoomUsers(user.room) })
      }
    })
  })
}


module.exports = initilizeSocket