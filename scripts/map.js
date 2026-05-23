document.addEventListener("DOMContentLoaded", () => {
  let map = L.map("osm-map").setView([48.2446, 16.3910], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href=\"https://osm.org/copyright\">OSM</a>",
  }).addTo(map);

  L.marker([48.2446, 16.3910]).addTo(map);
});
