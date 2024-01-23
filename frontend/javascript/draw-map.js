let svg, g, projection, pathGenerator;

/* let showStops = false; // This variable will control the visibility of the stops
let showWC = false;
let showMaket = false; */

let layers = {
    Stadtbezirk: { data: null, isVisible: true },
    Bezirksteile: { data: null, isVisible: true },
    Stadtvieltel: { data: null, isVisible: true },
    Stop: { data: null, isVisible: false },
    WC: { data: null, isVisible: false },
    Market: { data: null, isVisible: false }
};

function convertStopsToGeoJSON(stopsData) {
    return {
        type: 'FeatureCollection',
        features: stopsData.map(d => ({
            type: 'Feature',
            properties: {name: d.stop_name}, // Add any relevant properties here
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(d.Longitude), parseFloat(d.Latitude)]
            }
        }))
    };
}

async function initializeMap() {
    // Load geojson data
    layers.Stadtbezirk.data = await d3.json("./../geo-data/formatted-Stadtbezirk.geojson");

    layers.Stadtbezirk.data.features = layers.Stadtbezirk.data.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });

    layers.Bezirksteile.data = await d3.json("./../geo-data/formatted-Bezirksteile.geojson");

    layers.Bezirksteile.data.features = layers.Bezirksteile.data.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });

    layers.Stadtvieltel.data = await d3.json("./../geo-data/formatted-Stadtvieltel.geojson");

    layers.Stadtvieltel.data.features = layers.Stadtvieltel.data.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });

    layers.WC.data = await d3.json("./../geo-data/formatted_wc.geojson");
    layers.Market.data = await d3.json("./../geo-data/formatted_market.geojson");
    layers.Stop.data = await d3.csv("./../m.csv");
}
    // var selectedColumns = ["stop_name", "Longitude", "Latitude"];
    // const Stopsdata = await d3.csv("./../stops_modified.csv").then(function(data) {
    //     // Create a new array with only the selected columns
    //     var selectedData = data.map(function(row) {
    //         var selectedRow = {};
    //         if (isNaN(parseFloat(row.Latitude)) && !(isNaN(parseFloat(row.Longitude)))){
    //             // console.log(row.Latitude)

    //             row.Latitude = row.Longitude;
    //             // delete row.Longitude;
    //             row.Longitude = row.location_type;
    //             // delete row.location_type;

    //             selectedColumns.forEach(function(column) {

    //                 selectedRow[column] = row[column];
    //             });

                
    //         } else if(isNaN(parseFloat(row.Latitude)) && isNaN(parseFloat(row.Longitude))){ 
    //             row.Latitude = row.location_type;
    //             // delete row.Longitude;
    //             row.Longitude = row.parent_station;
    //             // delete row.location_type;

    //             selectedColumns.forEach(function(column) {

    //                 selectedRow[column] = row[column];
    //             });
    //         }
    //         else{
    //             // console.log(row.Latitude)
    //             selectedColumns.forEach(function(column) {

    //                 selectedRow[column] = row[column];
    //             });
    //         }
    //         // selectedColumns.forEach(function(column) {

    //         //     selectedRow[column] = row[column];
    //         // });
    //         return selectedRow;
    //     });

    //     return selectedData;
    // });
    // //layers.Stop.data = convertStopsToGeoJSON(Stopsdata);
    // console.log(layers.Stop.data);

    // layers.Stop.data = convertStopsToGeoJSON(stopsData);

    // Setup event listeners for buttons
    document.getElementById("AB-1").addEventListener("click", () => toggleLayer('Stadtbezirk'));
    document.getElementById("AB-2").addEventListener("click", () => toggleLayer('Bezirksteile'));
    document.getElementById("AB-3").addEventListener("click", () => toggleLayer('Stadtvieltel'));
    document.getElementById("AB-4").addEventListener("click", () => toggleLayer('Stop'));
    document.getElementById("AB-5").addEventListener("click", () => toggleLayer('WC'));
    document.getElementById("AB-6").addEventListener("click", () => toggleLayer('Market'));
    

    // Initialize SVG, projection, etc.
    initializeSVG();

    // Draw the initial state of the map
    drawMap();
    


function toggleLayer(layerName) {
    layers[layerName].isVisible = !layers[layerName].isVisible;
    drawMap();
}

function initializeSVG() {
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight;

    svg = d3.select(".VisSVG")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    projection = d3.geoMercator();
    
    pathGenerator = d3.geoPath().projection(projection);

    svg.append('g').attr("class", 'path-wrap');

    // Define and apply zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", event => svg.select('.path-wrap').attr("transform", event.transform));
    svg.call(zoom);
}

