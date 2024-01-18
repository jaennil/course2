package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/kellydunn/golang-geo"
)

const (
	username = "jaennil"
	password = "naen"
	hostname = "127.0.0.1:3306"
	dbname   = "course2"
)

var db *sql.DB

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/pdk/", handlePdk)

	serverAddress := "127.0.0.1:8082"
	log.Println("starting server at", serverAddress)

	var err error
	db, err = sql.Open("mysql", dsn())
	handleError(err, "error occured while connecting to database:")
	defer db.Close()

	err = db.Ping()
	handleError(err, "Errors %s pinging DB")
	log.Printf("Connected to DB %s successfully\n", dbname)

	http.ListenAndServe(serverAddress, mux)
}

func handleError(err error, message string) {
	if err != nil {
		log.Println(message, err)
	}
}

func handlePdk(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)

	log.Println(db)

	url := r.URL.Path
	log.Println(url)
	splitted := strings.Split(url, "/")
	if len(splitted) == 3 {

	}
	latlong := splitted[len(splitted)-1]
	splittedLatlong := strings.Split(latlong, ",")
	targetlat, err := strconv.ParseFloat(splittedLatlong[0], 32)
	handleError(err, "error occured while converting target lat from string to float")
	targetlng, err := strconv.ParseFloat(splittedLatlong[1], 32)
	handleError(err, "error occured while converting target lng from string to float")
	targetCoords := geo.NewPoint(targetlat, targetlng)

	var minpdk float64
	minDistance := float64(^uint(0) >> 1) // Set initial minimum distance to maximum float64 value

	rows, err := db.Query("SELECT ID, latitude, longitude, MonthlyAverage FROM pollution WHERE latitude IS NOT NULL")
	handleError(err, "error occured while quering pollution table")
	defer rows.Close()

	var latitude, longitude, currentpdk float64
	var id int
	for rows.Next() {
		err := rows.Scan(&id, &latitude, &longitude, &currentpdk)
		handleError(err, "error while scanning rows")
		coords := geo.NewPoint(latitude, longitude)
		distance := targetCoords.GreatCircleDistance(coords)

		if distance < minDistance {
			minDistance = distance
			minpdk = currentpdk
		}
	}
	log.Println(minpdk)
}

func dsn() string {
	return fmt.Sprintf("%s:%s@tcp(%s)/%s", username, password, hostname, dbname)
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}
