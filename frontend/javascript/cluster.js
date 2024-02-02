let svg, g, projection, pathGenerator;

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

function initializeSVG() {

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

let populationData;

function updateMap(selectedYear) {
    const totalEntry = populationData.find(row => row.id === "00" && row.Jahr === String(selectedYear));
    //console.log("Total Entry:", totalEntry); // Debug log

    const totalPopulation = totalEntry ? +totalEntry['Basiswert.1'] : 0;
    //console.log("Total Population for year " + selectedYear + ":", totalPopulation); // Debug log

    StadtbezirkData.features.forEach(feature => {
        const dataEntry = populationData.find(row => row.id === feature.properties['sb_nummer'] && row.Jahr === String(selectedYear));
        console.log("Data Entry for feature ID " + feature.properties.id + ":", dataEntry); // Debug log

        if (dataEntry) {
            feature.properties.populationDensity = +dataEntry.Indikatorwert;
            feature.properties.population = +dataEntry['Basiswert.1'];
            feature.properties.populationPercentage = totalPopulation ? (feature.properties.population / totalPopulation) * 100 : 0;
        } else {
            feature.properties.populationDensity = 0;
            feature.properties.population = 0;
            feature.properties.populationPercentage = 0;
        }
    });

    console.log("Updated map for year:", selectedYear);

    redrawMap();

}

const sliderEl = document.querySelector("#range")
const sliderValue = document.querySelector(".value")

sliderEl.addEventListener("input", (event) => {
    const selectedYear = sliderEl.value;
    updateMap(selectedYear);

    const tempSliderValue = event.target.value; 
    sliderValue.textContent = tempSliderValue;

    // Calculate the percentage of the slider that's been traversed
    const progress = ((tempSliderValue - sliderEl.min) / (sliderEl.max - sliderEl.min)) * 100;
    
    // Apply a linear gradient background to the slider
    sliderEl.style.background = `linear-gradient(to right, #6f63ad 0%, #6f63ad ${progress}%, #ccc ${progress}%, #ccc 100%)`;
    const sliderValueDisplay = document.querySelector(".value");
    if (sliderValueDisplay) {
        sliderValueDisplay.textContent = selectedYear;
    }

});

async function initializeMap() {
    StadtbezirkData = await d3.json("./../geo-data/formatted-Stadtbezirk.geojson");
    StadtbezirkData.features = StadtbezirkData.features.map(function (feature) {
        return turf.rewind(feature, { reverse: true });
    });
    
    populationData = await d3.csv("./../csv-data/Bevölkerungsdichte.csv");
    console.log(populationData)

    // Initialize SVG, projection, etc.
    initializeSVG();

    const initialYear = 2022; // Set your default year here
    updateMap(initialYear); // Initialize the map with the default year

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

    projection.fitExtent([[0, 0], [window.innerWidth, window.innerHeight]], StadtbezirkData);   
    
    // Draw Stadtbezirk and add hover event listeners
    g.selectAll("path")
        .data(StadtbezirkData.features)
        .join("path")
        .attr("class", StadtbezirkData)
        .attr("d", pathGenerator)
        .attr("stroke-width", 5)
        .attr("stroke", "#fefefe")
        .attr("stroke-linejoin", "round")
        .attr("fill", d => {
            let popCat = getPopulationCategory(d.properties.population);
            let densityCat = getDensityCategory(d.properties.populationDensity);
            return selectedScheme[popCat * 3 + densityCat];
        })
        .on("mouseover", onPolygonHover)  // Using mouseover event
        .on("mouseout", onPolygonMouseout); // Using mouseout event

}

function redrawMap() {
    // Select all path elements and update attributes as necessary
    const g = svg.select('.path-wrap');
    g.selectAll("path")
        .data(StadtbezirkData.features)
        .join("path")
        .attr("stroke-width", 5)
        .attr("stroke", "#fefefe")
        .attr("stroke-linejoin", "round")
        .attr("d", pathGenerator)
        .attr("fill", d => {
            let popCat = getPopulationCategory(d.properties.population);
            let densityCat = getDensityCategory(d.properties.populationDensity);
            return selectedScheme[popCat * 3 + densityCat];
        })
        .on("mouseover", onPolygonHover)  // Using mouseover event
        .on("mouseout", onPolygonMouseout); // Using mouseout event
        // Add any other necessary updates or transitions
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

function onPolygonHover(event) {
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

// Resize event listener
window.addEventListener("resize", () => {
    initializeSVG();
    drawMap();
});

// Initialize the map
initializeMap();