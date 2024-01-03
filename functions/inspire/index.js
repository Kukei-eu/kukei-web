import Mustache from 'mustache';
import template from './template.html';
import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import {renderHtml} from '../../lib/sso-render.js';
import {getRandomBlog} from '../../lib/search.js';

export const onRequestGet = async (context) => {
	emitPageView(context);
	const { env } = context;

	const entry = await getRandomBlog(env);

	console.log(entry);
	const viewDefaults = await getDefaultViewData(env);
	const view = {
		...viewDefaults,
		mainClass: 'body inspire',
		title: 'Get inspired - random blog post per load - kukei.eu',
		entries: [entry],
	};
	const html = await renderHtml(template, view);

	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
