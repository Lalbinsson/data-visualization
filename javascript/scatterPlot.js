/*TODO: fixa så att den ändrar på förkortning eller namn?
- blir ny timeline varje gång man filtrerar?
- Tror kajsas skala inte är i ton utan miljoner ton?
- Där man hoverar är inte där rutan kommer upp i kartan
*/
export async function drawScatterPlot (promises, filterHandler) {
    promises.then(function([world, co2, mappedNaturalDisasterData]){ //mappedNaturalDisasterData]) {
      var year = filterHandler.getYear()
      var emissionTypes = filterHandler.getEmissions()
      var countries =  filterHandler.getCountries()

     console.log("Scatterplot")
   //  console.log(filterHandler.getCountries())
     console.log(filterHandler.getEmissions())
     console.log('year:', filterHandler.getYear()) 

    //  var newMappedNaturalDisasterCountryAndYear = []
     // mapNaturalDisasters(co2, naturalDisasterData, newMappedNaturalDisasterCountryAndYear)

      // set the dimensions and margins of the graph
      var margin = {top: 50, right: 270, bottom: 50, left: 50}, //fixa dimensionerna så info-rutan inte hamnar utanför?
      width = 760 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

      var filteredNatDis = mappedNaturalDisasterData.filter(function (d) {
       //filtrera på emissions(?)
       // console.log("filtering data on ", year)
        return d.year == year && d.nbr > 0 && countries.includes(d.iso_code) //&& getEmissionsForCountry(d, year, emissionTypes)>0
      })

      var filteredCo2 = co2.filter(function (d) {
        return countries.includes(d.iso_code) && d.iso_code != '' && d.year == year //&& getEmissionsForCountry(d, year, emissionTypes)>0
       })

    /*  console.log(year)
      console.log(emissionTypes)
      console.log(filteredNatDis)
      console.log(filteredCo2) */

      // remove old svgs
      d3.select("#scatterSvg").remove();  

      // append the svg object to the body of the page
      var svg = d3.select("#scatterPlot") //ändra färg på bakgrunden?
          .append("svg")
          .attr("id", "scatterSvg")
          .attr("width", width + margin.left + margin.right)  
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // console.log("co2 max: ", d3.max(filteredCo2, function( d ) { return getEmissionsForCountry(d, year, filterHandler) })) // miljoner ton
        // Add X axis
        var x = d3.scaleLog()
          .domain( [ 1, d3.max(filteredCo2, function( d ) { return getEmissionsForCountry(d, year, emissionTypes) }) ] ) //den här skalan blir inte rätt
          .range([ 0, width ]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(5));

        // console.log("nbr max: ", d3.max(filteredNatDis, function( d ) { return d.nbr }))
        // Add Y axis
        var y = d3.scaleLinear()
          .domain( [ 0, d3.max(filteredNatDis, function( d ) { return d.nbr }) ] )
          .range([ height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

    // Y label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + -30 + ',' + height / 2 + ')rotate(-90)')
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('Natural disasters')

    // X label
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + 30)
      //.attr('text-anchor', 'middle')
      .style('font-family', 'Helvetica')
      .style('font-size', 12)
      .text('CO2 Emissions')


        // Add dots
        var circ = svg.append('g');

      console.log(emissionTypes.length)
      if (emissionTypes.length>1){ //om det inte finns någon emission type vald så ska den inte plotta några punkter
       circ.selectAll("dot")
        .data(filteredNatDis)
        .enter()
        .append("rect")
          .attr('y', function (d) { return y(getNaturalDisastersForCountry(d)); } )
          .data(filteredCo2)
          .attr('x', function (d) { return x(getEmissionsForCountry(d, year, emissionTypes)); } )
          .attr("width", 250)
          .attr("height", 70)
          .attr("rx", 5)
          .attr("stroke", "#69b3a2")
          .attr("stroke-opacity", 0.5)
          .attr("fill", "#ffffff")
          .attr("id", function(d) { return "rect"+d.iso_code.toString()+d.year.toString(); })
          .style('opacity', '0');

          circ.selectAll("dot")
          .data(filteredNatDis)
          .enter()
          .append("text")
            .attr('y', function (d) { return parseInt(y(getNaturalDisastersForCountry(d, year))+20); } )
            .data(filteredCo2)
            .attr('x', function (d) { 
              if (getEmissionsForCountry(d, year, emissionTypes)>0) {
                return parseInt(x(getEmissionsForCountry(d, year, emissionTypes))+10)
             } else {
                return 10
             } } )
            .attr("id", function(d) { return "text"+d.iso_code.toString()+d.year.toString(); })
            .style('opacity', '0')
            .text(function(d) { return d.country; })
            .attr('font-weight', "bold")
              .append("tspan")
              .attr('dy', 20)
              .attr('font-weight', "normal")
              .data(filteredCo2)
              .attr('dx', function (d) { return 0 })
              .attr('x', function (d) { 
                if (getEmissionsForCountry(d, year, emissionTypes)>0) {
                  return parseInt(x(getEmissionsForCountry(d, year, emissionTypes))+10)
                } else {
                  return 10
                }
              } )
              .text(function(d) { return "Co2 Emissions: "+getEmissionsForCountry(d, year, emissionTypes)+" million ton"; })
              .append("tspan")
              .attr('dx', function (d) { return 0 })
              .attr('x', function (d) { 
                if (getEmissionsForCountry(d, year, emissionTypes)>0) {
                  return parseInt(x(getEmissionsForCountry(d, year, emissionTypes))+10)
                } else {
                  return 10
                }
              } )
              .data(filteredNatDis)
              .text(function(d) { return "Natural Disasters: "+getNaturalDisastersForCountry(d)+" st"; })
              .attr('dy', 20)

        circ.selectAll("dot")
        .data(filteredNatDis)
        .enter()
        .append("circle")
          .attr("cy", function (d) { return y(getNaturalDisastersForCountry(d)); } )
          .data(filteredCo2)
          .attr("cx", function (d) { return x(getEmissionsForCountry(d, year, emissionTypes)); } )
          .attr("r", 5)
          .style("fill", "#69b3a2")
          .on('mouseover', function (d) {
            d3.select("#rect"+(d.iso_code.toString()+d.year.toString()))
             .transition()
             .duration(0.1)
             .style('opacity', '1');

            d3.select("#text"+(d.iso_code.toString()+d.year.toString()))
             .transition()
             .duration(0.1)
             .style('opacity', '1');

            d3.select(this)
            .transition()
            .duration(0.1)
            .attr("r", 7)
            .style('opacity', '0.5');
          })
          .on('mouseout', function (d) {
            d3.select(this)
            .transition()
            .duration(0.1)
            .attr("r", 5)
         //   .front() //fixa så att de läggs på längst fram?
            .style('opacity', '1')

            d3.select("#rect"+(d.iso_code.toString()+d.year.toString()))
            .transition()
            .duration(0.1)
            .style('opacity', '0'); 
            d3.select("#text"+(d.iso_code.toString()+d.year.toString()))
              .transition()
              .duration(0.1)
              .style('opacity', '0');
          }); 
        }
        })
      }

      function getNaturalDisastersForCountry(row) {
          return row.nbr
      }

      function getEmissionsForCountry(row, year, emissionTypes) { 
      //  console.log(emissionTypes)
      //  console.log("in get emissions ", year)

        if(emissionTypes.length>1){ //av någon anledning är arrayen 1 när ingen emission är vald, 2 när en emission är vald etc.
        //förlåt för riktigt dålig kod lol
        var tot = 0
        for (let y = 1989; y <= year; y++) {
         // console.log(row)

        // just nu väljs bara co2 om den i ikryssad, dvs adderar inte co2+ specifika typer av co2, utan tar då co2 totalen
        if (emissionTypes.includes('co2') && parseInt(row.oil_co2)>0) {
          tot= tot+parseInt(row.co2)
        } else {
          if (emissionTypes.includes('oil_co2') && row.oil_co2 && parseInt(row.oil_co2)>0) {
            tot= tot+parseInt(row.oil_co2)
          }
          if (emissionTypes.includes('gas_co2') && row.gas_co2 && parseInt(row.gas_co2)>0) {
            tot= tot+parseInt(row.gas_co2)
          }
          if (emissionTypes.includes('coal_co2') && row.coal_co2 && parseInt(row.coal_co2)>0) {
            tot= tot+parseInt(row.coal_co2)
          }
          if (emissionTypes.includes('cement_co2') && row.cement_co2 && parseInt(row.cement_co2)>0) {
            tot= tot+parseInt(row.cement_co2)
          }
          if (emissionTypes.includes('flaring_co2') && (row.flaring_co2 != "") && parseInt(row.flaring_co2)>0) {
            tot= tot+parseInt(row.flaring_co2)
          }
          if (emissionTypes.includes('other_industry_co2') && row.other_industry_co2 && (row.other_industry_co2)>0) {
            tot= tot+parseInt(row.other_industry_co2)
          }
        }
      }

    /*  console.log(row.country)
      console.log(emissionTypes)
      console.log(tot) */
      if (tot>0) {
        return tot
      } else {
        return 0
      }
     }
    }


//används för att filtrera ut ett nytt json-dataset, tar sjukt lång tid, använd den sparade filen istället.
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
        iso_code: iso_code,
      })
    }
  })

  var jsonData = JSON.stringify(newMappedNaturalDisasterCountryAndYear)
  console.log(jsonData)
}
