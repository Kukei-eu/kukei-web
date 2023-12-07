import Mustache from 'mustache';
import template from './template.html';
import { search, stats } from '../lib/search.js';
import hash from './version.js';

export const onRequestGet = async (context) => {
	const { request, env } = context;
	const { searchParams } = new URL(request.url);
	const { q, p = 0 } = Object.fromEntries(searchParams.entries());

	const startTime = Date.now();
	const result = q ? await search(env, q, p) : null;
	const [
		blogPages,
		docsPages,
	] = await stats(env);
	const doneIn = Date.now() - startTime;
	const hasResults = result?.hits?.length > 0;

	const hits = {};

	result?.hits?.forEach((hit) => {
		if (!hits[hit.index]) {
			hits[hit.index] = {
				label: hit.index === 'blogs' ? 'Blogs' : 'Docs',
				items: [],
			};
		}

	});

	const view = {
		q,
		title: 'kukei.eu',
		hits,
		hasResults,
		noResults: q && !hasResults,
		doneIn,
		hash,
		blogPages,
		docsPages,
	};

	const html = Mustache.render(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
