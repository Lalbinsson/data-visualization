var width = 650
var height = 400

var svg = d3.select('body').append('svg').attr('width', width).attr('height', height).attr('class', 'map')

var projection = d3.geoMercator().scale(100).translate([width / 2 , height / 1.5])

var path = d3.geoPath(projection)

var promises = [
  d3.json("https://unpkg.com/world-atlas@1/world/110m.json")
]


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
  
  
