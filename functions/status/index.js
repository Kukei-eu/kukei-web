import Mustache from 'mustache';
import template from './template.html';
import { getDefaultViewData } from '../../lib/view.js';

const getIndexStats = async (envs) => {
	const uri = `${envs.ATLAS_URI}/action/find`;
	const request = await fetch(uri, {
		method: 'POST',
		headers: {
			'api-key': envs.ATLAS_API_KEY,
			'content-type': 'application/json',
			'access-control-request-headers': '*',
		},
		body: JSON.stringify({
			collection: envs.ATLAS_COLLECTION,
			database: envs.ATLAS_DB,
			dataSource: envs.ATLAS_SOURCE,
			projection: { url: 1, lastCrawledAt: 1, index: 1}
		})
	});

	const response = await request.json();

	return response?.documents ?? [];
};
export const onRequestGet = async (context) => {
	const { env } = context;
	const indexStats = await getIndexStats(env);
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
	};

	const html = Mustache.render(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};