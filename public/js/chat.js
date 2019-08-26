const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.getElementById('send-location')
const $messages = document.querySelector('#messages')
const $sideBar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoScroll = () => {
    //new msg ele
    const $newMessage = $messages.lastElementChild

    //height of new msg
    const newMsgStyles = getComputedStyle($newMessage)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMessage.offsetHeight + newMsgMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far I've scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMsgHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdBy: message.createdBy,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (obj) => {
    const html = Mustache.render(locationTemplate,{
        url: obj.url,
        createdBy: obj.createdBy,
        createdAt: moment(obj.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', (obj) => {
    console.log(obj.roomMembers)
    const html = Mustache.render(sideBarTemplate, {
        roomName: obj.room,
        users: obj.roomMembers
    })
    $sideBar.innerHTML = html
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()
    $messageForm.setAttribute('disabled', 'diabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        $messageForm.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert("Your browser doesn't support Geolocation API")
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        },() => {
            console.log('Location shared')
        })
        $locationButton.removeAttribute('disabled')
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})