import {MemCache} from './MemCache.js';

/**
 * @typedef {import('../types').ResultGrouped} ResultGrouped
 */

/**
 *
 * @type {MemCache}
 */
const cache = new MemCache('npm');

const npmResultToSearchItem = (curr) => ({
	title: curr.package.name,
	highlight: '',
	excerpt: curr.package.description.length > 122 ? curr.package.description.slice(0, 122) + '...' : curr.package.description,
	lang: 'en',
	hostname: 'npmjs.com',
	url: curr.package.links.npm,
});

/**
 *
 * @param {string} q
 * @returns {Promise<ResultGrouped | null>}
 */
const fetchResults = async (q) => {
	try {
		const url = new URL('/-/v1/search', 'https://registry.npmjs.org');
		url.searchParams.set('text', q);
		url.searchParams.set('size', '5');
		const response = await fetch(url.toString());
		if (response.status !== 200) {
			throw new Error(`Failed to fetch, ${response.status}, ${url}`);
		}
		const body = await response.json();
		if (!body.objects.length) {
			return null;
		}

		const final = body.objects.reduce((acc, curr, index) => {
			if (!acc.title) {
				// First hit!
				acc = {
					...npmResultToSearchItem(curr),
					subItems: [],
				};
			}
			acc.subItems.push(npmResultToSearchItem(curr));

			return acc;
		}, {});

		return final;
	} catch (error) {
		console.error(error);
		return null;
	}
};
export const searchNPM = async (env, q) => {
	let cached = await cache.get(q);
	if (!cached) {
		cached = await fetchResults(q);
		if (cached) {
			await cache.set(q, cached);
		}
	}

	return cached;
};
