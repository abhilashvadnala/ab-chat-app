const users = []

const addUser = ({id, username, room}) => {

    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'username and room are required'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error: 'A user with this username already exists'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if(index !=-1)
        return users.splice(index, 1)[0]
    return new Error(`No user with ${id}`)
}

const getUser = (id) => {
    const foundUser = users.find(user => user.id === id)
    if(foundUser){
        return foundUser
    }
    return 'No user with that id'
}

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room
    })
    return usersInRoom
}

module.exports = ({
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
})