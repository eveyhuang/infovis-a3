// the map svg
const map = d3.select("svg"),
    width = +map.attr("width"),
    height = +map.attr("height");

const projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

const path = d3.geoPath(projection);

var tooltip = d3.select('div.tooltip');

const g = map.append('g');
var SEcountries = ['Afghanistan','Bangladesh', 'Bhutan', 'India','Maldives', 'Nepal','Pakistan', 'Sri Lanka']



d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data){

// Filter data
// data.features = data.features.filter(d => {return SEcountries.includes(d.properties.name)})
// console.log(data.features);

    // mouseover
    let mouseOver = function(d) {
        console.log(d)
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5)
            .style("stroke", "grey")
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "#69b3a2")
            .style("fill", "#69b3a2")
    }

    //mouseleave
    let mouseLeave = function(d) {
        d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .8)
        .style("stroke", "grey")
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        .style("fill", "#ccc")
        .style("stroke", "grey")
    }
    // Draw the map
    map.append("g")
        .selectAll("path")
        .data(data.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .style("stroke", "grey")
        .style("stroke-opacity", .2)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave );
    
    map.selectAll("text")
        .data(data.features)
        .enter().append("text")
        .text(function(d) {
            return d.properties.name;
        })
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("font-size", "3px")
})
