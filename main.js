// the map svg
let width = 750, height = 450;
let margin = { top: 20, right: 15, bottom: 30, left: 40 };
let w = width - margin.left - margin.right;
let h = height - margin.top - margin.bottom;
const SAcountries = ['Afghanistan','Bangladesh', 'Bhutan', 'India','Maldives', 'Nepal','Pakistan', 'Sri Lanka'];
let countryMap = '{"SA": ["Afghanistan", "Bangladesh", "Bhutan", "India", "Maldives", "Nepal", "Pakistan", "Sri Lanka"], "ECA": ["Albania", "Andorra", "Armenia", "Austria", "Azerbaijan", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", "Holy See", "Hungary", "Iceland", "Ireland", "Italy", "Kazakhstan", "Kyrgyzstan", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Republic of Moldova", "Romania", "Russian Federation", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Tajikistan", "Turkey", "Turkmenistan", "Ukraine", "United Kingdom", "Uzbekistan"], "MENA": ["Algeria", "Bahrain", "Egypt", "Iran (Islamic Republic of)", "Iraq", "Israel", "Jordan", "Kuwait", "Lebanon", "Libya", "Morocco", "Oman", "Qatar", "Saudi Arabia", "State of Palestine", "Syrian Arab Republic", "Tunisia", "United Arab Emirates", "Yemen"], "SSA": ["Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", "Central African Republic", "Chad", "Comoros", "Congo", "Democratic Republic of the Congo", "Djibouti", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Togo", "Uganda", "United Republic of Tanzania", "Zambia", "Zimbabwe"], "LAC": ["Anguilla", "Antigua and Barbuda", "Argentina", "Bahamas", "Barbados", "Belize", "Bolivia (Plurinational State of)", "Brazil", "British Virgin Islands", "Chile", "Colombia", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "Ecuador", "El Salvador", "Grenada", "Guatemala", "Guyana", "Haiti", "Honduras", "Jamaica", "Mexico", "Montserrat", "Nicaragua", "Panama", "Paraguay", "Peru", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Suriname", "Trinidad and Tobago", "Turks and Caicos Islands", "Uruguay", "Venezuela (Bolivarian Republic of)"], "EAP": ["Australia", "Brunei Darussalam", "Cambodia", "China", "Cook Islands", "North Korea", "Fiji", "Indonesia", "Japan", "Kiribati", "Laos", "Malaysia", "Marshall Islands", "Micronesia (Federated States of)", "Mongolia", "Myanmar", "Nauru", "New Zealand", "Niue", "Palau", "Papua New Guinea", "Philippines", "Republic of Korea", "Samoa", "Singapore", "Solomon Islands", "Thailand", "Timor-Leste", "Tokelau", "Tonga", "Tuvalu", "Vanuatu", "Viet Nam"]}'
contryMap = JSON.parse(countryMap);
let attributes = ["region", "level"];
let region = "SA";
let mapdata, dataset, filter_query;

const map = d3.select("svg")

const projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

const path = d3.geoPath(projection);

const g = map.append('g');


d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data){


// Filter data
data.features = data.features.filter(d => {return SAcountries.includes(d.properties.name)})
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
