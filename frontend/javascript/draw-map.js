let Stadtbezirk, Bezirksteile, Stadtvieltel;

async function initializeMap() {
    // Load geojson data
    Stadtbezirk = await d3.json("./../geo-data/formatted-Stadtbezirk.geojson");
    Bezirksteile = await d3.json("./../geo-data/formatted-Bezirksteile.geojson");
    Stadtvieltel = await d3.json("./../geo-data/formatted-Stadtvieltel.geojson");

    // Setup event listeners for buttons
    var map1 = document.getElementById("AB-1");
    var map2 = document.getElementById("AB-2");
    var map3 = document.getElementById("AB-3");

    map1.addEventListener("click", function() {
        console.log("Button 1 clicked, data:", Stadtbezirk);
        drawMap(Stadtbezirk);
    });

    map2.addEventListener("click", function() {
        drawMap(Bezirksteile);
    });

    map3.addEventListener("click", function() {
        drawMap(Stadtvieltel);
    });

    // Draw initial map
    drawMap(Stadtbezirk);
}

// Call the initialize function
initializeMap();

async function drawMap (mapdata) {
    
    if (!mapdata || !mapdata.features) {
        console.error('Invalid or undefined mapdata:', mapdata);
        return; // Exit the function if mapdata is invalid
    }

    // Define Accessor for geojson
    const areaNameAccessor = d => d.properties["name"];
    const areaIdAccessor = d => d.properties["objectid"];

    // Define Accessor for CSV
    const stopIdAccessor = d => d.stop_id;
    const stopNameAccessor = d => d.stop_name;
    const stopLatAccessor = d => +d.stop_lat; // Convert to number
    const stopLonAccessor = d => +d.stop_lon; // Convert to number  

    //Set up SVG
    const svgWidth = window.innerWidth*0.9;
    const svgHeight = window.innerHeight*0.9;
    const padding = 30;

    // Clear the SVG container first
    d3.select(".VisSVG").selectAll("*").remove();

    // Re-select the SVG container and set its attributes
    const svg = d3.select(".VisSVG")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Rest of the map drawing code
    mapdata.features = mapdata.features.map(function (feature) {
        return turf.rewind(feature, {reverse: true})
    });

    const g = svg.append('g').attr("class", 'path-wrap').attr("width", svgWidth).attr("height", svgHeight);

    const projection = d3.geoMercator()
        .fitExtent([[padding, padding], [svgWidth - padding, svgHeight - padding]], mapdata);

    const pathGenerator = d3.geoPath().projection(projection);

    const mapDraw = g.selectAll("path")
        .data(mapdata.features); //数据绑定
    mapDraw.join("path")
        .attr("class", "continent-path")
        .attr("d", pathGenerator) //绘制path
        .attr("stroke-width", 2)
        .attr("stroke", "#ffffff");
        //.style("fill", "lightblue")
}


    /*//Draw canvas

    const container = d3.select("#wrapper")

    const wrapper = container.append("svg")
        .attr("width", dimensions.width)
    
    const sphere = MunichShapes
    
    const bounds = wrapper.append("g")
  
    bounds.append("defs").append("clipPath")
        .attr("id", "bounds-clip-path")
      .append("path")
        .attr("class", "earth-clip-path")

    const builtInProjections = [ "geoAzimuthalEqualArea", "geoAzimuthalEquidistant", "geoGnomonic", "geoOrthographic", "geoStereographic", "geoEqualEarth", "geoAlbersUsa", "geoAlbers", "geoConicConformal", "geoConicEqualArea", "geoConicEquidistant", "geoEquirectangular", "geoMercator", "geoTransverseMercator", "geoNaturalEarth1", ]
    const geoProjectionProjections = [ "geoAiry", "geoAitoff", "geoAlbers", "geoArmadillo", "geoAugust", "geoAzimuthalEqualArea", "geoAzimuthalEquidistant", "geoBaker", "geoBerghaus", "geoBertin1953", "geoBoggs", "geoBonne", "geoBottomley", "geoBromley", "geoChamberlin", "geoChamberlinAfrica", "geoCollignon", "geoConicConformal", "geoConicEqualArea", "geoConicEquidistant", "geoCraig", "geoCraster", "geoCylindricalEqualArea", "geoCylindricalStereographic", "geoEckert1", "geoEckert2", "geoEckert3", "geoEckert4", "geoEckert5", "geoEckert6", "geoEisenlohr", "geoEquirectangular", "geoFahey", "geoFoucaut", "geoFoucautSinusoidal", "geoGilbert", "geoGingery", "geoGinzburg4", "geoGinzburg5", "geoGinzburg6", "geoGinzburg8", "geoGinzburg9", "geoGnomonic", "geoGringorten", "geoGuyou", "geoHammer", "geoHammerRetroazimuthal", "geoHealpix", "geoHill", "geoHomolosine", "geoHufnagel", "geoHyperelliptical", "geoKavrayskiy7", "geoLagrange", "geoLarrivee", "geoLaskowski", "geoLittrow", "geoLoximuthal", "geoMercator", "geoMiller", "geoModifiedStereographic", "geoModifiedStereographicAlaska", "geoModifiedStereographicGs48", "geoModifiedStereographicGs50", "geoModifiedStereographicMiller", "geoModifiedStereographicLee", "geoMollweide", "geoMtFlatPolarParabolic", "geoMtFlatPolarQuartic", "geoMtFlatPolarSinusoidal", "geoNaturalEarth1", "geoNaturalEarth2", "geoNellHammer", "geoNicolosi", "geoOrthographic", "geoPatterson", "geoPolyconic", "geoRectangularPolyconic", "geoRobinson", "geoSatellite", "geoSinusoidal", "geoSinuMollweide", "geoStereographic", "geoTimes", "geoTransverseMercator", "geoTwoPointAzimuthal", "geoTwoPointAzimuthalUsa", "geoTwoPointEquidistant", "geoTwoPointEquidistantUsa", "geoVanDerGrinten", "geoVanDerGrinten2", "geoVanDerGrinten3", "geoVanDerGrinten4", "geoWagner", "geoWagner4", "geoWagner6", "geoWagner7", "geoWiechel", "geoWinkel3", "geoInterrupt", "geoInterruptedHomolosine", "geoInterruptedSinusoidal", "geoInterruptedBoggs", "geoInterruptedSinuMollweide", "geoInterruptedMollweide", "geoInterruptedMollweideHemispheres", "geoPolyhedral", "geoPolyhedralButterfly", "geoPolyhedralCollignon", "geoPolyhedralWaterman", "geoQuincuncial", "geoGringortenQuincuncial", "geoPeirceQuincuncial", ]
    const projections = [
        ...builtInProjections,
        ...geoProjectionProjections,
    ]

    const selectedProjection = projections[1]
    const projectionLabel = d3.select("#name")
    projectionLabel.text(selectedProjection)

    const select = d3.select("#select")
    select.selectAll("option")
        .data(projections)
      .enter().append("option")
        .text(d => d)
        .attr("value", d => d)

    select.on("change", function(d) {
        projectionLabel.text(this.value)
        drawMap(this.value)
    })

    //Draw Data
    bounds.append("path")
        .attr("class", "earth")

    bounds.append("path")
        .attr("class", "graticule")

    const drawMap = projectionName => {
        const projection = d3[projectionName]()
            .fitWidth(dimensions.boundedWidth, sphere)

        const pathGenerator = d3.geoPath(projection)
        const [[x0, y0], [x1, y1]] = pathGenerator.bounds(sphere)

        dimensions.boundedHeight = y1
        dimensions.height = dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom
        wrapper.attr("height", dimensions.height)

        bounds.style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

        bounds.select(".earth")
            .attr("d", pathGenerator(sphere))
        bounds.select(".earth-clip-path")
            .attr("d", pathGenerator(sphere))

        const graticule = d3.geoGraticule10()
        bounds.select(".graticule")
            .attr("clip-path", "url(#bounds-clip-path)")
            .attr("d", pathGenerator(graticule))

        const countries = bounds.selectAll(".country")
            .data(MunichShapes.features)

        countries.enter().append("path")
            .merge(countries)
                .attr("class", "country")
                .attr("title", d => areaNameAccessor(d))
                .attr("clip-path", "url(#bounds-clip-path)")
            .transition().duration(500)
                .attr("d", d => pathGenerator(d))
        countries.exit().remove()
    }

    drawMap(selectedProjection)*/