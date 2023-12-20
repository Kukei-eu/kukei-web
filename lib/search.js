import { MeiliSearch } from 'meilisearch';

const getMeiliClient = (env) => {
	return new MeiliSearch({
		host: env.MEILI_HOST,
		apiKey: env.MEILI_MASTER_KEY,
	});
};

const makeOptions = (lang) => ({
	attributesToHighlight: ['content'],
	attributesToCrop: ['content'],
	facets: ['hostname', 'lang'],
	filter: lang ? [
		`lang=${lang}`
	] : undefined,
	cropLength: 50,
	limit: 8,
	offset: 0,
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
 * @param {Object} options
 * @returns {Promise<void>}
 */
const doSearch = async (results, env, index, q, { lang } = {}) => {
	const meiliClient = getMeiliClient(env);
	const searchResult = await meiliClient.index(`kukei-${index}`).search(q, makeOptions(lang));

	const {
		hits
	} = searchResult;

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
 * @param {string?} lang
 * @returns {Promise<{SearchResult}>}
 */
export const search = async (env, q, lang) => {
	const result = {
		facets: [],
		hits: {
			'blogs': [],
			'docs': [],
			'magazines': [],
		},
	};

	await doSearch(result, env, 'blogs', q, lang);
	await doSearch(result, env, 'docs', q, lang);
	await doSearch(result, env, 'magazines', q, lang);

	return result;
};

export const stats = async (env) => {
	const { numberOfDocuments: blogPages} = await getMeiliClient(env).index('kukei-blogs').getStats();
	const { numberOfDocuments: docsPages} = await getMeiliClient(env).index('kukei-docs').getStats();
	const { numberOfDocuments: magazinesPages} = await getMeiliClient(env).index('kukei-magazines').getStats();

	return [blogPages, docsPages, magazinesPages];
};

export const getFacets = async (env) => {
	const client = await getMeiliClient(env);
	const { facetHits: blogFacets } = await client.index('kukei-blogs').searchForFacetValues({
		facetName: 'lang'
	});
	const { facetHits: docsFacets } = await client.index('kukei-docs').searchForFacetValues({
		facetName: 'lang'
	});
	const { facetHits: magazinesFacets } = await client.index('kukei-magazines').searchForFacetValues({
		facetName: 'lang'
	});

	const lang = [...blogFacets, ...docsFacets, ...magazinesFacets].reduce((acc, curr) => {
		if (!acc.has(curr.value)) {
			acc.set(curr.value, {
				name: curr.value,
				count: 0
			});
		}

		const existing = acc.get(curr.value);
		existing.count += curr.count;

		return acc;
	}, new Map());

	return {
		lang,
	};
};
