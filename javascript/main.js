import { FilterHandler } from './filterHandler.js'
import { lineChart } from './lineChart.js'
import { drawWorldMap } from './worldMap.js'
import { drawScatterPlot } from './scatterPlot.js'

//TODO: read these from the data set
var allEmissions = [
  'co2',
  'coal_co2',
  'gas_co2',
  'oil_co2',
  'cement_co2',
  'flaring_co2',
  'other_industry_co2'
//  'consumption_co2'
]
var allYears = ['1960', '1970', '1990']
var allCountries = []
var allCountriesMap = new Map()

const countryNameAccessor = d => d.properties['NAME']
const countryIdAccessor = d => d.properties['ADM0_A3_IS']

var promises = [
  d3.json('../world-geojson.json'),
  d3.csv('../owid-co2-data.csv'),
  //d3.csv('../disasterlocations.csv')
  d3.json('../naturalDisastersMappedIso.json'),
  d3.json('../naturalDisasters_coordinates.json')
]

var promises = Promise.all(promises)

// initializing the FilterHandler-class with defaultValues
var selectedEmissions = ['co2'] //''coal_co2', 'gas_co2', 'oil_co2', 'cement_co2', 'flaring_co2', 'other_industry_co2']
var selectedYear = 1990 //"2000" //"1990"
var selectedCountries = ['AFG', 'SWE']
//var selectedYear = 2000 //"2000" //"1990"
//var selectedEmissions = ['oil_co2']
var defaultFilteredData = []
var currentNormalization = "none"
var filterHandler = new FilterHandler(
  defaultFilteredData,
  selectedEmissions,
  selectedCountries,
  selectedYear,
  currentNormalization
)

//just to have an initial value to avoid undefined
filterHandler.updateYear(selectedYear)
//filterHandler.updateEmissions(selectedEmissions)
//filterHandler.updateCountries(selectedCountries)

d3.select('#year-selector')
  .selectAll()
  .data(allYears)
  .enter()
  .append('li')
  .text(function (d) {
    return d
  }) // text showed in the menu
  .attr('value', function (d) {
    return d
  })


  //används ens den här?
d3.select('#year-selector').on('change', function () {
  var newYear = d3.select(this).property('value')
  filterHandler.updateYear(newYear)
  lineChart(filterHandler)
  drawScatterPlot(promises, filterHandler)
  console.log(filterHandler.getYear())
})

var disaster_coordinates = []
function updateYearForCircles (
  naturalDisaster_coordinates,
  disaster_coordinates
) {
  var id = 0

  naturalDisaster_coordinates.forEach(d => {
    if (d.year >= filterHandler.getYear()) return
    disaster_coordinates.push([d.lon, d.lat])
  })
  drawScatterPlot(promises, filterHandler)
  lineChart(filterHandler, promises)
}

promises.then(function ([
  worldMap,
  co2_dataset,
  x,
  naturalDisaster_coordinates
]) {
  updateYearForCircles(naturalDisaster_coordinates, disaster_coordinates)

  for (let i = 0; i < worldMap.features.length; i++) {
    if (isNaN(countryIdAccessor(worldMap.features[i])))
      allCountriesMap.set(countryIdAccessor(worldMap.features[i]), countryNameAccessor(worldMap.features[i]))
      allCountries.push(countryIdAccessor(worldMap.features[i]))
  }
  allCountries.sort()
  //addSelectedEmission(selectedEmissions)

  d3.select('#countries-dropdown')
    .selectAll()
    .data(allCountries)
    .enter()
    .append('button')
    .attr('class', 'btn btn-success')
    .attr('id', 'dropdown_elements')
    .on('click', function (d) {
      addSelectedCountry(d)
      // lineChart(filterHandler, promises)
    })
    .text(function (d) {
      return getCountryName(d)
    }) // text showed in the menu
    .append('input')
    .attr('type', 'checkbox')
    .attr('class', 'checkedCountries')
    .attr('vertical-align', 'middle')
    .attr('id', function (d) {
      return d + '_checkbox'
    })
    .style('float', 'left') //move box left of label
    .on('change', function () {
      //  console.log('clicked on ', this.id)
      if (this.checked) {
        if (!selectedCountries.includes(this.id)) {
          selectedCountries.push(this.id)
        }
      } else {
        if (selectedCountries.includes(this.id)) {
          const index = selectedCountries.indexOf(this.id)
          if (index > -1) {
            selectedCountries.splice(index, 1)
          }
        }
      }
      //update countries in filterHandler
      //osäker på hur vi ska få detta att gå åt båda hållen så att boxes blir unchecked om man väljer det på kartan, tror att vi kanske bara kan selecta det elementet och sätta checked till false eller något.
      filterHandler.updateCountries(selectedCountries)
      drawScatterPlot(promises, filterHandler)
      lineChart(filterHandler, promises)
      //console.log(filterHandler.getCountries)
    })
  initEmissionCheckBox(selectedEmissions)
  initCountryCheckBox(selectedCountries)
})

