package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

const (
	username = "jaennil"
	password = "naen"
	hostname = "127.0.0.1:3306"
	dbname   = "course2"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/pdk", handlePdk)
	log.Println("starting server at 127.0.0.1:8080")

	db, err := sql.Open("mysql", dsn())
	handleError(err, "error occured while connecting to database:")
	defer db.Close()

	ctx, cancelfunc := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelfunc()

	err = db.PingContext(ctx)
	handleError(err, "Errors %s pinging DB")

	rows, err := db.QueryContext(ctx, "SELECT Location FROM pollution")
	handleError(err, "error occured while quering pollution table")
	defer rows.Close()
	log.Printf("Connected to DB %s successfully\n", dbname)

	for rows.Next() {
		var location string
		err := rows.Scan(&location)
		handleError(err, "error while scanning rows")
		log.Println(location)
	}

	http.ListenAndServe("127.0.0.1:8080", mux)
}

func handleError(err error, message string) {
	if err != nil {
		log.Println(message, err)
	}
}

func handlePdk(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello world"))
}

func dsn() string {
	return fmt.Sprintf("%s:%s@tcp(%s)/%s", username, password, hostname, dbname)
}
