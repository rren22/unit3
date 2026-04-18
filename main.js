
(function(){

let width, height, chartWidth, chartHeight;

// region mapping
const stateToRegion = {
    "WA":"West","OR":"West","CA":"West","NV":"West","ID":"West","MT":"West","WY":"West","UT":"West","CO":"West","AK":"West","HI":"West",
    "ND":"Midwest","SD":"Midwest","NE":"Midwest","KS":"Midwest","MN":"Midwest","IA":"Midwest","MO":"Midwest","WI":"Midwest","IL":"Midwest","IN":"Midwest","MI":"Midwest","OH":"Midwest",
    "TX":"South","OK":"South","AR":"South","LA":"South","MS":"South","AL":"South","GA":"South","FL":"South","SC":"South","NC":"South","TN":"South","KY":"South","VA":"South","WV":"South","MD":"South","DE":"South","DC":"South",
    "PA":"Northeast","NJ":"Northeast","NY":"Northeast","CT":"Northeast","RI":"Northeast","MA":"Northeast","VT":"Northeast","NH":"Northeast","ME":"Northeast"
};

const stateNameToAbbr = {
    "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE",
    "Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY",
    "Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO",
    "Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC",
    "North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
    "Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"
};

function setDimensions() {
    // Fixed dimensions for consistent layout
    width = 550;
    chartWidth = 450;
    height = 450;
    chartHeight = 450;
}

function highlight(abbr){
    d3.selectAll("." + abbr).classed("selected", true);
}
function dehighlight(abbr){
    d3.selectAll("." + abbr).classed("selected", false);
}

function init(){
    setDimensions();
    d3.selectAll("#map-container svg").remove();
    d3.selectAll(".tooltip").remove();

    const container = d3.select("#map-container");
    
    // Clear container
    container.html("");
    
    // Style the container as flex column
    container.style("display", "flex")
        .style("flex-direction", "column")
        .style("width", "100%")
        .style("max-width", "1200px")
        .style("margin", "0 auto")
        .style("padding", "20px");
    
    // Create controls bar at the TOP
    const controlsDiv = container.append("div")
        .attr("class", "controls-bar")
        .style("width", "100%")
        .style("margin-bottom", "25px")
        .style("display", "flex")
        .style("gap", "30px")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("padding", "15px 20px")
        .style("background", "#f5f5f5")
        .style("border-radius", "8px")
        .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)");
    
    // Add title to controls
    controlsDiv.append("div")
        .style("font-weight", "bold")
        .style("color", "#E87F24")
        .style("font-size", "1.2rem")
        .text("⚡ EV Charging Explorer");
    
    // Region filter dropdown
    const regionGroup = controlsDiv.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "10px");
    
    regionGroup.append("label")
        .style("font-weight", "bold")
        .style("color", "#333")
        .text("Region:");
    
    const regionSelect = regionGroup.append("select")
        .attr("id", "region-select")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("border", "1px solid #ccc");
    
    regionSelect.selectAll("option")
        .data(["All", "West", "Midwest", "South", "Northeast"])
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
    
    // Attribute reexpress dropdown
    const attrGroup = controlsDiv.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "10px");
    
    attrGroup.append("label")
        .style("font-weight", "bold")
        .style("color", "#333")
        .text("Reexpress:");
    
    const attributeSelect = attrGroup.append("select")
        .attr("id", "attribute-select")
        .style("padding", "6px 12px")
        .style("border-radius", "4px")
        .style("border", "1px solid #ccc");
    
    attributeSelect.selectAll("option")
        .data([
            {value: "normalized", text: "EVSE per 100k (Normalized)"},
            {value: "total", text: "Total EVSE Count"},
            {value: "population", text: "Population"},
            {value: "dc_fast", text: "DC Fast Chargers"},
            {value: "level2", text: "Level 2 Chargers"}
        ])
        .enter()
        .append("option")
        .attr("value", d => d.value)
        .text(d => d.text);
    
    // Add instruction text
    controlsDiv.append("div")
        .style("font-size", "0.8rem")
        .style("color", "#666")
        .style("background", "#e9ecef")
        .style("padding", "4px 12px")
        .style("border-radius", "20px")
        .html("💡 Hover states/ bars for details");
    
    // Create FLOAT LAYOUT: map LEFT, chart RIGHT using CSS float
    const contentDiv = container.append("div")
        .style("width", "100%")
        .style("overflow", "hidden"); // Clearfix
    
    // Map DIV - float left
    const mapDiv = contentDiv.append("div")
        .style("float", "left")
        .style("width", "55%")
        .style("margin-right", "2%")
        .style("background", "white")
        .style("border-radius", "12px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
        .style("overflow", "hidden");
    
    // Map title
    mapDiv.append("div")
        .style("background", "#f8f9fa")
        .style("padding", "12px")
        .style("text-align", "center")
        .style("font-weight", "bold")
        .style("border-bottom", "2px solid #E87F24")
        .style("color", "#333")
        .html("Choropleth Map - EVSE Density by State");
    
    // Map SVG container
    const mapSvgDiv = mapDiv.append("div")
        .style("padding", "15px")
        .style("display", "flex")
        .style("justify-content", "center");
    
    const svg = mapSvgDiv.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "0 auto");
    
    // Chart DIV - float right
    const chartDiv = contentDiv.append("div")
        .style("float", "right")
        .style("width", "42%")
        .style("background", "white")
        .style("border-radius", "12px")
        .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
        .style("overflow", "hidden");
    
    // Chart title
    chartDiv.append("div")
        .style("background", "#f8f9fa")
        .style("padding", "12px")
        .style("text-align", "center")
        .style("font-weight", "bold")
        .style("border-bottom", "2px solid #E87F24")
        .style("color", "#333")
        .html("Bar Chart - Total EVSE by Region");
    
    // Chart SVG container
    const chartSvgDiv = chartDiv.append("div")
        .style("padding", "15px")
        .style("display", "flex")
        .style("justify-content", "center");
    
    const chart = chartSvgDiv.append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .style("display", "block")
        .style("margin", "0 auto");
    
    // Clearfix to prevent parent collapse
    contentDiv.append("div")
        .style("clear", "both");
    
    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "white")
        .style("padding", "8px 14px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("font-family", "Roboto, sans-serif")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", "1000")
        .style("max-width", "250px")
        .style("line-height", "1.4");

    Promise.all([
        d3.json("data/usStates.json"),
        d3.csv("data/EV_Charging_Stations_Feb82024Countries.csv"),
        d3.csv("data/usStatesPopulation.csv")
    ]).then(([geojson, csvData, popData]) => {

        const cleanData = csvData.filter(d => d.States && d.States.length === 2);

        cleanData.forEach(d => {
            d.ev_total = (+d["Sum of EV Level1 EVSE Num"] || 0) + 
                         (+d["Sum of EV Level2 EVSE Num"] || 0) + 
                         (+d["Sum of EV DC Fast Count"] || 0);
            d.dc_fast = +d["Sum of EV DC Fast Count"] || 0;
            d.level2 = +d["Sum of EV Level2 EVSE Num"] || 0;
            d.level1 = +d["Sum of EV Level1 EVSE Num"] || 0;

            const popMatch = popData.find(p => p.State === d.States);
            d.population = popMatch ? +popMatch.Population : null;
            d.ev_per_100k = (d.population && d.population > 0) ? (d.ev_total / d.population) * 100000 : 0;
            d.region = stateToRegion[d.States] || "Other";
        });

        geojson.features.forEach(f => {
            const abbr = stateNameToAbbr[f.properties.NAME];
            const match = cleanData.find(d => d.States === abbr);
            f.properties.ev_total = match ? match.ev_total : 0;
            f.properties.ev_per_100k = match ? match.ev_per_100k : 0;
            f.properties.population = match ? match.population : 0;
            f.properties.dc_fast = match ? match.dc_fast : 0;
            f.properties.level2 = match ? match.level2 : 0;
            f.properties.region = match ? match.region : "Other";
            f.properties.abbr = abbr;
        });

        const projection = d3.geoAlbersUsa()
            .translate([width/2, height/2])
            .scale(width * 1.1);
        const path = d3.geoPath().projection(projection);

        // Helper to get attribute value for a feature
        function getAttributeValue(feature, attributeType) {
            switch(attributeType) {
                case "normalized": return feature.properties.ev_per_100k;
                case "total": return feature.properties.ev_total;
                case "population": return feature.properties.population;
                case "dc_fast": return feature.properties.dc_fast;
                case "level2": return feature.properties.level2;
                default: return feature.properties.ev_per_100k;
            }
        }

        // Get aggregated region data for bar chart
        function getRegionData(regionFilter) {
            const filtered = regionFilter === "All" ? cleanData : cleanData.filter(d => d.region === regionFilter);
            const grouped = d3.rollups(
                filtered,
                v => ({
                    total: d3.sum(v, d => d.ev_total),
                    pop: d3.sum(v, d => d.population || 0),
                    per100k: d3.sum(v, d => d.ev_total) / (d3.sum(v, d => d.population) || 1) * 100000
                }),
                d => d.region
            );
            return grouped.map(([region, v]) => ({ region, total: v.total, per100k: v.per100k, population: v.pop }));
        }

        function update() {
            const regionFilter = regionSelect.property("value");
            const attributeType = attributeSelect.property("value");
            const regionData = getRegionData(regionFilter);
            
            // Get color scale based on selected attribute across all states
            const attributeValues = geojson.features.map(f => getAttributeValue(f, attributeType)).filter(v => v > 0);
            const colorScale = attributeValues.length > 0 ? 
                d3.scaleQuantile()
                    .domain(attributeValues)
                    .range(["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"]) :
                d3.scaleLinear().domain([0,1]).range(["#eee", "#eee"]);

            // ===== UPDATE MAP =====
            svg.selectAll("path")
                .data(geojson.features)
                .join("path")
                .attr("d", path)
                .attr("stroke", "white")
                .attr("stroke-width", 0.8)
                .attr("class", d => d.properties.abbr ? d.properties.abbr : "")
                .attr("fill", d => {
                    const val = getAttributeValue(d, attributeType);
                    return (val !== undefined && val > 0) ? colorScale(val) : "#e9ecef";
                })
                .attr("opacity", d => (regionFilter !== "All" && d.properties.region !== regionFilter) ? 0.4 : 1)
                .on("mouseover", function(e, d) {
                    highlight(d.properties.abbr);
                    const attrValue = getAttributeValue(d, attributeType);
                    let attrLabel = "";
                    switch(attributeType) {
                        case "normalized": attrLabel = `EVSE per 100k: ${attrValue.toFixed(1)}`; break;
                        case "total": attrLabel = `Total EVSE: ${attrValue.toLocaleString()}`; break;
                        case "population": attrLabel = `Population: ${attrValue.toLocaleString()}`; break;
                        case "dc_fast": attrLabel = `DC Fast Chargers: ${attrValue.toLocaleString()}`; break;
                        case "level2": attrLabel = `Level 2 Chargers: ${attrValue.toLocaleString()}`; break;
                        default: attrLabel = `${attrValue}`;
                    }
                    tooltip.style("opacity", 1)
                        .html(`<strong>${d.properties.NAME}</strong><br>${attrLabel}<br>🏷️ Region: ${d.properties.region}`)
                        .style("left", (e.pageX + 12) + "px")
                        .style("top", (e.pageY - 28) + "px");
                })
                .on("mouseout", function(e, d) {
                    dehighlight(d.properties.abbr);
                    tooltip.style("opacity", 0);
                });

            // ===== BAR CHART (Regional Aggregates) =====
            const margin = { top: 50, right: 30, bottom: 70, left: 80 };
            const innerWidth = chartWidth - margin.left - margin.right;
            const innerHeight = chartHeight - margin.top - margin.bottom;

            chart.selectAll("*").remove();
            
            if (regionData.length === 0) {
                chart.append("text")
                    .attr("x", chartWidth/2)
                    .attr("y", chartHeight/2)
                    .attr("text-anchor", "middle")
                    .style("fill", "#999")
                    .text("No data for selected region");
                return;
            }

            const chartGroup = chart.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
            const sortedData = [...regionData].sort((a,b) => b.total - a.total);
            
            const xScale = d3.scaleBand()
                .domain(sortedData.map(d => d.region))
                .range([0, innerWidth])
                .padding(0.3);
            
            const yMax = d3.max(sortedData, d => d.total) || 1;
            const yScale = d3.scaleLinear().domain([0, yMax]).range([innerHeight, 0]).nice();

            // Axes
            chartGroup.append("g")
                .attr("transform", `translate(0,${innerHeight})`)
                .call(d3.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-35)")
                .style("text-anchor", "end")
                .attr("dx", "-0.6em")
                .attr("dy", "0.2em")
                .style("font-size", "11px");
            
            chartGroup.append("g").call(d3.axisLeft(yScale).ticks(6).tickFormat(d => d.toLocaleString()));
            
            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -55)
                .attr("x", -innerHeight/2)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#555")
                .text("Total EVSE Count");
            
            chartGroup.append("text")
                .attr("x", innerWidth/2)
                .attr("y", innerHeight + 50)
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "#555")
                .text("Region");

            // Bars
            chartGroup.selectAll(".bar")
                .data(sortedData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => xScale(d.region))
                .attr("y", d => yScale(d.total))
                .attr("width", xScale.bandwidth())
                .attr("height", d => innerHeight - yScale(d.total))
                .attr("fill", "#ff8c42")
                .attr("opacity", 0.85)
                .on("mouseover", (e,d) => {
                    tooltip.style("opacity",1)
                        .html(`<strong>${d.region}</strong><br>Total EVSE: ${d.total.toLocaleString()}<br>Per 100k: ${d.per100k.toFixed(1)}`)
                        .style("left",(e.pageX+10)+"px")
                        .style("top",(e.pageY+10)+"px");
                })
                .on("mouseout", () => tooltip.style("opacity",0));
            
            // Value labels on bars
            chartGroup.selectAll(".bar-label")
                .data(sortedData)
                .enter()
                .append("text")
                .attr("x", d => xScale(d.region) + xScale.bandwidth()/2)
                .attr("y", d => yScale(d.total) - 5)
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .style("font-weight", "bold")
                .style("fill", "#333")
                .text(d => d.total.toLocaleString());
        }

        // Event listeners for coordinated reexpress + retrieve
        regionSelect.on("change", () => update());
        attributeSelect.on("change", () => update());

        update();
    }).catch(err => {
        console.error("Data loading error:", err);
        d3.select("#map-container").append("div")
            .style("color", "red")
            .style("padding", "40px")
            .html("⚠️ Error loading data. Ensure JSON/CSV files exist in 'data/' folder.");
    });
}

init();
window.addEventListener("resize", () => init());

})();