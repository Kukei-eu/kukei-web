import { Chart, registerables, TimeScale } from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm';

Chart.register(...registerables, TimeScale);
class HistoryChart extends HTMLElement {
	connectedCallback() {
		const dataRaw = JSON.parse(this.getAttribute('chart-data')).map((el) => ({
			...el,
			dateJS: new Date(el.created),
		}));

		const data = dataRaw.sort((a, b) => (a.created > b.created ? 1 : -1));
		console.log(data);
		const root = document.createElement('canvas');
		this.appendChild(root);

		const chart = new Chart(root, {
			type: 'line',
			data: {
				datasets: [
					{
						label: 'Crawled',
						data,
						parsing: {
							yAxisKey: 'crawledCount',
							xAxisKey: 'date',
						}
					},
					{
						label: 'Known, uncrawled',
						data,
						parsing: {
							yAxisKey: 'unCrawledCount',
							xAxisKey: 'date',
						}
					},
					{
						label: 'Indexed',
						data,
						parsing: {
							yAxisKey: 'totalIndex',
							xAxisKey: 'date',
						}
					}
				],
			},
			options: {
				scales: {
					x: {
						display: false,
					},
					xAxis: {
						ticks: {
							callback: (a,b,c) => {
								const el = data[a];

								return el.dateJS.toLocaleString();
							}
						}
					},
				}
			}
		});
	}
}

customElements.define('history-chart', HistoryChart);
