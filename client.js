'use strict';

let room = location.search.slice(1)
let proto, host, socket, field, tableau, userName, password;
var lastSpeaker;

let init = () => {
    field = document.getElementById('field')
    tableau = document.getElementById('tableau')
    if (room == "") {
        field.style.display = "none"
        return
    } else tableau.innerHTML = null;
    userName = localStorage.getItem('instachat/username')
    if (!userName) {
        userName = prompt("Enter your username:").split(":")
        localStorage.setItem('instachat/username', userName)
    }
    if (!password) {
        password = prompt("Enter the room password:")
        while (password.length < 8) password += password;
    }
    host = (location.hostname == 'localhost') ? 'localhost' : location.hostname;
    socket = new WebSocket('ws://' + host + ':8000/' + room, 'protocolOne');
    socket.onmessage = event => displayBubble(event.data);
}

let trySend = event => {
    if (event.keyCode != 13) return
    let encryptedMsg = enc(userName + ":" + field.value, password)
    socket.send(JSON.stringify(encryptedMsg))
    field.value = null
}

let displayBubble = cipher => {
    let message = dec(JSON.parse(cipher), password)
    let [user] = message.split(":", 1);
    let text = message.slice(message.indexOf(":")+1)
    let textClassName = user == userName ? 'myBubble' : 'bubble'
    let userClassName = user == userName ? 'myUserName' : 'userName'
    if (lastSpeaker != user) {
        tableau.innerHTML += `<div class="${userClassName}">${user}</div>`
        lastSpeaker = user;
    }
    tableau.innerHTML += `<div class=${textClassName}>${text}</div>`
    tableau.scrollTop = tableau.scrollHeight
}

let openRoom = () => location.search = "?" + document.getElementById("room").value;