// the map svg
let width = 750, height = 450;
let margin = { top: 20, right: 15, bottom: 30, left: 40 };
let w = width - margin.left - margin.right;
let h = height - margin.top - margin.bottom;

const SAcountries = ['Afghanistan','Bangladesh', 'Bhutan', 'India','Maldives', 'Nepal','Pakistan', 'Sri Lanka'];
let countries = {"SA": ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"], "ECA": ["Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Holy See", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kyrgyzstan", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Republic of Moldova", "Romania", "Russian Federation", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Tajikistan", "Turkey", "Turkmenistan", "Ukraine", "United Kingdom", "Uzbekistan"], "MENA": ["Algeria", "Bahrain", "Egypt", "Iran (Islamic Republic of)", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Libya", "Morocco", "Oman", "Qatar", "Saudi Arabia", "State of Palestine", "Syrian Arab Republic", "Tunisia", "United Arab Emirates", "Yemen"], "SSA": ["Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Togo", "Uganda", "United Republic of Tanzania", "Zambia", "Zimbabwe"], "LAC": ["Anguilla", "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia (Plurinational State of)", "Brazil", "British Virgin Islands", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Montserrat", "Nicaragua", "Panama", "Paraguay", "Peru", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Suriname", "Trinidad and Tobago", "Turks and Caicos Islands", "Uruguay", "Venezuela (Bolivarian Republic of)"], "EAP": ["Australia", "Brunei Darussalam", "Cambodia", "China", "Cook Islands", "North Korea", "Fiji", "Indonesia", "Japan", "Kiribati", "Laos", "Malaysia", "Marshall Islands", "Micronesia (Federated States of)", "Mongolia", "Myanmar", "Nauru", "New Zealand", "Niue", "Palau", "Papua New Guinea", "Philippines", "Republic of Korea", "Samoa", "Singapore", "Solomon Islands", "Thailand", "Timor-Leste", "Tokelau", "Tonga", "Tuvalu", "Vanuatu", "Viet Nam"]};
// console.log(countries);

let attributes = ["region", "level"];
let region = "SA";
let mapdata, dataset, filter_query;
let data = new Map();

// color scale for map filling
var colorScale = d3.scaleSequential().domain([0, 100])
.interpolator(d3.interpolateBlues);

const map = d3.select("svg")

// propjection is set to work with ECA region
const projection = d3.geoMercator()
    .center([30, 57])                // GPS of location to zoom on
    .scale(350)                       // This is like the zoom
    .translate([ width/2, height/2 ])

const path = d3.geoPath(projection);

const g = map.append('g');

// initiate tooltip
tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data/all_levels.csv", function(d){
        data.set(d.ISO3, +d.Total)
    })
]).then(function(loadData){
    let topo = loadData[0];

    // console.log(countries[region]);
    //filter out map data based on specific region
    topo.features = topo.features.filter(d => {return countries[region].includes(d.properties.name)})
    // console.log(data.features);

    // mouseover
    let mouseOver = function(event, d, i) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 0.3)
            .style("stroke", "blue");
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html("<b>" + d.properties.name + "</b>: " + "Total out of school rates = " + data.get(d.id) + " % <br>" )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    // //mouseleave
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
        .style("stroke", "grey")
    }

    // Draw the map
    map.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .style("stroke", "grey")
        .style("stroke-opacity", .2)
        // set the color of each country
        .attr("fill", function (d) {
            // console.log("topo id", d.id);
            // console.log("topo id in data", data.get(d.id));
            d.total = data.get(d.id) || 0;
            // console.log(colorScale(d.total))
            return colorScale(d.total);
        })
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave);
    
    map.selectAll("text")
        .data(topo.features)
        .enter().append("text")
        .text(function(d) {
            return d.properties.name;
        })
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("font-size", "8px")
    })

