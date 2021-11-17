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
  
  