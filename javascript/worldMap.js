export async function drawpWorldMap (addSelectedCountry, promises) {
  var selectedCountries

  const countryNameAccessor = d => d.properties['NAME']
  const countryIdAccessor = d => d.properties['ADM0_A3_IS']
  const metric = 'share_global_co2'
  var year = '2020'

  const width = 650
  const height = 500

  const projection2 = d3
    .geoMercator()
    .scale(100)
    .translate([width / 2.1, height / 1.7])

  const pathGenerator = d3.geoPath(projection2)

  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .style('background', '#afdbdb')
    .attr('width', width)
    .attr('height', height)

  const bounds = wrapper
    .append('g')
    .style('transform', `translate(${10}px, ${10}px)`)

  promises.then(ready)

  const tooltip = d3.select('#tooltip')

  function filter (co2_dataset, metricDataByCountry) {
    co2_dataset.forEach(d => {
      if (d['iso_code'] == 'OWID_WRL' || d['year'] != year) return
      metricDataByCountry[d['iso_code']] = +d['share_global_co2']
    })
  }

  function ready ([worldMap, co2_dataset]) {
    let metricDataByCountry = {}

    filter(co2_dataset, metricDataByCountry)

    const metricValues = Object.values(metricDataByCountry)
    const metricValueExtent = d3.extent(metricValues)

    const colorScale = d3
      .scaleLog()
      .domain([0, metricValueExtent[0] + 0.01, metricValueExtent[1]])
      .range(['white', 'white', 'darkgreen'])

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
        return colorScale(metricValue)
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
      .on(
        'click',
        (selectedCountries = function (d) {
          var country = countryIdAccessor(d)
          console.log(country)
          addSelectedCountry(country)
        })
      )
      .on('mouseenter', onMouseEnter)
      .on('mouseleave', onMouseLeave)

    function onMouseEnter (datum) {
      tooltip.style('opacity', 1)

      const metricValue = metricDataByCountry[countryIdAccessor(datum)]
      tooltip.select('#country').text(countryNameAccessor(datum))
      tooltip.select('#value').text(`${d3.format(',.2f')(metricValue || 0)}%`)

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

    var title = d3
      .select('#wm-title')
      .append('text')
      .attr('id', 'yearTitle')
      .text(year)

    var slider = d3
      .sliderHorizontal()
      .tickFormat(d3.format('.0f'))
      .displayValue(year)
      .default(['2021'])
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
      .max(2021)
      .step(1)
      .width(530)
      .displayValue(false)
      .on('onchange', val => {
        year = val
        d3.select('#yearTitle').text(year)
        filter(co2_dataset, metricDataByCountry)
        bounds.selectAll('.country').attr('fill', d => {
          const metricValue = metricDataByCountry[countryIdAccessor(d)]
          if (typeof metricValue == 'undefined') return '#e2e6e9'
          return colorScale(metricValue)
        })
        console.log(year)
      })

    d3.select('#slider')
      .append('svg')
      .attr('width', 600)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(30,40)')
      .call(slider)

    var svg = d3.select('svg')

    svg
      .append('g')
      .attr('class', 'legendLog')
      .attr('transform', 'translate(20,440)')
      .on('mouseover', function (d) {})

    var legendLog = d3
      .legendColor()
      .shapeWidth(40)
      .shapePadding(10)
      .title('Quantiles')
      .cells(10)
      .labels([
        '0-10',
        '10-20',
        '20-30',
        '30-40',
        '40-50',
        '50-60',
        '60-70',
        '70-80',
        '80-90',
        '90-100'
      ])
      .orient('horizontal')
      .scale(colorScale)

    svg.select('.legendLog').call(legendLog)
  }
  return selectedCountries
}
