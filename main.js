// set the dimensions and margins of the graph
const margin = {top: 40, right: 30, bottom: 70, left: 60},
width = 750 - margin.left - margin.right,
height = 550 - margin.top - margin.bottom;

const SAcountries = ['Afghanistan','Bangladesh', 'Bhutan', 'India','Maldives', 'Nepal','Pakistan', 'Sri Lanka'];
let countries = {"SA": ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"], "ECA": ["Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Holy See", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kyrgyzstan", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Republic of Moldova", "Romania", "Russian Federation", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Tajikistan", "Turkey", "Turkmenistan", "Ukraine", "United Kingdom", "Uzbekistan"], "MENA": ["Algeria", "Bahrain", "Egypt", "Iran (Islamic Republic of)", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Libya", "Morocco", "Oman", "Qatar", "Saudi Arabia", "State of Palestine", "Syrian Arab Republic", "Tunisia", "United Arab Emirates", "Yemen"], "SSA": ["Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Togo", "Uganda", "United Republic of Tanzania", "Zambia", "Zimbabwe"], "LAC": ["Anguilla", "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia (Plurinational State of)", "Brazil", "British Virgin Islands", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Montserrat", "Nicaragua", "Panama", "Paraguay", "Peru", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Suriname", "Trinidad and Tobago", "Turks and Caicos Islands", "Uruguay", "Venezuela (Bolivarian Republic of)"], "EAP": ["Australia", "Brunei Darussalam", "Cambodia", "China", "Cook Islands", "North Korea", "Fiji", "Indonesia", "Japan", "Kiribati", "Laos", "Malaysia", "Marshall Islands", "Micronesia (Federated States of)", "Mongolia", "Myanmar", "Nauru", "New Zealand", "Niue", "Palau", "Papua New Guinea", "Philippines", "Republic of Korea", "Samoa", "Singapore", "Solomon Islands", "Thailand", "Timor-Leste", "Tokelau", "Tonga", "Tuvalu", "Vanuatu", "Viet Nam"]};
// console.log(countries);

let attributes = ["region", "level"];
let region = "SA";
let mapdata, dataset;
let data = new Map();

let selectedCountry = null;
// color scale for map filling
var colorScale = d3.scaleSequential().domain([0, 100])
.interpolator(d3.interpolateBlues);



// append svg for map
const map = d3.select("#mapViz")
// propjection is set to work with ECA region
const projection = d3.geoMercator()
    .center([30, 57])                // GPS of location to zoom on
    .scale(350)                       // This is like the zoom
    .translate([ width/2, height/2 ])

const path = d3.geoPath(projection);

const g = map.append('g');

// legend for map
var legend_x = width - 100
var legend_y = height 
    
map.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + legend_x + "," + legend_y+")");

var legend = d3.legendColor()
  .shapeWidth(20)
  .orient('horizontal')
  .title("Total Out of School Rates")
  .scale(colorScale)
  
map.select(".legend")
 .call(legend)
 .style("font-size", "8px");


