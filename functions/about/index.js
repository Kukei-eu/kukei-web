import Mustache from 'mustache';
import template from './template.html';
import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';

export const onRequestGet = async (context) => {
	emitPageView(context);
	const { env } = context;

	const viewDefaults = await getDefaultViewData(env);
	const view = {
		...viewDefaults,
		title: 'About kukei.eu',
	};
	const html = Mustache.render(template, view);

	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
