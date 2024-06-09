import {MemCache} from './MemCache.js';
import {KUKEI_WEB_SEARCH_CLIENT_UA} from './__tests__/constants.js';

/**
 * @typedef {import('../types').ResultGrouped} ResultGrouped
 */

/**
 *
 * @type {MemCache}
 */
const cache = new MemCache('crates');

const crateToSearchItem = (curr) => ({
	title: curr.name,
	highlight: '',
	excerpt: curr.description.length > 122 ? curr.description.slice(0, 122) + '...' : curr.description,
	lang: 'en',
	hostname: 'crates.io',
	url: curr.documentation || curr.repository,
});

/**
 *
 * @param {string} q
 * @returns {Promise<ResultGrouped | null>}
 */
const fetchResults = async (q) => {
	try {
		const url = new URL('/api/v1/crates', 'https://crates.io');
		url.searchParams.set('q', q);
		url.searchParams.set('per_page', '5');
		const response = await fetch(url.toString(), {
			headers: {
				'User-Agent': KUKEI_WEB_SEARCH_CLIENT_UA,
			}
		});
		if (response.status !== 200) {
			throw new Error(`Failed to fetch, ${response.status}, ${url}`);
		}
		const body = await response.json();
		if (!body.crates.length) {
			return null;
		}

		const final = body.crates.reduce((acc, curr, index) => {
			if (!acc.title) {
				// First hit!
				acc = {
					...crateToSearchItem(curr),
					subItems: [],
				};
			} else {
				acc.subItems.push(crateToSearchItem(curr));
			}

			return acc;
		}, {});

		return final;
	} catch (error) {
		console.error(error);
		return null;
	}
};
export const searchCrates = async (env, q) => {
	let cached = await cache.get(q);
	if (!cached) {
		cached = await fetchResults(q);
		if (cached) {
			await cache.set(q, cached);
		}
	}

	return cached;
};
