import { MeiliSearch } from 'meilisearch'

const getMeiliClient = (env) => {
	return new MeiliSearch({
		host: env.MEILI_HOST,
		apiKey: env.MEILI_MASTER_KEY,
	});
}

export const search = async (env, q, p = 0) => {
	const meiliClient = getMeiliClient(env);
	const meiliResults = await meiliClient.index('index').search(q, {
		attributesToHighlight: ['content'],
		attributesToCrop: ['content'],
		cropLength: 50,
		limit: 10,
		offset: p,
	});

	const {
		estimatedTotalHits,
		hits
	} = meiliResults;

	const final = hits.map((el) => {
		const highlightRaw = el._formatted?.content ?? '';
		// remove excessive whitespace
		const highlight = highlightRaw.replace(/\s+/g, ' ');
		return {
			url: el.url,
			highlight,
			excerpt: el.excerpt,
			title: el.title,
		}
	});

	return final;
}
