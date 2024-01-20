package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

type Response struct {
	Id    int
	Avg   float64
	Pdkss float64
}

type jaennilPoint struct {
	Lat    float64
	Lng    float64
	Avg    float64
	Period string
}

func main() {
	router := gin.New()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://dubrovskih.ru"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))
	router.GET("/api/v1/pdk", handlePdk)
	router.GET("/api/v1/pdk/:latlng", pdkByCoords)
	envAddress := os.Getenv("address")
	if envAddress == "" {
		envAddress = "127.0.0.1"
	}
	serverAddress := envAddress + ":3000"
	log.Println("starting server at", serverAddress)

	var err error
	db, err = sql.Open("mysql", dsn())
	handleError(err, "error occured while connecting to database:")
	defer db.Close()

	err = db.Ping()
	handleError(err, "Errors %s pinging DB")
	log.Printf("Connected to DB %s successfully\n", dbname)

	httpServer := &http.Server{
		Addr:           serverAddress,
		Handler:        router,
		MaxHeaderBytes: 1 << 20, // 1 MB
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
	}

	httpServer.ListenAndServe()
}

func handleError(err error, message string) {
	if err != nil {
		log.Println(message, err)
	}
}

func pdkByCoords(c *gin.Context) {
	latlong := c.Param("latlng")
	log.Println("latlong", latlong)
	splittedLatlong := strings.Split(latlong, ",")
	targetlat, err := strconv.ParseFloat(splittedLatlong[0], 32)
	handleError(err, "error occured while converting target lat from string to float")
	targetlng, err := strconv.ParseFloat(splittedLatlong[1], 32)
	handleError(err, "error occured while converting target lng from string to float")
	targetCoords := geo.NewPoint(targetlat, targetlng)

	var minpdk, minpdkss float64
	var minid int
	minDistance := float64(^uint(0) >> 1) // Set initial minimum distance to maximum float64 value

	rows, err := db.Query("SELECT ID, latitude, longitude, MonthlyAverage, MonthlyAveragePDKss FROM pollution WHERE latitude IS NOT NULL")
	handleError(err, "error occured while quering pollution table")
	defer rows.Close()

	var latitude, longitude, currentpdk, pdkss float64
	var id int
	for rows.Next() {
		err := rows.Scan(&id, &latitude, &longitude, &currentpdk, &pdkss)
		handleError(err, "error while scanning rows")
		coords := geo.NewPoint(latitude, longitude)
		distance := targetCoords.GreatCircleDistance(coords)

		if distance < minDistance {
			minDistance = distance
			minpdk = currentpdk
			minpdkss = pdkss
			minid = id
		}
	}
	log.Println(minid, minpdkss, minpdk)

	myResponse := Response{Id: minid, Avg: minpdk, Pdkss: minpdkss}
	c.JSON(http.StatusOK, myResponse)
}

func handlePdk(c *gin.Context) {
	log.Println("multiple poinths")
	var result []jaennilPoint
	rows, err := db.Query("SELECT latitude, longitude, MonthlyAverage, Period FROM pollution WHERE latitude IS NOT NULL")
	handleError(err, "error occured while quering pollution table")
	defer rows.Close()

	var latitude, longitude, avg float64
	var period string
	for rows.Next() {
		err := rows.Scan(&latitude, &longitude, &avg, &period)
		handleError(err, "error while scanning rows")
		result = append(result, jaennilPoint{Lat: latitude, Lng: longitude, Avg: avg, Period: period})
	}
	c.JSON(http.StatusOK, result)
}

func searchByAdmArea(c *gin.Context) {
	log.Println("search by adm area")
	var result []jaennilPoint
	rows, err := db.Query("SELECT , longitude, MonthlyAverage, Period FROM pollution WHERE latitude IS NOT NULL")
	handleError(err, "error occured while quering pollution table")
	defer rows.Close()

	var latitude, longitude, avg float64
	var period string
	for rows.Next() {
		err := rows.Scan(&latitude, &longitude, &avg, &period)
		handleError(err, "error while scanning rows")
		result = append(result, jaennilPoint{Lat: latitude, Lng: longitude, Avg: avg, Period: period})
	}
	c.JSON(http.StatusOK, result)
}

func dsn() string {
	return fmt.Sprintf("%s:%s@tcp(%s)/%s", username, password, hostname, dbname)
}
