import translate from './translate.js'

const redirectList = [
	{ from: '/ppk', to: '/prk' }
	// append pathnames without domens and protocols
	// { from: '/pathname-from', to: '/pathname-to' }
]
const langs = {
  'es': '/es'
  // other langs add here
  // name: cur_lang
}
const lang_keys = Object.keys(langs)

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
    if (lang_keys.includes(pathname.split('/')[1])) {
      cur_lang =  pathname.split('/')[1]
      pathname = pathname.replace(langs[cur_lang], '')
		}
    if (pathname.includes(`/${cur_lang}/sitemap.xml`) ||
        pathname.includes(`/${cur_lang}/${cur_lang}`)) {
      return translate.sampleCheck(url, cur_lang)
    }

    let redirect = redirectList.find(x => x.from.replaceAll('/', '') === pathname.replaceAll('/', ''))

    if (redirect && pathname !== '/') {
      redirect = removeChains(redirect.from, redirect.to)
      return Response.redirect(url.origin + langs[cur_lang] + redirect.to, 301)
    }

    if (cur_lang) {
      return translate.getTranslate(request, cur_lang)
    }
    return fetch(request)
  }
}
