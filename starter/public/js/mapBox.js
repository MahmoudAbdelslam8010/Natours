


export const displayMap = locations => {
  const map = L.map('map', {
    zoomControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false
}).setView([0,0],2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
}).addTo(map);


const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  iconSize: [35,50],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
const bounds = []
locations.forEach((element , index) => {
    const latlng = element.coordinates.slice().reverse();
    bounds.push(latlng)
  const marker = L.marker(latlng, { icon: greenIcon }).addTo(map);
  marker.bindPopup(`<h1> Place number ${index + 1} for ${element.day} day: ${element.description}</h1>`, {
        autoClose: false,
        closeOnClick:false
  }).openPopup();
});
L.polyline(bounds, {
  color: 'green',
  weight: 4,
  opacity: 0.7,
  lineJoin: 'round'
}).addTo(map);
map.flyToBounds(bounds, {
    padding: [100, 100],
    duration: 5
});

}
