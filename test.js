import { FilterHandler } from './filterHandler.js'; 

var width = 650
var height = 400

var svg = d3.select('#map').append('svg').attr('width', width).attr('height', height).attr('class', 'map')

var projection = d3.geoMercator().scale(100).translate([width / 2 , height / 1.5])

var path = d3.geoPath(projection)

var promises = [
  d3.json("https://unpkg.com/world-atlas@1/world/110m.json")
]

var emissionTypes = ["coal_co2", "gas_co2", "oil_co2", "cement_co2", "flaring_co2", "other_industry_co2"]
var years = ["1950", "1960", "1970"]

// initializing the FilterHandler-class with defaultValues
const defaultCountries = []
const defaultYears = ["2000", "1999"]
var defaultEmissions = "gas_co2"
var defaultFilteredData = []
var filterHandler = new FilterHandler(defaultFilteredData, defaultEmissions, defaultCountries, defaultYears);

Promise.all(promises).then(ready)

// adding the options to the button
d3.select("#emission-selector")
  .selectAll()
  .data(emissionTypes)
  .enter()
  .append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) 

  d3.select("#emission-selector").on("change", function() {
    var selectedEmissions = d3.select(this).property("value"); //kolla på att läsa in fler värden från checkboxen.
    filterHandler.updateEmissions(selectedEmissions)
    console.log(filterHandler.getEmissions())
    filterHandler.filterDataSetOnCurrentFilters() //should be called on all global updates to update all filters()
})


// adding the options to the button
d3.select("#year-selector")
  .selectAll()
  .data(years)
  .enter()
  .append('option')
  .text(function (d) { return d; }) // text showed in the menu
  .attr("value", function (d) { return d; }) 

  d3.select("#year-selector").on("change", function() {
    var selectedYear = d3.select(this).property("value"); //kolla på att läsa in fler värden från checkboxen.
    filterHandler.updateYears(selectedYear)
    console.log(filterHandler.getYears())
    filterHandler.filterDataSetOnCurrentFilters() //should be called on all global updates to update all filters()
})


Promise.all(promises).then(ready)

function ready([world]){

  console.log(world)
  svg.append("g")
  .attr("class","countries")
  .selectAll("path")
  .data(topojson.feature(world, world.objects.countries).features).enter().append("path").attr("fill", "#5adb7c")
  .style('stroke', 'white')
  .style('stroke-width', 0.3)
  .style("opacity",0.8)
  .attr("d", path)

  // On mouse hover
  .on('mouseover',function(d){
    d3.select(this)
      .style("opacity", 1)
      .style("stroke","white")
      .style("stroke-width",1.8);
  })
  .on('mouseout', function(d){
    d3.select(this)
      .style("opacity", 0.8)
      .style("stroke","white")
      .style("stroke-width",0.3);
  });
  
}

var currentYear = 2021

function changeColor() {
    d3.select("#blue")
      .attr("fill", "yellow");
  }
  
  function changeRadius() {
    d3.selectAll(".red")
      .attr("r", 10);
  }
  
  function logData() {
    var data = d3.json("owid-co2-data.json");
    console.log(data);
  }

  function filterYear(year) {
    var dat = d3.csv("owid-co2-data.csv").then(function(csv) {
      csv = csv.filter(function(row) {
          return row['year'] == year
      });
      console.log(csv)
      currentYear = year
      return csv
      });
  }
  
  
