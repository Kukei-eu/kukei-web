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
	const hasBlogs = result?.hits.blogs.length > 0;
	const hasDocs = result?.hits.docs.length > 0;
	const results = [];
	if (result.hits.blogs.length) {
		results.push({
			name: 'Blogs',
			hits: result.hits.blogs,
		});
	}
	if (result.hits.docs.length) {
		results.push({
			name: 'Docs',
			hits: result.hits.docs,
		});
	}
	const view = {
		q,
		title: 'kukei.eu',
		results,
		hasQuery: !!q,
		noResults: !(hasBlogs || hasDocs),
		hasResults: results.length > 0,
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
