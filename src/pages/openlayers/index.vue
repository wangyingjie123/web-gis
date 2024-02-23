<template>
  <div class="map">
    <h3 class="map-title">超大图片展示、瓦片图（清明上河图500M）</h3>
    <div id="map1" class="map-inner"></div>
  </div>
  <div class="map">
    <h3 class="map-title">大型tif图展示（224M）</h3>
    <div id="map2" class="map-inner"></div>
  </div>
</template>
<script lang="js" setup>
import { onMounted } from 'vue';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import XYZ from 'ol/source/XYZ.js';
import 'ol/ol.css';

const initTileMap = () => {
  const maxZoom = 9;
  const vjtag =
    '?tag=t3c93d14ff01&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M';
  const tileSource = new TileLayer({
    source: new XYZ({
      url: `https://vjmap.com/server/api/v1/map/tile/t3c93d14ff09/v1/t8d34dcf61/{z}/{x}/{y}${vjtag}`,
    }),
  });
  // 初始渲染范围

  const map = new Map({
    target: 'map1',
    layers: [tileSource],
    view: new View({
      center: [0, 0],
      zoom: 3,
      maxZoom,
      minZoom: 2,
    }),
  });
};

const initTif = () => {
  const source = new GeoTIFF({
    sources: [
      {
        url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
      },
    ],
  });

  const map2 = new Map({
    target: 'map2',
    layers: [
      new TileLayer({
        source: source,
      }),
    ],
    view: source.getView(),
  });
};
onMounted(() => {
  initTileMap();
  initTif();
});
</script>
<style lang="scss" scoped>
.map {
  width: calc(100% - 20px);
  height: 400px;
  margin: 20px auto 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  position: relative;
  &-inner {
    width: 100%;
    height: 100%;
  }
  &-title {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 99;
  }
  &-form {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
