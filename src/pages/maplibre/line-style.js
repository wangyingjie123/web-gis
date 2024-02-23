const customStyles = [
  // Style for LineString
  {
    id: 'dashed-line',
    type: 'line',
    paint: {
      'line-color': 'yellow',
      'line-opacity': 0.8,
      'line-width': 2,
      'line-dasharray': [2, 2], // 设置虚线效果
    },
    filter: ['all', ['==', '$type', 'LineString']],
  },
  // Style for Point
  {
    id: 'circle-point',
    type: 'circle',
    paint: {
      'circle-radius': 6,
      'circle-color': 'rgba(0, 0, 0, 0.7)', // 圆形点的颜色
      'circle-stroke-color': 'blue', // 选中时圆形点的边框颜色
      'circle-stroke-width': 2,
    },
    filter: ['all', ['==', '$type', 'Point']],
  },
];
export default customStyles;

export const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
    },
  },
  layers: [
    {
      id: 'osm',
      source: 'osm',
      type: 'raster',
    },
  ],
};

export const WMS_STYLE = {
  version: 8,
  sources: {
    wms: {
      type: 'raster',
      tiles: [
        'http://172.16.10.26:8090/geoserver/image-test/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&STYLES&LAYERS=image-test%3ADOM_final_3857&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3857&WIDTH=768&HEIGHT=424&BBOX={bbox-epsg-3857}',
      ],
      tileSize: 256,
      maxzoom: 22,
    },
  },
  layers: [
    {
      id: 'wms',
      source: 'wms',
      type: 'raster',
    },
  ],
};
export const geoJsonDemo = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-121.353637, 40.584978],
            [-121.284551, 40.584758],
            [-121.275349, 40.541646],
            [-121.246768, 40.541017],
            [-121.251343, 40.423383],
            [-121.32687, 40.423768],
            [-121.360619, 40.43479],
            [-121.363694, 40.409124],
            [-121.439713, 40.409197],
            [-121.439711, 40.423791],
            [-121.572133, 40.423548],
            [-121.577415, 40.550766],
            [-121.539486, 40.558107],
            [-121.520284, 40.572459],
            [-121.487219, 40.550822],
            [-121.446951, 40.56319],
            [-121.370644, 40.563267],
            [-121.353637, 40.584978],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-121.415061, 40.506229],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-121.505184, 40.488084],
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-121.354465, 40.488737],
      },
    },
  ],
};
