all:
	http-server &
	ngrok tcp 8080 &

tsc:
	tsc map.ts
