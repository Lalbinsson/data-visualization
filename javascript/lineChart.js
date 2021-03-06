export async function lineChart (filterHandler, promises) {
  // Set the dimensions of the canvas / graph
  var margin = { top: 30, right: 120, bottom: 50, left: 60 },
    width = window.innerWidth * 0.47 - margin.left - margin.right,
    height = window.innerHeight * 0.5 - margin.top - margin.bottom

  // Parse the date / time
  var parseDate = d3.timeParse('%Y')

  // Set the ranges
  var x = d3.scaleLinear().range([0, width])
  var y = d3.scaleLinear().range([height, 0])

  // Define the line
  var priceline = d3
    .line()
    .x(function (d) {
      return x(d.year)
    })

    .y(function (d) {
      return y(d.total_co2)
    })

  // remove old svgs
  d3.select('#lineplot').remove()

  // Adds the svg canvas
  var svg = d3
    .select('#linechart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('id', 'lineplot')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  // Get the data
  promises.then(function ([
    worldMap,
    co2_dataset,
    placeholder,
    naturalDisaster_coordinates
  ]) {
    var countries = filterHandler.getCountries()
    var max_year = parseInt(filterHandler.getYear())
    var emissionTypes = filterHandler.getEmissions()
    var normalizationType = filterHandler.getNormalization()
    var normalizationFactor = 1

    co2_dataset.forEach(function (d) {
      if (normalizationType === 'capita') {
        normalizationFactor = parseInt(d.population) / 1000000
      } else if (normalizationType === 'gdp') {
        normalizationFactor = parseInt(d.gdp) / 1000000
      } else {
        normalizationFactor = 1
      }

      if (d.year > 1900) {
        d.year = parseInt(d.year)
      }
      d.total_co2 = 0
        if (emissionTypes[0] === ['co2'] && emissionTypes.length === 1) {
          d.total_co2 = +d['co2']/normalizationFactor
        } 
        else {
          for (let i = 0; i < emissionTypes.length; i++) {
            var emissionType = emissionTypes[i]
            if (!isNaN(d[emissionType])) {
              if (isNaN(+d[emissionType]/normalizationFactor)) {
                d.total_co2 += 0
              }
              else  {d.total_co2 += +d[emissionType]/normalizationFactor}
            }
          }
        }
    })

    // Remove data for countries we're not interested in
    let filtered_data_countries = co2_dataset.filter(function (item) {
      return countries.indexOf(item.iso_code) !== -1
    })

    // Remove data for years outside chosen intervals
    let filtered_data = filtered_data_countries.filter(function (item) {
      return item.year <= max_year + 1 && item.year >= 1900
    })

    // Scale the range of the data
    x.domain(
      d3.extent(filtered_data, function (d) {
        return d.year
      })
    )

    y.domain([
      0,
      d3.max(filtered_data, function (d) {
        return d.total_co2
      })
    ]).nice()

    // Group the entries by symbol
    var dataNest = Array.from(
      d3.group(filtered_data, d => d.country),
      ([key, value]) => ({ key, value })
    )

    // set the colour scale
    var color = d3.scaleOrdinal(d3.schemeCategory10)

    // Loop through each symbol / key
    dataNest.forEach(function (d, i) {
      svg
        .append('path')
        .attr('class', 'line')
        .style('stroke', function () {
          return (d.color = color(d.key))
        })
        .style('fill-opacity', 0)
        .attr('d', priceline(d.value))

      // Add the Legend
      svg
        .append('text')
        .attr(
          'transform',
          'translate(' +
            (width + 4) +
            ',' +
            (y(d.value.at(-1).total_co2) + 3) +
            ')'
        )
        .style('fill', 'black')
        .style('font-size', '10px')
        .text(d.key)
    })

    // Add the X Axis
    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))

    // Add the Y Axis
    svg
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y))

    // Y label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', function () {
      if (normalizationType === 'gdp') {
        return 'translate(' + -48 + ',' + height / 2 + ')rotate(-90)'
      }
      return 'translate(' + -35 + ',' + height / 2 + ')rotate(-90)'
    })
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('CO2')
      .text(function() {
        if (normalizationType === 'none') {return 'CO2 (million ton)'}
        else if (normalizationType === 'gdp') {return 'CO2 (ton per GDP)'}
        else {return 'CO2 (ton per capita)'}
      })

    // X label
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      //.attr('text-anchor', 'middle')
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('Year')

    // Add mouseover
    var mouseG = svg.append('g').attr('class', 'mouse-over-effects')

    mouseG
      .append('path')
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0')

    var lines = document.getElementsByClassName('line')

    var mousePerLine = mouseG
      .selectAll('.mouse-per-line')
      .data(dataNest)
      .enter()
      .append('g')
      .attr('class', 'mouse-per-line')

    mousePerLine
      .append('circle')
      .attr('r', 6)
      .style('stroke', function (d) {
        return color(d.key)
      })
      .style('fill', 'none')
      .style('stroke-width', '1px')
      .style('opacity', '0')

    mousePerLine
      .append('text')
      .attr('transform', 'translate(10,3)')
      .style('font-size', '10')

    d3.select('#lineplot')
      .append('text')
      .attr('id', 'yearBox')
      .attr('x', '450px')
      .attr('y', '30px')

    mouseG
      .append('svg:rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function () {
        d3.select('.mouse-line').style('opacity', '0')
        d3.selectAll('.mouse-per-line circle').style('opacity', '0')
        d3.selectAll('.mouse-per-line text').style('opacity', '0')
        d3.selectAll('.text-box').style('opacity', '0')
        d3.select('#yearBox').style('opacity', '0')
      })
      .on('mouseover', function () {
        d3.select('.mouse-line').style('opacity', '1')
        d3.selectAll('.mouse-per-line circle').style('opacity', '1')
        d3.selectAll('.mouse-per-line text').style('opacity', '1')
      })
      .on('mousemove', function () {
        var mouse = d3.mouse(this)
        d3.select('.mouse-line').attr('d', function () {
          var d = 'M' + mouse[0] + ',' + height
          d += ' ' + mouse[0] + ',' + 0
          return d
        })
        let listOfYPos = []

        // Update position for circle in floating legend
        d3.selectAll('.mouse-per-line circle').attr('transform', function (
          d,
          i
        ) {
          var xDate = x.invert(mouse[0])
          var bisect = d3.bisector(function (d) {
            return d.year
          }).right
          var idx = bisect(d.value, xDate)
          var beginning = 0
          var end = lines[i].getTotalLength()
          var target = null
          while (true) {
            var target = Math.floor((beginning + end) / 2)
            var pos = lines[i].getPointAtLength(target)

            if (
              (target === end || target === beginning) &&
              pos.x !== mouse[0]
            ) {
              break
            }
            if (pos.x > mouse[0]) end = target
            else if (pos.x < mouse[0]) beginning = target
            else break
          }
          d3.select('#yearBox')
            .text(parseInt(xDate))
            .style('opacity', '1')
          return 'translate(' + mouse[0] + ',' + pos.y + ')'
        })

        // Update text and position for text in floating legend
        d3.selectAll('.mouse-per-line text').attr('transform', function (d, i) {
          var xDate = x.invert(mouse[0])
          var bisect = d3.bisector(function (d) {
            return d.year
          }).right
          var idx = bisect(d.value, xDate)
          var beginning = 0
          var end = lines[i].getTotalLength()
          var target = null
          while (true) {
            var target = Math.floor((beginning + end) / 2)
            var pos = lines[i].getPointAtLength(target)

            if (
              (target === end || target === beginning) &&
              pos.x !== mouse[0]
            ) {
              break
            }
            if (pos.x > mouse[0]) end = target
            else if (pos.x < mouse[0]) beginning = target
            else break
          }

          if (xDate < d.value[0].year) {
            var outputString = ''
          }
          if (normalizationType === 'none') {
            var outputString = Math.round(xDate) + ': ' + d.key + '\n ' + y.invert(pos.y).toFixed(2) + ' mil. ton'
          }
          else {
            var outputString = Math.round(xDate) + ': ' + d.key + '\n ' + y.invert(pos.y).toFixed(4) + ' ton'
          }
          const stringLength = outputString.length
          d3.select(this).text(outputString)

          if (width - mouse[0] < 130) {
            if (normalizationType === 'none') {
              return (
                'translate(' +
                (mouse[0] - 4.4 * stringLength - 8) +
                ',' +
                (pos.y + 3) +
                ')'
              )
            } else {
              return (
                'translate(' +
                (mouse[0] - 4.4 * stringLength - 12) +
                ',' +
                (pos.y + 3) +
                ')'
              )
            }
          }
          return 'translate(' + (mouse[0] + 8) + ',' + (pos.y + 3) + ')'
        })
      })
  })
}
