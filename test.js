const width = 650
const height = 400

const svg = d3.select('body').append('svg').attr('width', width).attr('height', height).attr('class', 'map')

const projection = d3.geoMercator().scale(100).translate([width / 2 , height / 1.5])
const path = d3.geoPath(projection)


d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then(data => {
  const countries = topojson.feature(data, data.objects.countries)

  svg.append("g").attr('class', 'countries').selectAll('path').data(countries.features).enter().append('path').attr('d', path)
})