export async function drawWorldMap (
  addSelectedCountry,
  addSelectedEmission,
  updateYearForCircles,
  promises,
  filterHandler,
  lineChart,
  drawScatterPlot,
  disaster_coordinates
) {
  // remove old svgs
  d3.select('#worldMap').remove()
  d3.select('#sliderSVG').remove()
  //Global variables
  var countries_quant20 = []
  var countries_quant40 = []
  var countries_quant60 = []
  var countries_quant80 = []
  var countries_quant100 = []
  let metricDataByCountry = {}
  var quantile_20
  var quantile_40
  var quantile_60
  var quantile_80
  var quantile_100
  var metricValues
  var sorted_metricValues = []

  var toggleNaturalDisaster = document.getElementById('toggleNaturalDisasters')

  const countryNameAccessor = d => d.properties['NAME']
  const countryIdAccessor = d => d.properties['ADM0_A3_IS']
  var emissionType = filterHandler.getEmissions()
  var year = filterHandler.getYear()

  const width = window.innerWidth * 0.623
  const height = width * 0.7//window.innerHeight * 0.4
  const scale = 0.15863*width //143


  console.log('skala:', scale)
  const projection2 = d3
    .geoMercator()
    .scale(scale)
    .translate([width/2, height/1.67])

  const pathGenerator = d3.geoPath(projection2)

  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('id', 'worldMap')
    .attr('width', width)
    .attr('height', height)

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${0}px, ${0}px)`)

  promises.then(ready)

  const tooltip = d3.select('#tooltip')
  const options = d3.select('#options')

  function filterCO2 (co2_dataset, metricDataByCountry) {
    co2_dataset.forEach(d => {
      var result = 0
      if (d['iso_code'] == 'OWID_WRL' || d['year'] != year) return
      emissionType.forEach(element => {
        if (!isNaN(parseInt(d[element]))) {
          result = result + parseInt(d[element])
          metricDataByCountry[d['iso_code']] = +result
        }
      })
    })
  }

  function findQuantiles (sorted_metricValues, quantile_x, quantile_y) {
    var result = []
    sorted_metricValues.forEach(x => {
      if (x[0] >= quantile_x && x[0] <= quantile_y) {
        result.push(x[1])
      }
    })
    return result
  }

  function updateQuantiles (
    sorted_metricValues,
    quantile_20,
    quantile_40,
    quantile_60,
    quantile_80,
    quantile_100
  ) {
    var result = []
    countries_quant20 = findQuantiles(sorted_metricValues, 0, quantile_20)
    countries_quant40 = findQuantiles(
      sorted_metricValues,
      quantile_20 + 0.01,
      quantile_40
    )
    countries_quant60 = findQuantiles(
      sorted_metricValues,
      quantile_40 + 0.01,
      quantile_60
    )
    countries_quant80 = findQuantiles(
      sorted_metricValues,
      quantile_60 + 0.01,
      quantile_80
    )
    countries_quant100 = findQuantiles(
      sorted_metricValues,
      quantile_80 + 0.01,
      quantile_100
    )
  }

  function updateQuantileValues (metricValues) {
    quantile_20 = d3.quantile(metricValues, 0.2)
    quantile_40 = d3.quantile(metricValues, 0.4)
    quantile_60 = d3.quantile(metricValues, 0.6)
    quantile_80 = d3.quantile(metricValues, 0.8)
    quantile_100 = d3.quantile(metricValues, 1)
  }

  function mapNaturalDisasters (disasterlocations, disaster_coordinates) {
    disasterlocations.forEach(n => {
      disaster_coordinates.push({
        country: n.country,
        year: n.year,
        lat: n.latitude,
        lon: n.longitude
      })
    })

    var jsonData = JSON.stringify(disaster_coordinates)
   // console.log(jsonData)
  }

  function ready ([worldMap, co2_dataset, x, naturalDisaster_coordinates]) {
    filterCO2(co2_dataset, metricDataByCountry)

    //console.log(disasterlocations)
    //mapNaturalDisasters(disasterlocations, disaster_coordinates)

    for (var x in metricDataByCountry) {
      sorted_metricValues.push([metricDataByCountry[x], x])
    }

    metricValues = Object.values(metricDataByCountry)
    var metricValueExtent = d3.extent(metricValues)
    metricValues.sort((a, b) => a - b)

    updateQuantileValues(metricValues)

    updateQuantiles(
      sorted_metricValues,
      quantile_20,
      quantile_40,
      quantile_60,
      quantile_80,
      quantile_100
    )

    var colorScale = d3
      .scaleLog()
      .domain([0, metricValueExtent[0] + 0.01, metricValueExtent[1]])
      .range(['white', 'white', '#035e18'])
    const colorScaleLegend = d3
      .scaleQuantile()
      .domain(metricValues)
      .range(['white', '#bbcfb8', '#89ad86', '#588a56', '#035e18'])
    
    const countries = bounds
      .selectAll('.country')
      .data(
        worldMap.features.filter(function (d) {
          return d.properties.NAME != 'Antarctica'
        })
      )
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator)
      .style('opacity', 1)
      .style('stroke', 'white')
      .style('stroke-width', 0.7)
      .attr('fill', d => {
        const metricValue = metricDataByCountry[countryIdAccessor(d)]
        if (typeof metricValue == 'undefined') return '#e2e6e9'
        return colorScaleLegend(metricValue)
      })
      .on('mouseover', function (d) {
        d3.selectAll('.country')
          .transition()
          .duration(200)
          .style('opacity', 0.35)
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1.0)
      })
      .on('mouseout', function (d) {
        d3.selectAll('.country')
          .transition()
          .duration(200)
          .style('opacity', 1)
        d3.select(this)
          .style('opacity', 0.9)
          .style('stroke', 'white')
          .style('stroke-width', 0.3)
      })
      .on('click', function (d) {
        var country = countryIdAccessor(d)
      //  console.log(country)
        addSelectedCountry(country)
      })
      .on('mouseenter', onMouseEnter)
      .on('mouseleave', onMouseLeave)

    function onMouseEnter (datum) {
      tooltip.style('opacity', 1)

      const metricValue = metricDataByCountry[countryIdAccessor(datum)]
      tooltip.select('#country').text(countryNameAccessor(datum))
      tooltip.select('#value').text(`${d3.format(',.2f')(metricValue || 0)}`)

      const [centerX, centerY] = pathGenerator.centroid(datum)

      const x = centerX + 10
      const y = centerY + 10

      tooltip.style(
        'transform',
        `translate(` + `calc( -50% + ${x}px),` + `calc( 500% + ${y}px)` + `)`
      )
    }

    function onMouseLeave () {
      tooltip.style('opacity', 0)
    }

    var slider = d3
      .sliderHorizontal()
      .tickFormat(d3.format('.0f'))
      .displayValue(year)
      .default([year])
      .ticks(12)
      .tickValues([
        1900,
        1912,
        1924,
        1936,
        1948,
        1960,
        1972,
        1984,
        1996,
        2008,
        2020
      ])
      .min(1902)
      .max(2020)
      .step(1)
      .width(530)
      .displayValue(false)
      .on('end', val => {
        filterHandler.updateYear(val)
        year = filterHandler.getYear()

        d3.selectAll('circle').remove()
        disaster_coordinates = []
        updateYearForCircles(naturalDisaster_coordinates, disaster_coordinates)

        svg
          .append('g')
          .attr('id', 'canvas')
          .selectAll('circle')
          .data(disaster_coordinates)
          .enter()
          .append('circle')
          .attr('cx', function (d) {
            return projection2(d)[0]
          })
          .attr('cy', function (d) {
            return projection2(d)[1]
          })
          .attr('r', '0.5px')
          .attr('fill', 'red')
        if (toggleNaturalDisaster.checked == false) {
          d3.selectAll('#canvas').attr('visibility', 'hidden')
        }
      })
      .on('onchange', val => {
        filterHandler.updateYear(val)
        year = filterHandler.getYear()
        lineChart(filterHandler, promises)

        d3.select('#yearTitle').text(year)
        metricDataByCountry = {}
        filterCO2(co2_dataset, metricDataByCountry)
        sorted_metricValues = []
        for (var x in metricDataByCountry) {
          sorted_metricValues.push([metricDataByCountry[x], x])
        }
        metricValues = Object.values(metricDataByCountry)
        metricValues.sort((a, b) => a - b)
        updateQuantileValues(metricValues)
        updateQuantiles(
          sorted_metricValues,
          quantile_20,
          quantile_40,
          quantile_60,
          quantile_80,
          quantile_100
        )
        bounds.selectAll('.country').attr('fill', d => {
          const metricValue = metricDataByCountry[countryIdAccessor(d)]
          if (typeof metricValue == 'undefined') return '#6D6D6D'
          return colorScaleLegend(metricValue)
        })

        filterCO2(co2_dataset, metricDataByCountry)
        metricValues = Object.values(metricDataByCountry)
        metricValueExtent = d3.extent(metricValues)

        legendLog = d3
          .legendColor()
          .shapeWidth(40)
          .shapePadding(10)
          .title('Quantiles')
          .cells(10)
          .labels(['0-20', '20-40', '40-60', '60-80', '80-100'])
          .orient('horizontal')
          .scale(colorScaleLegend)

        d3.select('#worldMap')
          .select('.legendLog')
          .call(legendLog)
        //console.log(year)
      })

    var svg = d3.select('#worldMap')

    d3.select('#slider')
      .append('svg')
      .attr('id', 'sliderSVG')
      .attr('width', 500)
      .attr('height', 80)
      .append('g')
      .attr('transform', 'translate(30,40)')
      .call(slider)
    svg
      .append('g')
      .attr('id', 'canvas')
      .selectAll('circle')
      .data(disaster_coordinates)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return projection2(d)[0]
      })
      .attr('cy', function (d) {
        return projection2(d)[1]
      })
      .attr('r', '0.5px')
      .attr('fill', 'red')
    if (toggleNaturalDisaster.checked == false) {
      d3.selectAll('#canvas').attr('visibility', 'hidden')
    }


    //svg.select('.options')
    //.attr('transform', function() { return 'translate(30,'+ (height-60) +')' })
    // Quantiles legend
    svg
      .append('g')
      .attr('class', 'legendLog')
      .attr('id', 'ID_legendlog')
      .attr('transform', function() { return 'translate(30,'+ (height-60) +')' })
      .on('mouseover', function (d) {
        d3.selectAll('rect')._groups[0][0].setAttribute('id', 'rect-0')
        d3.selectAll('rect')._groups[0][1].setAttribute('id', 'rect-1')
        d3.selectAll('rect')._groups[0][2].setAttribute('id', 'rect-2')
        d3.selectAll('rect')._groups[0][3].setAttribute('id', 'rect-3')
        d3.selectAll('rect')._groups[0][4].setAttribute('id', 'rect-4')

        svg
          .select('#rect-0')
          .on('mouseover', function (d) {
            bounds
              .selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 0.1)

            bounds
              .selectAll('.country')
              .filter(function (d) {
                return countries_quant20.includes(d.properties.ADM0_A3_IS)
              })
              .transition()
              .duration(200)
              .style('opacity', 1.0)
          })
          .on('mouseout', function (d) {
            countries.data(
              worldMap.features.filter(function (d) {
                return d.properties.NAME != 'Antarctica'
              })
            )
            d3.selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 1)
            d3.select(this)
              .style('opacity', 0.9)
              .style('stroke', 'white')
              .style('stroke-width', 0.3)
          })
        svg
          .select('#rect-1')
          .on('mouseover', function (d) {
            bounds
              .selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 0.1)

            bounds
              .selectAll('.country')
              .filter(function (d) {
                return countries_quant40.includes(d.properties.ADM0_A3_IS)
              })
              .transition()
              .duration(200)
              .style('opacity', 1.0)
          })
          .on('mouseout', function (d) {
            countries.data(
              worldMap.features.filter(function (d) {
                return d.properties.NAME != 'Antarctica'
              })
            )
            d3.selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 1)
            d3.select(this)
              .style('opacity', 0.9)
              .style('stroke', 'white')
              .style('stroke-width', 0.3)
          })

        svg
          .select('#rect-2')
          .on('mouseover', function (d) {
            bounds
              .selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 0.1)

            bounds
              .selectAll('.country')
              .filter(function (d) {
                return countries_quant60.includes(d.properties.ADM0_A3_IS)
              })
              .transition()
              .duration(200)
              .style('opacity', 1.0)
          })
          .on('mouseout', function (d) {
            countries.data(
              worldMap.features.filter(function (d) {
                return d.properties.NAME != 'Antarctica'
              })
            )
            d3.selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 1)
            d3.select(this)
              .style('opacity', 0.9)
              .style('stroke', 'white')
              .style('stroke-width', 0.3)
          })
        svg
          .select('#rect-3')
          .on('mouseover', function (d) {
            bounds
              .selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 0.1)

            bounds
              .selectAll('.country')
              .filter(function (d) {
                return countries_quant80.includes(d.properties.ADM0_A3_IS)
              })
              .transition()
              .duration(200)
              .style('opacity', 1.0)
          })
          .on('mouseout', function (d) {
            countries.data(
              worldMap.features.filter(function (d) {
                return d.properties.NAME != 'Antarctica'
              })
            )
            d3.selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 1)
            d3.select(this)
              .style('opacity', 0.9)
              .style('stroke', 'white')
              .style('stroke-width', 0.3)
          })
        svg
          .select('#rect-4')
          .on('mouseover', function (d) {
            bounds
              .selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 0.1)

            bounds
              .selectAll('.country')
              .filter(function (d) {
                return countries_quant100.includes(d.properties.ADM0_A3_IS)
              })
              .transition()
              .duration(200)
              .style('opacity', 1.0)
          })
          .on('mouseout', function (d) {
            countries.data(
              worldMap.features.filter(function (d) {
                return d.properties.NAME != 'Antarctica'
              })
            )
            d3.selectAll('.country')
              .transition()
              .duration(200)
              .style('opacity', 1)
            d3.select(this)
              .style('opacity', 0.9)
              .style('stroke', 'white')
              .style('stroke-width', 0.3)
          })
      })

    var legendLog = d3
      .legendColor()
      .shapeWidth(40)
      .shapePadding(10)
      .title('Quantiles')
      .cells(6)
      .labels(['0-20', '20-40', '40-60', '60-80', '80-100'])
      .orient('horizontal')
      .scale(colorScaleLegend)

    svg.select('.legendLog').call(legendLog)
    /*
    svg
      .append('g')
      .attr('class', 'options')
      .attr('id', 'ID_options')
      .attr('transform', 'translate(30,330)')

    var options = d3
      .legendColor()
      .shapeWidth(40)
      .shapePadding(10)
      .cells()
      .orient('vertical')

    svg.select('.options').call(options)
    */

    d3.select('#toggleNaturalDisasters').on('click', val => {
      if (toggleNaturalDisaster.checked == true) {
        d3.selectAll('#canvas').attr('visibility', '')
      } else {
        d3.selectAll('#canvas').attr('visibility', 'hidden')
      }
     // console.log('CLICKED')
    })
  }
}
