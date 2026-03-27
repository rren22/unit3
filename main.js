const width = 960;
const height = 600;

const svg = d3.select("#map-container")
              .append("svg")
              .attr("width", width)
              .attr("height", height);

// Load GeoJSON + CSV
Promise.all([
    d3.json("data/usStates.json"), 
    d3.csv("data/EV_Charging_Stations_Feb82024Countries.csv")
]).then(([geojson, csvData]) => {

    const evCounts = Object.fromEntries(
        csvData
            .filter(d => d.States && d.States.length === 2)
            .map(d => [d.States, (+d["Sum of EV Level1 EVSE Num"] || 0) +
                                 (+d["Sum of EV Level2 EVSE Num"] || 0) +
                                 (+d["Sum of EV DC Fast Count"] || 0)])
    );

    const projection = d3.geoAlbersUsa().translate([width/2, height/2]).scale(1000);
    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleSequential()
                         .domain([0, d3.max(Object.values(evCounts))])
                         .interpolator(d3.interpolateOranges);

    // Draw states
    svg.selectAll(".state")
       .data(geojson.features)
       .enter()
       .append("path")
       .attr("class", "state")
       .attr("d", path)
       .attr("fill", d => evCounts[d.properties.abbr] ? colorScale(evCounts[d.properties.abbr]) : "#ccc")
       .attr("stroke", "white")
       .attr("stroke-width", 0.5);

    console.log("Map drawn successfully!");
}).catch(console.error);