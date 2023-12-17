const callMongo = async (envs, action, data) => {
	const uri = `${envs.ATLAS_URI}/action/${action}`;
	const request = await fetch(uri, {
		method: 'POST',
		headers: {
			'api-key': envs.ATLAS_API_KEY,
			'content-type': 'application/json',
			'access-control-request-headers': '*',
		},
		body: JSON.stringify(data)
	});

	const response = await request.json();

	return response;
};

export const getIndexStats = async (envs) => {
	const response = await callMongo(envs, 'find', {
		collection: envs.ATLAS_COLLECTION,
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		projection: { url: 1, lastCrawledAt: 1, index: 1}
	});

	return response?.documents ?? [];
};

export const getUnchecked = async (envs) => {
	const response = await callMongo(envs, 'aggregate', {
		collection: `${envs.ATLAS_COLLECTION}-links`,
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		pipeline: [
			{
				$match: {
					lastCrawledAt: {$exists: false}
				},
			},
			{
				$group: {
					_id: '$source',
					count: {$sum: 1}
				}
			}
		]
	});

	return response?.documents?.[0]?.count ?? null;
};
