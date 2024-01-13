function init() {
  ymaps.panorama
    .createPlayer(
      "panorama", // ID DOM-элемента, в котором будет открыт плеер
      [55.65336771654587, 37.52289044973747] // Координаты панорамы, которую мы хотим открыть
    )
    .done((player) => {
      let canvas = document.querySelector(".ymaps-2-1-79-panorama-screen");
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const points = createPoints(100, width, height);

      let bearing = player.getDirection()[0];
      let pitch = player.getDirection()[1];
      player.events.add("directionchange", function () {
        let new_bearing = player.getDirection()[0];
        let new_pitch = player.getDirection()[1];
        let delta_bearing = bearing - new_bearing;
        let delta_pitch = pitch - new_pitch;
        let horizontal_span = player.getSpan()[0];
        let vertical_span = player.getSpan()[1];
        console.log(horizontal_span);
        console.log((delta_bearing / horizontal_span) * width);
        points.forEach((point) => {
          point.x += (delta_bearing / horizontal_span) * width;
          point.y += (delta_pitch / vertical_span) * height;
        });
        bearing = new_bearing;
        pitch = new_pitch;
        console.log(player.getDirection());
        console.log(player.getSpan());
      });

      // Add points to the panorama
      points.forEach((point) => {
        document
          .querySelector(".ymaps-2-1-79-panorama-screen")
          .appendChild(point.element);
        animatePoint(point, width, height);
      });
    });

  function createPoints(count, width, height) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const point = createPoint();
      result.push({
        element: point,
        x: Math.random() * width * 4,
        y: Math.random() * height * 2,
      });
    }
    return result;
  }

  function createPoint() {
    const point = document.createElement("div");
    point.style.position = "absolute";
    point.style.width = "5px";
    point.style.height = "5px";
    point.style.backgroundColor = "red";
    point.style.borderRadius = "50%";
    return point;
  }

  function animatePoint(particle, width, height) {
    setInterval(() => {
      particle.x += Math.random() * 2 - 1;
      particle.y += Math.random() * 2 - 1;
      particle.element.style.left = particle.x + "px";
      particle.element.style.top = particle.y + "px";
    }, 50);
  }
}

ymaps.ready(init);
