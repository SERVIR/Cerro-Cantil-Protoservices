let opacity_planet;
let opacity_nicfi;
let map;
let compare;
let csrftoken;

const fireLayersOn = [];

function toggle_layer(checked, which, isFire) {
    if (checked) {
        map.getPane(which).style.display = "block";
        if (isFire) {
            fireLayersOn.push(which);
        }
    } else {
        map.getPane(which).style.display = "none";
        if (isFire) {
            const index = fireLayersOn.indexOf(which);
            if (index !== -1) {
                // Name exists in the list, remove it
                fireLayersOn.splice(index, 1);
            }
        }
    }
    if (fireLayersOn.length > 0) {
        $("#footerDrawer .open").show();
        console.log("show");
    } else {
        $("#footerDrawer .open").hide();
        if ($('.footerDrawer .content').is(':visible')) {
            $('.footerDrawer .content').hide();
        }
    }
}

/**
 * adjustLayerIndex
 * adjusts the layer indexes to match the order in the layer manager
 */
function adjustLayerIndex() {
    let count = 200;
    const ol_layers_li = $("ol.layers li");
    for (let i = ol_layers_li.length; i > 0; i--) {
        if (map.getPane(ol_layers_li[i - 1].id.replace("_node", "_layer"))) {
            map.getPane(ol_layers_li[i - 1].id.replace("_node", "_layer")).style.zIndex = count;
            count++;
        }
    }
}

