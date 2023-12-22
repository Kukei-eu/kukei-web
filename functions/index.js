import Mustache from 'mustache';
import template from './template.html';
import { search, getFacets } from '../lib/search.js';
import classNames from 'html-classnames';
import {getDefaultViewData} from '../lib/view.js';
import {emitPageView} from '../lib/plausible.js';
import {parseQuery} from '../lib/parseQuery.js';

export const onRequestGet = async (context) => {
	const startTime = Date.now();
	const { request, env } = context;
	const { searchParams } = new URL(request.url);
	const { q} = Object.fromEntries(searchParams.entries());
	const { q: searchQuery, lang } = parseQuery(q);

	const searchTimeStamp = Date.now();
	const result = q ? await search(env, searchQuery, lang) : null;
	const doneIn = Date.now() - searchTimeStamp;
	console.log(`Result milestone took ${Date.now() - startTime}ms`);


	const viewDefaults = await getDefaultViewData(env);
	console.log(`Default view milestone took ${Date.now() - startTime}ms`);

	const hasBlogs = result?.hits.blogs.length > 0;
	const hasDocs = result?.hits.docs.length > 0;
	const hasMagazines = result?.hits.magazines.length > 0;
	const results = [];

	if (hasDocs) {
		results.push({
			name: 'Docs',
			anchor: 'docs',
			hits: result.hits.docs,
		});
	}
	if (hasBlogs) {
		results.push({
			name: 'Blogs',
			anchor: 'blogs',
			hits: result.hits.blogs,
		});
	}
	if (hasMagazines) {
		results.push({
			name: 'Magazines',
			anchor: 'magazines',
			hits: result.hits.magazines,
		});
	}

	const hasQuery = !!q;
	const mainClass = classNames('body', {
		'--has-query': hasQuery,
	});

	console.log(`Processing results milestone took ${Date.now() - startTime}ms`);

	const hasResults = hasQuery ? results.length > 0 : undefined;

	// without await it might get killed before sending by cloudflare
	await emitPageView(context, {
		hasResults,
	});

	const facets = await getFacets(env);

	console.log(`Facets milestone took ${Date.now() - startTime}ms`);

	const langs = [...facets.lang.values()].sort((a,b) => a.count > b.count ? -1 : 1);

	// Save used queries for analytics
	if (q) {
		await context.env.KUKEI_QUERIES.put(
			q,
			JSON.stringify({
				hasResults,
			})
		);
	}
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
		langs,
	};

	const html = Mustache.render(template, view);
	console.log(`Last milestone took ${Date.now() - startTime}ms`);

	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
