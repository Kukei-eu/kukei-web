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
		projection: {url: 1, lastCrawledAt: 1, index: 1}
	});

	return response?.documents ?? [];
};

export const getCrawlHistory = async (envs) => {
	const twoDaysAgoInMs = Date.now() - (2 * 24 * 60 * 60 * 1000);
	const response = await callMongo(envs, 'aggregate', {
		collection: `${envs.ATLAS_COLLECTION}-stats`,
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		pipeline: [
			{
				$match: {
					created: {$gt: twoDaysAgoInMs}
				}
			},
			{
				$sort: {
					created: -1
				}
			},
			{
				$limit: 100
			}
		]
	});

	const documents = (response?.documents ?? []).map((el) => ({
		...el,
		date: (new Date(el.created)).toISOString()
	}));

	return documents;
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

	return response?.documents?.[0]?.count ?? 0;
};

export const trackQuery = async (envs, {q, hasResults}) => {
	const d = Date.now();
	await callMongo(envs, 'updateOne', {
		collection: 'queries',
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		filter: {
			q,
		},
		update: {
			$inc: {
				used: 1,
			},
			$set: {
				q,
				hasResults,
				lastUse: Date.now()
			}
		},
		upsert: true,
	});
	console.log(`Analytics via mongo took ${Date.now() - d}ms`);
};

export const registerFeedbackVote = async (envs, {q, vote, token}) => {
	const response = await callMongo(envs, 'insertOne', {
		collection: 'feedback',
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		document: {
			q,
			vote,
			token,
			created: (new Date()).toISOString(),
		},
	});

	const { insertedId } = response;

	return insertedId;
};

export const enhanceFeedbackVote = async (envs, {token, comment, contact }) => {
	const { document } = await callMongo(envs, 'findOne', {
		collection: 'feedback',
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		filter: {
			token,
		},
		projection: {
			_id: 1,
		},
	});

	if (!document?._id) {
		return false;
	}

	await callMongo(envs, 'updateOne', {
		collection: 'feedback',
		database: envs.ATLAS_DB,
		dataSource: envs.ATLAS_SOURCE,
		filter: {
			token,
		},
		update: {
			$set: {
				comment,
				contact,
			},
		},
	});

	return true;
};
