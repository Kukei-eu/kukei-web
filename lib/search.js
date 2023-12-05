import { buildClient} from '@xata.io/client';
import { MeiliSearch } from 'meilisearch'

const getXataClient = (env) => {
	const Client = buildClient();
	const xata = new Client({
		apiKey: env.XATA_API_KEY,
		branch: env.XATA_BRANCH,
		databaseURL: env.XATA_DB_URL,
	});

	return xata;
}

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
