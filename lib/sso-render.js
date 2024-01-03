import Mustache from 'mustache';
import beforeTemplate from './partials/before.html';
import afterTemplate from './partials/after.html';


export const renderHtml = async (template, data) => {
	const before = Mustache.render(beforeTemplate, data);
	const after = Mustache.render(afterTemplate, data);

	const html = Mustache.render(template, {
		...data,
		before,
		after,
	});

	return html;
};
