export async function lineChart (filterHandler) { //, countries, emissionTypes, max_year) {
  console.log(filterHandler.getCountries())
  console.log(filterHandler.getEmissions())
  console.log(filterHandler.getYear())

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 80, bottom: 50, left: 50},
width = 600 - margin.left - margin.right,
height = 300 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.timeParse("%Y");

// Set the ranges
var x = d3.scaleTime().range([0, width]);  
var y = d3.scaleLinear().range([height, 0]);

// Define the line
var priceline = d3.line()	
.x(function(d) { return x(d.year); })
.y(function(d) { return y(d.total_co2); });

// remove old svgs
d3.select("#lineplot").remove();

// Adds the svg canvas
var svg = d3.select("body")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "lineplot")
    .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("owid-co2-data.csv").then(function(data) {

var countries = filterHandler.getCountries()
var max_year = parseInt(filterHandler.getYear())
console.log(typeof max_year)
data.forEach(function(d) {

  if (parseInt(d.year) <= max_year) {
  //if (countries.includes(d.country)) { continue }
  d.year = parseDate(d.year);
  //console.log(typeof parseInt(d.year))
  d.total_co2 = 0
  var emissionTypes = filterHandler.getEmissions()
  if (emissionTypes.length === 0) {
    d.total_co2 = +d['co2']
  }
  else {
    for (let i=0; i<emissionTypes.length; i++) {
      var emissionType = emissionTypes[i]
      d.total_co2 += +d[emissionType]

  }
  }
}
})

// Remove data for countries we're not interested in
let filtered_data_countries = data.filter( function(item) {
  return countries.indexOf(item.country) !== -1;
}) 

// Remove data for years outside chosen intervals
let filtered_data = filtered_data_countries.filter(function(item) {
  return item.year < max_year
})

// Scale the range of the data
x.domain(d3.extent(filtered_data, function(d) { return d.year; }));
y.domain([0, d3.max(filtered_data, function(d) { return d.total_co2; })]);

// Group the entries by symbol
var dataNest = Array.from(
  d3.group(filtered_data, d => d.country), ([key, value]) => ({key, value})
);

// set the colour scale
var color = d3.scaleOrdinal(d3.schemeCategory10);

/*var legend = svg.selectAll('g')
.data(filtered_data)
.enter()
.append('g')
.attr('class', 'legend')*/

// Loop through each symbol / key
dataNest.forEach(function(d,i) { 

  console.log(d)
    svg.append("path")
        .attr("class", "line")
        .style("stroke", function() { // Add the colours dynamically
            return d.color = color(d.key); })
        .style("fill-opacity", 0)
        .attr("d", priceline(d.value));

    // Add the Legend
    svg.append("text")
    .attr("transform", "translate(" + (width+4) + "," + (y(d.value.at(-1).total_co2) + 3) + ")")
        .style("fill", "black")
        .style("font-size", "10px")
        .text(d.key);

    

});

// Add the X Axis
svg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
  .attr("class", "axis")
  .call(d3.axisLeft(y));

// Y label
svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('transform', 'translate(' + (-30)+',' + (height/2) + ')rotate(-90)')
  .style('font-family', 'Helvetica')
  .style('font-size', 12)
  .text('CO2');

// X label
svg.append('text')
  .attr('x', width/2)
  .attr('y', height+30)
  //.attr('text-anchor', 'middle')
  .style('font-family', 'Helvetica')
  .style('font-size', 12)
  .text('Year');



// Add mouseover

var mouseG = svg.append("g").attr("class", "mouse-over-effects")

mouseG.append("path")
  .attr("class", "mouse-line")
  .style("stroke", "black")
  .style("stroke-width", "1px")
  .style("opacity", "0");

var lines = document.getElementsByClassName('line')

var mousePerLine = mouseG.selectAll('.mouse-per-line')
  .data(dataNest)
  .enter()
  .append("g")
  .attr("class", "mouse-per-line");

mousePerLine.append("circle")
  .attr("r", 6)
  .style("stroke", function(d) { return color(d.key)})
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("opacity", "0");

mousePerLine.append("text")
  .attr("transform", "translate(10,3)")
  .style('font-size', '10')

mouseG.append('svg:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('fill', 'none')
  .attr('pointer-events', 'all')
  .on('mouseout', function(){
    d3.select(".mouse-line")
      .style('opacity', '0');
    d3.selectAll(".mouse-per-line circle")
      .style('opacity', '0');
    d3.selectAll(".mouse-per-line text")
      .style('opacity', '0');
  })
  .on('mouseover', function() {
    d3.select(".mouse-line")
      .style("opacity", "1");
    d3.selectAll(".mouse-per-line circle")
      .style("opacity", "1");
    d3.selectAll(".mouse-per-line text")
      .style("opacity", "1");
  })
  .on('mousemove', function() {
    var mouse = d3.mouse(this);
    d3.select(".mouse-line")
      .attr("d", function() {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });

    d3.selectAll(".mouse-per-line")
      .attr("transform", function(d, i) {
        var xDate = x.invert(mouse[0])
        var bisect = d3.bisector(function(d) { return d.year; }).right;
        var idx = bisect(d.value, xDate);

        var beginning = 0;
        var end = lines[i].getTotalLength();
        var target = null;

        while (true) {
          var target = Math.floor((beginning + end) / 2);
          var pos = lines[i].getPointAtLength(target);

          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break
          }
          if (pos.x > mouse[0])       end = target;
          else if (pos.x < mouse[0])  beginning = target;
          else                        break;
        }
        //console.log(d)
        d3.select(this).select("text")
          .text(d.key + "\n " + y.invert(pos.y).toFixed(2) + " ton/yr");

        return "translate(" + mouse[0] + "," + pos.y + ")";


      })
  })
});
}