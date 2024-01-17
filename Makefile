all:
	http-server &
	ngrok tcp 8080 &