async function drawMap() {
    const g = svg.select('.path-wrap');
    g.selectAll('*').remove(); // Clear existing layers
    
    Object.keys(layers).forEach(layerName => {
        if (layers[layerName].isVisible && layers[layerName].data) {
            let data = layers[layerName].data;
            console.log('Data for layer', layerName, data);     
            projection.fitExtent([[0, 0], [window.innerWidth, window.innerHeight]], layers.Stadtbezirk.data);   

            if (["Bezirksteile", "Stadtvieltel", "Stadtbezirk"].includes(layerName)) {
    
                g.selectAll("path." + layerName)
                    .data(data.features || [])
                    .join("path")
                    .attr("class", layerName)
                    .attr("d", pathGenerator)
                    .attr("stroke-width", layerStyles[layerName].strokeWidth)
                    .attr("stroke", layerStyles[layerName].strokeColor)
                    .attr("fill", layerStyles[layerName].fillColor)
                    .on("click", onPolygonClick)
                    .on("mouseout", function() {
                        document.getElementById('tooltip').style.visibility = 'hidden';
                    });
            } else if (["WC", "Market", "Stop"].includes(layerName)) {
                // Assuming these layers are point data and already in GeoJSON format
                g.selectAll("circle." + layerName)
                    .data(data.features || [])
                    .join("circle")
                    .attr("class", layerName)
                    .attr("cx", d => projection(d.geometry.coordinates)[0])
                    .attr("cy", d => projection(d.geometry.coordinates)[1])
                    .attr("r", 5) // Customize radius
                    .attr("fill", layerStyles[layerName].fillColor); // Customize fill color
            } 
        }

        if (layers["Stop"].isVisible && layers["Stop"].data) {
            g.selectAll("circle.stop")
                .data(layers.Stop.data)
                .join("circle")
                .attr("class", "stop")
                .attr("cx", d => {
                    if (!isNaN(+d.Longitude) && !isNaN(+d.Latitude)) {
                        return projection([+d.Longitude, +d.Latitude])[0];
                    }
                    return 0; // Default value in case of invalid data
                })
                .attr("cy", d => {
                    if (!isNaN(+d.Longitude) && !isNaN(+d.Latitude)) {
                        return projection([+d.Longitude, +d.Latitude])[1];
                    }
                    return 0; // Default value in case of invalid data
                })
                
                .attr("r", 5) // Customize radius
                .attr("fill", "red"); // Customize fill color
        }
        
    });
}

let isInfoEnabled = false; // Default state

function toggleInfo() {
    isInfoEnabled = !isInfoEnabled;
}

document.getElementById('infoToggle').addEventListener('change', function() {
    toggleInfo();
});

// Function to handle click event on a polygon
function onPolygonClick(event) {
    if (!isInfoEnabled) return;

    const d = d3.select(this).datum();
    const name = d.properties.name;
    const area = d.properties.flaeche_qm;

    let tooltipContent = '';

    if (name) { // Check if 'name' is defined and not null
        tooltipContent += `Name: ${name}<br>`; // Add 'Name' to the content
    }

    if (area) { // Similarly, you can check for 'area' if needed
        tooltipContent += `Area: ${area} sqm`;
    }

    // If both 'name' and 'area' are undefined, you could handle it, for example:
    if (!name && !area) {
        tooltipContent = 'No information available';
    }

    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = tooltipContent;
    tooltip.style.left = event.pageX + 'px'; // Position horizontally
    tooltip.style.top = event.pageY + 'px'; // Position vertically
    tooltip.style.visibility = 'visible';
}


const layerStyles = {
    Stadtbezirk: { strokeWidth: 6, strokeColor: "#ff0000", fillColor: "transparent"},
    Bezirksteile: { strokeWidth: 3, strokeColor: "#00ff00", fillColor: "transparent" },
    Stadtvieltel: { strokeWidth: 1, strokeColor: "#0000ff", fillColor: "transparent" },
    Stop: { strokeWidth: 1, strokeColor: "white", fillColor: "red" },
    WC: { strokeWidth: 1, strokeColor: "white", fillColor: "red" },
    Market: { strokeWidth: 1, strokeColor: "white", fillColor: "red" },
};

// Resize event listener
window.addEventListener("resize", () => {
    initializeSVG();
    drawMap();
});

// Initialize the map
initializeMap();