const overlayMaps = [];
$(function () {
    csrftoken = getCookie('csrftoken');
    opacity_planet = $('#opacity_planet');
    opacity_nicfi = $('#opacity_nicfi');
    map = L.map('map3', {
        zoomControl: true,
        fullscreenControl: true,
        maxBounds: [[16.124985029560996, -90.43945312500001], [15.677254358963596, -91.32385253906251]],
        minZoom: 11,
        center: [15.851173662653748, -90.9172296524048], zoom: 11
    });
    map.zoomControl.setPosition('topright');
    gSatLayer.addTo(map);
    map.createPane('cerro_cantil_layer');
    const cerro_cantil_layer = L.geoJSON(cerro_cantil, {fill: false, color: "#ffc0cb", pane: "cerro_cantil_layer"});
    cerro_cantil_layer.addTo(map);

    $("#cerro_cantil").change(function () {
        toggle_layer(this.checked, "cerro_cantil_layer");
    });

    overlayMaps.cerro_cantil = cerro_cantil_layer;

    map.createPane('santa_maria_layer');

    const santa_maria_layer = L.geoJSON(santa_maria, {fill: false, color: "#800080", pane: "santa_maria_layer"});
    santa_maria_layer.addTo(map);

    $("#santa_maria").change(function () {
        toggle_layer(this.checked, "santa_maria_layer");
    });

    overlayMaps.santa_maria = santa_maria_layer;

    let cam_areas_layer = null;
    // add_cam_areas();

    map.createPane('cam_areas_layer');
    cam_areas_layer = L.tileLayer.wms(
        "https://mapserverx.servirglobal.net/cgi-bin/cerro/?&crs=EPSG:3857",
        {
            layers: "cerro_cam",
            format: "image/png",
            transparent: true,
            styles: "",
            TILED: true,
            VERSION: "1.3.0",
            pane: "cam_areas_layer",

        }
    );
    cam_areas_layer.addTo(map);

    overlayMaps.cam_areas_layer = cam_areas_layer;
    $("#cam_areas").change(function () {
        toggle_layer(this.checked, "cam_areas_layer");
    });

    map.createPane('rivers_layer');

    const tzeja_river_layer = L.geoJSON(tzeja_river, {fill: false, color: "#1974fc", pane: "rivers_layer"});

    const yarcon_river_layer = L.geoJSON(yarcon_river, {fill: false, color: "#1974fc", pane: "rivers_layer"});

    const zoreco_river_layer = L.geoJSON(zoreco_river, {fill: false, color: "#1974fc", pane: "rivers_layer"});

    const pajuil_river_layer = L.geoJSON(pajuil_river, {fill: false, color: "#1974fc", pane: "rivers_layer"});

    const rivers = L.layerGroup([tzeja_river_layer, yarcon_river_layer, zoreco_river_layer, pajuil_river_layer]);
    rivers.my_id = "rivers";
    rivers.addTo(map);
    map.createPane('planet_layer');
    const planet_layer = L.tileLayer('/planet_proxy/?planet_url=https://tiles{s}.planet.com/data/v1/layers/' + planet_id + '/{z}/{x}/{y}', {
        pane: "planet_layer",
        subdomains: ["0", "1", "2", "3"]
    });

    planet_layer.addTo(map);
    map.getPane("planet_layer").style.display = "none";
    $("#planet").change(function () {
        toggle_layer(this.checked, "planet_layer");
    });

    // Code to add nicfi basemaps substitute YYYY-mm
    map.createPane('nicfi_layer');

    //start_mosaic

    const nicfi_layer = L.tileLayer('/nicfi_proxy/?nicfi_url=https://tiles0.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_' + $("#start_mosaic").val() + '_mosaic/gmap/{z}/{x}/{y}.png', {
        pane: "nicfi_layer",
        subdomains: ["0", "1", "2", "3"],
        attribution: "Planet, NICFI",
        id: "nicfi_layer"
    });

    nicfi_layer.addTo(map);
    map.getPane("nicfi_layer").style.display = "none";


    // map.createPane('nicfi_layer2');
    const nicfi_layer2 = L.tileLayer('/nicfi_proxy/?nicfi_url=https://tiles0.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_' + $("#end_mosaic").val() + '_mosaic/gmap/{z}/{x}/{y}.png', {
        pane: "nicfi_layer",
        subdomains: ["0", "1", "2", "3"],
        attribution: "Planet, NICFI",
        id: "nicfi_layer2"
    });

    nicfi_layer2.addTo(map);

    $("#nicfi").change(function () {
        toggle_layer(this.checked, "nicfi_layer");
        // toggle_layer(this.checked, "nicfi_layer2");
        if (compare && compare._map) {
            compare.remove();
        } else {
            compare = L.control.compare([nicfi_layer], [nicfi_layer2]).addTo(map);
        }
    });

    overlayMaps.rivers = rivers;
    $("#rivers").change(function () {
        toggle_layer(this.checked, "rivers_layer");
    });

    for (let j = 0; j < client_layers.length; j++) {
        const pane_name = client_layers[j].id.toString() + "_layer";
        map.createPane(pane_name);
        map.getPane(pane_name).style.display = "none";
        overlayMaps[client_layers[j].id] = L.tileLayer.wms(client_layers[j].url, {
            tileSize: 1024,
            layers: client_layers[j].layers,
            format: 'image/png',
            transparent: true,
            attribution: client_layers[j].attribution,
            size: "10,10",
            symbols: client_layers[j].layers.toLowerCase().includes("viirs") ? "triangle" : "circle",
            pane: pane_name,
        });
        overlayMaps[client_layers[j].id].addTo(map);
    }

    opacity_planet.on("input", function () {
        map.getPane("planet_layer").style.opacity = $(this).val();

    });

    opacity_nicfi.on("input", function () {
        map.getPane("nicfi_layer").style.opacity = $(this).val();

    });


// Add the Search Control to the map
    const search = new GeoSearch.GeoSearchControl({
        provider: new GeoSearch.OpenStreetMapProvider(),
        showMarker: false, // optional: true|false  - default true
        showPopup: false,
        position: 'topright',
        autoClose: true,
    });
    map.addControl(search);
    $(".leaflet-bar-timecontrol").css("margin-left", "50px");
    $('.leaflet-bar-timecontrol').css('display', 'inline');
    sortableLayerSetup();
    const button = document.getElementById("cam_areas");
    button.disabled = false;
    adjustLayerIndex();
    $('.footerDrawer .open').on('click', function () {
        var text = $('.footerDrawer .open').text();
        $('.footerDrawer .open').text(
            text == "Mostrar Gráfico" ? "Cerrar Gráfico" : "Mostrar Gráfico");
        // $('.footerDrawer .content').slideToggle(400, function(){
        //     window.dispatchEvent(new Event('resize'));
        // });
        toggleDrawer();
    });
    get_monthly_fires();
    if (window.innerWidth < 650) {
        closeNav();
    }
    resetHeight();
    layer_info("which");
    close_dialog();
});

function toggleDrawer() {
    if ($('.footerDrawer .content').is(':visible')) {
        $('.footerDrawer .content').hide();
    } else {
        $('.footerDrawer .content').show();
    }
}

