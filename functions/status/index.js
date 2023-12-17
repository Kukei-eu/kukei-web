import Mustache from 'mustache';
import template from './template.html';
import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import { getUnchecked, getIndexStats } from '../../lib/mongo.js';

export const onRequestGet = async (context) => {
	emitPageView(context);
	const { env } = context;
	const indexStats = await getIndexStats(env);
	const unchecked = await getUnchecked(env);
	const uncheckedLang = unchecked === null ? 'unknown' : unchecked;
	const viewDefaults = await getDefaultViewData(env);

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
		title: 'Index statistics - kukei.eu',
		finalStats,
		uncheckedLang,
	};

	const html = Mustache.render(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
