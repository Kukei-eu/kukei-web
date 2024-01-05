import { createHash, randomBytes } from 'node:crypto';
import { registerFeedbackVote } from '../../../lib/mongo.js';
import template from './template.html';
import {renderHtml} from '../../../lib/sso-render.js';

export const onRequestPost = async (context) => {
	const { env, request } = context;
	const data = await request.formData();

	const pseudoRandom = randomBytes(8).toString('hex');
	const token = createHash('sha256').update(pseudoRandom).digest('hex');

	const vote = parseInt(data.get('vote'), 10);
	const q = data.get('q');

	const insertedId = await registerFeedbackVote(env, {q, vote, token});

	const view = {
		q,
		token,
		success: !!insertedId,
	};

	const html = await renderHtml(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
