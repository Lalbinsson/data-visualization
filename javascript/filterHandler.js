/* //gammal kod som inte tillhör klassen, men kanske kan återanvända filteringen.
// får fortfarande promise på denna så måste lösa det, men rätt data loggas.
  function updateDataFromFilters() {
    currentFilteredData = d3.csv("owid-co2-data.csv").then(function(csv) {
        csv = csv.filter(function(row) {
                return row[currentEmission] != ""
        });
        console.log(csv)
        return csv
        });
    getFiltered()
  }

  function getFiltered(){
    console.log(currentFilteredData) //denna blir fortf promise
  }



  function updateYear() {
    var year = document.getElementById("year-selector").value;
    currentYear = year
    document.getElementById("cYear").innerHTML = currentYear
    filterYear()
    updateDataFromFilters()
    //getYear()
  }

  function getYear(){
    console.log("get year:", currentYear)
    return currentYear
  }

  function updateEmission() {
    var emission = document.getElementById("emission-selector").value;
    currentEmission = emission
    document.getElementById("cEmission").innerHTML = currentEmission
    filterEmission()
   // getEmission()
  } */

//import { lineChart } from "./lineChart";
import { lineChart } from './lineChart.js';


class FilterHandler {
  filterHandler(currentFilteredData, currentEmissions, currentCountries, currentYear){
    this.currentFilteredData = currentFilteredData
    this.currentEmissions = currentEmissions
    this.currentCountries = currentCountries
    this.currentYear = currentYear
  }

  constructor(currentFilteredData, currentEmissions, currentCountries, currentYear){
    this.filterHandler(currentFilteredData, currentEmissions, currentCountries, currentYear);
      console.log(currentFilteredData, currentEmissions, currentCountries, currentYear);
  }


  // funkar inte som den ska än.
  filterDataSetOnCurrentFilters(){
    this.filterYear()
    //denna funkar inte nu, får promise
      /*  var dat = d3.csv("owid-co2-data.csv").then(function(csv) {
          csv = csv.filter(function(row) {
              return row['year'] == this.currentYear //&& row[this.currentEmissions] != ""
          });
          console.log(csv)
          return csv
          }); */
      this.updateCharts()
  }

  updateEmissions(newEmissions){
    this.currentEmissions = newEmissions
    this.updateCharts()
  }

  getEmissions(){
    return this.currentEmissions
  }

  updateCountries(newCountries){
    this.currentCountries = newCountries
    this.updateCharts()
  }

  getCountries(){
    return this.currentCountries
  }

  updateYear(newYear){
      this.currentYear = newYear
      this.updateCharts()
  }

  getYear(){
    return this.currentYear
  }

  //update the charts that use global attributes, this only updates the printed values in the html right now.
  updateCharts(){
    if (!(this.currentEmissions == undefined)) {
      document.getElementById("cEmissions").innerHTML = this.currentEmissions
    } else {
      console.log("undef?")
    }
    if (!(this.currentYear == undefined)) {
    document.getElementById("cYear").innerHTML = this.currentYear
    }
    if (!(this.currentCountries == undefined)) {
    document.getElementById("cCountries").innerHTML = this.currentCountries
    }
    //console.log(this.filterHandler.getCountries())
    //lineChart(this.filterHandler, this.filterHandler.getCountries(), this.filterHandler.getEmissions(), this.filterHandler.getYear())
  }


  //den här funkar inte som den ska än.
  filterYear() {
    var dat = d3.csv("owid-co2-data.csv").then(function(csv, currentYear) {
     // console.log(currentYear) //denna blir undefined, kanske pga nested func?
      csv = csv.filter(function(row) {
          return row['year'] == currentYear //går att filtrera på hårdkodat värde
      });
    //  console.log(csv)
      return csv
      });
    return dat
  }

}

export { FilterHandler };
