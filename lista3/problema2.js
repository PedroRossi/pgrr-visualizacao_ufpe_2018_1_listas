async.parallel([
    (cb => d3.json('geojs-100-mun.json', cb)),
	(cb => d3.json('brazil-states.json' , cb)),
	(cb => d3.csv('oco.csv', cb))
], (err, results) => {
    if (err) {
        console.log(err);
		return;
	}
    let dataset = {
        counties: [],
        states: [],
        occurrences: []
    }
	dataset.counties = results[0];
	dataset.states = results[1];
    dataset.occurrences = results[2];
    draw(dataset);
});

function draw(dataset) {

    const states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE', 'PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].sort();

    let occPerState = Array(states.length).fill(0);
    dataset.occurrences.forEach(occ => {
        let index = states.indexOf(occ.ocorrencia_uf);
        if (index !== -1)
            occPerState[index]++;
    });
    dataset.states.features.sort((a, b) => a.properties.sigla > b.properties.sigla ? 1 : -1);
    dataset.states.features.forEach((f, i) => {
        f.properties.index = i;
        f.properties.occurences = occPerState[states.indexOf(f.properties.sigla)];
    });

    const colors = ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'];

    const interval = d3.extent(occPerState);

    const colorScale = d3.scaleQuantize().domain(interval).range(colors);

    const initialCoordinates = [-22.91, -43.20]; // Rio de Janeiro
    const initialZoomLevel = 5;
    const map = L.map('map').setView(initialCoordinates, initialZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.geoJSON(dataset.states.features, {
        style: (feature) => {
            return {
                fillColor: colorScale(occPerState[feature.properties.index]),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }
    }).addTo(map);
}