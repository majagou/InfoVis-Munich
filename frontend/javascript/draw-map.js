async function drawMap () {

    //Access the geojson data
    const MunichShapes = await d3.json("./../formatted-munich-geojson.json")
    console.log(MunichShapes) 
}

drawMap()