//append svg for boxplot 
const boxPlot = d3.select("#sortedBarplot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


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
        .style("stroke", "grey");
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        .style("stroke", "grey");
        tooltip.transition()
        .duration(500)
        .style("opacity", 0.5);
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

// Parse the Data
d3.csv("data/all_levels.csv").then( function(data) {

    // Get set of schooling levels - LS, PRIMARY, US
    const schoolLevels = new Set(data.map(d => d.Level))
    // console.log(schoolLevels)

   // Add school levels as options to dropdown menu
    d3.select("#selectLevel")
    .selectAll('schoolLevels')
        .data(schoolLevels)
    .enter()
        .append('option')
    .text(function (d) { return d + " School"; }) // Drop-Down Menu text
    .attr("value", function (d) { return d; }) // Value returned by drop-down menu

    // Set default school level
    const defaultLevel = "Primary"

    // Filter data by the defaut level and also sort it
    const filteredData = data.filter(d => d.Level === defaultLevel).sort((a, b) => b.Total - a.Total)

    // Set colors for each school level
    const levelColour = d3.scaleOrdinal()
    .domain(schoolLevels)
    .range(d3.schemeSet2);

    // X axis
    const x = d3.scaleBand() // allows scaling of bars
    .range([ 0, width ])
    .domain(filteredData.map(d => d.Country)) // map the country names to the x axis
    .padding(0.2);
    
    // Make x-axis + customise the positioning of xticks
    boxPlot.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
        .attr("transform", "translate(5,5)rotate(-30)") // rotation for readability
        .style("text-anchor", "end") // for vertical alignment
        .attr("font-size","11px"); // font size

    // Add x-label
    boxPlot.append("text")
    .attr("class", "xlabel")
    .attr("text-anchor", "end")
    .attr("x", (width + margin.left + margin.right)/2) // Position x-label
    .attr("y", height + margin.bottom)
    .text("Countries"); // Label

    // Y axis
    const y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0]);

    // Make y-axis + customise the positioning of yticks
    boxPlot.append("g") 
    .call(d3.axisLeft(y))
    .selectAll("text")
        .attr("font-size","11px"); // font size

    // Add y-label
    boxPlot.append("text")
    .attr("class", "ylabel")
    .attr("text-anchor", "end")
    .attr("y", -margin.left/1.5) // **SEE HERE**: mind these if you change the margins or width/height
    .attr("x", margin.bottom - height/2.8) // **SEE HERE**: mind these if you change the margins or width/height
    .attr("transform", "rotate(-90)")
    .text("Percentage of Students Dropped Out"); // Label

    // Make the bars with a chosen default school level to start with
    const barplot = boxPlot.selectAll("bars")
    .data(filteredData) 
    .join("rect")
        .attr("x", d => x(d.Country))
        .attr("y", d => y(d.Total))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Total))
        .attr("fill", function(d){ return levelColour(defaultLevel) })
        // Animation: show no bars at the start
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })
        .on("mouseover",function(){
                  d3.select(this)
              .attr("fill","red")
                }) 	
        .on("mouseout",function(){
                  d3.select(this)
                  .attr("fill", function(d){ return levelColour(defaultLevel) })
                }) 
        // .on("click", function() {
        //    		sortBars();
        //     });

    // Animation
    boxPlot.selectAll("rect")
    .transition()
    .duration(400)
    .attr("y", function(d) { return y(d.Total); })
    .attr("height", function(d) { return height - y(d.Total); })
    //.delay(function(d,i){console.log(i) ; return(i*100)})

    // Function to update visualization based on school level selected
    function update(selectedLevel) {

        // Filter data by the selected level and also sort it
        const filteredData = data.filter(d => d.Level === selectedLevel)//.sort((a, b) => b.Total - a.Total)

        // Recalculate x-axis domain based on selected school level + sorted countries
        // x.domain(filteredData.map(d => d.Country)) // map the country names to the x axis

        // Update the barplot based on the selected school level
        barplot.data(filteredData)
        .join("rect")
        .attr("x", d => x(d.Country))
        .attr("y", d => y(d.Total))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.Total))
        //.attr("fill", 'dodgerblue');
        .attr("fill", function(d){ return levelColour(selectedLevel) })
        // Animation: show no bars at the start
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })
        .on("mouseover",function(){
                  d3.select(this)
              .attr("fill","red")
                }) 	
        .on("mouseout",function(){
                  d3.select(this)
                  .attr("fill", function(d){ return levelColour(selectedLevel) })
                }) 
        // .on("click", function() {
        //    		sortBars();
        //     });

        // Animation
        boxPlot.selectAll("rect")
        .transition()
        .duration(400)
        .attr("y", function(d) { return y(d.Total); })
        .attr("height", function(d) { return height - y(d.Total); })

    }

    // Call to update visualization when button changes
    d3.select("#selectLevel").on("change", function(event,d) {
        // recover the option that has been chosen
        const selectedLevel = d3.select(this).property("value")
        // run the update function with this selected option
        update(selectedLevel)
    })

    // Add a title woohoo!
    boxPlot.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("South-East Asian Countries, Ranked by Percentage of Dropouts");


})