function updateNICFI(mosaic, which) {
    // Assuming you have a Leaflet map named 'map'

    var nicfiLayer = null;
    map.eachLayer(function (layer) {
        if (layer.options && layer.options.id === which) {
            nicfiLayer = layer;
        }
    });

    if (nicfiLayer) {
        // Step 2: Update URL parameters
        var newUrlParams = "new_parameters_here";  // Replace with your new URL parameters
        nicfiLayer.setUrl('/nicfi_proxy/?nicfi_url=https://tiles0.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_' + mosaic + '_mosaic/gmap/{z}/{x}/{y}.png');

        // Step 3: Reload or refresh the layer
        nicfiLayer.redraw();  // This reloads the layer with the updated URL parameters

        var nicfiCheckbox = document.getElementById('nicfi');

        if (nicfiCheckbox && !nicfiCheckbox.checked) {
            nicfiCheckbox.checked = true;
            var event = new Event('change', {bubbles: true, cancelable: true});
            nicfiCheckbox.dispatchEvent(event);
        }
    }

}


function resetHeight() {
    // reset the body height to that of the inner browser
    if (/(iPhone|Android|BlackBerry|Windows Phone)/i.test(navigator.userAgent)) {
        document.body.style.height = (window.innerHeight - 50) + "px";
        if (document.getElementById("wrapper").style.height < window.innerHeight) {
            document.getElementById("wrapper").style.height = (window.innerHeight - 50) + "px";
        }
        const element = document.getElementById('wrapper');
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const offsetFromBottom = viewportHeight - rect.bottom;
        const drawerOffset = 58 + offsetFromBottom;

        const footer = document.getElementById('footerDrawer');
        const footerRect = footer.getBoundingClientRect();
        const footerOffset = viewportHeight - footerRect.bottom;

        if (footerOffset < 0) {
            $(".footerDrawer").css("bottom", drawerOffset + "px");
        }

        const map3 = document.getElementById('map3');
        if (/(iPhone)/i.test(navigator.userAgent)) {
            $(map3).height("calc(100svh - 186px)");
            $(".footerDrawer").css("bottom", (drawerOffset + 25) + "px");
        } else {
            // $(map3).height("calc(100svh - 242px)");
        }
    }

}

// reset the height whenever the window's resized
window.addEventListener("resize", resetHeight);

// called to initially set the height.

function sortableLayerSetup() {
    $("ol.layers").sortable({
        handle: ".rst__moveHandle",
        pullPlaceholder: true,
        ghostClass: "sortable-ghost",
        animation: 150,
        easing: "cubic-bezier(1, 0, 0, 1)",
        filter: ".opacity-control",
        preventOnFilter: false,
        onEnd: function ($item, container, _super) {
            adjustLayerIndex();
        },
        onChange: function () {
            adjustLayerIndex();
        },
    });
}

// Remove all basemap layers from the map
removeLayers = function () {
    satellite.remove();
    osm.remove();
    OpenTopoMap.remove();
    terrainLayer.remove();
    deLormeLayer.remove();
    gSatLayer.remove();
};
// Add selected basemap layer to the map
add_basemap = function (map_name) {
    removeLayers();
    switch (map_name) {
        case "osm":
            osm.addTo(map);
            break;
        case "delorme":
            deLormeLayer.addTo(map);
            break;
        case "satellite":
            satellite.addTo(map);
            break;
        case "terrain":
            terrainLayer.addTo(map);
            break;
        case "topo":
            OpenTopoMap.addTo(map);
            break;
        case "gsatellite":
            gSatLayer.addTo(map);
            break;
        default:
            osm.addTo(map);

    }
};

// Add legend to the map for CHIRPS
function add_legend_fixed_size(dataset, wms, variable, colorscalerange, palette, element) {
    if (variable === "") {
        $.ajax({
            url: wms + "/legend?f=json",
            type: "GET",
            async: true,
            crossDomain: true
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.warn(jqXHR + textStatus + errorThrown);
        }).done(function (data, _textStatus, _jqXHR) {
            if (data.errMsg) {
                console.info(data.errMsg);
            } else {
                add_other_legend(data, dataset, wms);
            }
        });
    } else {
        const legend = L.control({});
        const link = wms + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=" + variable + "&colorscalerange=" + colorscalerange + "&PALETTE=" + palette + "&transparent=TRUE";
        legend.onAdd = function () {
            const src = link;
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML +=
                '<img src="' + src + '" alt="legend">';
            div.id = "legend_" + dataset;
            div.className = "thredds-legend";
            return div;
        };
        legend.addTo(map);
        set_parent(legend, element);
    }
}

