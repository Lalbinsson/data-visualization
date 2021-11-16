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
  
  