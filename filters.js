
var currentFilteredData
var currentYear
var currentEmission


// får fortfarande promise på denna så måste lösa det, men rätt data loggas.
  function updateDataFromFilters() {
    currentFilteredData = d3.csv("owid-co2-data.csv").then(function(csv) {
        csv = csv.filter(function(row) {
                return row[currentEmission] != ""
        });
        console.log(csv)
        return csv
        });
   // getFiltered()
  }

  function getFiltered(){
    console.log(currentFilteredData) //denna blir fortf promise
  }

  function filterYear() {
    dat = d3.csv("owid-co2-data.csv").then(function(csv) {
      csv = csv.filter(function(row) {
          return row['year'] == currentYear
      });
      console.log(csv)
      return csv
      });
    return dat
  }

  function updateYear() {
    var year = document.getElementById("year-selector").value;
    currentYear = year
    document.getElementById("cYear").innerHTML = currentYear
    filterYear()
    //getYear()
  }

  function getYear(){
    console.log("get year:", currentYear)
    return currentYear
  }

  function filterEmission() {
      dat = d3.csv("owid-co2-data.csv").then(function(csv) {
      csv = csv.filter(function(row) {
          return row[currentEmission] != ""
      });
      console.log(csv)
      return csv
      });
  }

  function updateEmission() {
    var emission = document.getElementById("emission-selector").value;
    currentEmission = emission
    document.getElementById("cEmission").innerHTML = currentEmission
    filterEmission()
   // getEmission()
  }

  function getEmission(){
    console.log("get emission:", currentEmission)
    return currentEmission
  }

  function getFilterData(){


  }

  class Filter {
    constructor(label, value) {
        this.label = label;
        this.value = value;
    }
}

  class FilterHandler {
    constructor(currentData){
      currentData = this.currentData
      currentFilters = []
    }

    updateValue(label, newValue){
      //uppdatera
    }

    updateCurrentFilters() {
      //lägga till filters i filter-arrayen
    }

    updateCurrentData(){
      //uppdaters csv-filen beroende på currentFilters.
    }

  }