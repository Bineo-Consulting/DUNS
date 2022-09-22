const functions = require('firebase-functions')
const setCors = require('../utils/setCors')
const { decrypt } = require('../utils/encrypt')
const Mongo = require('../services/mongo.service')
const MappingService = require('../services/mapping.service')
// const fs = require('fs')

const db = 'https://cos4cloud-2d9d3.firebaseio.com/'
const ipHost = 'http://ip-api.com/json'

const getIpInfo = async (ip) => {
  const fetch = require('node-fetch')
  const ipFormat = ip.replace(/\./g, '_')
  let ipInfo = await fetch(`${db}/ip/${ipFormat}.json`).then(res => res.json())
  if (!ipInfo) {
    const aux = await fetch(`${ipHost}/${ip}`).then(res => res.json())
    await fetch(`https://cos4cloud-2d9d3.firebaseio.com/ip/${ipFormat}.json`, {
      method: 'PUT',
      body: JSON.stringify(aux)
    })
    ipInfo = aux
    delete ipInfo.id
  }
  return ipInfo || null
}

const proxy = functions.region('us-central1').https.onRequest(async (req, res) => {
  if (setCors(req, res)) return true

  if (req.path.includes('refresh')) {
    const items = await Mongo.get('logs')
    const p = items.map(async (item) => {
      if (item.ip) {
        const fetch = require('node-fetch')
        const ipFormat = item.ip.replace(/\./g, '_')
        let ipInfo = await fetch(`${db}/ip/${ipFormat}.json`).then(res => res.json())
        if (!ipInfo) {
          const aux = await fetch(`${ipHost}/${item.ip}`).then(res => res.json())
          await fetch(`https://cos4cloud-2d9d3.firebaseio.com/ip/${ipFormat}.json`, {
            method: 'PUT',
            body: JSON.stringify(aux)
          })
          ipInfo = aux
          delete ipInfo.id
        }
        if (!item.country) {
          await Mongo.update('logs', {
            _id: item._id,
            ...ipInfo
          })
        }
      }
      if (item['accept-language']) {
        item.lang = item['accept-language'].split(',')[0]
        await Mongo.update('logs', {_id: item._id, lang: item.lang})
      }
      return null
    })
    await Promise.all(p)
    return res.send(items)
  }

  const Url = require('url')
  const http = require('http')
  const https = require('https')
  const uaparser = require('../utils/uaparser')
  const ip = req.headers['fastly-client-ip'] || req.headers['x-appengine-user-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const {ua, ...restua} = uaparser(req.headers['user-agent']);

  let parts = Url.parse(req.url, true)
  const { id, url, ...more } = decrypt(parts.query.id)

  let [origin, _id] = id.split('/').filter(Boolean).pop().split('-').filter(Boolean);
  [origin, _id] = _id ? [origin, _id] : ['natusfera', origin]

  parts = Url.parse(url)

  const filename = parts.pathname.split("/").pop()
  const options = {
    port: (parts.protocol === "https:" ? 443 : 80),
    host: parts.hostname,
    method: 'GET',
    path: parts.path,
    accept: '*/*'
  }
  const request = (options.port === 443 ? https.request(options) : http.request(options));

  request.addListener('response', function (proxyResponse) {
    let offset = 0;
    const contentLength = parseInt(proxyResponse.headers["content-length"], 10);
    const body = new Buffer(contentLength);

    proxyResponse.setEncoding('binary');
    proxyResponse.addListener('data', function(chunk) {
      body.write(chunk, offset, "binary");
      offset += chunk.length;
    }); 

    proxyResponse.addListener('end', function() {
      const contentType = filename.includes('.png') ? 'image/png' : 'image/jpeg'
      res.contentType(contentType);
      res.write(body);
      res.end();
    });
  });

  request.end();

  const ipInfo = ip ? await getIpInfo(ip) : null

  let lang = null
  if (req.headers['accept-language']) {
    lang = req.headers['accept-language'].split(',')[0]
  }

  let ref_user = null
  if (more && more.user_id) {
    ref_user = more.user_id
  } else {
    const dwcRes = await MappingService._dwcGetById(id, origin)
    ref_user = dwcRes.user ? (dwcRes.user.id || dwcRes.user.login) : null
  }


  const aux = {
    host: req.get('Referrer') || req.get('Referer') || req.headers.referer || req.headers.referrer,
    protocol: req.protocol,
    method: req.method,
    "sec-ch-ua": req.headers['sec-ch-ua'],
    'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'],
    'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'],
    'sec-fetch-site': req.headers['sec-fetch-site'],
    'sec-fetch-mode': req.headers['sec-fetch-mode'],
    'sec-fetch-user': req.headers['sec-fetch-user'],
    'sec-fetch-dest': req.headers['sec-fetch-dest'],
    'accept-language': req.headers['accept-language'],
    ref_id: id,
    origin,
    ua,
    ip,
    ...restua,
    url,
    ...ipInfo,
    lang,
    ref_user: ref_user ? `${ref_user}` : null
  }

  if (aux.host) {
    const urlParse = new Url(aux.host)
    aux.hostname = urlParse.host
  }

  // const items = await Mongo.get('logs')
  // const p = items.map(item => Mongo.delete('logs', item._id))
  // await Promise.all(p)
  return Mongo.update('logs', aux)
})

module.exports = { proxy }
