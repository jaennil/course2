function init() {
    var myMap = new ymaps.Map("map", {
        center: [55.65336771654587, 37.52289044973747],
        zoom: 18,
        type: "yandex#map",
        controls: ["typeSelector"],
    });
    myMap.getPanoramaManager().then(function (manager) {
        manager.enableLookup();
        manager.openPlayer(myMap.getCenter());
        manager.events.add("openplayer", function () {
            var player = manager.getPlayer();
            var canvas = document.querySelector(".ymaps-2-1-79-panorama-screen");
            if (canvas === null) {
                console.error("cant find canvas");
                return;
            }
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;
            var points = createPoints(100, width, height);
            points.forEach(function (point) {
                canvas.appendChild(point.element);
                animatePoint(point);
            });
            var bearing = player.getDirection()[0];
            var pitch = player.getDirection()[1];
            player.events.add("directionchange", function () {
                var new_bearing = player.getDirection()[0];
                var new_pitch = player.getDirection()[1];
                var delta_bearing = bearing - new_bearing;
                var delta_pitch = pitch - new_pitch;
                var horizontal_span = player.getSpan()[0];
                var vertical_span = player.getSpan()[1];
                points.forEach(function (point) {
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
        var result = [];
        for (var i = 0; i < count; i++) {
            var point_div = createPointDiv();
            var point = {
                element: point_div,
                x: Math.random() * width * 4,
                y: Math.random() * height * 2,
            };
            result.push(point);
        }
        return result;
    }
    function createPointDiv() {
        var point = document.createElement("div");
        point.style.position = "absolute";
        point.style.width = "5px";
        point.style.height = "5px";
        point.style.backgroundColor = "red";
        point.style.borderRadius = "50%";
        return point;
    }
    function animatePoint(point) {
        setInterval(function () {
            point.x += Math.random() * 2 - 1;
            point.y += Math.random() * 2 - 1;
            point.element.style.left = point.x + "px";
            point.element.style.top = point.y + "px";
        }, 1);
    }
}
ymaps.ready(init);
