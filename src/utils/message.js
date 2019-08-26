const generateMessage = (username, text) => {
    return {
        text: text,
        createdBy: username,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return {
        url,
        createdBy: username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}