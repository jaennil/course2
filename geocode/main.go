package main

import (
	// "database/sql"
	// "errors"
	// "fmt"
	"encoding/json"
	"io"
	"log"
	"net/http"

	// "strings"

	"net/url"

	_ "github.com/go-sql-driver/mysql"
)

type TwoGisResponse struct {
	Meta struct {
		APIVersion string `json:"api_version"`
		Code       int    `json:"code"`
		IssueDate  string `json:"issue_date"`
	} `json:"meta"`
	Result struct {
		Items []struct {
			AddressName string `json:"address_name"`
			FullName    string `json:"full_name"`
			ID          string `json:"id"`
			Name        string `json:"name"`
			Point       struct {
				Lat float64 `json:"lat"`
				Lon float64 `json:"lon"`
			} `json:"point"`
			PurposeName string `json:"purpose_name"`
			Type        string `json:"type"`
		} `json:"items"`
		Total int `json:"total"`
	} `json:"result"`
}

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
	twogis_apikey := "20834bec-5f7b-40af-b623-9e4d1010a93e"
	url := "https://catalog.api.2gis.com/3.0/items/geocode?q=" + address + "&fields=items.point&key=" + twogis_apikey
	log.Println("url", url)
	resp, err := http.Get(url)
	if err != nil {
		log.Println("error occured while http.Get:", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	log.Println(string(body))

	var twoGisResponse TwoGisResponse
	if err := json.Unmarshal(body, &twoGisResponse); err != nil { // Parse []byte to go struct pointer
		log.Println("Can not unmarshal JSON")
	}
	log.Println(len(twoGisResponse.Result.Items))
	lat :=twoGisResponse.Result.Items[0].Point.Lat
	lng :=twoGisResponse.Result.Items[0].Point.Lon
	log.Println(twoGisResponse.Result.Items[0].Point.Lat)
	log.Println(twoGisResponse.Result.Items[0].Point.Lon)
	return &Point{lat: lat, lng: lng}, nil
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

	log.Println(geocodeAddress(url.QueryEscape("Российская Федерация, город Москва, внутригородская территория муниципальный округ Орехово-Борисово Южное, Гурьевский проезд, дом 9, корпус 1")))
}
