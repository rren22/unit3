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
        .range([50, width - 50]);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Pop_2015)])
        .range([height - 50, 50]);

    var rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Pop_2015)])
        .range([5, 40]);

    // draw bubbles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Pop_1985))
        .attr("cy", d => yScale(d.Pop_2015))
        .attr("r", d => rScale(d.Pop_2015))
        .attr("fill", "steelblue")
        .attr("opacity", 0.7);

    // labels (optional but helpful)
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.Pop_1985))
        .attr("y", d => yScale(d.Pop_2015))
        .text(d => d.City)
        .attr("font-size", "10px");
});