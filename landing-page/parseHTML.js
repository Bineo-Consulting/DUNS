const deep = (obj, path) => {
  if (path) return path.split('.').reduce((prev, curr) => prev && prev[curr], obj) || ''
  else return ''
}
const parseHtml = (html, object, defaultLang) => {
  let htmlAux = html
  html.split('{{').slice(1).map(htmlStart => {
    const variable = htmlStart.split('}}')[0].trim()
    const search = `{{${variable}}}`
    let found = true
    while(found) {
      found = htmlAux.includes(search)
      if (found) {
        htmlAux = htmlAux.replace(search, deep(object, variable) || deep(defaultLang, variable))
      }
    }
  })
  return htmlAux
}
const replace = (data, exp, term) => {
  return data.replaceAll(exp, term)
}

module.exports = parseHtml

if (process.env.INIT) {
  const langs = ['en', 'es']
  const fs = require('fs')
  const html = fs.readFileSync('./index.html').toString()
  const htmls = langs.map(lang => {
    try {
      const data = JSON.parse(fs.readFileSync(`./i18n/${lang}.json`))
      let aux = parseHtml(html, data, 'en')
      aux = replace(aux, '"dist/', '"/')
      return {
        lang,
        html: aux
      }
    } catch(_) {
      console.error(_)
      return null
    }
  })

  htmls.map(data => {
    fs.mkdir(`./dist/${data.lang}/`, { recursive: true }, (err) => {
      if (err) throw err;
      fs.writeFileSync(`./dist/${data.lang}/index.html`, data.html)
    });
  })
  fs.writeFileSync(`./dist/index.html`, htmls[0].html)
  console.log('writeFileSync')
}