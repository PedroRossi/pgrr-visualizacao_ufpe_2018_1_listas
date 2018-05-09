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
    let counties = [];
    let occPerCounty = [];

    dataset.occurrences.forEach(occ => {
        let indexState = states.indexOf(occ.ocorrencia_uf);
        if (indexState !== -1)
            occPerState[indexState]++;
        const lower = occ.ocorrencia_cidade.toLowerCase();
        const indexCounty = counties.indexOf(lower);
        if (indexCounty !== -1) {
            occPerCounty[indexCounty]++;
        } else {
            counties.push(lower);
            occPerCounty.push(1);
        }
    });
    dataset.states.features.sort((a, b) => a.properties.sigla > b.properties.sigla ? 1 : -1);
    dataset.states.features.forEach((f, i) => f.properties.index = i);

    const colors = ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'];

    const initialCoordinates = [-22.91, -43.20]; // Rio de Janeiro
    const initialZoomLevel = 5;

    let select = document.querySelector('select');
    let div = document.querySelector('div#map');
    div.style.height = `${window.innerHeight - select.offsetHeight}px`;

    const map = L.map('map').setView(initialCoordinates, initialZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let currLayer = null;
    let circles = [];
    document.querySelector('select[name="filter"]').onchange = (ev) => {
        const value = ev.target.value;

        if (currLayer) {
            map.removeLayer(currLayer);
            if (circles.length > 0) {
                circles.forEach(c => map.removeLayer(c));
            }
        }
        if (value === 'localizacao') {
            currLayer = L.geoJSON(dataset.counties.features, {
                style: (feature) => {
                    return {
                        fillColor: '#f5f5f5',
                        fillOpacity: 0.5,
                        weight: 0.5,
                        color: 'black',
                        colorOpacity: 0.7,
                        dashArray: '3'
                    };
                }
            }).addTo(map);
                
            dataset.occurrences.forEach(occ => {
                const fillColor = occ.ocorrencia_classificacao === "ACIDENTE" ? '#cf2030' : occ.ocorrencia_classificacao === "INCIDENTE" ? '#64bbe3' : '#69c242';
                const color = occ.ocorrencia_classificacao === "ACIDENTE" ? 'red' : occ.ocorrencia_classificacao === "INCIDENTE" ? 'blue' : 'green';
                let circle = L.circle([occ.ocorrencia_latitude, occ.ocorrencia_longitude], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    radius: 200
                }).addTo(map);
                circles.push(circle);
            })
        } else if (value === 'estado') {
            const interval = d3.extent(occPerState);
            const colorScale = d3.scaleQuantize().domain(interval).range(colors);
            currLayer = L.geoJSON(dataset.states.features, {
                style: (feature) => {
                    return {
                        fillColor: colorScale(occPerState[feature.properties.index]),
                        fillOpacity: 0.5,
                        weight: 0.5,
                        color: 'black',
                        colorOpacity: 0.7,
                        dashArray: '3'
                    };
                }
            }).addTo(map);
        } else if (value === 'municipio') {
            const interval = d3.extent(occPerCounty);
            const colorScale = d3.scaleQuantize().domain(interval).range(colors);
            currLayer = L.geoJSON(dataset.counties.features, {
                style: (feature) => {
                    const lower = feature.properties.name.toLowerCase();
					const i = counties.indexOf(lower);
					const fillColor = ((i === -1) ? '#f5f5f5' : colorScale(occPerCounty[i]));
                    return {
                        fillColor: fillColor,
                        fillOpacity: 0.5,
                        weight: 0.5,
                        color: 'black',
                        colorOpacity: 0.7,
                        dashArray: '3'
                    };
                }
            }).addTo(map);
        }
    };
}