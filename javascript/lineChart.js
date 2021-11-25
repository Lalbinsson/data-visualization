export async function lineChart () {

    var expanded = false;
    // List of groups (here I have one group per column)
    var allGroup = ["valueA", "valueB", "valueC"]
    
    function onClickHandler() {
        const checks =  document.querySelectorAll('.testCheckbox:checked');
        for(var i=0; checks[i]; ++i){
          if(checks[i].checked){
            console.log(checks[i].value);
          }
        }
      }


    function showCheckboxes() {
      var checkboxes = document.getElementById("checkboxes");
      /*allGroup.map(function (x) {
        return $('.multiselect', d.el).append("<option>" + x + "</option>");
    }, allGroup);*/

    /*$('.multiselect', d.el).multiselect({
        allSelectedText: 'All',
        maxHeight: 200,
        includeSelectAllOption: true
    });*/
      //checkboxes.data(allGroup).enter().append('option').text(function (d) { return d; }) // text showed in the menu
       // .attr("label", function (d) { return d; }) // corresponding value returned by the button
      
      if (!expanded) {
        checkboxes.style.display = "block";
        expanded = true;
      } else {
        checkboxes.style.display = "none";
        expanded = false;
      }
      }
      
    
    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 30, left: 30},
        width = 450 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
      
    // append the svg object to the body of the page
    var sVg = d3.select("#Area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      // translate this svg element to leave some margin.
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    // read data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv").then( function(data) {

      //const sumstat = d3.group(data, d => d.name); // nest function allows to group the calculation per level of a factor

      // List of groups (here I have one group per column)
      const allGroup = ["valueA", "valueB", "valueC"]
      
      // add the options to the button
      d3.select("#selectButton")
        .selectAll("option")
        //.selectAll("option") //'myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button
      

      // A color scale: one color for each group
      const myColor = d3.scaleOrdinal()
        .domain(allGroup)
        .range(d3.schemeSet2);

      // Add X axis --> it is a date format
      const x = d3.scaleLinear()
        .domain([0,10])
        .range([ 0, width ]);
      sVg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3.scaleLinear()
        .domain( [0, 20]) //d3.max(data, function(d) { return d.selectedGroup; })
        .range([ height, 0 ]);
      sVg.append("g")
        .call(d3.axisLeft(y));

      // Initialize line with group a
      // Line that should be showed as default
      const line = sVg
        .append('g')
        .append("path")
          .datum(data)
          .attr("d", d3.line()
            .x(function(d) { return x(+d.time) })
            .y(function(d) { return y(+d.valueA) })
          )
          .attr("stroke", function(d){ return myColor("valueA") })
          .style("stroke-width", 2)
          .style("fill", "none")

      // A function that update the chart
      function update(selectedGroup) {

        // Create new data with the selection?
        const dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })

        const sumstat = d3.group(dataFilter, d => d.name); // nest function allows to group the calculation per level of a factor

        //svg.selectAll("path.line").remove();
        
        /*for (let i=0; i < selectedGroup.length; i++) {
          sVg
          .append('g')
          .append("path")
            .datum(dataFilter)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.time) })
              .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return myColor(selectedGroup) })
            .style("stroke-width", 2)
            .style("fill", "none")  
        }*/

        /*sVg.selectAll(".line")
            .data(sumstat)
            .datum(dataFilter)
            //.duration(1000)
            .join("path")
            .attr("fill", "none")
            .attr("d", function(d) {
              return d3.line()
              .x(function(d) { return x(+d.time); })
              .y(function(d) { return y(+d.value); })
              
            
            }
            
            )
            .attr("stroke", function(d){ return myColor(selectedGroup) })*/
        

        // Give these new data to update line
        line
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
              .x(function(d) { return x(+d.time) })
              .y(function(d) { return y(+d.value) })
            )
            .attr("stroke", function(d){ return myColor(selectedGroup) })
      }

      // When the button is changed, run the updateChart function
      d3.select("#selectButton").on("change", function(event,d) {
          // recover the option that has been chosen
          const selectedOption = d3.select(this).property("value")
          console.log(selectedOption)
          // run the updateChart function with this selected option

          update(selectedOption)
      })

      })
 // Y label
 sVg.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', margin.left - 10)
        .attr('y', margin.top - 10)
        //.attr('transform', 'translate(60,' + height + ')rotate(-90)')
        .style('font-family', 'Helvetica')
        .style('font-size', 12)
        .text('CO2');

  // X label
  sVg.append('text')
        .attr('x', 350)
        .attr('y', margin.bottom + 320)
        //.attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 12)
        .text('Year');

        // Scale the range of the data

}