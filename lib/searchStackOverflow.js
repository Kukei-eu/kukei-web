export const searchStackOverflow = async (envs, query) => {
	try {
		const url = new URL('https://api.stackexchange.com/2.3/search/excerpts');
		url.searchParams.set('order', 'desc');
		url.searchParams.set('sort', 'votes');
		url.searchParams.set('q', query);
		url.searchParams.set('pagesize', '3');
		url.searchParams.set('filters','withbody');
		url.searchParams.set('site', 'stackoverflow');
		url.searchParams.set('access_token', envs.SO_ACCESS_TOKEN);
		url.searchParams.set('key', envs.SO_APP_KEY);
		const request = await fetch(url.toString());
		const response = await request.json();
		const finalResult = response.items.reduce((acc, item) => {
			const element = {
				title: item.title,
				url: `https://stackoverflow.com/questions/${item.question_id}`,
				excerptSafe: item.body,
				hostname: 'stackoverflow.com',
				date: new Date(item.creation_date * 1000).toISOString(),
			};
			if (acc.length < 1) {
				acc.push({
					...element,
					subItems: []
				});
			} else {
				acc[0].subItems.push(element);
			}

			return acc;
		}, []);

		return finalResult;
	} catch (error) {
		console.error(error);
		return null;
	}
};
