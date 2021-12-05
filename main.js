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

// Set default school level
const defaultLevel = "Primary"

// color scale for map filling
var colorScale = d3.scaleSequential().domain([0, 100])
.interpolator(d3.interpolateBlues);



// append svg for map
const map = d3.select("#mapViz")
// propjection is set to work with ECA region
const projection = d3.geoMercator()
    .center([70, 27])                // GPS of location to zoom on
    .scale(700)                       // This is like the zoom
    .translate([ width/2, height/1.8 ])

const path = d3.geoPath(projection);

const g = map.append('g');

// legend for map
var legend_x = width - 100
var legend_y = height + 60
    
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
  .attr("width", width + 300)
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
        return {
            country_id : d.ISO3,
            country : d.Country, 
            total : +d.Total,
            female: +d.Female,
            male:  +d.Male, // convert "Male" column to number
            rural:  +d.RuralResidence,
            urban: +d.UrbanResidence,
            level: d.Level   
        }
        
    })
]).then(function(loadData){
    
    // mapdata is the geojson for drawing the map
    mapdata = loadData[0];
    // dataset is the csv file for out of school rates; column names are defined  in line 74-81
    dataset = loadData[1];
    
    //filter out map data based on chosen region
    mapdata.features = mapdata.features.filter(d => {return countries[region].includes(d.properties.name)})
    
    // Filter dataset by the defaut School level and also sort it
    let filteredData = dataset.filter(d => d.level === defaultLevel).sort((a, b) => b.Total - a.Total)
    console.log("Filtered Data:", filteredData);

    // mouseover for map
    let mouseOver = function(event, d, i) {
        selectedCountry =d.properties.name;
        console.log("selecting: ", selectedCountry);
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html("<b>" + d.properties.name + "</b>: " + "Total out of School Rates for Upper Secondary Schooling Level is " + data.get(d.id) + " % <br>" )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    // //mouseleave for map
    let mouseLeave = function(d) {
        selectedCountry = null;
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "transparent")
        .style("stroke", "grey");
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
            // fill teh country with total out of school
            let row = filteredData.filter(data => data.country_id === d.id);
            d.total = row[0].total|| 0;
            return colorScale(d.total);
        })
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave);
    
    map.selectAll("text")
        .data(mapdata.features)
        .enter().append("text")
        .text(function(d) {
            console.log(d.properties.name);
            return d.properties.name;
        })
        .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("font-size", "11px")
    


    // Get set of schooling levels - LS, PRIMARY, US
    const schoolLevels = new Set(dataset.map(d => d.level))
    // console.log(schoolLevels)

   // Add school levels as options to dropdown menu
    d3.select("#selectLevel")
    .selectAll('schoolLevels')
        .data(schoolLevels)
    .enter()
        .append('option')
    .text(function (d) { return d + " School"; }) // Drop-Down Menu text
    .attr("value", function (d) { return d; }) // Value returned by drop-down menu

    
    // Set colors for each school level
    const levelColour = d3.scaleOrdinal()
    .domain(schoolLevels)
    .range(d3.schemeSet2);

    // X axis
    const x = d3.scaleBand() // allows scaling of bars
    .range([ 0, width ])
    .domain(filteredData.map(d => d.country)) // map the country names to the x axis
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
    .attr("y", -margin.left/1.6) // **SEE HERE**: mind these if you change the margins or width/height
    .attr("x", margin.bottom - height/2.8) // **SEE HERE**: mind these if you change the margins or width/height
    .attr("transform", "rotate(-90)")
    .text("Percentage of Students Dropped Out"); // Label

    // Make the bars with a chosen default school level to start with
    const barplot = boxPlot.selectAll("bars")
    .data(filteredData) 
    .join("rect")
        .attr("x", d => x(d.country))
        .attr("y", d => y(d.total))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.total))
        .attr("fill", function(d){ return levelColour(defaultLevel)})
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
       

    // Animation
    boxPlot.selectAll("rect")
    .transition()
    .duration(400)
    .attr("y", function(d) { return y(d.total); })
    .attr("height", function(d) { return height - y(d.total); })
    //.delay(function(d,i){console.log(i) ; return(i*100)})

    // Function to update visualization based on school level selected
    function update(selectedLevel) {

        // Filter data by the selected level and also sort it
        filteredData = dataset.filter(d => d.level === selectedLevel).sort((a, b) => b.Total - a.Total)

        // Recalculate x-axis domain based on selected school level + sorted countries
        // x.domain(filteredData.map(d => d.Country)) // map the country names to the x axis

        // Update the barplot based on the selected school level
        barplot.data(filteredData)
        .join("rect")
        .attr("x", d => x(d.country))
        .attr("y", d => y(d.total))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.total))
        //.attr("fill", 'dodgerblue');
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
                  .attr("fill", function(d){ return levelColour(selectedLevel) })
                }) 
        .on("click", function() {
           		sortBars();
            });

        // Animation
        boxPlot.selectAll("rect")
        .transition()
        .duration(400)
        .attr("y", function(d) { return y(d.total); })
        .attr("height", function(d) { return height - y(d.total); })

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