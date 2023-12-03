import { buildClient} from '@xata.io/client';

const getXataClient = (env) => {
	const Client = buildClient();
	const xata = new Client({
		apiKey: env.XATA_API_KEY,
		branch: env.XATA_BRANCH,
		databaseURL: env.XATA_DB_URL,
	});

	return xata;
}

export const search = async (env, q, p = 0) => {
	const xata = getXataClient(env);
	const result = await xata.db.index.search(q, {
		fuzziness: 2,
		target: [
			{
				column: 'content',
				weight: 1,
			},
			{
				column: 'title',
				weight: 2,
			},
		],
		page: {
			size: 10,
			offset: p,
		},
		prefix: "phrase",
	})
	const { totalCount, records } = result;

	const final = records.map((el) => {
		const highlightRaw = el.xata?.highlight?.content?.[0] ?? '';
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
