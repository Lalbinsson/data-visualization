
//TODO: uppdateras på nya globala värden, dvs när year, emission types och countries ändras?
export async function drawScatterPlot (promises, filterHandler) {
    promises.then(function([world, co2, mappedNaturalDisasterData]) {
      var year = filterHandler.getYear()
      //var mappedNaturalDisasterCountryAndYear = []
      //mapNaturalDisasters(co2, naturalDisasterData, mappedNaturalDisasterCountryAndYear)

      // set the dimensions and margins of the graph
      var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3.select("#scatterPlot")
          .append("svg")
          .attr("width", width + margin.left + margin.right)  
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
        // Add X axis
        var x = d3.scaleLinear()
          .domain([0, 4000])
          .range([ 0, width ]);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, 500])
          .range([ height, 0]);
        svg.append("g")
          .call(d3.axisLeft(y));

        // Add dots
        var circ = svg.append('g');

       circ.selectAll("dot")
        .data(mappedNaturalDisasterData)
        .enter()
        .append("rect")
          .attr('y', function (d) { return y(getNaturalDisastersForCountry(d, year)); } )
          .data(co2)
          .attr('x', function (d) { return x(getEmissionsForCountry(d, year, filterHandler)); } )
          .attr("width", 200)
          .attr("height", 70)
          .attr("fill", "#ffffff")
          .attr("id", function(d) { return "rect"+d.iso_code.toString()+d.year.toString(); })
          .style('opacity', '0');

          circ.selectAll("dot")
          .data(mappedNaturalDisasterData)
          .enter()
          .append("text")
            .attr('y', function (d) { return y(getNaturalDisastersForCountry(d, year)-20); } )
            .data(co2)
            .attr('x', function (d) { return x(getEmissionsForCountry(d, year, filterHandler)+100); } )
            .attr("id", function(d) { return "text"+d.iso_code.toString()+d.year.toString(); })
            .style('opacity', '0')
            .text(function(d) { return d.country; })
              .append("tspan")
              .attr('dy', 20)//(function (d) { return y(getNaturalDisastersForCountry(d, year)-100); } )
              .data(co2)
              .attr('x', function (d) { return x(getEmissionsForCountry(d, year, filterHandler)+100); } )
              .text(function(d) { return "Co2 Emissions: "+getEmissionsForCountry(d, year, filterHandler)+" ton"; })
              .append("tspan")
              .attr('x', function (d) { return x(getEmissionsForCountry(d, year, filterHandler)+100); } )
              .data(mappedNaturalDisasterData)
              .text(function(d) { return "Natural Disasters: "+getNaturalDisastersForCountry(d, year)+" st"; })
              .attr('dy', 20)// function (d) { return y(getNaturalDisastersForCountry(d, year)+30); } )

        circ.selectAll("dot")
        .data(mappedNaturalDisasterData.filter(function (d) {
            return d.nbr > 0;
          }))
        .enter()
        .append("circle")
          .attr("cy", function (d) { return (getNaturalDisastersForCountry(d, year)); } )
          .data(co2.filter(function (d) {
            return d.co2 != null;
          }))
          .attr("cx", function (d) { return (getEmissionsForCountry(d, year, filterHandler)); } )
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

            //denna är inte samma som det som skrivs ut när man hoverar?
             console.log(d.year)
             console.log(d.country)
             console.log(d.co2)

            //console.log("hover on ", (d.iso_code.toString()+d.year.toString()))

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
         //   .front()
            .style('opacity', '1')

            d3.select("#rect"+(d.iso_code.toString()+d.year.toString()))
            .transition()
            .duration(0.1)
            .style('opacity', '0'); 
            d3.select("#text"+(d.iso_code.toString()+d.year.toString()))
              .transition()
              .duration(0.1)
              .style('opacity', '0');

          //  console.log("unhover on :", (d.iso_code.toString()+d.year.toString()))



          }); 
        
        })

      }

      function getNaturalDisastersForCountry(row, year) {
        if (row.year==year){
        //TODO: fixa så att de som är 0 inte visas?
       // console.log("nbr: ", row.country, row.nbr)
          return row.nbr
        }
      }

      function getEmissionsForCountry(row, year, filterHandler) {
        var emissionTypes = filterHandler.getEmissions()
 
        //förlåt för riktigt dålig kod lol
        //detta ska vara summan t.o.m året, just nu är det bara året.
        if (year == row.year){
          var tot = 0
        if (emissionTypes.includes('oil_co2') && parseInt(row.oil_co2)>0) {
          tot= tot+parseInt(row.oil_co2)
        }
        if (emissionTypes.includes('gas_co2') && parseInt(row.gas_co2)>0) {
          tot= tot+parseInt(row.gas_co2)
        }
        if (emissionTypes.includes('coal_co2') && parseInt(row.coal_co2)>0) {
          tot= tot+parseInt(row.coal_co2)
        }
        if (emissionTypes.includes('cement_co2') && parseInt(row.cement_co2)>0) {
          tot= tot+parseInt(row.cement_co2)
        }
        if (emissionTypes.includes('flaring_co2') && parseInt(row.flaring_co2)>0) {
          tot= tot+parseInt(row.flaring_co2)
        }
        if (emissionTypes.includes('other_industry_co2') && (row.other_industry_co2)>0) {
          tot= tot+parseInt(row.other_industry_co2)
        }
        if(tot>0){
          return tot
        }
      }
      }

      //används för att filtrera ut ett nytt json-dataset, tar sjukt lång tid, använd den sparade filen istället.
      function mapNaturalDisasters(co2_data, naturalDisaster_data, mappedNaturalDisasterCountryAndYear) {
        co2_data.forEach(d => {
          var nbr = 0
          var c = d.country
          var y = d.year

          naturalDisaster_data.forEach(n => {
            if (c == n.country && y > n.year){
              nbr++
            }
          })

        if (nbr>0){
          mappedNaturalDisasterCountryAndYear.push({
            'country': c,
            'year': y,
            'nbr': nbr
          })
        }
      })

      var jsonData = JSON.stringify(mappedNaturalDisasterCountryAndYear);
      console.log(jsonData)
}