let room = 'test'
let host = 'localhost:12345'
let socket = new WebSocket('ws://' + host + '/' + room, 'protocolOne');

socket.onmessage = event => {
    let msg = event.data;
    console.log("message received", msg)
    history.innerHTML += msg + '<br/>'
    history.scrollTop = history.scrollHeight;
}

let message, history;

let init = () => {
    message = document.getElementById('message')
    history = document.getElementById('history')
}

let trySend = event => {
    if (event.keyCode != 13) return;
    socket.send(message.value);
    message.value = null;
}