d3.select('#emissions-dropdown')
  .selectAll()
  .data(allEmissions)
  .enter()
  .append('button')
  .attr('class', 'btn btn-success')
  .attr('id', 'dropdown_elements')
  .on('click', function (d) {
    addSelectedEmission(d)
    drawScatterPlot(promises, filterHandler)
    lineChart(filterHandler, promises)
    drawWorldMap(
      addSelectedCountry,
      addSelectedEmission,
      updateYearForCircles,
      promises,
      filterHandler,
      lineChart,
      drawScatterPlot,
      disaster_coordinates
    )
  })
  .text(function (d) {
    return getNameForEmissionsType(d)
  }) // text showed in the menu
  .append('input')
  .attr('type', 'checkbox')
  .attr('class', 'checkedEmissions')
  .attr('id', function (d) {
    return d
  })
  .style('float', 'left') //move box left of label
  .on('change', function () {
    updateDropdown
    //console.log(filterHandler.getEmissions())
  })

function getNameForEmissionsType(d) {
  if(d == 'gas_co2') {
    return 'Gas'
  } 
  if(d == 'cement_co2') {
    return 'Cement'
  }
  if(d == 'oil_co2') {
    return 'Oil'
  }
  if(d == 'co2') {
    return 'All'
  }
  if(d == 'other_industry_co2') {
    return 'Other industry'
  }
  if(d == 'consumption_co2') {
    return 'Consumption'
  }
  if(d == 'flaring_co2') {
    return 'Flaring'
  }
  if(d == 'coal_co2') {
    return 'Coal'
  }
}

function getCountryName(d) {
  return allCountriesMap.get(d)
}

function updateDropdown () {
  if (this.checked) {
    if (!selectedEmissions.includes(this.id)) {
      selectedEmissions.push(this.id)
    }
  } else {
    if (selectedEmissions.includes(this.id)) {
      const index = selectedEmissions.indexOf(this.id)
      if (index > -1) {
        selectedEmissions.splice(index, 1)
      }
    }
  }

  filterHandler.updateEmissions(selectedEmissions)
  //drawScatterPlot(promises, filterHandler)
  //lineChart(promises, filterHandler)
  drawScatterPlot(promises, filterHandler)
  lineChart(filterHandler)
  //console.log(filterHandler.getEmissions());
}

//gör dropdown-listorna hidden/visible på click, fixa så att de inte tar upp hela ytan när de är hidden.
var checkListCountries = document.getElementById('countries-selector')
var countryList = document.getElementsByClassName('countries')[0]
checkListCountries.onclick = function (evt) {
  if (countryList.style.visibility == 'visible')
    countryList.style.visibility = 'hidden'
  else countryList.style.visibility = 'visible'
}

checkListCountries.onblur = function (evt) {
  countryList.style.visibility = 'hidden'
}

var checkListEmissions = document.getElementById('emissions-selector')
var emissionList = document.getElementsByClassName('emissions')[0]
checkListEmissions.onclick = function (evt) {
  if (emissionList.style.visibility == 'visible')
    emissionList.style.visibility = 'hidden'
  else emissionList.style.visibility = 'visible'
}

checkListEmissions.onblur = function (evt) {
  emissionList.style.visibility = 'hidden'
}

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

function initCountryCheckBox (array) {
  array.forEach(d => {
    var element = document.getElementById(d + '_checkbox')
    if (element.checked == false) {
      element.checked = true
    }
  })
}

function initEmissionCheckBox (array) {
  array.forEach(d => {
    var element = document.getElementById(d)
    if (element.checked == false) {
      element.checked = true
    }
  })
}

function addSelectedEmission (emission) {
  var index = selectedEmissions.indexOf(emission)
  var element = document.getElementById(emission)
  if (index !== -1) {
    selectedEmissions.splice(index, 1)
    element.checked = false
  } else {
    selectedEmissions.push(emission)
    element.checked = true
  }
  filterHandler.updateEmissions(selectedEmissions)
  lineChart(filterHandler, promises)
}

function addSelectedCountry (country) {
  var index = selectedCountries.indexOf(country)
  var element = document.getElementById(country + '_checkbox')
  console.log('countr', country)
  if (index !== -1) {
    selectedCountries.splice(index, 1)
    element.checked = false
  } else {
    selectedCountries.push(country)
    element.checked = true
  }
  filterHandler.updateCountries(selectedCountries)
  lineChart(filterHandler, promises)
  drawScatterPlot(promises, filterHandler)
}

// Update normalization
var radiobuttons = d3.selectAll('.radiobutton');
radiobuttons.on('change', function (d) {
  console.log('Radio button change to ', this.value)
  filterHandler.updateNormalization(this.value)
  lineChart(filterHandler, promises)
});

drawWorldMap(
  addSelectedCountry,
  addSelectedEmission,
  updateYearForCircles,
  promises,
  filterHandler,
  lineChart,
  drawScatterPlot,
  disaster_coordinates
)
lineChart(filterHandler, promises)
drawScatterPlot(promises, filterHandler)
