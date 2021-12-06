// set the dimensions and margins of the graph
const margin = {top: 40, right: 30, bottom: 70, left: 50},
width = 600 - margin.left - margin.right,
height = 550 - margin.top - margin.bottom;

// regions and corresponding countries 
let countries = {"SA": ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"], "ECA": ["Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Holy See", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kyrgyzstan", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Republic of Moldova", "Romania", "Russian Federation", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Tajikistan", "Turkey", "Turkmenistan", "Ukraine", "United Kingdom", "Uzbekistan"], "MENA": ["Algeria", "Bahrain", "Egypt", "Iran (Islamic Republic of)", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Libya", "Morocco", "Oman", "Qatar", "Saudi Arabia", "State of Palestine", "Syrian Arab Republic", "Tunisia", "United Arab Emirates", "Yemen"], "SSA": ["Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Togo", "Uganda", "United Republic of Tanzania", "Zambia", "Zimbabwe"], "LAC": ["Anguilla", "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia (Plurinational State of)", "Brazil", "British Virgin Islands", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Montserrat", "Nicaragua", "Panama", "Paraguay", "Peru", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Suriname", "Trinidad and Tobago", "Turks and Caicos Islands", "Uruguay", "Venezuela (Bolivarian Republic of)"], "EAP": ["Australia", "Brunei Darussalam", "Cambodia", "China", "Cook Islands", "North Korea", "Fiji", "Indonesia", "Japan", "Kiribati", "Laos", "Malaysia", "Marshall Islands", "Micronesia (Federated States of)", "Mongolia", "Myanmar", "Nauru", "New Zealand", "Niue", "Palau", "Papua New Guinea", "Philippines", "Republic of Korea", "Samoa", "Singapore", "Solomon Islands", "Thailand", "Timor-Leste", "Tokelau", "Tonga", "Tuvalu", "Vanuatu", "Viet Nam"]};

// some default variables
let attributes = ["region", "level"];
let region = "SA";
let mapdata, dataset;
let data = new Map();
// color scale for map filling
var colorScale = d3.scaleSequential().domain([0, 60])
.interpolator(d3.interpolateBlues);

// color scheme for bar plot
var colourScheme;

// Some global variables for the barplot - default level and demographic type
var selectedLevel = "Primary"; // Primary, Lower Secondary, Upper Secondary
var selectedDemoType = "Total"; // Total, Gender, Residence

// append svg for map
var map = d3.select("#mapViz")
// propjection is set to work with ECA region
const projection = d3.geoMercator()
    .center([70, 27])                // GPS of location to zoom on
    .scale(700)                       // This is like the zoom
    .translate([ width/2, height/1.8 ])

const path = d3.geoPath(projection);

const g = map.append('g');

// legend for map
var legend_x = width - 50
var legend_y = height + 60
    
map.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + legend_x + "," + legend_y+")");

var legend = d3.legendColor()
  .shapeWidth(26)
  .orient('horizontal')
  .title("Total Out of School Rates")
  .scale(colorScale)
  
map.select(".legend")
.call(legend)
.style("font-size", "8px");

// initiate tooltip
tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0)
.style("font", "20px sans-serif");

// Append svg for barplot 
var barPlotSVG = d3.select("#sortedBarplot")
.append("svg")
    .attr("width", width + 300)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);



