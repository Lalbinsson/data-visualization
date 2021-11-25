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



class FilterHandler {
  filterHandler(currentFilteredData, currentEmissions, currentCountries, currentYears){
    currentFilteredData = this.currentFilteredData
    currentEmissions = this.currentEmissions
    currentCountries = this.currentCountries
    currentYears = this.currentYears
  }

  constructor(currentFilteredData, currentEmissions, currentCountries, currentYears){
    this.filterHandler(currentFilteredData, currentEmissions, currentCountries, currentYears);
      console.log(currentFilteredData, currentEmissions, currentCountries, currentYears);
  }

  filterDataSetOnCurrentFilters(){
    this.filterYear()
    //denna funkar inte nu, får promise
      /*  var dat = d3.csv("owid-co2-data.csv").then(function(csv) {
          csv = csv.filter(function(row) {
              return row['year'] == this.currentYears //&& row[this.currentEmissions] != ""
          });
          console.log(csv)
          return csv
          }); */
      this.updateCharts()
  }

  updateEmissions(newEmissions){
    this.currentEmissions = newEmissions
  }

  getEmissions(){
    return this.currentEmissions
  }

  updateYears(newYear){ //fixa så denna kan ta en range
      this.currentYears = newYear
  }

  getYears(){
    return this.currentYears
  }

  updateCharts(){
    document.getElementById("cEmission").innerHTML = this.currentEmissions
    document.getElementById("cYear").innerHTML = this.currentYears
    //update the charts that use global attributes
  }

  filterYear() {
    var dat = d3.csv("owid-co2-data.csv").then(function(csv, currentYears) {
      console.log(currentYears) //denna blir undefined, kanske pga nested func?
      csv = csv.filter(function(row) {
          return row['year'] == currentYears //går att filtrera på hårdkodat värde
      });
      console.log(csv)
      return csv
      });
    return dat
  }

}

export { FilterHandler };