// Remove legend from the map
function remove_legend_fixed_size(val) {
    document.getElementById("legend_" + val).remove();
}

// Add legend to the map
function add_other_legend(response, dataset, base_service_url) {
    let htmlString = "<table>";
    for (var iCnt = 0; iCnt < response.layers.length; iCnt++) {
        lyr = response.layers[iCnt];
        if (lyr.layerId === 3) {
            if (lyr.legend.length > 1) {
                htmlString += "<tr><td colspan='2' style='font-weight:bold;'>" + dataset + "</td></tr>";
                for (let jCnt = 0; jCnt < lyr.legend.length; jCnt++) {
                    const src = base_service_url + "/" + lyr.layerId + "/images/" + lyr.legend[jCnt].url;
                    const strlbl = lyr.legend[jCnt].label.replace("<Null>", "Null");
                    htmlString += "<tr><td><img src=\"" + src + "\" alt ='' /></td><td>" + strlbl + "</td></tr>";
                }
            } else {
                htmlString += "<tr><td colspan='2' class='tdLayerHeader' style='font-weight:bold;'>" + dataset + "</td></tr>";
                const img_src = base_service_url + "/" + lyr.layerId + "/images/" + lyr.legend[0].url;
                htmlString += "<tr><td colspan='2' ><img src=\"" + img_src + "\" alt ='' /></td></tr>";
            }
        }
    }
    htmlString += "</table>";
    const div = document.createElement('div');
    div.innerHTML += htmlString;
    div.id = "legend_" + dataset;
    div.className = "arcgis-legend";
    document.getElementById("legend_full_" + dataset).appendChild(div);

    window.dispatchEvent(new Event('resize'));

}

function fireResize(target_width) {
    if ($("#mySidenav").width() !== target_width) {
        setTimeout(function () {
            fireResize(target_width);
        }, 250);
    }
    window.dispatchEvent(new Event('resize'));
}

// Expand the sidebar when the user clicks the three line button on the top left
function openNav() {
    $("#mySidenav").addClass("open");
    $("#nav_opener").hide();
    $(".leaflet-bar-timecontrol").css("margin-left", "370px");
    $('.leaflet-bar-timecontrol').css('display', 'flex');
    $('.footerDrawer').css('width', 'calc(100% - 357px)');

    // set timeout to check if width has reached 350, then dispatch
    fireResize(350);

}

// Collapse the sidebar when the user clicks close button on top of the sidebar
function closeNav() {
    $("#mySidenav").removeClass("open");
    $("#nav_opener").show();
    $(".leaflet-bar-timecontrol").css("margin-left", "50px");
    $('.leaflet-bar-timecontrol').css('display', 'inline');
    $('.footerDrawer').css('width', 'calc(100% - 7px)');
    fireResize(0);
}

function get_local_fires() {
    $.ajax({
        type: "GET",
        url: "/firebox/",
        success: function (data) {
            console.log(data);
        },
        error: function (error) {
            console.log("error: " + error);
        }
    });
}

var debug_data;
let compiledData;

function get_monthly_fires() {
    const bounds = map.getBounds();
    let formData = new FormData();
    formData.append("sw_lng", bounds._southWest.lng);
    formData.append("sw_lat", bounds._southWest.lat);
    formData.append("ne_lng", bounds._northEast.lng);
    formData.append("ne_lat", bounds._northEast.lat);
    // alert(document.cookie);
    // alert(csrftoken);
    compiledData = [];
    $.ajax({
        url: "/monthlyfire/",
        type: "POST",
        headers: {'X-CSRFToken': csrftoken},
        processData: false,
        contentType: false,
        async: true,
        crossDomain: true,
        data: formData,
        success: function (data) {
            try {
                // alert("building");
                debug_data = data;
                data.forEach((d) => {
                    const darray = [];
                    darray.push(Date.parse(d.month));
                    darray.push(d.total_fires);
                    compiledData.push(darray);
                });

                fire_chart(compiledData);
                // alert("done");
            } catch (e) {
                alert(e);
            }
        },
        error: function (error) {
            alert("ajax error: " + error.responseText);
            console.log("error: " + error);
        }
    });
}

