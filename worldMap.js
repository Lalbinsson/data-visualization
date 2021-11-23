async function drawpWorldMap (){
  var promises = [
    d3.json("world-geojson.json"),
    
    d3.csv("owid-co2-data.csv")
  ]

  const countryNameAccessor = d => d.properties['NAME']
  const countryIdAccessor = d => d.properties["ADM0_A3_IS"]
  const metric = "share_global_co2"
  const year = "2005"

  let dimensions = {
    width: window.innerWidth * 0.6,
    margin: {
      top:10,
      right: 10,
      bottom: 10,
      left: 10
    },
  }

  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right

  const sphere = ({type: "Sphere"})

  const projection2 = d3.geoEqualEarth()
  .fitWidth(dimensions.boundedWidth, sphere)

  const pathGenerator = d3.geoPath(projection2)

  const [[x0,y0], [x1,y1]] = pathGenerator.bounds(sphere)

  dimensions.boundedHeight = y1
  dimensions.height = dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${
      dimensions.margin.left
    }px, ${
      dimensions.margin.top
    }px)`)

  const earth = bounds.append("path")
  .attr("class", "earth")
  .attr("d", pathGenerator(sphere))

  const graticuleJson = d3.geoGraticule10()
  const graticule = bounds.append("path")
  .attr("class", "graticule")
  .attr("d", pathGenerator(graticuleJson))

  Promise.all(promises).then(ready)

  
  const tooltip = d3.select("#tooltip")

  function ready([worldMap, co2_dataset]){
    let metricDataByCountry = {}

    co2_dataset.forEach(d => {
      if (d["iso_code"] == "OWID_WRL" || d["year"] != year) return
      metricDataByCountry[d["iso_code"]] = + d ["share_global_co2"]
    })

    console.log(metricDataByCountry)

    const metricValues = Object.values(metricDataByCountry)
    const metricValueExtent = d3.extent(metricValues)

    console.log(metricValueExtent[1])

    const colorScale = d3.scaleLinear()
    .domain([0, metricValueExtent[1]])
    .range(["#BEE3C2", "darkgreen"])

    const countries = bounds.selectAll(".country").data(worldMap.features)
    .enter().append("path")
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
    if (metricValue >= 10) {
      return colorScale(metricValue * 0.8)
    }
    if (metricValue < 10) {
      return colorScale(metricValue * 1.5)
    }
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

    const x = centerX + dimensions.margin.left

    const y = centerY + dimensions.margin.top

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