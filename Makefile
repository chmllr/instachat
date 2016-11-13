push:
	git push origin
	git push prod

run:
	go run chat.go

rerun:
	killall chat
	make run
