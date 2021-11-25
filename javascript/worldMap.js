async function drawpWorldMap (){
  var promises = [
    d3.json("world-geojson.json"),
    d3.csv("owid-co2-data.csv")
  ]

  const countryNameAccessor = d => d.properties['NAME']
  const countryIdAccessor = d => d.properties["ADM0_A3_IS"]
  const metric = "share_global_co2"
  var year = "2020"

  width = 650
  height= 400
  const projection2 = d3.geoMercator().scale(100).translate([width/2.1, height/1.5])

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

  function filter(co2_dataset, metricDataByCountry) {
    co2_dataset.forEach(d => {
      if (d["iso_code"] == "OWID_WRL" || d["year"] != year) return
      metricDataByCountry[d["iso_code"]] = + d ["share_global_co2"]
    })
  }

  function ready([worldMap, co2_dataset]){
    let metricDataByCountry = {}

    filter(co2_dataset, metricDataByCountry)

    const metricValues = Object.values(metricDataByCountry)
    const metricValueExtent = d3.extent(metricValues)

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
    return colorScale(metricValue)
    })
    .on('mouseover',function(d){
      d3.select(this)
        .style("opacity", 1.0)
        .style("stroke","purple")
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

  var title = d3.select("#wm-title").append("text").attr("id", "yearTitle").text(year)

  var slider = d3
      .sliderHorizontal()
      .tickFormat(d3.format('.0f'))
      .displayValue(year)
      .fill(["#EE3234"])
      .default(["2021"])
      .ticks(12)
      .tickValues([1900, 1912, 1924, 1936, 1948, 1960, 1972, 1984, 1996, 2008, 2020])
      .min(1902)
      .max(2021)
      .step(1)
      .width(530)
      .displayValue(false)
      .on('onchange', (val) => {
        year=val
        d3.select("#yearTitle").text(year)
        filter(co2_dataset, metricDataByCountry)
        bounds.selectAll(".country")
        .attr("fill", d => {
          const metricValue = metricDataByCountry[countryIdAccessor(d)]
          if(typeof metricValue == "undefined") return "#e2e6e9"
          return colorScale(metricValue)
          })
        console.log(year)
      })
  
    d3.select('#slider')
      .append('svg')
      .attr('width', 600)
      .attr('height', 80)
      .append('g')
      .attr('transform', 'translate(30,30)')
      .call(slider);
  }
}


drawpWorldMap()
