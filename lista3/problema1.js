let select = document.querySelector('select');

const margin = {
    top: 10,
    right: 20,
    left: 50,
    bottom: select.offsetHeight
};
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;


let dataset = {
	counties: [],
	states: [],
	occurrences: []
}

async.parallel([
	(cb => d3.json('geojs-100-mun.json', cb)),
	(cb => d3.json('brazil-states.json' , cb)),
	(cb => d3.csv('oco.csv', cb))
], (err, results) => {
	if (err) {
		console.log(err);
		return;
	}
	dataset.counties = results[0];
	dataset.states = results[1];
	dataset.occurrences = results[2];
	draw(dataset);
});

function draw(dataset) {

	const projection = d3.geoMercator()
		.translate([width/2, height/2])
		.scale([(width+height)/3])
		.center([-50, -20]);

	const path = d3.geoPath()
		.projection(projection);

	const svg = d3.select('svg')
		.attr('width', width)
		.attr('height', height);

	const g = svg.append('g');

	const zoom = d3.zoom().on('zoom', () => {
		g.selectAll('path').style('stroke-width', `${0.5 / d3.event.transform.k}px`)
		g.attr('transform', d3.event.transform)
	});

	svg.call(zoom)

	document.querySelector('select[name="filter"]').onchange = (ev) => {
		const value = ev.target.value;

		g.selectAll('path').remove();
		g.selectAll('circle').remove();
		d3.select('svg').selectAll('g').filter('.legend').remove();

		const colorset = ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'];

		if (value === "localizacao") {
			g.selectAll('path')
				.data(dataset.counties.features)
				.enter()
				.append('path')
				.attr('d', path)
				.attr('id', d => d.properties.id)
				.attr('fill', '#f5f5f5')
				.style('stroke', 'black')
				.style('stroke-opacity', 0.7)
				.attr('stroke-width', 0.5);

			g.selectAll('circle')
				.data(dataset.occurrences)
				.enter()
				.append('circle')
				.attr('r', 2)
				.attr('transform', (d) =>
					`translate(${projection([d.ocorrencia_longitude, d.ocorrencia_latitude])})`
				)
				.attr('fill', (d) =>
					d.ocorrencia_classificacao === "ACIDENTE" ? '#cf2030' : d.ocorrencia_classificacao === "INCIDENTE" ? '#64bbe3' : '#69c242'
				)
				.attr('fill-opacity', 0.7);
		} else if (value === 'estado') {
			const states = ['AC','AL','AP','AM', 'BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE', 'PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

			let occPerState = Array(states.length).fill(0);
			dataset.occurrences.forEach(occ => {
				let index = states.indexOf(occ.ocorrencia_uf);
				if (index !== -1)
					occPerState[index]++;
			});

			const interval = d3.extent(occPerState);

			const colorScale = d3.scaleQuantize().domain(interval).range(colorset);

			g.selectAll('path')
				.data(dataset.states.features)
				.enter()
				.append('path')
				.attr('d', path)
				.attr('fill', d => colorScale(occPerState[states.indexOf(d.properties.sigla)]))
				.style('stroke', 'black')
				.style('stroke-opacity', 0.8)
				.attr('stroke-width', 0.5);

			const colorLegend = d3.legendColor()
				.labelFormat(d3.format(".0f"))
				.scale(colorScale);

			svg.append('g')
				.attr('class', 'legend')
				.attr('transform', `translate(${width-2*(margin.left+margin.right)}, ${margin.top})`)
				.call(colorLegend);

		} else if (value === 'municipio') {
			let counties = [];
			let occPerCounty = [];

			dataset.occurrences.forEach(occ => {
				const lower = occ.ocorrencia_cidade.toLowerCase();
				const index = counties.indexOf(lower);
				if (index !== -1) {
					occPerCounty[index]++;
				} else {
					counties.push(lower);
					occPerCounty.push(1);
				}
			});

			const interval = d3.extent(occPerCounty);
			
			const colorScale = d3.scaleQuantize()
				.domain(interval)
				.range(colorset);
			
			g.selectAll('path')
				.data(dataset.counties.features)
				.enter()
				.append('path')
				.attr('d', path)
				.attr('fill', d => {
					const lower = d.properties.name.toLowerCase();
					const i = counties.indexOf(lower);
					return i === -1 ? '#f5f5f5' : colorScale(occPerCounty[i]);
				})
				.style('stroke', 'black')
				.style('stroke-opacity', 0.8)
				.attr('stroke-width', 0.5);

			const colorLegend = d3.legendColor()
				.labelFormat(d3.format('.0f'))
				.scale(colorScale);

			svg.append('g')
				.attr('class', 'legend')
				.attr('transform', `translate(${width-2*(margin.left+margin.right)}, ${margin.top})`)
				.call(colorLegend);
		}
	};
	
}