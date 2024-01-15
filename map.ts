declare const ymaps: any;

interface Point {
  element: HTMLDivElement;
  x: number;
  y: number;
}

function init() {
  ymaps.panorama
    .createPlayer(
      "panorama", // ID DOM-элемента, в котором будет открыт плеер
      [55.65336771654587, 37.52289044973747] // Координаты панорамы, которую мы хотим открыть
    )
    .done((player) => {
      const canvas = document.querySelector(".ymaps-2-1-79-panorama-screen");
      if (canvas === null) {
        console.error("cant find canvas");
        return;
      }

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const points: Point[] = createPoints(100, width, height);

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
          point.element.style.left = point.x + "px";
          point.element.style.top = point.y + "px";
        });
        bearing = new_bearing;
        pitch = new_pitch;
        console.log(player.getDirection());
        console.log(player.getSpan());
      });

      // Add points to the panorama
      points.forEach((point) => {
        canvas.appendChild(point.element);
        animatePoint(point);
      });
    });

  function createPoints(count: number, width: number, height: number) {
    const result: Point[] = [];
    for (let i = 0; i < count; i++) {
      const point_div = createPointDiv();
      const point: Point = {
        element: point_div,
        x: Math.random() * width * 4,
        y: Math.random() * height * 2,
      };
      result.push(point);
    }
    return result;
  }

  function createPointDiv(): HTMLDivElement {
    const point = document.createElement("div");
    point.style.position = "absolute";
    point.style.width = "5px";
    point.style.height = "5px";
    point.style.backgroundColor = "red";
    point.style.borderRadius = "50%";
    return point;
  }

  function animatePoint(point: Point) {
    setInterval(() => {
      point.x += Math.random() * 2 - 1;
      point.y += Math.random() * 2 - 1;
      point.element.style.left = point.x + "px";
      point.element.style.top = point.y + "px";
    }, 5);
  }
}

ymaps.ready(init);
