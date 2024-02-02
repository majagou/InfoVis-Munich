let svg, g, projection, pathGenerator;

let layers = {
    Stadtbezirk: { data: null, isVisible: true },
    Bezirksteile: { data: null, isVisible: false },
    Stadtvieltel: { data: null, isVisible: false },
    Stop: { data: null, isVisible: false },
    WC: { data: null, isVisible: false },
    Market: { data: null, isVisible: false },
    Mobile: { data: null, isVisible: false },
    MainStation: { data: null, isVisible: false }
};

const iconSize = 35;
const SiconSize = 20;

schemes = [
    {
      name: "RdBu", 
      colors: [
        "#e8e8e8", "#e4acac", "#c85a5a",
        "#b0d5df", "#ad9ea5", "#985356",
        "#64acbe", "#627f8c", "#574249"
      ]
    },
    {
      name: "BuPu", 
      colors: [
        "#e8e8e8", "#ace4e4", "#5ac8c8",
        "#dfb0d6", "#a5add3", "#5698b9", 
        "#be64ac", "#8c62aa", "#3b4994"
      ]
    },
    {
      name: "GnBu", 
      colors: [
        "#e8e8e8", "#b5c0da", "#6c83b5",
        "#b8d6be", "#90b2b3", "#567994",
        "#73ae80", "#5a9178", "#2a5a5b"
      ]
    },
    {
      name: "PuOr", 
      colors: [
        "#e8e8e8", "#e4d9ac", "#c8b35a",
        "#cbb8d7", "#c8ada0", "#af8e53",
        "#9972af", "#976b82", "#804d36"
      ]
    }
]

let selectedScheme = schemes.find(scheme => scheme.name === "PuOr").colors;

// Thresholds for population categories(Based on the top and bottom value)
const populationThresholds = [59181, 89376];

// Thresholds for population density categories(Based on the top and bottom value)
const densityThresholds = [6313, 11022];

const svgWidth = window.innerWidth;
const svgHeight = window.innerHeight;

const k = 0.04*svgHeight; // Size of each square in the legend
const n = 3; // Number of categories (low, medium, high)
const labels = ["Low", "Medium", "High"]; // Labels for categories
const colors = [
    "#9972af", "#976b82", "#804d36",
    "#cbb8d7", "#c8ada0", "#af8e53",
    "#e8e8e8", "#e4d9ac", "#c8b35a"
  ];

function convertStopsToGeoJSON(Data) {
    return {
        type: 'FeatureCollection',
        features: Data.map(d => ({
            type: 'Feature',
            properties: { name: d.stop_name, id: d.HstNummer }, // Adjust the property name if needed
            geometry: {
                type: 'Point',
                coordinates: [
                    parseFloat(d.Longitude.replace(',', '.')), 
                    parseFloat(d.Latitude.replace(',', '.'))
                ]
            }
        }))
    };
}

async function initializeMap() {
    // Load geojson data
    layers.Stadtbezirk.data = await d3.json("./../frontend/geo-data/formatted-Stadtbezirk.geojson");

    layers.Stadtbezirk.data.features = layers.Stadtbezirk.data.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });

    layers.Bezirksteile.data = await d3.json("./../frontend/geo-data/formatted-Bezirksteile.geojson");

    layers.Bezirksteile.data.features = layers.Bezirksteile.data.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });

    layers.Stadtvieltel.data = await d3.json("./../frontend/geo-data/formatted-Stadtvieltel.geojson");

    layers.Stadtvieltel.data.features = layers.Stadtvieltel.data.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });

    layers.WC.data = await d3.json("./../frontend/geo-data/formatted_wc.geojson");
    layers.Market.data = await d3.json("./../frontend/geo-data/formatted_market.geojson");
    const Stopdata = await d3.dsv(";", "./../frontend/csv-data/m.csv");
    //console.log(Stopdata)
    layers.Stop.data = convertStopsToGeoJSON(Stopdata);
    //console.log(layers.Stop.data);

    layers.Mobile.data = await d3.json("./../frontend/geo-data/Mobilitat.geojson")
    layers.MainStation.data = await d3.json("./../frontend/geo-data/TrafficStation.geojson")

    // Setup event listeners for buttons
    document.getElementById("AB-1").addEventListener("click", () => toggleLayer('Stadtbezirk'));
    document.getElementById("AB-2").addEventListener("click", () => toggleLayer('Bezirksteile'));
    document.getElementById("AB-3").addEventListener("click", () => toggleLayer('Stadtvieltel'));
    document.getElementById("AB-4").addEventListener("click", () => toggleLayer('Stop'));
    document.getElementById("AB-5").addEventListener("click", () => toggleLayer('WC'));
    document.getElementById("AB-6").addEventListener("click", () => toggleLayer('Market'));
    document.getElementById("AB-7").addEventListener("click", () => toggleLayer('Mobile'));
    document.getElementById("AB-8").addEventListener("click", () => toggleLayer('MainStation'));
    
    const populationData = await d3.csv("./../frontend/csv-data/Bevölkerungsdichte.csv");

    const totalPopulation = 1588330; // Total population for percentage calculation

    layers.Stadtbezirk.data.features.forEach(feature => {
        const populationInfo = populationData.find(pd => pd.id === feature.properties.sb_nummer);
    
        if (populationInfo) {
            // Population
            feature.properties.population = parseFloat(populationInfo["Basiswert.1"]);
    
            // Population Density
            feature.properties.populationDensity = parseFloat(populationInfo.Indikatorwert);
    
            // Population Percentage (relative to total population)
            feature.properties.populationPercentage = (feature.properties.population / totalPopulation) * 100;
        } else {
            // Handle the case where no matching data is found
            feature.properties.population = 0;
            feature.properties.populationDensity = 0;
            feature.properties.populationPercentage = 0;
        }
    });
    

    // Initialize SVG, projection, etc.
    initializeSVG();

    createLegend(d3.select("svg"));

    // Draw the initial state of the map
    drawMap();

}

