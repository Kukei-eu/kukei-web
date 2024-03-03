import { createHash, randomBytes } from 'node:crypto';
import { registerFeedbackVote } from '../../../lib/mongo.js';
import {getTemplate, renderHtml} from '../../../lib/sso-render.js';

const template = getTemplate(import.meta.dirname, './template.html');

export const postApiFeedbackController = async (req, res) => {
	const data = req.body;

	const pseudoRandom = randomBytes(8).toString('hex');
	const token = createHash('sha256').update(pseudoRandom).digest('hex');

	const vote = parseInt(data.vote, 10);
	const q = data.q;

	const insertedId = await registerFeedbackVote({q, vote, token});

	const view = {
		q,
		token,
		success: !!insertedId,
	};

	const html = await renderHtml(template, view);
	res.status(201).send(html);
};
