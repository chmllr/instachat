'use strict';

let room = location.search.slice(1)
let proto, host, socket, message, history, userName, password;
var lastSpeaker;

let init = () => {
    message = document.getElementById('message')
    history = document.getElementById('history')
    userName = localStorage.getItem('instachat/username')
    if (!userName) {
        userName = prompt("Enter your username:").split(":")
        localStorage.setItem('instachat/username', userName)
    }
    if (!password) {
        password = prompt("Enter the room password:")
        while (password.length < 8) password += password;
    }
    if (location.hostname == 'localhost') {
        proto = 'ws'
        host = 'localhost'
    } else {
        proto = 'wss'
        host = 'notehub.org'
    }
    socket = new WebSocket(proto + '://' + host + ':8080/' + room, 'protocolOne');
    socket.onmessage = event => displayBubble(event.data);
}

let trySend = event => {
    if (event.keyCode != 13) return
    let encryptedMsg = enc(userName + ":" + message.value, password)
    socket.send(JSON.stringify(encryptedMsg))
    message.value = null
}

let displayBubble = cipher => {
    let message = dec(JSON.parse(cipher), password)
    let [user] = message.split(":", 1);
    let text = message.slice(message.indexOf(":")+1)
    let textClassName = user == userName ? 'myBubble' : 'bubble'
    let userClassName = user == userName ? 'myUserName' : 'userName'
    if (lastSpeaker != user) {
        history.innerHTML += `<div class="${userClassName}">${user}</div>`
        lastSpeaker = user;
    }
    history.innerHTML += `<div class=${textClassName}>${text}</div>`
    history.scrollTop = history.scrollHeight
}