import translate from './translate.js'

const redirectList = [
	{ from: '/ppk', to: '/prk' }
	// append pathnames without domens and protocols
	// { from: '/pathname-from', to: '/pathname-to' }
]
const langs = [
  'es'
  // other langs add here
]

function removeChains(from, to) {
  let current_from = to
  let end_to
  while (current_from) {
    end_to = current_from
    current_from = redirectList.find(link => current_from === link.from)
    current_from = current_from ? current_from.to : ''
  }
  return { from: from, to: end_to }
}

export default {
  async fetch(request) {
		const url = new URL(request.url)
    let { pathname } = url
    let cur_lang = ''
    if (langs.includes(pathname.split('/')[1])) {
      cur_lang =  pathname.split('/')[1]
      pathname = pathname.replace('/' + cur_lang, '')
		}
    if (pathname.includes(`/${cur_lang}/sitemap.xml`) ||
        pathname.includes(`/${cur_lang}/${cur_lang}`)) {
      return translate.sampleCheck(url, cur_lang)
    }

    let redirect = redirectList.find(x => x.from.replaceAll('/', '') === pathname.replaceAll('/', ''))
    if (redirect && pathname !== '/') { 
      redirect = removeChains(redirect.from, redirect.to)
      let redirectTo = redirect.to === '/' ? '' : redirect.to
      cur_lang = cur_lang ? '/' + cur_lang : ''
      return Response.redirect(url.origin + cur_lang + redirectTo, 301)
    }

    if (cur_lang) {
      return translate.getTranslate(request, cur_lang)
    }
    return fetch(request)
  }
}
