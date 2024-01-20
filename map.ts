declare const ymaps: any;

interface Point {
  element: HTMLDivElement;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Coords {
  lat: number;
  lng: number;
}

async function getPDK<T>(coords: Coords): Promise<T> {
  const response = await fetch(
    "http://dubrovskih.ru:3000/api/v1/pdk/" + coords.lat + "," + coords.lng,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await (response.json() as Promise<T>);
}

async function getCoords<T>(): Promise<T> {
  const response = await fetch("http://dubrovskih.ru:3000/api/v1/pdk", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await (response.json() as Promise<T>);
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

async function addPlacemarks(map: any) {
  let coords: any = await getCoords();
  coords.forEach(function (point: any) {
    let placemark = new ymaps.Placemark(
      [point.Lat, point.Lng],
      {
        iconContent: "station.png",
        hintContent:
          "Период измерения: " +
          point.Period +
          "<br>Концентрация загрязняющих веществ: " +
          point.Avg +
          " мг/м3",
      },
      { preset: "islands#blueDotIcon" }
    );
    map.geoObjects.add(placemark);
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
  const canvas = document.querySelector(
    ".ymaps-2-1-79-panorama-screen"
  ) as HTMLElement;

  return canvas;
}

function handlePlayerOpen(manager: any) {
  manager.events.add("openplayer", async () => {
    const player = manager.getPlayer();

    const pos = player.getPanorama().getPosition();

    const coords: Coords = { lat: pos[0], lng: pos[1] };

    let color: string = "";

    const data: any = await getPDK(coords);

    if (data.Avg >= data.Pdkss) {
      color = "red";
    } else {
      color = "green";
    }

    let canvas = getCanvas();

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const points: Point[] = createPoints(1000, width, height, color);

    points.forEach((point) => {
      canvas.appendChild(point.element);
      animatePoint(point);
    });

    let bearing = player.getDirection()[0];
    let pitch = player.getDirection()[1];
    handlePlayerDirectionChange(player, points, bearing, pitch, width, height);
  });
}

function handlePlayerDirectionChange(
  player: any,
  points: Point[],
  bearing: number,
  pitch: number,
  width: number,
  height: number
) {
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

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function createPoints(
  count: number,
  width: number,
  height: number,
  color: string
) {
  const result: Point[] = [];
  for (let i = 0; i < count; i++) {
    const size = getRndInteger(1, 5);
    const point_div = createPointDiv(color, size);

    const point: Point = {
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

function createPointDiv(color: string, size: number): HTMLDivElement {
  const point = document.createElement("div");

  point.style.position = "absolute";
  point.style.width = size + "px";
  point.style.height = size + "px";
  point.style.backgroundColor = color;
  point.style.borderRadius = "50%";

  return point;
}

function animatePoint(point: Point) {
  setInterval(() => {
    point.x += Math.random() * 2 - 1;
    point.y += Math.random() * 2 - 1;
    point.element.style.left = point.x + "px";
    point.element.style.top = point.y + "px";
  }, 1);
}

async function getCoordsByAdmArea<T>(admArea: string): Promise<T> {
	admArea = admArea.replace(/\+/g, "+")
  const response = await fetch(
    "http://dubrovskih.ru:3000/api/v1/coords/" + encodeURI(admArea),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await (response.json() as Promise<T>);
}

async function getAdmAreas<T>(): Promise<T> {
  const response = await fetch("http://dubrovskih.ru:3000/api/v1/admAreas", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await (response.json() as Promise<T>);
}

async function init() {
  let myMap = createMap();

  myMap.controls.add(createDatasetButton(), {
    float: "left",
  });

  addPlacemarks(myMap);

  let areas: any = await getAdmAreas();

  let listItems: any = [];
  areas.forEach((area: any) => {
    listItems.push(
      new ymaps.control.ListBoxItem({
        data: {
          content: area,
        },
      })
    );
  });

  let myListBox = new ymaps.control.ListBox({
    data: {
      content: "Выбрать административный округ",
    },
    items: listItems,
  });

  myListBox.events.add("click", async function (e: any) {
    let item = e.get("target");
    console.log(item);
    if (item != myListBox) {
      myMap.geoObjects.removeAll();
      let coords: any = await getCoordsByAdmArea(item.data.get("content"));
      coords.forEach(function (point: any) {
        let placemark = new ymaps.Placemark(
          [point.Lat, point.Lng],
          {
            iconContent: "station.png",
            hintContent:
              "Период измерения: " +
              point.Period +
              "<br>Концентрация загрязняющих веществ: " +
              point.Avg +
              " мг/м3",
          },
          { preset: "islands#blueDotIcon" }
        );
        myMap.geoObjects.add(placemark);
      });
    }
  });

  myMap.controls.add(myListBox);

  myMap.getPanoramaManager().then((manager: any) => {
    manager.enableLookup();
    handlePlayerOpen(manager);
  });
}

ymaps.ready(init);
