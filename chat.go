package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"golang.org/x/net/websocket"
)

const maxHistoryLength = 1000

var history map[string][][]byte
var historyLock = &sync.Mutex{}
var sockets map[string][]*websocket.Conn

func messageHandler(room string) func(ws *websocket.Conn) {
	return func(ws *websocket.Conn) {
		ws.PayloadType = websocket.BinaryFrame
		sockets[room] = append(sockets[room], ws)
		time.Sleep(1 * time.Second)
		for _, msg := range history[room] {
			ws.Write(msg)
		}
		for {
			msg := make([]byte, 512)
			bs, err := ws.Read(msg)
			if err == nil {
				log(room, bs, "bytes received")
			} else {
				log(room, "closing connection:", err)
				ws.Close()
				return
			}
			effMsg := msg[0:bs]
			historyLock.Lock()
			msgs := history[room]
			msgs = append(msgs, effMsg)
			for len(msgs) > maxHistoryLength {
				msgs = msgs[1:]
			}
			history[room] = msgs
			historyLock.Unlock()
			log(room, "history length:", len(msgs))
			for _, s := range sockets[room] {
				s.Write(effMsg)
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
	log("server", "started...")
	http.HandleFunc("/", route)
	if err := http.ListenAndServe(":8000", nil); err != nil {
		panic("ListenAndServe: " + err.Error())
	}
}

func log(tag string, args ...interface{}) {
	fmt.Print(time.Now().Format(time.Stamp), ": ", tag, ": ")
	fmt.Println(args...)
}
