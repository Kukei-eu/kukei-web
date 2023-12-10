import { MeiliSearch } from 'meilisearch';

const getMeiliClient = (env) => {
	return new MeiliSearch({
		host: env.MEILI_HOST,
		apiKey: env.MEILI_MASTER_KEY,
	});
};

const makeOptions = (p) => ({
	attributesToHighlight: ['content'],
	attributesToCrop: ['content'],
	facets: ['hostname', 'lang'],
	cropLength: 50,
	limit: 8,
	offset: p,
});

/**
 * @typedef {Object} ResultItem
 * @property {string} url
 * @property {string} highlight
 * @property {string} index
 * @property {string} excerpt
 * @property {string} title
 * @property {string} lang
 * @property {string} hostname
 */
/**
 * @typedef {Object} ResultGrouped
 * @extends {ResultItem}
 * @property {ResultItem[]} subItems
 */

/**
 *
 * @param results
 * @param env
 * @param index
 * @param q
 * @param p
 * @returns {Promise<void>}
 */
const doSearch = async (results, env, index, q, p) => {
	const meiliClient = getMeiliClient(env);
	const searchResult = await meiliClient.index(index).search(q, makeOptions(p));

	const {
		facetDistribution,
		hits
	} = searchResult;

	Object.keys(facetDistribution).forEach((key) => {
		const facetData = facetDistribution[key];
		if (!results.facets[key]) {
			results.facets[key] = [];
		}
		Object.keys(facetData).forEach((facetKey) => {
			results.facets[key].push({
				count: facetData[facetKey],
				value: facetKey,
			});
		});
	});
	/**
	 *
	 * @typedef {Map<string, {ResultGrouped}>}
	 */
	const originsMap = new Map();

	hits.forEach((el) => {
		const highlightRaw = el._formatted?.content ?? '';
		// remove excessive whitespace
		const highlight = highlightRaw.replace(/\s+/g, ' ');

		const final = {
			url: el.url,
			highlight,
			index,
			excerpt: el.excerpt,
			title: el.title,
			hostname: el.hostname,
		};

		const indexArr = results.hits[final.index];
		let existingOrigin = originsMap.get(el.hostname);

		if (existingOrigin) {
			existingOrigin.subItems.push(final);
			return;
		}

		final.subItems = [];
		originsMap.set(el.hostname, final);
		indexArr.push(final);
	});
};

/**
 * @typedef {Object} Facet
 * @property {string} name
 * @property {Array<{count: number, value: string}>} data
 */
/**
 * @typedef {Object} SearchResult
 * @property {Array<Facet>} facets
 * @property {Object<string, Array<{ResultGrouped}>>} hits
 */
/**
 *
 * @param {Object} env
 * @param {string} q
 * @param {number} p
 * @returns {Promise<{SearchResult}>}
 */
export const search = async (env, q, p = 0) => {
	const result = {
		facets: [],
		hits: {
			'blogs': [],
			'docs': [],
			'magazines': [],
		},
	};

	await doSearch(result, env, 'blogs', q, p);
	await doSearch(result, env, 'docs', q, p);
	await doSearch(result, env, 'magazines', q, p);

	return result;
};

export const stats = async (env) => {
	const { numberOfDocuments: blogPages} = await getMeiliClient(env).index('blogs').getStats();
	const { numberOfDocuments: docsPages} = await getMeiliClient(env).index('docs').getStats();
	const { numberOfDocuments: magazinesPages} = await getMeiliClient(env).index('magazines').getStats();

	return [blogPages, docsPages, magazinesPages];
};
