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
	cropLength: 50,
	limit: 10,
	offset: p,
});

const doSearch = async (env, index, q, p) => {
	const meiliClient = getMeiliClient(env);
	const results = await meiliClient.index(index).search(q, makeOptions(p));

	const {
		estimatedTotalHits,
		hits
	} = results;

	const final = hits.map((el) => {
		const highlightRaw = el._formatted?.content ?? '';
		// remove excessive whitespace
		const highlight = highlightRaw.replace(/\s+/g, ' ');
		return {
			url: el.url,
			highlight,
			excerpt: el.excerpt,
			title: el.title,
		};
	});

	return final;
};
export const search = async (env, q, p = 0) => {
	const blogs = await doSearch(env, 'blogs', q, p);
	const docs = await doSearch(env, 'docs', q, p);

	return [
		blogs,
		docs,
	];
};

export const stats = async (env) => {
	const { numberOfDocuments: blogPages} = await getMeiliClient(env).index('blogs').getStats();
	const { numberOfDocuments: docsPages} = await getMeiliClient(env).index('docs').getStats();

	return [blogPages, docsPages];
};
