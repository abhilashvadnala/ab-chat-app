const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const pubDirPath = path.join(__dirname,'../public')
app.use(express.static(pubDirPath))

io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
        const {error,user} = addUser({id: socket.id, ...options})

        if(error){
            callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Host', 'Welcome!'))

        socket.broadcast.to(user.room).emit('message', generateMessage('Host',`${user.username} joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            roomMembers: getUsersInRoom(user.room)
        })

        callback()

    })
    socket.on('sendMessage', (message,callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback('Message Delivered!')
    })

    socket.on('sendLocation', (coords,cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Host',`${user.username} has left!`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                roomMembers: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is Up on ${port}`)
})