function fire_chart(compiled_series) {

    let chart_obj = {};
    chart_obj.title = {
        text: "puntos de calor históricos"
    };

    chart_obj.caption = {
        verticalAlign: 'top',
        useHTML: true,
        style: {
            'padding-bottom': '10px'
        },
        text: 'Este gráfico muestra todos los puntos de calor detectados empezando en el año 2001 hasta el año actual. El número de puntos de calor detectados depende del nivel de zoom del mapa, porque el gráfico toma en cuenta solamente el área que podemos ver en la pantalla. Cambie el nivel de zoom para ver cómo afecta el número total de puntos de calor durante un mes. ',
    };

    chart_obj.subtitle = {
        text: 'Source: FIRMS'
    };
    chart_obj.xAxis = {type: "datetime"};
    chart_obj.yAxis = {
        id: "simple",
        title: {
            text: "Hotspots"
        }
    };

    // if (yAxis_format) {
    //     chart_obj.yAxis.labels = yAxis_format;
    // }

    chart_obj.legend = {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    };

    chart_obj.plotOptions = {
        series: {
            connectNulls: false,
            marker: {
                radius: 3,
                fillColor: "#758055",
                states: {
                    hover: {
                        fillColor: '#758055',
                    },
                    halo: {
                        fillColor: '#758055',
                    }
                },
            },
            lineWidth: 2,
            states: {
                hover: {
                    lineWidth: 2
                },
                halo: {
                    fillColor: '#758055',
                }
            },
            threshold: null,
            allowPointSelect: true,
            point: {
                events: {
                    select: function (e) {
                        const full = new Date(e.target.x);
                        const date = full.getFullYear() + "-" + (full.getMonth() + 1) + "-" + full.getDate();
                        // maybe set current time for layers to this date
                        console.log(date);
                    }
                }
            }
        }
    };

    chart_obj.chart = {
        zoomType: 'xy',
        events: {
            redraw: function () {
                try {
                    img.translate(
                        this.chartWidth - originalWidth,
                        this.chartHeight - originalHeight
                    );
                } catch (e) {
                }
            }
        }
    };
    chart_obj.series = [{
        color: "#758055",
        type: "column",
        name: "Hotspots",
        data: compiled_series.sort((a, b) => a[0] - b[0])
    }];

    chart_obj.tooltip = {
        pointFormat: "Value: {point.y:.2f} Hotspots",
        borderColor: "#758055",
    };

    chart_obj.responsive = {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    };

    multiChart = Highcharts.chart('chart_holder', chart_obj, function (chart) { // on complete
        originalWidth = chart.chartWidth;
        originalHeight = chart.chartHeight;
        const width = chart.chartWidth - 105;
        const height = chart.chartHeight - 160;
        img = chart.renderer
            .image('https://climateserv.servirglobal.net/static/frontend/img/Servir_Logo_Flat_Color_Stacked_Small.png',
                5,
                5,
                50,
                41)
            .add();
    });
}

function getFireCount(typeName, label) {
    const wfsUrl = 'https://firms.modaps.eosdis.nasa.gov/mapserver/wfs/Central_America/e502b2eac7439d4b91948636161b8de0/?';
    let firstType = "";
    let secondType = null;

    const bounds = map.getBounds();
    const bbox = bounds.getSouth().toString() + "," + bounds.getWest().toString() + "," + bounds.getNorth().toString() + "," + bounds.getEast().toString();
    if (typeName.includes(",")) {
        const multiTpyes = typeName.split(",");
        firstType = multiTpyes[0];
        secondType = multiTpyes[1];
    } else {
        firstType = typeName;
    }
    $.ajax({
        type: "GET",
        url: wfsUrl,
        secondType: secondType,
        data: {
            "service": "WFS",
            "version": "2.0.0",
            "request": "GetFeature",
            "typeNames": firstType, //"ms:fires_modis_7days",
            "OUTPUTFORMAT": "application/json",
            // "filter": "BBOX(the_geom, 123, 456, 789, 1011)",
            "srs": "EPSG:4326",
            "srsName": "EPSG:4326",
            "bbox": bbox,
        },
        success: function (data) {
            if (secondType) {
                $.ajax({
                    type: "GET",
                    url: wfsUrl,
                    firstCount: data.features.length,
                    data: {
                        "service": "WFS",
                        "version": "2.0.0",
                        "request": "GetFeature",
                        "typeNames": secondType, //"ms:fires_modis_7days",
                        "OUTPUTFORMAT": "application/json",
                        // "filter": "BBOX(the_geom, 123, 456, 789, 1011)",
                        "srs": "EPSG:4326",
                        "srsName": "EPSG:4326",
                        "bbox": bbox,
                    },
                    success: function (data) {
                        $("#" + label).text(data.features.length + this.firstCount);
                    },
                    error: function (error) {
                        console.log("error: " + error);
                    }
                });
            } else {
                $("#" + label).text(data.features.length);
            }
        },
        error: function (error) {
            console.log("error: " + error);
        }
    });
}

