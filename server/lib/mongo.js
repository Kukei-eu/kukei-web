import {MongoClient} from 'mongodb';

const envs = process.env;

export const getMongo = async () => {
	const client = new MongoClient(process.env.MONGO_URI);
	await client.connect();
	const db = await client.db(process.env.MONGO_DATABASE);

	return [client, db];
};

let db;
let client;
const getDb = async () => {
	if (!db) {
		[client, db] = await getMongo();
	}
	return db;
};

export const getIndexStats = async () => {
	const db = await getDb();
	const result = await db.collection(envs.MONGO_COLLECTION).find();

	return result.toArray();
};

// One day more than two weeks ago
const twoWeeksAgoInMs = Date.now() - (15 * 24 * 60 * 60 * 1000);
export const getCrawlHistory = async () => {
	const db = await getDb();

	const result = await db.collection(`${envs.MONGO_COLLECTION}-stats`).aggregate([
		{
			$match: {
				created: {$gt: twoWeeksAgoInMs}
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
	]).toArray();


	const documents = (result.length ? result : []).map((el) => ({
		...el,
		date: (new Date(el.created)).toISOString()
	}));

	return documents;
};

export const getUnchecked = async () => {
	const db = await getDb();
	const [ result ] = await db.collection(`${envs.MONGO_COLLECTION}-links`).aggregate(
		[
			{
				$match: {
					lastCrawledAt: { $exists: false }
				}
			},
			{ $count: 'unCrawled' }
		],
		{ maxTimeMS: 60000, allowDiskUse: true }
	).toArray();

	return result?.unCrawled ?? 0;
};

export const trackQuery = async ({q, hasResults}) => {
	const d = Date.now();
	const db = await getDb();
	await db.collection('queries').updateOne(
		{ q },
		{
			$inc: {
				used: 1,
			},
			$set: {
				q,
				hasResults,
				lastUse: Date.now()
			}
		},
		{
			upsert: true,
		}
	);

	console.log(`Analytics via mongo took ${Date.now() - d}ms`);
};

export const registerFeedbackVote = async ({q, vote, token}) => {
	const db = await getDb();
	const response = await db.collection('feedback').insertOne({
		q,
		vote,
		token,
		created: (new Date()).toISOString(),
	});

	const { insertedId } = response;

	return insertedId;
};

export const enhanceFeedbackVote = async ({token, comment, contact }) => {
	const db = await getDb();
	const document = await db.collection('feedback').findOne({
		token,
	}, {
		_id: 1
	});

	if (!document?._id) {
		return false;
	}

	await db.collection('feedback').updateOne(
		{
			token
		},
		{
			$set: {
				comment,
				contact,
			},
		},
	);
	return true;
};
