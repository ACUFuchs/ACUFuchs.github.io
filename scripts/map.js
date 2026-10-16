import * as maplibregl from
    'https://unpkg.com/maplibre-gl/dist/maplibre-gl.mjs';

var map = new maplibregl.Map({
  container : "osm-map", // container id
  hash : true,

  // style: "https://tiles.openfreemap.org/styles/bright", // style URL
  style : {
    'version' : 8,
    'sources' : {
      'raster-tiles' : {
        'type' : 'raster',
        'tiles' : [ 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' ],
        'tileSize' : 256,
        'minzoom' : 0,
        'maxzoom' : 19,
        'attribution' : "© OSM",
      },
      'image' : {
        'type' : 'image',
        'url' : '../assets/media/sitemap.png',
        'coordinates' : [
          /* top left */[ 16.3889825, 48.2455086 ],
          /* top right */[ 16.393953, 48.245550 ],
          /* bottom right */[ 16.393885, 48.243282 ],
          /* bottom left */[ 16.3889786, 48.2431842 ],
        ]
      }
      // 'video': {
      //     'type': 'video',
      //     'urls': [
      //         'https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4',
      //         'https://static-assets.mapbox.com/mapbox-gl-js/drone.webm'
      //     ],
      //     'coordinates': [
      //         [-122.51596391201019, 37.56238816766053],
      //         [-122.51467645168304, 37.56410183312965],
      //         [-122.51309394836426, 37.563391708549425],
      //         [-122.51423120498657, 37.56161849366671]
      //     ]
      // }
    },
    'layers' : [
      {
        'id' : 'simple-tiles',
        'type' : 'raster',
        'source' : 'raster-tiles',
      },
      // {
      //   'id' : 'background',
      //   'type' : 'background',
      //   'paint' : {'background-color' : 'rgb(4,7,14)'}
      // },
      {'id' : 'image', 'type' : 'raster', 'source' : 'image'}
    ],
    'id' : 'blank'
  },

  center : [ 16.3910, 48.2446 ], // starting position [lng, lat]
  zoom : 10,                     // starting zoom
  maplibreLogo : false,
  attributionControl : false
});

// map.addControl(new maplibregl.AttributionControl({ compact: true }));
map.addControl(new maplibregl.FullscreenControl(
    {container : document.querySelector('osm-map')}));

const marker =
    new maplibregl.Marker().setLngLat([ 16.3910, 48.2446 ]).addTo(map);
