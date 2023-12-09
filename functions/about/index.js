import Mustache from 'mustache';
import template from './template.html';
import hash from '../version.js';
import {stats} from '../../lib/search.js';

export const onRequestGet = async (context) => {
	const { env } = context;
	const [
		blogPages,
		docsPages,
		magazinesPages,
	] = await stats(env);

	const view = {
		title: 'About kukei.eu',
		hash,
		blogPages,
		docsPages,
		magazinesPages,
		totalPages: blogPages + docsPages + magazinesPages,
	};

	const html = Mustache.render(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
