const encrypt = (id, url, more = null) => {
  const s = JSON.stringify({id, url, ...more})
  return encodeURIComponent(Buffer.from(s).toString('base64'))
}
const decrypt = (id) => {
  return JSON.parse(Buffer.from(id, 'base64').toString())
}
module.exports = { encrypt, decrypt }