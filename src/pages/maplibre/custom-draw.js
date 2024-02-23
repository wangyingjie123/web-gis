export default class CustomDraw {
  constructor({ map, draw, drawType = 'single', exceedCallback, areaChangedCallback }) {
    this._map = map;
    this._draw = draw;
    this.drawType = drawType; // 默认单图形模式，即新画出新图形时清除之前画的图形
    this.points = [];
    this.exceedCallback = typeof exceedCallback === 'function' ? exceedCallback : function () {};
    this.areaChangedCallback = typeof areaChangedCallback === 'function' ? areaChangedCallback : function () {};
    if (this.drawType === 'view') {
      // view 仅查看模式，禁止编辑
      this.enableEdit(false);
    } else {
      this.enableEdit(true);
    }
  }
  initListener(cb) {
    this._map.on('draw.create', (e) => {
      if (typeof cb === 'function') {
        cb(e.features);
      }
    });
    this._map.on('draw.update', (e) => {
      if (typeof cb === 'function') {
        cb(e.features);
      }
    });

    this._map.on('draw.selectionchange', (e) => {
      this.points = e.points;
    });

    this._map.on('draw.modechange', (e) => {
      console.log(e.mode, 'modechange');
    });
  }

  // 进入矩形模式
  addRectangle(cb) {
    this.clearAll();
    this._draw.changeMode('draw_rectangle', {
      areaLimit: 2 * 1e6, // 5 km2, optional
      escapeKeyStopsDrawing: true, // default true
      allowCreateExceeded: false, // default false
      exceedCallsOnEachMove: false, // default false - calls exceedCallback on each mouse move
      exceedCallback: this.exceedCallback,
      areaChangedCallback: this.areaChangedCallback,
    });
    this.initListener(cb); // 创建监听，画完后获取图形的geojson数据
  }

  // 进入自由多边形模式
  addPolygon(cb) {
    this.clearAll();
    this._draw.changeMode('draw_polygon', {
      areaLimit: 2 * 1e6, // 5 km2, optional
      escapeKeyStopsDrawing: true, // default true
      allowCreateExceeded: false, // default false
      exceedCallsOnEachMove: false, // default false - calls exceedCallback on each mouse move
      exceedCallback: this.exceedCallback,
      areaChangedCallback: this.areaChangedCallback,
    });
    this.initListener(cb);
  }

  // 外部传入geojson并添加到地图上
  addGeoJson(json, cb) {
    this.clearAll();
    let featureIds = [];
    if (Array.isArray(json)) {
      json.forEach((item) => {
        featureIds = featureIds.concat(this._draw.add(item));
      });
    } else {
      featureIds = this._draw.add(json);
    }
    this.initListener(cb);
  }

  trash() {
    if (this.points.length > 0) {
      this._draw.trash();
      return;
    }
    const selected = this._draw.getSelected();
    if (selected.features.length === 0) {
      return;
    }
    this._draw.delete(selected.features[0].id);
  }

  // 控制是否可编辑
  enableEdit(enable) {
    if (enable) {
      this._draw.changeMode('simple_select', {
        featureIds: [],
      });
      this.drawType = 'single';
    } else {
      this._draw.changeMode('static');
      this.drawType = 'view';
    }
  }

  // 单图形模式画完一个要清除之前画出来的图形
  singleClear() {
    if (this.drawType === 'single') {
      const allFeatures = this._draw.getAll();

      // 设置要显示的最大要素数量
      const maxFeatures = 1;

      // 如果超过最大数量，删除最旧的要素
      if (allFeatures.features.length > maxFeatures) {
        var featuresToRemove = allFeatures.features.slice(0, allFeatures.features.length - maxFeatures);
        featuresToRemove.forEach((feature) => {
          this._draw.delete(feature.id);
        });
      }
    }
  }

  clearAll() {
    this._draw.deleteAll();
  }
}
