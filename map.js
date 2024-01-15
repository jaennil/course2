function init() {
    ymaps.panorama
        .createPlayer("panorama", // ID DOM-элемента, в котором будет открыт плеер
    [55.65336771654587, 37.52289044973747] // Координаты панорамы, которую мы хотим открыть
    )
        .done(function (player) {
        var canvas = document.querySelector(".ymaps-2-1-79-panorama-screen");
        if (canvas === null) {
            console.error("cant find canvas");
            return;
        }
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        var points = createPoints(100, width, height);
        var bearing = player.getDirection()[0];
        var pitch = player.getDirection()[1];
        player.events.add("directionchange", function () {
            var new_bearing = player.getDirection()[0];
            var new_pitch = player.getDirection()[1];
            var delta_bearing = bearing - new_bearing;
            var delta_pitch = pitch - new_pitch;
            var horizontal_span = player.getSpan()[0];
            var vertical_span = player.getSpan()[1];
            console.log(horizontal_span);
            console.log((delta_bearing / horizontal_span) * width);
            points.forEach(function (point) {
                point.x += (delta_bearing / horizontal_span) * width;
                point.y += (delta_pitch / vertical_span) * height;
            });
            bearing = new_bearing;
            pitch = new_pitch;
            console.log(player.getDirection());
            console.log(player.getSpan());
        });
        // Add points to the panorama
        points.forEach(function (point) {
            canvas.appendChild(point.element);
            animatePoint(point);
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
        }, 5);
    }
}
ymaps.ready(init);
