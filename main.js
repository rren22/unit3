(function(){
const width = 960;
const height = 600;
const stateNameToAbbr = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
    "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
    "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
    "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
    "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI",
    "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA",
    "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

// Create map SVG
const svg = d3.select("#map-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load data
Promise.all([
    d3.json("data/usStates.json"),
    d3.csv("data/EV_Charging_Stations_Feb82024Countries.csv")
]).then(([geojson, csvData]) => {
    console.log(geojson.features[0].properties);
  
    // Clean and prep data
    const cleanData = csvData.filter(d =>
        d.States && d.States.length === 2
    );

    cleanData.forEach(d => {
        d.ev_total =
            (+d["Sum of EV Level1 EVSE Num"] || 0) +
            (+d["Sum of EV Level2 EVSE Num"] || 0) +
            (+d["Sum of EV DC Fast Count"] || 0);
    });


// Join data to GEOJSON
geojson.features.forEach(feature => {

    const stateName = feature.properties.NAME;   
    const stateAbbr = stateNameToAbbr[stateName];

    const match = cleanData.find(d => d.States === stateAbbr);

    if (match) {
        feature.properties.ev_total = match.ev_total;
    } else {
        feature.properties.ev_total = null;
    }
});
   
    // Projection and path
    const projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2])
        .scale(1000);

    const path = d3.geoPath().projection(projection);


    // Color scale (quantile)
    const values = geojson.features
        .map(d => d.properties.ev_total)
        .filter(d => d != null);

    const colorScale = d3.scaleQuantile()
        .domain(values)
        .range([
            "#feedde",
            "#fdbe85",
            "#fd8d3c",
            "#e6550d",
            "#a63603"
        ]);

   
    // Draw map
    svg.selectAll(".state")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("class", "state")
        .attr("d", path)
        .attr("fill", d => {
            const value = d.properties.ev_total;
            return value ? colorScale(value) : "#ccc";
        })
        .attr("stroke", "white")
        .attr("stroke-width", 0.5);

    console.log("Map drawn successfully!");


    // Bar Chart
    
    const chartWidth = 500;
    const chartHeight = 600;

    const chart = d3.select("#map-container")
        .append("svg")
        .attr("class", "chart")
        .attr("width", chartWidth)
        .attr("height", chartHeight);
    
    //sort data by total EV Stations
    const sortedData = [...cleanData].sort((a, b) => b.ev_total - a.ev_total).slice(0, 20);

    // Scales
    const xScale = d3.scaleLinear()
    .domain([0, d3.max(sortedData, d => d.ev_total)])
    .range([100, chartWidth - 20]);

    const yScale = d3.scaleBand()
    .domain(sortedData.map(d => d.States))
    .range([20, chartHeight - 40])
    .padding(0.1);

    //Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    chart.append("g")
    .attr("transform", `translate(0, ${chartHeight - 40})`)
    .call(d3.axisBottom(xScale));

    chart.append("g")
    .attr("transform", `translate(100, 0)`)
    .call(d3.axisLeft(yScale));
    
    //Bars
    chart.selectAll("rect")
    .data(sortedData)
    .enter()
    .append("rect")
    .attr("x", 100)
    .attr("y", d => yScale(d.States))
    .attr("width", d => xScale(d.ev_total) - 100)
    .attr("height", yScale.bandwidth())
    .attr("fill", d => colorScale(d.ev_total))
    .attr("opacity", 0.7);

    // add title to bubble chart
    chart.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Top 20 States by Total EV Charging Stations");

    // Add value labels on the bars
    chart.selectAll("text.bar-label")
    .data(sortedData)
    .enter()
    .append("text")
    .attr("x", d => xScale(d.ev_total) - 5)
    .attr("y", d => yScale(d.States) + yScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .style("text-anchor", "end")
    .style("font-size", "10px")
    .style("fill", "white")
    .text(d => d.ev_total);

    // add title to map
    svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Total EV Charging Stations by State");

}).catch(console.error);

})(); 





