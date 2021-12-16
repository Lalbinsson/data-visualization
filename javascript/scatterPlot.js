export async function drawScatterPlot (promises, filterHandler) {
  promises.then(function ([world, co2, mappedNaturalDisasterData]) {
    var year = filterHandler.getYear()
    var emissionTypes = filterHandler.getEmissions()
    var countries = filterHandler.getCountries()

      // set the dimensions and margins of the graph
      var margin = {top: 30, right: 30, bottom: 50, left: 50},
      width = window.innerWidth * 0.47  - margin.left - margin.right,
      height = window.innerHeight * 0.5  - margin.top - margin.bottom;

    var filteredNatDis = mappedNaturalDisasterData.filter(function (d) {
      return d.year == year && d.nbr > 0 && countries.includes(d.iso_code)
    })

    var filteredCo2 = co2.filter(function (d) {
      return (
        countries.includes(d.iso_code) && d.iso_code != '' && d.year == year
      )
    })

    // remove old svgs
    d3.select('#scatterSvg').remove()

    // append the svg object to the body of the page
    var svg = d3
      .select('#scatterPlot')
      .append('svg')
      .attr('id', 'scatterSvg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        // Add X axis
        var x = d3.scaleLinear()
          .domain( [ 0, 1.15*d3.max(filteredCo2, function( d ) { return getEmissionsForCountry(d, year, emissionTypes) }) ] )
          .range([ 0, width ])
          .nice();
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(5));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain( [ 0, 1.1*d3.max(filteredNatDis, function( d ) { return d.nbr }) ] )
          .range([ height, 0])
          .nice();
        svg.append("g")
          .call(d3.axisLeft(y));

    // Y label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + -30 + ',' + height / 2 + ')rotate(-90)')
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('Natural disasters (nbr)')

    // X label
    svg
      .append('text')
      .attr('x', width / 2 -75)
      .attr('y', height + 30)
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('CO2 Emissions (million ton)')

        // Add dots
      var circ = svg.append('g');
      const box_width = 210
      const box_height = 70
      if (emissionTypes.length>0){ 
        circ
        .selectAll("dot")
        .data(filteredNatDis)
        .enter()
        .append("rect")
          .attr('y', function (d) { 
            const temp_y = parseFloat(y(getNaturalDisastersForCountry(d)));
            if (height - temp_y < box_height) {
              return temp_y - box_height
            }
            return temp_y
          } )
          .data(filteredCo2)
          .attr('x', function (d) { 
            var temp_x = parseFloat(x(getEmissionsForCountry(d, year, emissionTypes))); 
            if (width - temp_x < box_width) {
              return temp_x - box_width
            }
            return temp_x
          } )
          .attr("width", box_width)
          .attr("height", box_height)
          .attr("rx", 5)
          .attr("stroke", "#8bb098")
          .attr("stroke-opacity", 0.5)
          .attr("fill", "#ffffff")
          .attr("id", function(d) { return "rect"+d.iso_code.toString()+d.year.toString(); })
          .style('opacity', '0');

          circ.selectAll("dot")
          .data(filteredNatDis)
          .enter()
          .append("text")
          .attr('y', function (d) { 
            const temp_y = parseFloat(y(getNaturalDisastersForCountry(d)));
            if (height - temp_y < box_height) {
              return temp_y - (box_height - 20)
            }
            return temp_y + 20
          } )
            .data(filteredCo2)
            .attr('x', function (d) { 
              if (getEmissionsForCountry(d, year, emissionTypes)>0) {
                var temp_x = parseFloat(x(getEmissionsForCountry(d, year, emissionTypes))); 
                if (width - temp_x < box_width) {
                  return temp_x - (box_width - 10)
                }
                return temp_x + 10
             } else {
                return 10
             } } )
            .attr("id", function(d) { return "text"+d.iso_code.toString()+d.year.toString(); })
            .style('opacity', '0')
            .text(function(d) { return d.country; })
            .attr('font-weight', "bold")
            .style('font-size', 12)
              .append("tspan")
              .attr('dy', 20)
              .attr('font-weight', "normal")
              .data(filteredCo2)
              .attr('dx', function (d) { return 0 })
              .attr('x', function (d) { 
                if (getEmissionsForCountry(d, year, emissionTypes)>0) {
                  var temp_x = parseFloat(x(getEmissionsForCountry(d, year, emissionTypes))); 
                  if (width - temp_x < box_width) {
                    return temp_x - (box_width - 10)
                  }
                  return temp_x + 10
                } else {
                  return 10
                }
              } )
              .text(function(d) { return "Co2 Emissions: "+getEmissionsForCountry(d, year, emissionTypes).toFixed(2)+" million ton"; })
              .append("tspan")
              .attr('dx', function (d) { return 0 })
              .attr('x', function (d) { 
                if (getEmissionsForCountry(d, year, emissionTypes)>0) {
                  var temp_x = parseFloat(x(getEmissionsForCountry(d, year, emissionTypes))); 
                  if (width - temp_x < box_width) {
                    return temp_x - (box_width - 10)
                  }
                  return temp_x + 10
                } else {
                  return 10
                }
              } )
              .data(filteredNatDis)
              .text(function(d) { return "Natural Disasters: "+getNaturalDisastersForCountry(d)+" st"; })
              .attr('dy', 20)

      circ
        .selectAll('dot')
        .data(filteredNatDis)
        .enter()
        .append("circle")
          .attr('id', function (d) {
            return d.iso_code + '_scatterplot'
          })
          .attr("cy", function (d) { return parseFloat(y(getNaturalDisastersForCountry(d))); } )
          .data(filteredCo2)
          .attr("cx", function (d) { return parseFloat(x(getEmissionsForCountry(d, year, emissionTypes))); } )
          .attr("r", 5)
          .style("fill", "#8bb098")
          .on('mouseover', function (d) {
            d3.select("#rect"+(d.iso_code.toString()+d.year.toString()))
             .transition()
             .duration(0.1)
             .style('opacity', '1');

          d3.select('#text' + (d.iso_code.toString() + d.year.toString()))
            .transition()
            .duration(0.1)
            .style('opacity', '1')

          d3.select(this)
            .transition()
            .duration(0.1)
            .attr('r', 7)
            .style('opacity', '0.5')
        })
        .on('mouseout', function (d) {
          d3.select(this)
            .transition()
            .duration(0.1)
            .attr('r', 5)
            .style('opacity', '1')

          d3.select('#rect' + (d.iso_code.toString() + d.year.toString()))
            .transition()
            .duration(0.1)
            .style('opacity', '0')
          d3.select('#text' + (d.iso_code.toString() + d.year.toString()))
            .transition()
            .duration(0.1)
            .style('opacity', '0')
        })
    }
  })
}

