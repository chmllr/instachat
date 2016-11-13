var socket1 = new WebSocket("ws://localhost:12345/test-room", "protocolOne");
socket1.onmessage = event => console.log("room to guest 1:", event.data);
socket1.send("anybody here?")

var socket2 = new WebSocket("ws://localhost:12345/test-room", "protocolOne");
socket2.onmessage = event => console.log("room to guest 2:", event.data);
socket2.send("hey ho")

var socket3 = new WebSocket("ws://localhost:12345/test-room", "protocolOne");
socket3.onmessage = event => console.log("room to guest 3:", event.data);
socket3.send("hi guys")

socket2.send("I leave")
socket2.close()