function getPopulationCategory(population) {
    if (population <= populationThresholds[0]) {
        return 0; // Low
    } else if (population <= populationThresholds[1]) {
        return 1; // Medium
    } else {
        return 2; // High
    }
}

function getDensityCategory(density) {
    if (density <= densityThresholds[0]) {
        return 0; // Low
    } else if (density <= densityThresholds[1]) {
        return 1; // Medium
    } else {
        return 2; // High
    }
}

function toggleLayer(layerName) {
    layers[layerName].isVisible = !layers[layerName].isVisible;
    drawMap();
}

function zoomed(event) {
    // Current zoom level
    const zoomLevel = event.transform.k;

    // Calculate new icon sizes inversely with the zoom level
    const newIconSize = iconSize / zoomLevel;
    const newSIconSize = SiconSize / zoomLevel;

    // Update the width and height attributes of the icons
    svg.selectAll("image.WC")
    .attr("width", newIconSize)
    .attr("height", newIconSize);

    svg.selectAll("image.Market")
    .attr("width", newIconSize)
    .attr("height", newIconSize);

    svg.selectAll("image.Mobile")
    .attr("width", newIconSize)
    .attr("height", newIconSize);

    svg.selectAll("image.MainStation")
       .attr("width", newIconSize)
       .attr("height", newIconSize);

    svg.selectAll("image.Stop")
       .attr("width", newSIconSize)
       .attr("height", newSIconSize);

    // Apply the zoom transformation to the zoomable group
    svg.select('.path-wrap').attr("transform", event.transform);
}

function initializeSVG() {

    svg = d3.select(".VisSVG")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    projection = d3.geoMercator();
    
    pathGenerator = d3.geoPath().projection(projection);

    svg.append('g').attr("class", 'path-wrap');

    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);
}

function createLegend(svg) {
    const arrow = svg.append("defs").append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", "5")
      .attr("refY", "5")
      .attr("markerWidth", "6")
      .attr("markerHeight", "6")
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "black");
  
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", "14")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${0.2*svgWidth}, ${0.8*svgHeight})`);
  
    // Draw the color squares
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        legend.append("rect")
          .attr("width", k)
          .attr("height", k)
          .attr("x", i * k)
          .attr("y", j * k)
          .attr("fill", colors[j * n + i]);
      }
    }
  
    // Add arrows
    legend.append("line")
      .attr("x1", 0)
      .attr("y1", n * k)
      .attr("x2", n * k)
      .attr("y2", n * k)
      .attr("stroke", "#051747")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");
  
    legend.append("line")
      .attr("x2", 0)
      .attr("y2", 0)
      .attr("x1", 0)
      .attr("y1", n * k)
      .attr("stroke", "#051747")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");
  
    // Add axis labels
    legend.append("text")
      .attr("transform", `translate(${-k / 2},${n * k / 2}) rotate(-90)`)
      .attr("fill", "#051747")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Population");
  
    legend.append("text")
      .attr("transform", `translate(${n * k / 2},${n * k + 20})`)
      .attr("fill", "#051747")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Population Density");
}  

