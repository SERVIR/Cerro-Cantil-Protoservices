let mapWasDragEnabled;
let mapWasTapEnabled;

// Leaflet v0.7 backwards compatibility
function on(el, types, fn, context) {
    types.split(" ").forEach(type => {
        L.DomEvent.on(el, type, fn, context);
    });
}

// Leaflet v0.7 backwards compatibility
function off(el, types, fn, context) {
    types.split(" ").forEach(type => {
        L.DomEvent.off(el, type, fn, context);
    });
}

function getRangeEvent(rangeInput) {
    return "oninput" in rangeInput ? "input" : "change";
}

function cancelMapDrag() {
    mapWasDragEnabled = map.dragging.enabled();
    mapWasTapEnabled = map.tap && map.tap.enabled();
    map.dragging.disable();
    map.tap && map.tap.disable();
}

function uncancelMapDrag(e) {
    map.getContainer().focus();
    if (mapWasDragEnabled) {
        map.dragging.enable();
    }
    if (mapWasTapEnabled) {
        map.tap.enable();
    }
}

// convert arg to an array - returns empty array if arg is undefined
function asArray(arg) {
    if (typeof arg === "undefined") {
        return [];
    }
    if (Array.isArray(arg)) {
        return arg;
    }
    return [arg];
}

L.Control.Compare = L.Control.extend({
    options: {
        thumbSize: 42,
        padding: 0,
        position: 0.5,
    },

    initialize(leftLayers, rightLayers, options) {
        this._leftLayers = asArray(leftLayers);
        this._rightLayers = asArray(rightLayers);
        this._updateClip();
        L.setOptions(this, options);
    },

    getPosition() {
        const rangeValue = this._range.value;
        const offset =
            (0.5 - rangeValue) *
            (2 * this.options.padding + this.options.thumbSize);
        return map.getSize().x * rangeValue + offset;
    },

    setPosition(offset) {
        if (!this._map) {
            return this;
        }
        this._range.value = offset;
        this._updateClip();
        return this;
    },

    includes: L.Evented.prototype,

    addTo(map) {
        this.remove();
        this._map = map;
        this._container = L.DomUtil.create(
            "div",
            "leaflet-sbs",
            // eslint-disable-next-line no-underscore-dangle
            map._controlContainer,
        );
        this._divider = L.DomUtil.create(
            "div",
            "leaflet-sbs-divider",
            this._container,
        );
        this._range = L.DomUtil.create(
            "input",
            "leaflet-sbs-range",
            this._container,
        );
        this._range.type = "range";
        this._range.min = 0;
        this._range.max = 1;
        this._range.step = "any";
        this._range.value = 0.5;
        // eslint-disable-next-line no-multi-assign
        this._range.style.paddingLeft = this._range.style.paddingRight = `${this.options.padding}px`;
        this._addEvents();
        this._updateClip();
        if (this.options.position) {
            this.setPosition(this.options.position);
        }
        return this;
    },

    remove() {
        if (!this._map) {
            return this;
        }
        this._leftLayers.forEach(leftLayer => {
            if (leftLayer.getContainer) {
                leftLayer.getContainer().style.clip = "";
            } else {
                leftLayer.getPane().style.clip = "";
            }
        });

        this._rightLayers.forEach(rightLayer => {
            if (rightLayer.getContainer) {
                rightLayer.getContainer().style.clip = "";
            } else {
                rightLayer.getPane().style.clip = "";
            }
        });
        this._removeEvents();
        L.DomUtil.remove(this._container);
        this._map = null;
        return this;
    },

    _updateClip() {
        if (!this._map) {
            return this;
        }
        const nw = map.containerPointToLayerPoint([0, 0]);
        const se = map.containerPointToLayerPoint(map.getSize());
        const clipX = nw.x + this.getPosition();
        const dividerX = this.getPosition();
        this._divider.style.left = `${dividerX}px`;
        this.fire("dividermove", {x: dividerX});
        const clipLeft = `rect(${[nw.y, clipX, se.y, nw.x].join("px,")}px)`;
        const clipRight = `rect(${[nw.y, se.x, se.y, clipX].join("px,")}px)`;

        this._leftLayers.forEach(leftLayer => {
            if (leftLayer.getContainer) {
                leftLayer.getContainer().style.clip = clipLeft;
            } else {
                leftLayer.getPane().style.clip = clipLeft;
            }
        });

        this._rightLayers.forEach(rightLayer => {
            if (rightLayer.getContainer) {
                rightLayer.getContainer().style.clip = clipRight;
            } else {
                rightLayer.getPane().style.clip = clipRight;
            }
        });
        return this;
    },

    _addEvents() {
        const range = this._range;
        const comp = this;
        /*const map = this._map;*/
        if (!map || !range) return;
        map.on("move", function () {
                try {
                    comp._updateClip();
                } catch (e) {
                }
            }
        );
        map.on("layeradd", function () {
                try {
                    comp._updateLayers();
                } catch (e) {
                }
            }
        );

        map.on("layerremove", function () {
            comp._updateLayers();
        });

        $(".leaflet-sbs-range").on("input", function () {
            comp._updateClip();
        });

        $(".leaflet-sbs-range").on('touchstart', function () {
            cancelMapDrag();
            comp._updateClip();
        });
        $(".leaflet-sbs-range").on('mousedown', function () {
            cancelMapDrag();
            comp._updateClip();
        });

        $(".leaflet-sbs-range").on('touchend', function () {
            comp._updateClip();
            uncancelMapDrag();
        });
        $(".leaflet-sbs-range").on('mouseup', function () {
            comp._updateClip();
            uncancelMapDrag();
        });
    },

    _removeEvents() {
        const range = this._range;
        const map = this._map;
        if (range) {
            off(range, getRangeEvent(range), this._updateClip, this);
            off(
                range,
                L.Browser.touch ? "touchstart" : "mousedown",
                cancelMapDrag,
                this,
            );
            off(
                range,
                L.Browser.touch ? "touchend" : "mouseup",
                uncancelMapDrag,
                this,
            );
        }
        if (map) {
            map.off("layeradd layerremove", this._updateLayers, this);
            map.off("move", this._updateClip, this);
        }
    },
});

L.control.compare = function (leftLayers, rightLayers, options) {
    return new L.Control.Compare(leftLayers, rightLayers, options);
};