$('#modal-content').click(function (event) {
    console.log("stop it");
    event.stopPropagation();
    return false;
});

function openAttribution() {
    $("#modalAttribution").html($(".leaflet-control-attribution.leaflet-control").html());
    // $("#modalAttribution").text(attribution);
    var modal = $("#myModal");
    modal.modal({
        keyboard: true
    });
    modal.modal('show');
}

function closeAttribution() {
    // $("#myModal").css("display", "none");
    $("#myModal").modal('hide');
}

function close_dialog() {
    const dialog = $("#dialog");
    if (dialog.dialog()) {
        dialog.dialog("close");
    }
}

/**
 * stats_info
 * Framework for the statistical query info box
 * @param which type of information requested
 */
function layer_info(which) {
    close_dialog();

    const foundObject = info_builder.find(obj => obj.id === which);

    const title = foundObject ? foundObject.Title : which;
    let layer_info = '<div style="font-size:unset; width:100%; height:100%; display: flex;' +
        '    align-items: center;' +
        '}">';
    layer_info += '<div style="width:100%; text-align: left;">';
    layer_info += foundObject ? foundObject.Description : get_layer_body(which);
    layer_info += '</div>';
    const dialog = $("#dialog");
    dialog.html(layer_info);
    // const the_width = $(window).width() < 500 ? $(window).width() + "px" : "500px";
    dialog.dialog({
        title: title,
        resizable: false,
        width: '500px',
        height: 'auto',
        position: {
            my: "center",
            at: "center",
            of: window
        },
        open: function () {
            console.log("open");
            $(this).dialog('option', 'maxHeight', $(window).height());
            if ($(this).width() > $(window).width()) {
                $(this).dialog('option', 'width', $(window).width());
            }

        }
    });

    $(".ui-dialog-titlebar-close").css("border", "none");
}

function get_layer_body(which) {
    return "description about " + which + " will be here";
}


let info_builder = [{
    id: "cerro_cantil",
    Title: "Cerro Cantil  (Fuente: La comunidad de Santa María Tzejá)",
    Description: "El polígono del Área Natural Cerro Cantil facilitado por la comunidad de Santa María Tzejá"
}, {
    id: "santa_maria",
    Title: "Santa María Tzejá (Fuente: La comunidad de Santa María Tzejá)\n",
    Description: "El polígono de los límites de Santa María Tzejá facilitado por la comunidad de Santa María Tzejá"
}, {
    id: "cam_areas",
    Title: "Áreas Protegidas Centroamericanas (Fuente: WDPA)\n",
    Description: "La Base de Datos Global de Áreas Protegidas (WDPA en inglés) es la base de datos mundial más comprensiva de áreas marinas y terrestres protegidas. Es un proyecto en conjunto entre el Programa de las Naciones Unidas para el Medio Ambiente (UNEP en inglés) y la Unión Internacional para la Conservación de la Naturaleza (IUCN en inglés), y es gestionado por el Centro de Monitoreo de la Conservación del Ambiente de las Naciones Unidas (UNEP-WCMC en inglés) en colaboración con varios gobiernos, organizaciones no gubernamentales, la academia y el sector industrial. \n"
}, {
    id: "rivers",
    Title: "Ríos Santa María Tzejá",
    Description: "Ríos Santa María Tzejá"
}, {
    id: "Planet",
    Title: "Imágenes diarias de Planet (Fuente: Planet Labs Inc.)",
    Description: "Planet Labs provee imágenes diarias de aproximadamente 5 metros de resolución. La ventaja de tener acceso a imágenes diarias es la continuidad de información, pero estas imágenes también pueden ser afectadas por la nubosidad."
}, {
    id: "NICFI",
    Title: "Mosaicos mensuales Planet NICFI (Fuente: Planet Labs Inc.)",
    Description: "Un mosaico mensual de imágenes es una combinación de las mejores observaciones de todas las imágenes disponibles durante un mes. Estas imágenes han sido corregidas para reducir el impacto de nubes, para facilitar el análisis entre meses. El acceso a estos mosaicos es gracias al financiamiento de la Iniciativa Internacional de Clima y Bosques de Noruega (Norway’s International Climate & Forests Initiative). "
}];