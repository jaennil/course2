package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"

	"net/url"

	_ "github.com/go-sql-driver/mysql"
)

const (
	username = "jaennil"
	password = "naen"
	hostname = "127.0.0.1:3306"
	dbname   = "course2"
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

type Point struct {
	lat float64
	lng float64
}

func coordsByAddress(address string) (*Point, error) {
	urlEncodedAddress := url.QueryEscape(address)

	twogis_apikey := "fb71aae4-ddd7-45ea-a016-2260f5a1ca4c"
	url := "https://catalog.api.2gis.com/3.0/items/geocode?q=" + urlEncodedAddress + "&fields=items.point&key=" + twogis_apikey + "&location=37.617617,55.755811"

	resp, err := http.Get(url)
	if err != nil {
		log.Println("error occured while http.Get:", err)
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		handleError(err, "error occured while io.ReadAll(resp.Body):")
	}

	var twoGisResponse TwoGisResponse
	if err := json.Unmarshal(body, &twoGisResponse); err != nil {
		log.Println("Can not unmarshal JSON")
	}

	if twoGisResponse.Result.Total == 0 {
		log.Println("cant find address", address)
		return nil, errors.New("cant find address")
	}

	lat := twoGisResponse.Result.Items[0].Point.Lat
	lng := twoGisResponse.Result.Items[0].Point.Lon
	return &Point{lat: lat, lng: lng}, nil
}

func updateCoords(db *sql.DB, point *Point, locationid int) error {
	updateStmt, err := db.Prepare("UPDATE pollution SET latitude=?, longitude=? WHERE ID=? ORDER BY Period DESC")
	if err != nil {
		return err
	}
	defer updateStmt.Close()

	_, err = updateStmt.Exec(point.lat, point.lng, locationid)
	if err != nil {
		return err
	}
	return nil
}

func main() {
	db, err := sql.Open("mysql", dsn())
	handleError(err, "error occured while connecting to database:")
	defer db.Close()

	err = db.Ping()
	handleError(err, "Errors %s pinging DB")

	// _, err = db.ExecContext(ctx, "ALTER TABLE pollution DROP COLUMN latitude, DROP COLUMN longitude")
	// handleError(err, "error while altering table pollution")
	//
	// _, err = db.ExecContext(ctx, "ALTER TABLE pollution ADD COLUMN latitude float, ADD COLUMN longitude float")
	// handleError(err, "error while altering table pollution")

	rows, err := db.Query("SELECT ID, AdmArea, District, Location FROM pollution WHERE latitude IS NULL OR longitude IS NULL")
	handleError(err, "error occured while quering pollution table")
	defer rows.Close()

	for rows.Next() {
		var admarea, district, location string
		var locationid int
		err := rows.Scan(&locationid, &admarea, &district, &location)
		handleError(err, "error while scanning rows")

		point, err := coordsByAddress("Москва " + admarea + " " + district + " " + location)
		if err == nil {
			err := updateCoords(db, point, locationid)
			handleError(err, "error occured while updatingCoords")
			continue
		}

		point, err = coordsByAddress("Москва " + district + " " + location)
		if err == nil {
			err := updateCoords(db, point, locationid)
			handleError(err, "error occured while updatingCoords")
			continue
		}

		point, err = coordsByAddress("Москва " + location)
		if err == nil {
			err := updateCoords(db, point, locationid)
			handleError(err, "error occured while updatingCoords")
			continue
		}

		log.Println(err, admarea+" "+district+" "+location)
	}
}

func handleError(err error, message string) {
	if err != nil {
		log.Println(message, err)
	}
}

func dsn() string {
	return fmt.Sprintf("%s:%s@tcp(%s)/%s", username, password, hostname, dbname)
}
