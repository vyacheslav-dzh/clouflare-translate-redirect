async function gatherResponse(response) {
	return response.text()
}
function replaceFields(results, lang, host) {
	return results
		.replaceAll('href="/"', `href="/${lang}/"`)
		.replaceAll(`${lang}.${host}`, `${host}/${lang}/`)
		.replaceAll('action="/search"', 'action="/es/search"')
		.replaceAll(`href="https://${host}/${lang}/"`, `href="https://${host}/${lang}"`)
		.replaceAll(`href="https://${host}/${lang}//`, `href="https://${host}/${lang}/`)
		.replaceAll(`href="https://${host}/${lang}/"`, `href="https://${host}/${lang}"`)
		.replaceAll(`href="https://${lang}.${host}.com/404"`, `href="https://${host}/${lang}/404"`)
		.replaceAll('<script type="text/javascript" src="https://cdn.weglot.com/weglot.min.js"></script>', '<script>Weglot = {initialize: function() {}}</script>')
		.replaceAll(`href="/${lang}/"`, `href="/${lang}"`)
		.replaceAll('?hash=fd2rdx05', '')
		.replaceAll('?hash=f2dsx03', '')
		.replaceAll('&hash=fd2rdx05', '')
		.replaceAll('&hash=f2dsx03', '')
		.replaceAll(`link href="https://${host}/${lang}/"`, `link href="https://${host}/${lang}"`)
}

const params = {
  headers: {
    "content-type": "text/html",
    "cache-control": "no-cache",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
  },
}

export default {
	async sampleCheck(url, lang) {
		let { pathname, host } = url
		if (pathname.includes(`/${lang}/sitemap.xml`)) {
			return Response.redirect(`https://${host}/sitemap.xml`, 301)
		}

		if (pathname.includes(`/${lang}/${lang}`)) {
			const translate404 = await fetch(`https://${lang}.${host}/404`, params)
			let results404 = await gatherResponse(translate404)
			results404 = results404
				.replaceAll(`href="https://${lang}.${host}/404"`, `href="https://${host}/${lang}/404"`)
				.replaceAll('action="/search"', `action="/${lang}/search"`)
			return new Response(replaceFields(results404), {
				status: 404,
				headers: {
					"content-type": "text/html"
				}
			})
		}
	},

	async getTranslate(request, lang) {
		const url = new URL(request.url)
		const params = {
			headers: {
				"content-type": "text/html",
				"cache-control": "no-cache",
				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"
			},
		}
		let { pathname, search, host } = url

		if (pathname.split('/')[1] === lang) {
			pathname = pathname.replace('/' + lang + '/', '').replace('/' + lang, '')
			const hash = search.length ? '&hash=f2dsx03' : '?hash=fd2rdx05'
			console.log(`https://${lang}.${host}.com/`)
			const translate = await fetch(`https://${lang}.${host}/` + pathname + search + hash, params)
			const results = await gatherResponse(translate)
			if (translate.status === 404) {
				params.status = 404
			}

			const resultsFix = replaceFields(results, lang, host)
			params.status = request.status === 301 ? 301 : 200
			return new Response(resultsFix, params)
		}
	}
}

