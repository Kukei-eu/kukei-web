import { enhanceFeedbackVote } from '../../../../lib/mongo.js';
import template from './template.html';
import {renderHtml} from '../../../../lib/sso-render.js';

export const onRequestPost = async (context) => {
	const { env, request } = context;
	const data = await request.formData();

	const q = data.get('q');
	const token = data.get('token');
	const contact = data.get('contact');
	const comment = data.get('comment');

	const success = await enhanceFeedbackVote(env, {token, comment, contact});

	const view = {
		success,
		noSuccess: !success,
		q,
	};

	const html = await renderHtml(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
