import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import {getUnchecked, getIndexStats, getCrawlHistory} from '../../lib/mongo.js';
import {getTemplate, renderHtml} from '../../lib/sso-render.js';

const template = getTemplate(import.meta.dirname, './template.html');

export const statusController = async (req, res) => {
	emitPageView(req);
	const { env } = req;
	const indexStats = await getIndexStats();
	const unchecked = await getUnchecked();
	const uncheckedLang = unchecked === null ? 'unknown' : unchecked;
	const viewDefaults = await getDefaultViewData(env);
	const history = await getCrawlHistory();

	const indexMap = new Map();
	const finalStats = indexStats
		.reduce((acc, curr) => {
			let existingIndex = indexMap.get(curr.index);
			if (!existingIndex) {
				existingIndex = {
					index: curr.index,
					elements: []
				};
				indexMap.set(curr.index, existingIndex);
				acc.push(existingIndex);
			}
			existingIndex.elements.push({
				...curr,
				lastCrawledAtHumanReadable: (new Date(curr.lastCrawledAt)).toISOString(),
			});

			return acc;
		}, [])
		.map((indexElement) => {
			indexElement.elements.sort((a, b) => {
				return b.lastCrawledAt - a.lastCrawledAt;
			});

			return indexElement;
		});

	const view = {
		...viewDefaults,
		mainClass: 'stats body',
		title: 'Index statistics - kukei.eu',
		history,
		historyJSON: JSON.stringify(history),
		finalStats,
		uncheckedLang,
	};

	const html = await renderHtml(template, view);
	res.status(200).send(html);
};