function getNaturalDisastersForCountry (row) {
  return row.nbr
}

function getEmissionsForCountry (row, year, emissionTypes) {
  if (emissionTypes.length > 0) {
    var tot = 0


        for (let y = 1700; y <= year; y++) {
        if (emissionTypes.includes('co2') && !Number.isNaN(row.co2) && parseFloat(row.co2)>0) {
          tot= tot+parseFloat(row.co2)
        } else {
          if (emissionTypes.includes('oil_co2') && !Number.isNaN(row.oil_co2) && parseFloat(row.oil_co2)>0) {
            tot= tot+parseFloat(row.oil_co2)
          }
          if (emissionTypes.includes('consumption_co2') && !Number.isNaN(row.consumption_co2) && parseFloat(row.consumption_co2)>0) {
            tot= tot+parseFloat(row.consumption_co2)
          }
          if (emissionTypes.includes('gas_co2') && !Number.isNaN(row.gas_co2) && parseFloat(row.gas_co2)>0) {
            tot= tot+parseFloat(row.gas_co2)
          }
          if (emissionTypes.includes('coal_co2') && !Number.isNaN(row.coal_co2) && parseFloat(row.coal_co2)>0) {
            tot= tot+parseFloat(row.coal_co2)
          }
          if (emissionTypes.includes('cement_co2') && !Number.isNaN(row.cement_co2) && parseFloat(row.cement_co2)>0) {
            tot= tot+parseFloat(row.cement_co2)
          }
          if (emissionTypes.includes('flaring_co2') && !Number.isNaN(row.flaring_co2) && parseFloat(row.flaring_co2)>0) {
            tot= tot+parseFloat(row.flaring_co2)
          }
          if (emissionTypes.includes('other_industry_co2') && !Number.isNaN(row.other_industry_co2) && (row.other_industry_co2)>0) {
            tot= tot+parseFloat(row.other_industry_co2)
          }
        }
      }
    }

    if (tot > 0) {
      return tot
    } else {
      return 0
    }
  }

function mapNaturalDisasters (
  co2_data,
  naturalDisaster_data,
  newMappedNaturalDisasterCountryAndYear
) {
  co2_data.forEach(d => {
    var nbr = 0
    var c = d.country
    var y = d.year
    var iso_code = d.iso_code

    naturalDisaster_data.forEach(n => {
      if (c == n.country && y > n.year) {
        nbr++
      }
    })

    if (nbr > 0) {
      newMappedNaturalDisasterCountryAndYear.push({
        country: c,
        year: y,
        nbr: nbr,
        iso_code: iso_code
      })
    }
  })

  var jsonData = JSON.stringify(newMappedNaturalDisasterCountryAndYear)
  //console.log(jsonData)
}
