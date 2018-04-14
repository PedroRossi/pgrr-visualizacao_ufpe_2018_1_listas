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
    let carriers = ['Gol', 'Tam', 'Azul'];
    Object.keys(aux).forEach(a => {
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

    chart.selectAll('g').remove();
    
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

    function updateData(data) {
        const bars = d3.select('#bars')
            .append('g')
            .selectAll('rect')
            .remove()
            .data(data)
            .enter();

        bars.append('rect')
            .attr('id', d => `${d.carrier}`)
            .attr('transform', `translate(${margin.left + margin.right}, ${margin.top})`)
            .attr('x', d => x(d.carrier) + 10)
            .attr('y', d => y(d.numberOfFlights))
            .attr('fill', 'blue')
            .attr('width', barWidth)
            .attr('height', d => height - margin.bottom - margin.top - y(d.numberOfFlights))
            .on('click', (d) => {
                // bars.selectAll(`rect`).attr('fill', 'white');
                // bars.select(`rect#${d.carrier}`).attr('fill', 'blue');
            });

        bars.append('text')
            .attr('transform', `translate(${margin.left + margin.right}, ${margin.top})`)
            .attr('x', d => x(d.carrier) - 5 + barWidth/2)
            .attr('y', d => y(d.numberOfFlights) + 20)
            .attr('fill', 'white')
            .text(d => d.numberOfFlights);
    }

    updateData(flightsPerCarrier);

}

// scatterplot
function scatterplot(data, width, height, callback) {
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

    // brush
    const brushGroup = scatter.append("g").attr("class","brush");
	const brush = d3.brush()
	    .on("start", () => {
            scatter.selectAll("circle").attr("fill","black")
        })
	    .on("brush", () => {
            let selectedPoints = [];
            let selection = d3.event.selection;
            const diffs = {
                x: margin.left+margin.right,
                y: margin.top,
            }
            scatter.selectAll("circle")
                .attr("fill", (d, i) => {
                    const timeDiff = Math.abs(d.start.getTime() - d.post.getTime());
                    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    const xCoord = x(diffDays)+diffs.x;
                    const yCoord = y(d.price)+diffs.y;
                    if (selection[0][0] <= xCoord && xCoord <= selection[1][0] &&
                        selection[0][1] <= yCoord && yCoord <= selection[1][1]) {
                        selectedPoints.push(d);
                        return "blue";
                    } else {
                        return "black";
                    }
                });

            if(callback)
                callback(selectedPoints);
	    });
	brushGroup.call(brush);

}

barsChart(trips, 500, 600);
scatterplot(trips, 500, 600, (data) => barsChart(data, 500, 600));