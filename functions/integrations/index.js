import Mustache from 'mustache';
import template from './template.html';
import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import {renderHtml} from '../../lib/sso-render.js';

export const onRequestGet = async (context) => {
	emitPageView(context);
	const { env } = context;

	const viewDefaults = await getDefaultViewData(env);
	const view = {
		...viewDefaults,
		mainClass: 'about body',
		title: 'Kukei.eu integrations',
	};
	const html = await renderHtml(template, view);

	return new Response(html, {
		headers: {
			'content-type': 'text/html',
		},
	});
};
