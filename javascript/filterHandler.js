  import { lineChart } from './lineChart.js';
  import { drawScatterPlot } from './scatterPlot.js';
class FilterHandler {
  filterHandler (
    currentFilteredData,
    currentEmissions,
    currentCountries,
    currentYear,
    currentNormalization
  ) {
    this.currentFilteredData = currentFilteredData
    this.currentEmissions = currentEmissions
    this.currentCountries = currentCountries
    this.currentYear = currentYear
    this.currentNormalization = currentNormalization
  }

  constructor (
    currentFilteredData,
    currentEmissions,
    currentCountries,
    currentYear,
    currentNormalization
  ) {
    this.filterHandler(
      currentFilteredData,
      currentEmissions,
      currentCountries,
      currentYear,
      currentNormalization
    )
  }

  filterDataSetOnCurrentFilters () {
    this.filterYear()
    this.updateCharts()
  }

  updateEmissions (newEmissions) {
    this.currentEmissions = newEmissions
    this.updateCharts()
  }

  getEmissions () {
    return this.currentEmissions
  }

  updateCountries (newCountries) {
    this.currentCountries = newCountries
    this.updateCharts()
  }

  getCountries () {
    return this.currentCountries
  }

  updateYear (newYear) {
    this.currentYear = newYear
    this.updateCharts()
  }

  getYear () {
    return this.currentYear
  }

  updateNormalization (newNormalization) {
    this.currentNormalization = newNormalization
  }

  getNormalization() {
    return this.currentNormalization

  }

  updateCharts () {
    if (!(this.currentEmissions == undefined)) {
      document.getElementById('cEmissions').innerHTML = this.currentEmissions
    }
    if (!(this.currentYear == undefined)) {
      document.getElementById('cYear').innerHTML = this.currentYear
    }
    if (!(this.currentCountries == undefined)) {
      document.getElementById('cCountries').innerHTML = this.currentCountries
    }
  }

  filterYear () {
    var dat = d3.csv('owid-co2-data.csv').then(function (csv, currentYear) {
      csv = csv.filter(function (row) {
        return row['year'] == currentYear
      })
      return csv
    })
    return dat
  }
}

export { FilterHandler }
