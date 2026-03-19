// set dimensions
var width = 800;
var height = 600;

// create SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// load data
d3.csv("data/MegaCities.csv").then(function(data) {

    // convert numbers
    data.forEach(function(d) {
        d.Pop_2015 = +d.Pop_2015;
        d.Pop_1985 = +d.Pop_1985;
    });

    // scales
        var xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Pop_1985)])
        .range([80, width - 80]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Pop_2015)])
        .range([height - 80, 80]);

    var rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Pop_2015)])
        .range([5, 25]); // smaller bubbles

    // draw bubbles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Pop_1985))
        .attr("cy", d => yScale(d.Pop_2015))
        .attr("r", d => rScale(d.Pop_2015))
        .attr("fill", "steelblue")
        .attr("opacity", 0.6);

    // labels (slightly shifted to reduce overlap)
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.Pop_1985))
        .attr("y", d => yScale(d.Pop_2015) - 8)
        .text(d => d.City)
        .attr("font-size", "9px")
        .attr("text-anchor", "middle");

    // axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - 80})`)
        .call(xAxis);

    svg.append("g")
        .attr("transform", `translate(80, 0)`)
        .call(yAxis);

});