package main

import (
	// "database/sql"
	// "errors"
	// "fmt"
	"io"
	"log"
	"net/http"
	"strings"

	// "github.com/codingsince1985/geo-golang/yandex"
	_ "github.com/go-sql-driver/mysql"
)

const (
	dbUser     = "your_db_user"
	dbPassword = "your_db_password"
	dbName     = "your_db_name"
)

type Point struct {
	lat float64
	lng float64
}

func geocodeAddress(address string) (*Point, error) {
	// geocoder := yandex.Geocoder("97f976c6-cd44-4f4d-a00e-42ff12b8f747")
	// location, err := geocoder.Geocode(address)
	// if err != nil {
	// 	log.Println("error occured while geocoding address:", err)
	// 	return nil, err
	// }
	// if location == nil {
	// 	fmt.Println("got <nil> location")
	// 	return nil, errors.New("got <nil> location")
	// }
	//
	// fmt.Printf("%s location is (%.6f, %.6f)\n", address, location.Lat, location.Lng)
	// return &Point{lat: location.Lat, lng: location.Lng}, nil
	address = strings.Replace(address, " ", "+", -1)
	url := "https://geocode-maps.yandex.ru/1.x/?apikey=97f976c6-cd44-4f4d-a00e-42ff12b8f747&geocode=" + address
	log.Println("url", url)
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Println("error occured while creating new request:", err)
		return nil, err
	}
	req.Header.Add("Referer", "127.0.0.1")
	resp, err := client.Do(req)
	if err != nil {
		log.Println("error occured while client.Do geocode url:", err)
		return nil, err
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalln(err)
		return nil, err
	}
	//Convert the body to type string
	sb := string(body)
	log.Printf(sb)
	return &Point{}, nil
}

// func updateCoordinates(db *sql.DB) error {
// 	rows, err := db.Query("SELECT id, address FROM addresses")
// 	if err != nil {
// 		return err
// 	}
// 	defer rows.Close()
//
// 	// Prepare a statement for updating coordinates
// 	updateStmt, err := db.Prepare("UPDATE addresses SET latitude=?, longitude=? WHERE id=?")
// 	if err != nil {
// 		return err
// 	}
// 	defer updateStmt.Close()
//
// 	// Loop through each row in the result set
// 	for rows.Next() {
// 		var id int
// 		var address string
//
// 		err := rows.Scan(&id, &address)
// 		if err != nil {
// 			log.Println("Error scanning row:", err)
// 			continue
// 		}
//
// 		// Geocode the address to get its coordinates
// 		coordinates, err := geocodeAddress(address)
// 		if err != nil {
// 			log.Println("Error geocoding address:", err)
// 			continue
// 		}
//
// 		// Update the database with the obtained coordinates
// 		_, err = updateStmt.Exec(coordinates.Lat(), coordinates.Lng(), id)
// 		if err != nil {
// 			log.Println("Error updating coordinates:", err)
// 			continue
// 		}
// 	}
//
// 	return nil
// }

func main() {
	// // Connect to the database
	// db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(127.0.0.1:3306)/%s", dbUser, dbPassword, dbName))
	// if err != nil {
	// 	log.Fatal("Error connecting to the database:", err)
	// }
	// defer db.Close()
	//
	// // Update coordinates in the database
	// err = updateCoordinates(db)
	// if err != nil {
	// 	log.Fatal("Error updating coordinates:", err)
	// }

	log.Println(geocodeAddress("бул Мухаммед Бин Рашид, дом 1"))
}
