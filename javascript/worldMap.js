async function drawpWorldMap (){
  var promises = [
    d3.json("world-geojson.json"),
    
    d3.csv("owid-co2-data.csv")
  ]

  const countryNameAccessor = d => d.properties['NAME']
  const countryIdAccessor = d => d.properties["ADM0_A3_IS"]
  const metric = "share_global_co2"
  const year = "2005"

  width = 600
  height= 400
  const projection2 = d3.geoMercator().scale(90).translate([width/2.1, height/1.5])

  const pathGenerator = d3.geoPath(projection2)


  const wrapper = d3.select("#wrapper")
    .append("svg")
    .style("background", "#afdbdb")
    .attr("width", width)
    .attr("height", height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${
      10
    }px, ${
      10
    }px)`)

  Promise.all(promises).then(ready)

  
  const tooltip = d3.select("#tooltip")

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

  function ready([worldMap, co2_dataset]){
    let metricDataByCountry = {}
    let worldMapFiltered = {}

    co2_dataset.forEach(d => {
      if (d["iso_code"] == "OWID_WRL" || d["year"] != year) return
      metricDataByCountry[d["iso_code"]] = + d ["share_global_co2"]
    })

    const metricValues = Object.values(metricDataByCountry)
    const metricValueExtent = d3.extent(metricValues)

    console.log(metricValueExtent)

    const colorScale = d3.scaleLog()
    .domain([0, metricValueExtent[0] + 0.01, metricValueExtent[1]])
    .range(["white", "white", "darkgreen"])

    const countries = bounds.selectAll(".country").data(worldMap.features.filter(function(d){
      return d.properties.NAME != "Antarctica"
    })).enter().append("path")
    .attr("class", "country")
    .attr("d", pathGenerator)
    .style("opacity", 0.9)
    .style("stroke", "white")
    .style("stroke-width", 0.3)
    .attr("fill", d => {
    const metricValue = metricDataByCountry[countryIdAccessor(d)]
    
    if(typeof metricValue == "undefined") return "#e2e6e9"
    // Scale down the countries that have too high share of global co2 emission. I.e. USA and China
    // Scale up other countries
    /*
    if (metricValue >= 10) {
      return colorScale(metricValue * 0.8)
    }
    if (metricValue < 10) {
      return colorScale(metricValue * 1.5)
    }
    */
    return colorScale(metricValue)
    })
    .on('mouseover',function(d){
      d3.select(this)
        .style("opacity", 1.0)
        .style("stroke","white")
        .style("stroke-width",2.5);
    })
    .on('mouseout', function(d){
      d3.select(this)
        .style("opacity", 0.9)
        .style("stroke","white")
        .style("stroke-width", 0.3);
    })
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)


  function onMouseEnter (datum) {
    tooltip.style("opacity", 1)
 
    const metricValue = metricDataByCountry[countryIdAccessor(datum)]
    tooltip.select("#country").text(countryNameAccessor(datum))
    tooltip.select("#value").text(`${d3.format(",.2f")(metricValue || 0)}%`)

    const [centerX, centerY] = pathGenerator.centroid(datum)

    const x = centerX + 10
    const y = centerY + 10

    tooltip.style("transform", `translate(`
      + `calc( -50% + ${x}px),`
      + `calc( 50% + ${y}px)`
      + `)`)

  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)
  }
  }

}

drawpWorldMap()