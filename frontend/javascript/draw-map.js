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
    document.getElementById("AB-4").addEventListener("click", () => toggleLayer('S-Bahn'));

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

function drawStops(stopsData) {
    const stopsGroup = svg.select('.path-wrap').append('g').attr("class", 'stops-wrap');

    stopsGroup.selectAll("circle")
        .data(stopsData)
        .join("circle")
        .attr("class", "stop-circle")
        .attr("cx", d => projection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0])
        .attr("cy", d => projection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1])
        .attr("r", 5)
        .attr("fill", "red");
/*     // Create a new group for stops
    const stopsGroup = svg.append('g').attr("class", 'stops-wrap');

    // Draw circles for each stop
    stopsGroup.selectAll("circle")
        .data(stopsData)
        .join("circle")
        .attr("class", "stop-circle")
        // .attr("cx", d => {
        //     const longitude = parseFloat(d.stop_lon);
        //     return projection(d[longitude, parseFloat(d.stop_lat)])[0];
        // })
        // .attr("cy", d => {
        //     const latitude = parseFloat(d.stop_lat);
        //     return projection([parseFloat(d.stop_lon), latitude])[1] ;
        // })
        .attr("cx", function(d) { 
            // console.log(parseFloat(d.Longitude)); 
            return parseFloat(d.Longitude * 50) })
        .attr("cy", function(d) { return parseFloat(d.Latitude) })
        .attr("r", 5) // Adjust the radius as needed
        .attr("fill", "red"); // Adjust the color as needed */
    
}


async function drawMap() {
    const g = svg.select('.path-wrap');
    g.selectAll('*').remove(); // Clear existing layers
    var selectedColumns = ["stop_name", "Longitude", "Latitude"];

    const stopsData = await d3.csv("./../stops_modified.csv").then(function(data) {
        // Create a new array with only the selected columns
        var selectedData = data.map(function(row) {
            var selectedRow = {};
            if (isNaN(parseFloat(row.Latitude)) && !(isNaN(parseFloat(row.Longitude)))){
                // console.log(row.Latitude)

                row.Latitude = row.Longitude;
                // delete row.Longitude;
                row.Longitude = row.location_type;
                // delete row.location_type;

                selectedColumns.forEach(function(column) {

                    selectedRow[column] = row[column];
                });

                
            } else if(isNaN(parseFloat(row.Latitude)) && isNaN(parseFloat(row.Longitude))){ 
                row.Latitude = row.location_type;
                // delete row.Longitude;
                row.Longitude = row.parent_station;
                // delete row.location_type;

                selectedColumns.forEach(function(column) {

                    selectedRow[column] = row[column];
                });
            }
            else{
                // console.log(row.Latitude)
                selectedColumns.forEach(function(column) {

                    selectedRow[column] = row[column];
                });
            }
            // selectedColumns.forEach(function(column) {

            //     selectedRow[column] = row[column];
            // });
            return selectedRow;
        });
    
        // Display the selected data in the console
        // console.log(selectedData);
    
        // Now you can use the 'selectedData' variable as needed in your code
        // For example, you can pass it to a function or perform further processing
        return selectedData;
    });
    
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
                .data(data.features || [])
                .join("path")
                .attr("class", layerName)  // Assign class for styling
                .attr("d", pathGenerator)
                .attr("stroke-width", layerStyles[layerName].strokeWidth)
                .attr("stroke", layerStyles[layerName].strokeColor)
                .attr("fill", layerStyles[layerName].fillColor)
                .on("click", onPolygonClick)
                .on("mouseout", function() {
                    document.getElementById('tooltip').style.visibility = 'hidden';
                });
        }
    });

    // Load stops data from the separate CSV file
    try {


                                
        console.log(stopsData); // Log stopsData to the console
        // var data = [{ x: 50, y: 50, radius: 20 }, { x: 150, y: 100, radius: 30 }];
        // console.log(data); // Log stopsData to the console

        // Draw stops on the map
        drawStops(stopsData);
    } catch (error) {
        console.error('Error loading stops data:', error);
    }

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
    Stadtvieltel: { strokeWidth: 1, strokeColor: "#0000ff", fillColor: "transparent" }
};

// Resize event listener
window.addEventListener("resize", () => {
    initializeSVG();
    drawMap();
});

// Initialize the map
initializeMap();