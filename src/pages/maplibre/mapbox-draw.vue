<template>
  <div class="maplibregl">
    <div id="map" class="maplibregl-container">
      <div class="maplibregl-ctrl-top-right maplibregl-custom_ctrl">
        <div class="maplibregl-ctrl maplibregl-ctrl-group">
          <button class="maplibregl-draw_ctrl-draw-btn maplibregl-custom_ctrl-pitch" @click="setPitch">
            {{ isThree ? '2D' : '3D' }}
          </button>
          <button class="maplibregl-draw_ctrl-draw-btn maplibregl-draw_rect" @click="addRectangle"></button>
          <button class="maplibregl-draw_ctrl-draw-btn maplibregl-draw_polygon" @click="addPolygon"></button>
          <button class="maplibregl-draw_ctrl-draw-btn maplibregl-draw_trash" @click="trash"></button>
        </div>
      </div>
      <div class="maplibregl-area" :style="areaStyle">
        <p class="maplibregl-area_text" :class="areaSize > 2 * 1e6 ? 'areaover' : ''">
          实时面积：{{ Math.floor((areaSize / 1e6) * 100) / 100 }}平方公里
        </p>
        <p class="maplibregl-area_text">限制面积： 2平方公里</p>
      </div>
    </div>
  </div>
</template>
<script lang="js" setup>
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { onMounted, ref, reactive } from 'vue';
import area from '@turf/area';
import { DrawStyles, DrawPolygon, DrawRectangle } from '@/utils/mapbox-gl-draw';
import CustomDraw from './custom-draw.js';

// import { WMS_STYLE } from './line-style.js';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/assets/styles/mapbox-gl-draw.css';

const areaSize = ref(0);
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
    trackResize: true, // 自适应
    style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL', // 使用适当的地图样式
    center: [119.313, 41.297], // 设置地图初始中心
    zoom: 15, // 设置地图初始缩放级别
  });
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
    const minLng = 119.29605865480914;
    const minLat = 41.28998947164632;
    const maxLng = 119.33184814377455;
    const maxLat = 41.30484390258789;

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
  const DirectSelect = MapboxDraw.modes.direct_select;
  DirectSelect.onDrag = function (state, e) {
    if (state.canDragMove !== true) return;
    state.dragMoving = true;
    e.originalEvent.stopPropagation();
    const delta = {
      lng: e.lngLat.lng - state.dragMoveLocation.lng,
      lat: e.lngLat.lat - state.dragMoveLocation.lat,
    };
    if (state.selectedCoordPaths.length > 0) {
      showArea = true;
      const currentArea = area(state.feature);
      areaSize.value = currentArea;
      if (currentArea > 2 * 1e6) {
        state.feature.sizeExceeded = true;
        state.feature.properties.size_exceed = true;
      } else {
        state.feature.sizeExceeded = false;
        state.feature.properties.size_exceed = false;
      }
      this.dragVertex(state, e, delta);
    } else {
      this.dragFeature(state, e, delta);
    }
    state.dragMoveLocation = e.lngLat;
  };
  customDraw = new CustomDraw({ map, draw, exceedCallback, areaChangedCallback });
};
// 切换2D/3D
const setPitch = () => {
  if (isThree.value) {
    map.setPitch(0);
    isThree.value = false;
  } else {
    map.setPitch(50);
    isThree.value = true;
  }
};
// 面积超出回调
const exceedCallback = (areaValue) => {
  console.log('面积超出', areaValue);
};
// 面积改变回调
const areaChangedCallback = (areaValue) => {
  showArea = true;
  areaSize.value = areaValue;
};
// 画完以后返回feature的json数据
const finishDraw = () => {
  showArea = false;
  areaStyle.display = 'none';
  areaSize.value = 0;
};
// 画多边形
const addPolygon = () => {
  customDraw.addPolygon(finishDraw);
};
// 画矩形
const addRectangle = () => {
  customDraw.addRectangle(finishDraw);
};
// 清除
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
    &_text {
      white-space: nowrap;
      &.areaover {
        color: red;
      }
    }
  }
}
</style>
