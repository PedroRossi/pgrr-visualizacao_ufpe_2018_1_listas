const margin = {
    top: 20,
    right: 20,
    left: 50,
    bottom: 30
};
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

// temperature
let dataset = [];
for (let i=0;i<12;++i) {
    dataset.push({
        mean: temperature.DailyMean[i],
        max: temperature.RecordHigh[i],
        min: temperature.RecordLow[i],
        index: i
    });
}

// x
const x = d3.scaleTime()
    .domain([new Date(2017, 0, 1), new Date(2017, 11, 1)])
    .range([0, width-margin.left-margin.right]);

const xAxis = d3.axisBottom()
    .scale(x);

// y
const maxVal = d3.max(temperature.RecordHigh);
const minVal = d3.min(temperature.RecordLow);

const y = d3.scaleLinear()
    // .domain([Math.floor(minVal), Math.ceil(maxVal)])
    .domain([minVal, maxVal])
    .range([height-margin.bottom-margin.top, 0]);

const yAxis = d3.axisLeft()
    .scale(y);

// line
const line = d3.line()
    .x(d => x(new Date(2017, d.index, 1)))
    .y(d => y(d.mean));

// area
const area = d3.area()
    .x(d => x(new Date(2017, d.index, 1)))
    .y0(d => y(d.min))
    .y1(d => y(d.max));

// drawing
const svg = d3.select('svg')
    .attr('width', width + margin.right)
    .attr('height', height)
    .attr('transform', `translate(20, 20)`);

svg.append("path")
    .datum(dataset)
    .attr('fill', '#FF717D')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr("d", area);

svg.append('path')
    .datum(dataset)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 4)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('d', line);

svg.append('g')
    .attr('transform', `translate(${margin.left}, ${height-margin.bottom})`)
    .call(xAxis);
    
svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);