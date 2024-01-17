"use strict";
// #TODO: make map and panorama take half site
function init() {
    const myMap = new ymaps.Map("map", {
        center: [55.65336771654587, 37.52289044973747],
        zoom: 18,
        type: "yandex#map",
        controls: ["typeSelector"],
    });
    var myGeocoder = ymaps.geocode("Петрозаводск");
    myGeocoder.then(function (res) {
        alert("Координаты объекта :" + res.geoObjects.get(0).geometry.getCoordinates());
    }, function (err) {
        alert("Ошибка" + err);
    });
    myMap.getPanoramaManager().then(function (manager) {
        manager.enableLookup();
        manager.events.add("openplayer", function () {
            const player = manager.getPlayer();
            console.log(player.getPanorama().getPosition());
            const canvas = document.querySelector(".ymaps-2-1-79-panorama-screen");
            if (canvas === null) {
                console.error("cant find canvas");
                return;
            }
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const points = createPoints(100, width, height);
            points.forEach((point) => {
                canvas.appendChild(point.element);
                animatePoint(point);
            });
            let bearing = player.getDirection()[0];
            let pitch = player.getDirection()[1];
            player.events.add("directionchange", function () {
                const new_bearing = player.getDirection()[0];
                const new_pitch = player.getDirection()[1];
                let delta_bearing = bearing - new_bearing;
                let delta_pitch = pitch - new_pitch;
                let horizontal_span = player.getSpan()[0];
                let vertical_span = player.getSpan()[1];
                points.forEach((point) => {
                    point.x += (delta_bearing / horizontal_span) * width;
                    point.y += (delta_pitch / vertical_span) * height;
                    point.element.style.left = point.x + "px";
                    point.element.style.top = point.y + "px";
                });
                bearing = new_bearing;
                pitch = new_pitch;
            });
        });
    });
    function createPoints(count, width, height) {
        const result = [];
        for (let i = 0; i < count; i++) {
            const point_div = createPointDiv();
            const point = {
                element: point_div,
                x: Math.random() * width * 4,
                y: Math.random() * height * 2,
            };
            result.push(point);
        }
        return result;
    }
    function createPointDiv() {
        const point = document.createElement("div");
        point.style.position = "absolute";
        point.style.width = "5px";
        point.style.height = "5px";
        point.style.backgroundColor = "red";
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
}
ymaps.ready(init);
