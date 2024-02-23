import area from '@turf/area';
import { Constants, CommonSelectors, createVertex } from './lib';

import { getIneractionSwitch } from './switchIteractions';

const doubleClickZoom = getIneractionSwitch('doubleClickZoom');
const dragPan = getIneractionSwitch('dragPan');

const getArea = (feature) => area(feature);

const DrawRectangle = {};

DrawRectangle.onSetup = function ({
  areaLimit,
  areaChangedCallback,
  exceedCallback,
  exceedCallsOnEachMove = false,
  allowCreateExceeded = false,
  escapeKeyStopsDrawing = true,
}) {
  const rectangle = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]],
    },
  });
  this.addFeature(rectangle);

  this.clearSelectedFeatures();

  // Disable iteractions
  doubleClickZoom.disable(this);
  dragPan.disable(this);

  // Update cursor
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POLYGON);
  this.setActionableState({ trash: true });

  // Setup mode options
  if (areaLimit) this.areaLimit = areaLimit;
  this.allowCreateExceeded = allowCreateExceeded;
  this.exceedCallsOnEachMove = exceedCallsOnEachMove;
  this.escapeStopsDrawing = escapeKeyStopsDrawing;
  if (exceedCallback) this.exceedCallback = exceedCallback;
  if (areaChangedCallback) this.areaChangedCallback = areaChangedCallback;

  return {
    rectangle,
    dragMoving: false,
    sizeExceeded: false,
    currentArea: 0,
  };
};

DrawRectangle.onClick = function (state, e) {
  // on first click, save clicked point coords as starting for rectangle
  if (!state.startPoint) {
    const startPoint = [e.lngLat.lng, e.lngLat.lat];
    state.startPoint = startPoint;
    this.updateUIClasses({ mouse: Constants.cursors.ADD });
    state.rectangle.updateCoordinate(`0.0`, e.lngLat.lng, e.lngLat.lat);
    state.rectangle.updateCoordinate(`0.1`, e.lngLat.lng, e.lngLat.lat);
  } else if (
    state.startPoint &&
    state.startPoint[0] !== e.lngLat.lng &&
    state.startPoint[1] !== e.lngLat.lat &&
    state.dragMoving &&
    (!state.sizeExceeded || this.allowCreateExceeded)
  ) {
    this.updateUIClasses({ mouse: 'pointer' });
    state.endPoint = [e.lngLat.lng, e.lngLat.lat];
    this.changeMode(Constants.modes.SIMPLE_SELECT, {
      featureIds: [state.rectangle.id],
    });
  }
};

DrawRectangle.onTap = function (state, e) {
  if (!state.startPoint) this.onClick(state, e);
};

DrawRectangle.onMouseMove = function (state, e) {
  state.dragMoving = true;
  if (CommonSelectors.isVertex(e)) {
    this.updateUIClasses({ mouse: Constants.cursors.POINTER });
  }
  if (state.startPoint) {
    state.rectangle.updateCoordinate('0.1', e.lngLat.lng, state.startPoint[1]); // maxX, minY
    state.rectangle.updateCoordinate('0.2', e.lngLat.lng, e.lngLat.lat); // maxX, maxY
    state.rectangle.updateCoordinate('0.3', state.startPoint[0], e.lngLat.lat); // minX,maxY
    state.rectangle.updateCoordinate('0.4', state.startPoint[0], state.startPoint[1]);
  } else {
    state.rectangle.updateCoordinate(`0.0`, e.lngLat.lng, e.lngLat.lat);
  }
  if (this.areaLimit) {
    let area = getArea(state.rectangle);
    if (area > 0) if (state.currentArea !== area && this.areaChangedCallback) this.areaChangedCallback(area);
    state.currentArea = area;
    if (area > this.areaLimit) {
      if (!state.sizeExceeded || this.exceedCallsOnEachMove) if (this.exceedCallback) this.exceedCallback(area);
      state.sizeExceeded = true;
      state.rectangle.properties.size_exceed = true;
    } else {
      state.sizeExceeded = false;
      state.rectangle.properties.size_exceed = false;
    }
  }
};

DrawRectangle.onStop = function (state) {
  this.updateUIClasses({ mouse: Constants.cursors.NONE });

  // Enable iteractions
  doubleClickZoom.enable(this);
  dragPan.enable(this);
  this.activateUIButton();

  // check to see if we've deleted this feature
  if (this.getFeature(state.rectangle.id) === undefined) return;

  //remove last added coordinate
  state.rectangle.removeCoordinate('0.5');
  if (state.rectangle.isValid()) {
    this.map.fire(Constants.events.CREATE, {
      features: [state.rectangle.toGeoJSON()],
    });
  } else {
    this.deleteFeature([state.rectangle.id], { silent: true });
    this.changeMode(Constants.modes.SIMPLE_SELECT, {}, { silent: true });
  }
};

DrawRectangle.onKeyUp = function (state, e) {
  if (CommonSelectors.isEscapeKey(e))
    if (this.escapeStopsDrawing) {
      this.deleteFeature([state.rectangle.id], { silent: true });
      this.changeMode(Constants.modes.SIMPLE_SELECT);
    } else if (CommonSelectors.isEnterKey(e)) {
      this.changeMode(Constants.modes.SIMPLE_SELECT, {
        featureIds: [state.rectangle.id],
      });
    }
};

DrawRectangle.onTrash = function (state) {
  this.deleteFeature([state.rectangle.id], { silent: true });
  this.changeMode(Constants.modes.SIMPLE_SELECT);
};

DrawRectangle.toDisplayFeatures = function (state, geojson, display) {
  const isActivePolygon = geojson.properties.id === state.rectangle.id;
  geojson.properties.active = isActivePolygon ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  if (!isActivePolygon) return display(geojson);

  if (geojson.geometry.coordinates.length === 0) return;
  const coordinateCount = geojson.geometry.coordinates[0].length;

  if (coordinateCount < 3) return;
  display(createVertex(state.rectangle.id, geojson.geometry.coordinates[0][0], '0.0', false));
  geojson.properties.meta = Constants.meta.FEATURE;

  if (!state.startPoint) return;
  return display(geojson);
};

export default DrawRectangle;
