import Mustache from 'mustache';
import template from './template.html';
import { search, stats } from '../lib/search.js';
import hash from './version.js';
import classNames from 'html-classnames'

export const onRequestGet = async (context) => {
	const { request, env } = context;
	const { searchParams } = new URL(request.url);
	const { q, p = 0 } = Object.fromEntries(searchParams.entries());

	const startTime = Date.now();
	const result = q ? await search(env, q, p) : null;
	const [
		blogPages,
		docsPages,
		magazinesPages,
	] = await stats(env);
	const doneIn = Date.now() - startTime;
	const hasBlogs = result?.hits.blogs.length > 0;
	const hasDocs = result?.hits.docs.length > 0;
	const hasMagazines = result?.hits.magazines.length > 0;
	const results = [];
	if (hasDocs) {
		results.push({
			name: 'Docs',
			hits: result.hits.docs,
		});
	}
	if (hasBlogs) {
		results.push({
			name: 'Blogs',
			hits: result.hits.blogs,
		});
	}
	if (hasMagazines) {
		results.push({
			name: 'Magazines',
			hits: result.hits.magazines,
		});
	}

	const hasQuery = !!q;
	const mainClass = classNames('body', {
		'--has-query': hasQuery,
	});

	const view = {
		q,
		title: 'kukei.eu',
		results,
		hasQuery,
		mainClass,
		noResults: !(hasBlogs || hasDocs),
		hasResults: results.length > 0,
		doneIn,
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
