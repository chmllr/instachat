push:
	git push origin
	git push prod

web:
	http-server . -p 8080

server:
	go run chat.go
