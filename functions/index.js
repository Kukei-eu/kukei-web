import Mustache from "mustache";
import template from "./template.html";
import { search } from '../lib/search.js';
import hash from './version.js';

export const onRequestGet = async (context) => {
	const { request, env } = context;
	const { searchParams } = new URL(request.url);
	const { q, p = 0 } = Object.fromEntries(searchParams.entries());

	const startTime = Date.now();
	const list = q ? await search(env, q, p) : [];
	const doneIn = Date.now() - startTime;
	const hasResults = list.length > 0;
	const view = {
		q,
		title: 'kukei.eu',
		list,
		hasResults,
		noResults: q && !hasResults,
		doneIn,
		hash,
	};

	const html = Mustache.render(template, view);
	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
}
