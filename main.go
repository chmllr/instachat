package main

import (
	"fmt"
	"net/http"
	"time"

	"golang.org/x/net/websocket"
)

const maxHistoryLength = 1000

var history map[string][][]byte
var sockets map[string][]*websocket.Conn

func messageHandler(room string) func(ws *websocket.Conn) {
	return func(ws *websocket.Conn) {
		msgs := history[room]
		sockets[room] = append(sockets[room], ws)
		time.Sleep(1 * time.Second)
		for _, msg := range msgs {
			log(room, "history message:", string(msg))
			ws.Write(msg)
		}
		for {
			msg := make([]byte, 512)
			if bytes, err := ws.Read(msg); err == nil {
				log(room, bytes, "bytes received")
			} else {
				log(room, "closing connection:", err)
				ws.Close()
				return
			}
			log(room, "new message:", string(msg))

			msgs = append(msgs, msg)
			for len(msgs) > maxHistoryLength {
				msgs = msgs[1:]
			}
			log(room, "history length:", len(msgs))
			history[room] = msgs
			for _, s := range sockets[room] {
				s.Write(msg)
			}
		}
	}
}

func route(w http.ResponseWriter, r *http.Request) {
	room := r.URL.Path
	log(room, "new guest")
	websocket.Handler(messageHandler(room)).ServeHTTP(w, r)
}

func main() {
	history = make(map[string][][]byte)
	sockets = make(map[string][]*websocket.Conn)
	http.HandleFunc("/", route)
	if err := http.ListenAndServe(":12345", nil); err != nil {
		panic("ListenAndServe: " + err.Error())
	}
}

func log(tag string, args ...interface{}) {
	fmt.Print(time.Now().Format(time.Stamp), ": ", tag, ": ")
	fmt.Println(args...)
}
