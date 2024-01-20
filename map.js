"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getPDK(coords) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://dubrovskih.ru:3000/api/v1/pdk/" + coords.lat + "," + coords.lng, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return yield response.json();
    });
}
function getCoords() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://dubrovskih.ru:3000/api/v1/pdk", {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return yield response.json();
    });
}
function createDatasetButton() {
    let datasetButton = new ymaps.control.Button("<b>Датасет</b>");
    datasetButton.events.add("press", () => {
        window.open("https://data.mos.ru/opendata/2453", "_blank");
    });
    return datasetButton;
}
function createMapControls() {
    let inputSearch = new ymaps.control.SearchControl({
        options: {
            size: "large",
            provider: "yandex#search",
        },
    });
    return [inputSearch, "geolocationControl", "typeSelector"];
}
function addPlacemarks(map) {
    return __awaiter(this, void 0, void 0, function* () {
        let coords = yield getCoords();
        coords.forEach(function (point) {
            let placemark = new ymaps.Placemark([point.Lat, point.Lng], {
                iconContent: "station.png",
                hintContent: "Период измерения: " +
                    point.Period +
                    "<br>Концентрация загрязняющих веществ: " +
                    point.Avg +
                    " мг/м3",
            }, { preset: "islands#blueDotIcon" });
            map.geoObjects.add(placemark);
        });
    });
}
function createMap() {
    let map = new ymaps.Map("map", {
        center: [55.751244, 37.618423],
        zoom: 17,
        type: "yandex#map",
        controls: createMapControls(),
    });
    return map;
}
function getCanvas() {
    const canvas = document.querySelector(".ymaps-2-1-79-panorama-screen");
    return canvas;
}
function handlePlayerOpen(manager) {
    manager.events.add("openplayer", () => __awaiter(this, void 0, void 0, function* () {
        const player = manager.getPlayer();
        const pos = player.getPanorama().getPosition();
        const coords = { lat: pos[0], lng: pos[1] };
        let color = "";
        const data = yield getPDK(coords);
        if (data.Avg >= data.Pdkss) {
            color = "red";
        }
        else {
            color = "green";
        }
        let canvas = getCanvas();
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const points = createPoints(1000, width, height, color);
        points.forEach((point) => {
            canvas.appendChild(point.element);
            animatePoint(point);
        });
        let bearing = player.getDirection()[0];
        let pitch = player.getDirection()[1];
        handlePlayerDirectionChange(player, points, bearing, pitch, width, height);
    }));
}
function handlePlayerDirectionChange(player, points, bearing, pitch, width, height) {
    player.events.add("directionchange", function () {
        const new_bearing = player.getDirection()[0];
        const new_pitch = player.getDirection()[1];
        let delta_bearing = bearing - new_bearing;
        let delta_pitch = pitch - new_pitch;
        let horizontal_span = player.getSpan()[0];
        let vertical_span = player.getSpan()[1];
        points.forEach((point) => {
            if (horizontal_span == 0) {
                return;
            }
            if (vertical_span == 0) {
                return;
            }
            point.x += (delta_bearing / horizontal_span) * width;
            point.y -= (delta_pitch / vertical_span) * height;
            console.log("point", point.x, point.y);
            console.log("width", width);
            console.log("horspan", horizontal_span);
            console.log("d_bearing", delta_bearing);
            point.element.style.left = point.x + "px";
            point.element.style.top = point.y + "px";
        });
        bearing = new_bearing;
        pitch = new_pitch;
    });
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function createPoints(count, width, height, color) {
    const result = [];
    for (let i = 0; i < count; i++) {
        const size = getRndInteger(1, 5);
        const point_div = createPointDiv(color, size);
        const point = {
            element: point_div,
            x: Math.random() * (width * 2 + width * 2) - width * 2,
            y: Math.random() * (height * 2 + height * 2) - height * 2,
            size: size,
            color: color,
        };
        result.push(point);
    }
    return result;
}
function createPointDiv(color, size) {
    const point = document.createElement("div");
    point.style.position = "absolute";
    point.style.width = size + "px";
    point.style.height = size + "px";
    point.style.backgroundColor = color;
    point.style.borderRadius = "50%";
    return point;
}
function animatePoint(point) {
    setInterval(() => {
        point.x += Math.random() * 2 - 1;
        point.y += Math.random() * 2 - 1;
        point.element.style.left = point.x + "px";
        point.element.style.top = point.y + "px";
    }, 1);
}
function getAdmAreas() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("http://dubrovskih.ru:3000/api/v1/admAreas", {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return yield response.json();
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        let myMap = createMap();
        let areas = yield getAdmAreas();
        let listItems = [];
        areas.forEach((area) => {
            listItems.push(new ymaps.control.ListBoxItem(area));
        });
        let myListBox = new ymaps.control.ListBox({
            data: {
                content: 'Выбрать административный округ'
            },
            items: listItems
        });
        myMap.controls.add(myListBox);
        myMap.controls.add(createDatasetButton(), {
            float: "left",
        });
        addPlacemarks(myMap);
        myMap.getPanoramaManager().then((manager) => {
            manager.enableLookup();
            handlePlayerOpen(manager);
        });
    });
}
ymaps.ready(init);
