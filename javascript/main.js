import { FilterHandler } from './filterHandler.js'; 
import { lineChart } from './lineChart.js';
import { drawpWorldMap } from './worldMap.js';

var emissionTypes = ["coal_co2", "gas_co2", "oil_co2", "cement_co2", "flaring_co2", "other_industry_co2"]
var years = ["1950", "1960", "1970"]

// initializing the FilterHandler-class with defaultValues
const defaultCountries = []
const defaultYears = ["2000", "1999"]
var defaultEmissions = "gas_co2"
var defaultFilteredData = []
var filterHandler = new FilterHandler(defaultFilteredData, defaultEmissions, defaultCountries, defaultYears);

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

/*
var currentYear = 2021

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
  */

drawpWorldMap()
lineChart()