<template>
  <div class="maplibregl">
    <div id="map" class="maplibregl-container">
      <div class="maplibregl-ctrl-top-right maplibregl-custom_ctrl">
        <div class="maplibregl-ctrl maplibregl-ctrl-group">
          <button @click="setPitch" class="maplibregl-draw_ctrl-draw-btn maplibregl-custom_ctrl-pitch">
            {{ isThree ? '2D' : '3D' }}
          </button>
          <button @click="addRectangle" class="maplibregl-draw_ctrl-draw-btn maplibregl-draw_rect"></button>
          <button @click="addPolygon" class="maplibregl-draw_ctrl-draw-btn maplibregl-draw_polygon"></button>
          <button @click="trash" class="maplibregl-draw_ctrl-draw-btn maplibregl-draw_trash"></button>
        </div>
      </div>
      <div class="maplibregl-area" :style="areaStyle" v-html="areatext"></div>
    </div>
  </div>
</template>
<script lang="js" setup>
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { onMounted, ref, reactive } from 'vue';
import area from '@turf/area';
// import DrawRectangle from './draw-rectangle-mode';
// import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import { DrawStyles, DrawPolygon, DrawRectangle } from '@/utils/mapbox-gl-draw';
import { Constants } from '@/utils/mapbox-gl-draw/lib/constants';
import constrainFeatureMovement from '@/utils/mapbox-gl-draw/lib/constrain_feature_movement';
import CustomDraw from './custom-draw.js';

import { OSM_STYLE, WMS_STYLE } from './line-style.js';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/assets/styles/mapbox-gl-draw.css';

const areatext = ref('');
const isThree = ref(false);

const areaStyle = reactive({
  left: 0,
  top: 0,
  display: 'none',
});
let draw = null;
let map = null;
let showArea = false;
let customDraw = null;
const initMap = () => {
  map = new maplibregl.Map({
    container: 'map',
    minZoom: 0,
    maxZoom: 22,
    // renderWorldCopies: false, // 关闭地图重复渲染
    style: WMS_STYLE,
    trackResize: true, // 自适应
    style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL', // 使用适当的地图样式
    center: [119.313, 41.297], // 设置地图初始中心
    zoom: 15, // 设置地图初始缩放级别
  });
  // map.dragRotate.enable(); // 右键切换倾斜角
  // map.dragPan.enable(); // 平移
  map.addControl(new maplibregl.NavigationControl());
  map.on('load', () => {
    console.log('map load');
    // map.addLayer({
    //   id: 'wms-layer',
    //   type: 'raster',
    //   source: {
    //     type: 'raster',
    //     tiles: [
    //       '/geoserver/image-test/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=true&STYLES&LAYERS=image-test%3ADOM_final_3857&exceptions=application%2Fvnd.ogc.se_inimage&SRS=EPSG%3A3857&WIDTH=768&HEIGHT=424&BBOX={bbox-epsg-3857}',
    //     ],
    //     tileSize: 256,
    //     maxzoom: 22,
    //   },
    //   paint: {},
    // });

    // 设置地图视图范围（bbox）
    var minLng = 119.29605865480914;
    var minLat = 41.28998947164632;
    var maxLng = 119.33184814377455;
    var maxLat = 41.30484390258789;

    map.fitBounds([
      [minLng, minLat],
      [maxLng, maxLat],
    ]);
  });
  draw = new MapboxDraw({
    displayControlsDefault: false,
    userProperties: true,
    styles: DrawStyles,
    modes: {
      ...MapboxDraw.modes,
      draw_rectangle: DrawRectangle,
      draw_polygon: DrawPolygon,
    },
  });
  map.addControl(draw);
  map.on('mousemove', (e) => {
    if (showArea) {
      areaStyle.left = `${e.point.x + 4}px`;
      areaStyle.top = `${e.point.y + 4}px`;
      areaStyle.display = 'block';
    }
  });
  const DirectModeOverride = MapboxDraw.modes.direct_select;
  DirectModeOverride.dragVertex = function (state, e, delta) {
    const geometry = state.feature.toGeoJSON().geometry;
    const selectedCoords = state.selectedCoordPaths.map((coord_path) => state.feature.getCoordinate(coord_path));
    const currentArea = area(geometry) / 1e6; // 将面积转换为平方千米

    const selectedCoordPoints = selectedCoords.map((coords) => ({
      type: Constants.geojsonTypes.FEATURE,
      properties: {},
      geometry: {
        type: Constants.geojsonTypes.POINT,
        coordinates: coords,
      },
    }));
    const constrainedDelta = constrainFeatureMovement(selectedCoordPoints, delta);
    for (let i = 0; i < selectedCoords.length; i++) {
      const coord = selectedCoords[i];
      state.feature.updateCoordinate(
        state.selectedCoordPaths[i],
        coord[0] + constrainedDelta.lng,
        coord[1] + constrainedDelta.lat
      );
    }
  };
  customDraw = new CustomDraw({ map, draw, exceedCallback, areaChangedCallback });
};
const setPitch = () => {
  if (isThree.value) {
    map.setPitch(0);
    isThree.value = false;
  } else {
    map.setPitch(50);
    isThree.value = true;
  }
};

const exceedCallback = (areaValue) => {
  console.log('面积超出', areaValue);
};
const areaChangedCallback = (areaValue) => {
  showArea = true;
  areatext.value = `${(areaValue / 1e6).toFixed(2)} 平方公理`;
};
// 画完以后返回feature的json数据
const finishDraw = () => {
  showArea = false;
  areaStyle.display = 'none';
  areatext.value = '';
};
// 画多边形
const addPolygon = () => {
  customDraw.addPolygon(finishDraw);
};
// 画矩形
const addRectangle = () => {
  customDraw.addRectangle(finishDraw);
};
const trash = () => {
  customDraw.trash();
};
onMounted(() => {
  initMap();
});
</script>
<style scoped lang="scss">
.maplibregl {
  width: 100%;
  height: 100%;
  display: flex;
  padding: 20px;
  gap: 20px;
  &-container {
    width: 1200px;
    height: 500px;
    background-color: #000;
  }
  &-custom {
    &_ctrl {
      top: 90px;
      &-pitch {
        color: #262626;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
  &-area {
    position: absolute;
    z-index: 6;
    background: hsla(0, 0%, 100%, 0.8);
    color: rgba(0, 0, 0, 0.8);
    padding: 2px 3px;
    pointer-events: none;
    display: none;
  }
}
</style>
