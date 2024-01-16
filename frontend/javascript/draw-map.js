//let Stadtbezirk, Bezirksteile, Stadtvieltel;
//let mapdata;
let svg, g, projection, pathGenerator;
//const padding = 0;

let layers = {
    Stadtbezirk: { data: null, isVisible: true },
    Bezirksteile: { data: null, isVisible: false },
    Stadtvieltel: { data: null, isVisible: false }
};

async function initializeMap() {
    // Load geojson data
    layers.Stadtbezirk.data = await d3.json("./../geo-data/formatted-Stadtbezirk.geojson");
    layers.Bezirksteile.data = await d3.json("./../geo-data/formatted-Bezirksteile.geojson");
    layers.Stadtvieltel.data = await d3.json("./../geo-data/formatted-Stadtvieltel.geojson");

    // Setup event listeners for buttons
    document.getElementById("AB-1").addEventListener("click", () => toggleLayer('Stadtbezirk'));
    document.getElementById("AB-2").addEventListener("click", () => toggleLayer('Bezirksteile'));
    document.getElementById("AB-3").addEventListener("click", () => toggleLayer('Stadtvieltel'));

    // Initialize SVG, projection, etc.
    initializeSVG();

    // Draw the initial state of the map
    drawMap();
}

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

function drawMap() {
    const g = svg.select('.path-wrap');
    g.selectAll('*').remove(); // Clear existing layers

    Object.keys(layers).forEach(layerName => {
        if (layers[layerName].isVisible && layers[layerName].data) {
            let data = layers[layerName].data;
                    // Apply turf.rewind to each feature
            data.features = data.features.map(function (feature) {
                return turf.rewind(feature, { reverse: true });
            });

            projection.fitExtent([[0, 0], [window.innerWidth, window.innerHeight]], data);

            // Draw layer with specific style
            g.selectAll("path." + layerName)
                .data(data.features)
                .join("path")
                .attr("class", layerName)  // Assign class for styling
                .attr("d", pathGenerator)
                .attr("stroke-width", layerStyles[layerName].strokeWidth)
                .attr("stroke", layerStyles[layerName].strokeColor)
                .attr("fill", layerStyles[layerName].fillColor);
        }
    });
}

const layerStyles = {
    Stadtbezirk: { strokeWidth: 6, strokeColor: "#ff0000", fillColor: "none"},
    Bezirksteile: { strokeWidth: 3, strokeColor: "#00ff00", fillColor: "none" },
    Stadtvieltel: { strokeWidth: 1, strokeColor: "#0000ff", fillColor: "none" }
};

// Resize event listener
window.addEventListener("resize", () => {
    initializeSVG();
    drawMap();
});

// Initialize the map
initializeMap();