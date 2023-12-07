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
	facets: ['hostname'],
	cropLength: 50,
	limit: 10,
	offset: p,
});

const doSearch = async (result, env, index, q, p) => {
	const meiliClient = getMeiliClient(env);
	const results = await meiliClient.index(index).search(q, makeOptions(p));

	const {
		facetDistribution,
		hits
	} = results;

	result.facets.push(...facetDistribution);

	hits.forEach((el) => {
		const highlightRaw = el._formatted?.content ?? '';
		// remove excessive whitespace
		const highlight = highlightRaw.replace(/\s+/g, ' ');

		result.hits.push({
			url: el.url,
			highlight,
			index,
			excerpt: el.excerpt,
			title: el.title,
		});
	});
};
export const search = async (env, q, p = 0) => {
	const result = {
		facets: [],
		hists: [],
	};
	await doSearch(env, 'blogs', q, p);
	await doSearch(env, 'docs', q, p);

	return result;
};

export const stats = async (env) => {
	const { numberOfDocuments: blogPages} = await getMeiliClient(env).index('blogs').getStats();
	const { numberOfDocuments: docsPages} = await getMeiliClient(env).index('docs').getStats();

	return [blogPages, docsPages];
};
