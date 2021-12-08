//TODO: uppdateras på nya globala värden, dvs när year, emission types och countries ändras?
export function drawScatterPlot (promises, filterHandler) {
  promises.then(function ([world, co2, mappedNaturalDisasterData]) {
    var year = filterHandler.getYear()
    //var mappedNaturalDisasterCountryAndYear = []
    //mapNaturalDisasters(co2, naturalDisasterData, mappedNaturalDisasterCountryAndYear)

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 590 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom

    // append the svg object to the body of the page
    var svg = d3
      .select('#linechart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('margin-top', '25px')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    // Add X axis
    var x = d3
      .scaleLinear()
      .domain([0, 4000])
      .range([0, width])
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([0, 500])
      .range([height, 0])
    svg.append('g').call(d3.axisLeft(y))

    // Add dots
    svg
      .append('g')
      .selectAll('dot')
      .data(mappedNaturalDisasterData)
      .enter()
      .append('circle')
      .attr('cy', function (d) {
        return y(getNaturalDisastersForCountry(d, year))
      })
      .data(co2)
      .attr('cx', function (d) {
        return x(getEmissionsForCountry(d, year, filterHandler))
      })
      .attr('r', 3)
      .style('fill', '#69b3a2')
  })
}

function getNaturalDisastersForCountry (row, year) {
  if (row.year == year) {
    //TODO: fixa så att de som är 0 inte visas?
    return row.nbr
  }
}

function getEmissionsForCountry (row, year, filterHandler) {
  var emissionTypes = filterHandler.getEmissions()
  //TODO: räkna ihop för alla år, nu är det bara det faktiska årtalet och inte till och med årtalet.

  //förlåt för riktigt dålig kod lol
  if (year == row.year) {
    var tot = 0
    if (emissionTypes.includes('oil_co2') && parseInt(row.oil_co2) > 0) {
      tot = tot + parseInt(row.oil_co2)
    }
    if (emissionTypes.includes('gas_co2') && parseInt(row.gas_co2) > 0) {
      tot = tot + parseInt(row.gas_co2)
    }
    if (emissionTypes.includes('coal_co2') && parseInt(row.coal_co2) > 0) {
      tot = tot + parseInt(row.coal_co2)
    }
    if (emissionTypes.includes('cement_co2') && parseInt(row.cement_co2) > 0) {
      tot = tot + parseInt(row.cement_co2)
    }
    if (
      emissionTypes.includes('flaring_co2') &&
      parseInt(row.flaring_co2) > 0
    ) {
      tot = tot + parseInt(row.flaring_co2)
    }
    if (
      emissionTypes.includes('other_industry_co2') &&
      row.other_industry_co2 > 0
    ) {
      tot = tot + parseInt(row.other_industry_co2)
    }
    if (tot > 0) {
      return tot
    }
  }
}

//används för att filtrera ut ett nytt json-dataset, tar sjukt lång tid, använd den sparade filen istället.
function mapNaturalDisasters (
  co2_data,
  naturalDisaster_data,
  mappedNaturalDisasterCountryAndYear
) {
  co2_data.forEach(d => {
    var nbr = 0
    var c = d.country
    var y = d.year

    naturalDisaster_data.forEach(n => {
      if (c == n.country && y > n.year) {
        nbr++
      }
    })

    if (nbr > 0) {
      mappedNaturalDisasterCountryAndYear.push({
        country: c,
        year: y,
        nbr: nbr
      })
    }
  })

  var jsonData = JSON.stringify(mappedNaturalDisasterCountryAndYear)
  console.log(jsonData)
}