async function drawMap() {
    const g = svg.select('.path-wrap');
    g.selectAll('*').remove(); // Clear existing layers

    Object.keys(layers).forEach(layerName => {
        if (layers[layerName].isVisible && layers[layerName].data) {
            let data = layers[layerName].data;
    
            projection.fitExtent([[0, 0], [window.innerWidth, window.innerHeight]], layers.Stadtbezirk.data);   

            if (["Bezirksteile", "Stadtvieltel"].includes(layerName)) {
    
                g.selectAll("path." + layerName)
                    .data(data.features || [])
                    .join("path")
                    .attr("class", layerName)
                    .attr("d", pathGenerator)
                    .attr("stroke-width", layerStyles[layerName].strokeWidth)
                    .attr("stroke", layerStyles[layerName].strokeColor)
                    .attr("fill", layerStyles[layerName].fillColor)
            } else if (layerName === "Stadtbezirk") {

                // Draw Stadtbezirk and add hover event listeners
                g.selectAll("path." + layerName)
                    .data(data.features || [])
                    .join("path")
                    .attr("class", layerName)
                    .attr("d", pathGenerator)
                    .attr("stroke-width", layerStyles[layerName].strokeWidth)
                    .attr("stroke", layerStyles[layerName].strokeColor)
                    .attr("stroke-linejoin", "round")
                    .attr("fill", d => {
                        let popCat = getPopulationCategory(d.properties.population);
                        let densityCat = getDensityCategory(d.properties.populationDensity);
                        return selectedScheme[popCat * 3 + densityCat];
                    })
                    .on("mouseover", onPolygonHover)  // Using mouseover event
                    .on("mouseout", onPolygonMouseout); // Using mouseout event
            }else if (["WC", "Market", "Mobile", "MainStation"].includes(layerName)) {
                g.selectAll("image." + layerName)
                    .data(data.features || [])
                    .join("image")
                    .attr("class", layerName)
                    .attr("x", d => projection(d.geometry.coordinates)[0] - iconSize / 2) // Centering the icon
                    .attr("y", d => projection(d.geometry.coordinates)[1] - iconSize / 2) // Centering the icon
                    .attr("width", iconSize) // Set icon size
                    .attr("height", iconSize) // Set icon size
                    .attr("xlink:href", getIconUrl(layerName)) // Function to get the icon URL
                    .on("mouseover", onPolygonClick) // Assuming you want to keep this event
                    .on("mouseout", function() {
                        document.getElementById('tooltip').style.visibility = 'hidden';
                    });
            }else if (["Stop"].includes(layerName)) {
                g.selectAll("image." + layerName)
                    .data(data.features || [])
                    .join("image")
                    .attr("class", layerName)
                    .attr("x", d => projection(d.geometry.coordinates)[0] - SiconSize / 2) // Centering the icon
                    .attr("y", d => projection(d.geometry.coordinates)[1] - SiconSize / 2) // Centering the icon
                    .attr("width", SiconSize) // Set icon size
                    .attr("height", SiconSize) // Set icon size
                    .attr("xlink:href", getIconUrl(layerName)) // Function to get the icon URL
                    .on("mouseover", onPolygonClick) // Assuming you want to keep this event
                    .on("mouseout", function() {
                        document.getElementById('tooltip').style.visibility = 'hidden';
                    });
            }

        
        }

    });
}

function getIconUrl(layerName) {
    switch (layerName) {
        case "WC":
            return "./../frontend/icon/pointer.png";
        case "Market":
            return "./../frontend/icon/shopping-cart.png";
        case "Stop":
            return "./../frontend/icon/location.png";
        case "Mobile":
            return "./../frontend/icon/Hstation.png";
        case "MainStation":
            return "./../frontend/icon/zug.png";
        default:
            return "";
    }
}

function getPopulationCategoryLabel(population) {
    if (population <= populationThresholds[0]) {
        return 'Low'; 
    } else if (population <= populationThresholds[1]) {
        return 'Medium'; 
    } else {
        return 'High'; 
    }
}

function getDensityCategoryLabel(density) {
    if (density <= densityThresholds[0]) {
        return 'Low'; 
    } else if (density <= densityThresholds[1]) {
        return 'Medium'; 
    } else {
        return 'High'; 
    }
}

let isInfoEnabled = false; // Default state

function toggleInfo() {
    isInfoEnabled = !isInfoEnabled;
}

document.getElementById('infoToggle').addEventListener('change', function() {
    toggleInfo();
});

let isStopInfoEnabled = false; // Default state

function toggleStopInfo() {
    isStopInfoEnabled = !isStopInfoEnabled;
}

document.getElementById('StopinfoToggle').addEventListener('change', function() {
    toggleStopInfo();
});

function onPolygonHover(event) {
    if (!isInfoEnabled) return;
    const d = d3.select(this).datum();

    // Get category labels
    const populationCategory = getPopulationCategoryLabel(d.properties.population);
    const densityCategory = getDensityCategoryLabel(d.properties.populationDensity);

    let tooltipContent = `
        <strong>${d.properties.name}</strong><br>
        Population: ${d.properties.population.toLocaleString()} (${populationCategory})<br>
        Population Density: ${d.properties.populationDensity.toLocaleString()} per sq km (${densityCategory})<br>
        Population Percentage: ${d.properties.populationPercentage.toFixed(2)}%
    `;

    // Display the tooltip
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = tooltipContent;
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';
    tooltip.style.visibility = 'visible';
}


function onPolygonMouseout(event) {
    // Hide the tooltip or clear the information
    document.getElementById('tooltip').style.visibility = 'hidden';
}

// Function to handle click event on a polygon
function onPolygonClick(event) {
    if (!isStopInfoEnabled) return;

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
    Stadtbezirk: { strokeWidth: 5, strokeColor: "#fefefe", fillColor: "transparent"},
    Bezirksteile: { strokeWidth: 3, strokeColor: "#fce786", fillColor: "transparent" },
    Stadtvieltel: { strokeWidth: 1, strokeColor: "#081f62", fillColor: "transparent" },
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