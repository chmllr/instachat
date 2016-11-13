'use strict';

let room = 'test'
let host = 'localhost:12345'
let socket = new WebSocket('ws://' + host + '/' + room, 'protocolOne');

socket.onmessage = event => {
    let msg = event.data
    console.log("message received", msg)
    displayBubble(msg)
}

let message, history, userName;

let init = () => {
    message = document.getElementById('message')
    history = document.getElementById('history')
    userName = localStorage.getItem('instachat/username')
    if (!userName) {
        userName = prompt("Enter your username:").split(":")
        localStorage.setItem('instachat/username', userName)
    }
}

let trySend = event => {
    if (event.keyCode != 13) return
    socket.send(userName + ":" + message.value)
    message.value = null
}

let displayBubble = message => {
    let [user] = message.split(":", 1);
    let text = message.slice(message.indexOf(":")+1)
    let className = user == userName ? 'myBubble' : 'bubble'
    history.innerHTML += `<div class=${className}><div class="userName">${user}</div>${text}</div>`
    history.scrollTop = history.scrollHeight
}