// Function for choosing colours on the barplot based on DemoType
function chooseColours(selectedDemoType) {
    if (selectedDemoType=="Total") {
        colourScheme = ['orange'];
    } else if (selectedDemoType=="Gender") {
        colourScheme = ['dodgerblue', 'gold'];
    } else {
        colourScheme = ['green','brown'];
    }
    return colourScheme;   
}

Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("data/all_levels_tidy_SA.csv", function(d){
        return {
            country_id : d.ISO3,
            country : d.Country, 
            level: d.Level,
            demo_type: d.DemoType,
            demo_category: d.DemoCategory,
            demo_value: +d.DemoValue,
            total_value: +d.TotalValue,
        }
        
    })
]).then(function(loadData){
    
    // ****************************************************************************************
    // DATA LOADING FOR MAP AND BARPLOT 
    // ****************************************************************************************

    // mapdata is the geojson for drawing the map
    mapdata = loadData[0];
    
    // filter out map data based on chosen region
    mapdata.features = mapdata.features.filter(d => {return countries[region].includes(d.properties.name)})
    
    // dataset is the csv file for out of school rates; column names are defined  in line 74-81
    dataset = loadData[1];

    // Filter barplot data by the defaut level, and also by the default demoType,
    // and also sort it by the value of the default demographic
    var filteredData = dataset.filter(d => d.level === selectedLevel)
        .filter(d => d.demo_type === selectedDemoType)
        .sort((a, b) => b['total_value'] - a['total_value']);

    filteredData.forEach(d => data.set(d.country_id, d.total_value));
    
    // ****************************************************************************************
    // MAP MOUSEOVER AND DRAWING
    // ****************************************************************************************

    // mouseover for map
    let mouseOver = function(event, d, i) {
        selectedCountry = d.properties.name;
        console.log("selecting: ", selectedCountry);
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html("<b>" + d.properties.name + "</b>: " + "Total out of School Rates for "+ selectedLevel +" is " + data.get(d.id) + " % <br>" )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        barPlotSVG.selectAll("rect")
            .filter(function(data){
                return data.country === selectedCountry
            })
            .attr("fill", "red")
    }

    // //mouseleave for map
    let mouseLeave = function(d) {
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        .style("stroke", "grey")
        .style("opacity", .7);
        barPlotSVG.selectAll("rect")
            .attr("fill", data => zScale(data.demo_category));
        tooltip.transition()
        .style("opacity", 0);
    }

    

    // Draw the map
    map.append("g")
        .selectAll("path")
        .data(mapdata.features)
        .enter().append('path')
        .attr('class', 'country')
        .attr('d', path)
        .style("stroke", "grey")
        .style("stroke-opacity", .5)
        // set the color of each country
        .attr("fill", function (d) {
            // fill the country with total out of school
            return colorScale(data.get(d.id)); 
        })
        .style("opacity", .7)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave);
    
    
    // add name for each country on map (broken rn)
    // map.selectAll("text")
    //     .data(mapdata.features)
    //     .enter().append("text")
    //     .text(function (d) {
    //         return d.properties.name;
    //     })
    //     .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    //     .attr("dy", ".35em")
    //     .style("font-size", "11px")    
    


    // ****************************************************************************************
    // DROP-DOWN MENU SETUP
    // ****************************************************************************************

    // Get set of schooling levels - PRIMARY, LS, US
    const schoolLevels = new Set(dataset.map(d => d.level))

    // Add school levels as options to dropdown menu
    d3.select("#selectLevel")
        .selectAll('schoolLevels')
            .data(schoolLevels)
        .enter()
            .append('option')
        .text(function (d) { return d + " School"; }) // Drop-Down Menu text
        .attr("value", function (d) { return d; }) // Value returned by drop-down menu

    // Get set of demoTypes to plot for
    const demoTypes = ['Total', 'Gender', 'Residence']

    // Add demographics as options to dropdown menu
    d3.select("#selectDemoType")
        .selectAll('demoTypes')
            .data(demoTypes)
        .enter()
            .append('option')
        .text(function (d) { return d.replace(/([a-z])([A-Z])/g, '$1 $2'); }) // Drop-Down Menu text (split camel-case for pretty display)
        .attr("value", function (d) { return d; }) // Value returned by drop-down menu
    
    
    // ****************************************************************************************
    // BARPLOT AXES SETUP
    // ****************************************************************************************

    // Use filteredData to get the sub-categories for the demoType
    var selectedDemoCategories = new Set(filteredData.map(d => d.demo_category));

    // Get X, Y, Z values from selection
    // const X = d3.map(filteredData, d => d.country);
    // const Y = d3.map(filteredData, d => d.demo_value);
    // const Z = d3.map(filteredData, d => d.demo_category);

    // Add a title woohoo!
    barPlotSVG.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "14px") 
        .style("text-decoration", "underline")  
        .text("South-East Asian Countries, Ranked by Out-of-School Rates");

    
    // ********** X-Axis Stuff **********

    // Make X-scale
    var xScale = d3.scaleBand() // allows scaling of bars
        .domain(filteredData.map(d => d.country)) // map the country names to the x axis
        .range([ 0, width ]) //set range
        .paddingInner(0.2); // set the padding between the bars

    // Make X-axis + customise the positioning of xticks
    var xAxis = d3.axisBottom(xScale);

    // Add X-axis to the svg
    barPlotSVG.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
            .attr("transform", "translate(5,5)rotate(-30)") // rotation for readability
            .style("text-anchor", "end") // for vertical alignment
            .attr("font-size","11px"); // font size

    // Add X-label
    barPlotSVG.append("text")
        .attr("class", "xlabel")
        .attr("text-anchor", "end")
        .attr("x", (width + margin.left + margin.right)/2) // Position x-label
        .attr("y", height + margin.bottom)
        .text("Countries"); // Label
        
        
    // ********** Y-Axis Stuff **********

    // Make Y-scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(d) { return d.demo_value; })+10]) // some adjustments for a nice upper bound on the axis
        .range([ height, 0]);

    // Make Y-axis + customise the positioning of yticks and the grid
    var yAxis = d3.axisLeft(yScale)
        .tickFormat(d => d + " %");
    var yAxisGrid = d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('').ticks(10);

    // Add Y-axis to the svg
    barPlotSVG.append("g") 
        .attr("class", "yAxis")
        .call(yAxis)
        .selectAll("text")
            .attr("font-size","11px"); // font size

    // Add y-label
    barPlotSVG.append("text")
        .attr("class", "ylabel")
        .attr("text-anchor", "end")
        .attr("y", -margin.left/1.3) // **SEE HERE**: mind these if you change the margins or width/height
        .attr("x", margin.bottom - height/2.5) // **SEE HERE**: mind these if you change the margins or width/height
        .attr("transform", "rotate(-90)")
        .text("Out of School Rate (% of population)"); // Label

    // Add the Y gridlines
    barPlotSVG.append('g')
        .attr('class', 'yaxis-grid')
        .call(yAxisGrid);
 

    // ********** XZ-Axis Stuff **********

    // XZ Scale setup i.e. for side-by-side bars
    var xzScale = d3.scaleBand()
    .domain(filteredData.map(d => d.demo_category)) 
    .range([0, xScale.bandwidth()]) // set range
    .padding(0.05); // set the padding within the bars

    // Z Scale setup for colouring the bars
    const zScale = d3.scaleOrdinal()
    .domain(filteredData.map(d => d.demo_category)) // 
    .range(chooseColours(selectedDemoType)); //
    //.range(d3.schemeSet2); // set the range of colours
    
    // legend for bar chart
    var ordinal = d3.scaleOrdinal()
    .domain(["Total", "Male", "Female", "Rural",  "Urban"])
    .range(['orange', 'dodgerblue', 'gold','green', 'brown']);

    barPlotSVG.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(450,20)");

    var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
    .shapePadding(5)
    .scale(ordinal);

    barPlotSVG.select(".legendOrdinal")
    .call(legendOrdinal);

    // mouseover for barplot
    let barMouseOver = function(event, d, i) {
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html("<b>" + d.country + "</b>: " + "Out of School Rates for "+ d.demo_category + " in "+ selectedLevel +" is " + d.total_value + " % <br>" )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    // //mouseleave for barplot
    let barMouseLeave = function(d) {
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        tooltip.transition()
        .style("opacity", 0);
    }
    // ****************************************************************************************
    // MAKING THE BARS
    // ****************************************************************************************

    // Make the bars with the default school level + demographic to start with
    barPlot = barPlotSVG.selectAll("rect")
        .data(filteredData) 
        .join("rect")
            .attr("x", d => xScale(d.country) + xzScale(d.demo_category))
            .attr("y", d => yScale(d.demo_value))
            .attr("width", xzScale.bandwidth())
            .attr("height", d => height - yScale(d.demo_value))
            .attr("fill", d => zScale(d.demo_category))
            // Animation: show no bars at the start
            .attr("height", function() { return height - yScale(0); }) // always equal to 0
            .attr("y", function() { return yScale(0); })
            .on("mouseover", barMouseOver)
            .on("mouseleave", barMouseLeave);


    // Animation
    barPlotSVG.selectAll("rect")
        .transition()
        .duration(400)
        .attr("y", function(d) { return yScale(d.demo_value); })
        .attr("height", function(d) { return height - yScale(d.demo_value); });


    // ****************************************************************************************
    // UPDATE FUNCTION DECLARATIONS
    // ****************************************************************************************

    // Function to update visualisation based on school-level or demographic-type change
    function update(selectedLevel, selectedDemoType) {

        // Remove the old bars
        barPlotSVG.selectAll("rect").remove(); 
        
        // Filter data by the defaut level, and also by the default demoType,
        // and also sort it by the value of the default demographic
        const filteredData = dataset.filter(d => d.level === selectedLevel)
            .filter(d => d.demo_type === selectedDemoType)
            .sort((a, b) => b['total_value'] - a['total_value']);

        filteredData.forEach(d => data.set(d.country_id, d.total_value));
        
        // Use this to get the sub-categories for the demoType
        var selectedDemoCategories = new Set(filteredData.map(d => d.demo_category))

        // Update the yScale
        yScale.domain([0, d3.max(filteredData, function(d) { return d.demo_value; })+10]);
        // Update the yAxis and yAxisGrid
        var yAxis = d3.axisLeft(yScale)
            .tickFormat(d => d + " %");
        var yAxisGrid = d3.axisLeft(yScale).tickSize(-width)
            .tickFormat('')
            .ticks(10);
        // Re-draw the yAxis and yAxisGrid
        barPlotSVG.selectAll("g .yAxis")
            .call(yAxis)
        barPlotSVG.selectAll("g .yaxis-grid")
            .call(yAxisGrid);

        // Update the xScale
        xScale.domain(filteredData.map(d => d.country));
        // Update the xAxis
        var xAxis = d3.axisBottom(xScale)
        // Re-draw the xAxis
        barPlotSVG.selectAll("g .xAxis")
            .call(xAxis)

        // Update xzScale and zScale for the bars and their colours
        xzScale.domain(filteredData.map(d => d.demo_category)) 
            .range([0, xScale.bandwidth()]) // set range
        zScale.domain(filteredData.map(d => d.demo_category)) // 
        .range(chooseColours(selectedDemoType)); //

        // Update the barplot woohoo!
        
        barPlotSVG.selectAll("rect")
        .data(filteredData)
        .join("rect")
            .attr("x", d => xScale(d.country) + xzScale(d.demo_category))
            .attr("y", d => yScale(d.demo_value))
            .attr("width", xzScale.bandwidth())
            .attr("height", d => height - yScale(d.demo_value))
            .attr("fill", d => zScale(d.demo_category))
            // Animation: show no bars at the start
            .attr("height", function() { return height - yScale(0); }) // always equal to 0
            .attr("y", function() { return yScale(0); })
            .on("mouseover", barMouseOver)
            .on("mouseleave", barMouseLeave);

        // Animation
        barPlotSVG.selectAll("rect")
        .transition()
        .duration(400)
        .attr("y", function(d) { return yScale(d.demo_value); })
        .attr("height", function(d) { return height - yScale(d.demo_value); });

        // update fill color of the map
        map.selectAll("path")
        .data(mapdata.features)
        // set the color of each country
        .attr("fill", function (d) {
            // fill the country with total out of school
            return colorScale(data.get(d.id)); 
        })
    }
    
    // ****************************************************************************************
    // UPDATE FUNCTION CALLS
    // ****************************************************************************************

    // Call to update visualization when button changes
    d3.select("#selectLevel").on("change", function(event,d) {
        // recover the option that has been chosen
        selectedLevel = d3.select(this).property("value")
        // run the update function with this selected option
        update(selectedLevel, selectedDemoType)
    })

    // Call to update visualization when button changes
    d3.select("#selectDemoType").on("change", function(event,d) {
        // recover the option that has been chosen
        selectedDemoType = d3.select(this).property("value")
        
        // run the update function with this selected option
        update(selectedLevel, selectedDemoType)
    })


})