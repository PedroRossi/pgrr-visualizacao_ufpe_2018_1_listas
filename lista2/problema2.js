/**
 * Trip definition
 * 
 * carrier
 * destination
 * end
 * origin
 * post
 * price
 * start
 */
// console.log(trips)
const margin = {
    top: 20,
    right: 20,
    left: 50,
    bottom: 0
};
// each chart width

function barsChart(data, width, height) {
    let flightsPerCarrier = {};
    data.forEach(t => {
        if (flightsPerCarrier[t.carrier]) {
            flightsPerCarrier[t.carrier]++;
        } else {
            flightsPerCarrier[t.carrier] = 1;
        }
    });

    let aux = flightsPerCarrier;
    let arr = [];
    let carriers = [];
    Object.keys(aux).forEach(a => {
        carriers.push(a);
        arr.push({
            carrier: a,
            numberOfFlights: flightsPerCarrier[a]
        });
    });
    flightsPerCarrier = arr;

    const barWidth = (width/flightsPerCarrier.length) - 50;

    const x = d3.scaleBand()
        .domain(carriers)
        .range([0, width]);
    
    const xAxis = d3.axisBottom()
        .scale(x)
    
    const y = d3.scaleLinear()
        .domain([0, 600])
        .range([height-margin.top-margin.bottom, 0])
    
    const yAxis = d3.axisLeft()
        .scale(y)

    const chart = d3.select('#bars')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    chart.append('g')
        .attr('transform', `translate(${margin.left}, ${height-margin.bottom})`)
        .call(xAxis);

    chart.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

    chart.append('g')
        .append('text')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('x', (width/2) - 70)
        .attr('y', 0)
        .attr('fill', 'black')
        .text('Nº of Flights per Carrier');

    const bars = d3.select('#bars')
        .selectAll('rect')
        .data(flightsPerCarrier)
        .enter();

    bars.append('g')
        .append('rect')
        .attr('transform', `translate(${margin.left + margin.right}, ${margin.top})`)
        .attr('x', d => x(d.carrier) + 10)
        .attr('y', d => y(d.numberOfFlights))
        .attr('fill', 'blue')
        .attr('width', barWidth)
        .attr('height', d => height - margin.bottom - margin.top - y(d.numberOfFlights))

    bars.append('g')
        .append('text')
        .attr('transform', `translate(${margin.left + margin.right}, ${margin.top})`)
        .attr('x', d => x(d.carrier) - 5 + barWidth/2)
        .attr('y', d => y(d.numberOfFlights) + 20)
        .attr('fill', 'white')
        .text(d => d.numberOfFlights)
}

// scatterplot
function scatterplot(data, width, height) {
    let dataset = data.map(d => {
        d.start = new Date(d.start.split('/').reverse().join('/'));
        d.end = new Date(d.end.split('/').reverse().join('/'));
        d.post = new Date(d.post.split('/').reverse().join('/'));
        return d;
    });

    const x = d3.scaleLinear()
        .domain([0, 400])
        .range([0, width]);

    const xAxis = d3.axisBottom()
        .scale(x)

    const y = d3.scaleLinear()
        .domain([0, 1800])
        .range([height-margin.top-margin.bottom, 0])

    const yAxis = d3.axisLeft()
        .scale(y)

    const scatter = d3.select('#scatter')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    
    scatter.append('g')
        .attr('transform', `translate(${margin.left}, ${height-margin.bottom})`)
        .call(xAxis);

    scatter.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);
    
    scatter.append('g')
        .append('text')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('x', (width/2) - 70)
        .attr('y', 0)
        .attr('fill', 'black')
        .text('Flight price per diff post & start');
    
    scatter.append('g')
        .selectAll('circles')
        .data(dataset)
        .enter()
        .append('circle')
        .attr('transform', `translate(${margin.left+margin.right}, ${margin.top})`)
        .attr('cx', d => {
            const timeDiff = Math.abs(d.start.getTime() - d.post.getTime());
            const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return x(diffDays);
        })
        .attr('cy', d => y(d.price))
        .attr('fill', 'blue')
        .attr('r', 5)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

}

barsChart(trips, 500, 600);
scatterplot(trips, 500, 600);