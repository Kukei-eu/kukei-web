import Mustache from 'mustache';
import template from './template.html';
import { search } from '../lib/search.js';
import classNames from 'html-classnames';
import {getDefaultViewData} from '../lib/view.js';
import {emitPageView} from '../lib/plausible.js';

export const onRequestGet = async (context) => {
	const { request, env } = context;
	const { searchParams } = new URL(request.url);
	const { q, p = 0 } = Object.fromEntries(searchParams.entries());

	const startTime = Date.now();
	const result = q ? await search(env, q, p) : null;
	const doneIn = Date.now() - startTime;

	const viewDefaults = await getDefaultViewData(env);
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

	const hasResults = results.length > 0;

	// without await it might get killed before sending by cloudflare
	await emitPageView(context, {
		hasResults,
	});

	const view = {
		...viewDefaults,
		q,
		title: 'kukei.eu',
		results,
		hasQuery,
		mainClass,
		noResults: !hasResults,
		hasResults,
		doneIn,
	};

	const html = Mustache.render(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
