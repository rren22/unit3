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
    });

    // x scale (categorical)
    var xScale = d3.scaleBand()
        .domain(data.map(d => d.City))
        .range([80, width - 80])
        .padding(0.5);

    // y scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Pop_2015)])
        .range([height - 80, 80]);

    // radius scale
    var rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.Pop_2015)])
        .range([5, 40]);

    // draw circles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.City))
        .attr("cy", d => yScale(d.Pop_2015))
        .attr("r", d => rScale(d.Pop_2015))
        .attr("fill", "orange")
        .attr("opacity", 0.7);

    // labels (city names)
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.City))
        .attr("y", d => yScale(d.Pop_2015))
        .text(d => d.City)
        .attr("font-size", "10px")
        .attr("text-anchor", "middle");

    // axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0, ${height - 80})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(80, 0)`)
        .call(yAxis);

    // x axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("City");

    // y axis label
    svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("x", -height / 2)
     .attr("y", 20)
     .attr("text-anchor", "middle")
     .attr("font-size", "14px")
     .text("Population (millions)");
});