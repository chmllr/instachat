package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"golang.org/x/net/websocket"
)

const maxHistoryLength = 1000

type room struct {
	History [][]byte
	Sockets []*websocket.Conn
	Mutex   sync.Mutex
}

var rooms map[string]*room
var mutex sync.Mutex

func messageHandler(roomName string) func(ws *websocket.Conn) {
	return func(ws *websocket.Conn) {
		ws.PayloadType = websocket.BinaryFrame
		var r *room
		mutex.Lock()
		if r = rooms[roomName]; r == nil {
			r = &room{}
			rooms[roomName] = r
		}
		mutex.Unlock()
		r.Mutex.Lock()
		r.Sockets = append(r.Sockets, ws)
		r.Mutex.Unlock()
		time.Sleep(1 * time.Second)
		for _, msg := range r.History {
			ws.Write(msg)
		}
		for {
			msg := make([]byte, 512)
			bs, err := ws.Read(msg)
			if err == nil {
				log(roomName, bs, "bytes received")
			} else {
				log(roomName, "closing connection:", err)
				ws.Close()
				return
			}
			effMsg := msg[0:bs]
			r.Mutex.Lock()
			msgs := r.History
			msgs = append(msgs, effMsg)
			for len(msgs) > maxHistoryLength {
				msgs = msgs[1:]
			}
			r.History = msgs
			log(roomName, "history length:", len(msgs))
			for _, s := range r.Sockets {
				s.Write(effMsg)
			}
			r.Mutex.Unlock()
		}
	}
}

func route(w http.ResponseWriter, r *http.Request) {
	room := r.URL.Path
	log(room, "new guest")
	websocket.Handler(messageHandler(room)).ServeHTTP(w, r)
}

func main() {
	rooms = make(map[string]*room)
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
