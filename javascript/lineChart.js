export async function lineChart (filterHandler, promises) {
  //, countries, emissionTypes, max_year) {
  console.log(filterHandler.getCountries())
  console.log(filterHandler.getEmissions())
  console.log('year:', filterHandler.getYear())

  let checkForLargestEmitter = function (datanest) {
    let maxEmissions = 0
    let largestEmitter = 0
    let country = ''
    let country_i = -1
    for (var i = 0; i < datanest.length; i++) {
      if (datanest[i]['country'] !== country) {
        console.log('old index:', country_i)
        country_i = country_i + 1
        console.log('updated index:', country_i)
      }
      country = datanest[i]['country']
      //console.log('largest data:', datanest[i]["co2"])
      if (datanest[i]['co2'] > maxEmissions) {
        maxEmissions = datanest[i]['co2']
        largestEmitter = country_i //datanest[i]["country"]
        console.log('output:', largestEmitter)
      }
    }
    return largestEmitter
  }
  // Set the dimensions of the canvas / graph
  var margin = { top: 30, right: 80, bottom: 50, left: 50 },
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom

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
    .select('body')
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
    console.log(
      'the year is:' + max_year + ' and year is type: ' + typeof max_year
    )
    co2_dataset.forEach(function (d) {
      //if (parseInt(d.year) <= max_year) {
      //console.log("year in int: ", parseInt(d.year))
      //console.log("year in date: ", parseDate(d.year))
      //if (countries.includes(d.country)) { continue }
      //console.log(parseInt(parseDate(d.year)))
      d.year = parseInt(d.year)
      //console.log(typeof parseInt(d.year))
      d.total_co2 = 0
      var emissionTypes = filterHandler.getEmissions()
      if (emissionTypes.length === 1) {
        d.total_co2 = +d['co2']
      } else {
        for (let i = 0; i < emissionTypes.length; i++) {
          var emissionType = emissionTypes[i]
          if (!isNaN(d[emissionType])) {
            d.total_co2 += +d[emissionType]
          }
        }
      }
      //}
    })

    // Remove data for countries we're not interested in
    let filtered_data_countries = co2_dataset.filter(function (item) {
      return countries.indexOf(item.iso_code) !== -1
    })

    // Remove data for years outside chosen intervals
    let filtered_data = filtered_data_countries.filter(function (item) {
      return item.year < max_year
    })

    console.log(
      'date extent:',
      d3.extent(filtered_data, function (d) {
        return d.year
      })
    )
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
    ])

    // Group the entries by symbol
    var dataNest = Array.from(
      d3.group(filtered_data, d => d.country),
      ([key, value]) => ({ key, value })
    )

    // set the colour scale
    var color = d3.scaleOrdinal(d3.schemeCategory10)

    /*var legend = svg.selectAll('g')
.data(filtered_data)
.enter()
.append('g')
.attr('class', 'legend')*/

    console.log(dataNest)
    // Loop through each symbol / key
    dataNest.forEach(function (d, i) {
      console.log(d.value)
      svg
        .append('path')
        .attr('class', 'line')
        .style('stroke', function () {
          // Add the colours dynamically
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
      .attr('transform', 'translate(' + -30 + ',' + height / 2 + ')rotate(-90)')
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('CO2')

    // X label
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      //.attr('text-anchor', 'middle')
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('Year')

    // Create dictionary for used data that can be used to floating legend
    let dataDict = new Object()
    dataNest.forEach(function (d, i) {
      dataDict[d.key] = {}
      d.value.forEach(function (row, index) {
        dataDict[d.key][row.year.toString()] = row.total_co2
      })
    })

    console.log('finished dict:', dataDict)

    // Add mouseover

    var mouseG = svg.append('g').attr('class', 'mouse-over-effects')

    var legend = mouseG
      .selectAll('text-box')
      .data(dataNest)
      .enter()
      .append('g')
      .attr('class', 'text-box')

    legend
      .append('rect')
      .attr('width', 100)
      .attr('height', 100)
      .style('opacity', '0')

    legend
      .append('text')
      .attr('transform', 'translate(10,3)')
      .style('font-size', '10')
      .style('fill', 'black')
    //.text('hejhej')

    /*
mouseG.append("rect")
.attr("class", "text-box")
.attr("width", 100)
.attr("height", 100)
.style("opacity", "0");


var textbox = mouseG.select("text-box")
.enter()
.append('g')
.attr("class", "textlegend")

textbox.append("text")
.attr("transform", "translate(10,3)")
.style('font-size', '10')
.text('HEJHEJHEJ')
.style('fill', 'black')

console.log('textbox', textbox)*/

    mouseG
      .append('path')
      .attr('class', 'mouse-line')
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('opacity', '0')

    console.log('mouseG', mouseG)

    var lines = document.getElementsByClassName('line')

    let largestEmittingCountry = checkForLargestEmitter(filtered_data)
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

    console.log('mouse per line:', mousePerLine)
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
      })
      .on('mouseover', function () {
        d3.select('.mouse-line').style('opacity', '1')
        d3.selectAll('.mouse-per-line circle').style('opacity', '1')
        d3.selectAll('.mouse-per-line text').style('opacity', '1')
        d3.selectAll('.text-box')
          .style('opacity', '0.75')
          .style('fill', 'white')
      })
      .on('mousemove', function () {
        var mouse = d3.mouse(this)
        d3.select('.mouse-line').attr('d', function () {
          var d = 'M' + mouse[0] + ',' + height
          d += ' ' + mouse[0] + ',' + 0
          return d
        })

        //d3.select("")
        d3.selectAll('.text-box').attr('transform', function () {
          console.log('textbox:', this)
          //console.log("d year;", d.value["year"])
          var xDate = x.invert(mouse[0])
          //var bisect = d3.bisector(function(d) { return d.year; }).right;
          //var idx = bisect(d.value, xDate);

          var beginning = 0
          var end = lines[largestEmittingCountry].getTotalLength()
          var target = null

          while (true) {
            var target = Math.floor((beginning + end) / 2)
            var pos = lines[largestEmittingCountry].getPointAtLength(target)

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
          //pos.y = 94;
          let printOutString = ''
          /*for (var i=0; i<countries.length; i++) {
          printOutString += ", " + countries[i] + ": " + dataDict[countries[i]][Math.round(xDate).toString()] + " ton/yr"
        }*/

          //d3.select(this).append("text").attr("text", printOutString).attr("opacity", "1")
          /*d3.select(this).select("text")
          .text(printOutString)
          .style("fill", "black")
          .attr("opacity", "1");*/

          d3.select(this)
            .select('rect')
            .attr('opacity', '0.5')

          console.log('this text:', d3.select(this).select('text'))

          return 'translate(' + mouse[0] + ',' + pos.y + ')'
        })
        console.log(d3.select('.text-box').select('rect'))
        let listOfYPos = []
        d3.selectAll('.mouse-per-line').attr('transform', function (d, i) {
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
          d3.select(this)
            .select('text')
            .text(d.key + '\n ' + y.invert(pos.y).toFixed(2) + ' ton/yr')
          /*.text(function() {
            let outputString = ""
            for (var i = 0; i<countries.length; i++) {
              console.log("outside co2 func", d)
              outputString += countries[i] + ": " + getCO2val(d)
              console.log(outputString)
            }
          })*/
          //let overlap = true
          //if (listOfYPos.length === 0) {
          // overlap = false
          //}

          /*let checkOverlap = function(yPos, otherYpos) {
          for (var i=0; i<otherYpos.length; i++) {
            
            if (Math.abs(yPos - otherYpos[i]) < 20) {
              //console.log(Math.abs(yPos - otherYpos[i]))
              return true
            }
          }
          return false
        }
        var newYPos = pos.y
        let maxIterations = 100
        let j = 0
        while (overlap && j < maxIterations) {
          j += 1
          for (var i = 0; i < listOfYPos.length; i++) {
            if ((Math.abs(listOfYPos[i] - newYPos) < 0.5) && listOfYPos[i]<newYPos) {
              newYPos += 15
              //console.log("moved label up")
            }
            else if ((Math.abs(listOfYPos[i] - newYPos) < 0.5) && listOfYPos[i]>newYPos) {
              newYPos -= 15
              //console.log("moved label down")
            } 
          }
          overlap = checkOverlap(newYPos, listOfYPos)
        }
        
        listOfYPos.push(newYPos)*/
          return 'translate(' + mouse[0] + ',' + pos.y + ')'
          //return "translate(" + mouse[0] + "," + newYPos + ")";
        })
      })
  })
}
