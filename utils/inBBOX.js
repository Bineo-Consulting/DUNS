function pointCollide(p, box) {
  // return !(p.x < box.left || p.x > box.right || p.y > box.bottom || p.y < box.top)
  return p.x >= box.left && p.x <= box.right && p.y >= box.bottom && p.y <= box.top
}

const inBBOX = (item, query) => {
  const [lat1, lat2] = query.decimalLatitude.split(',').map(Number)
  const [lng1, lng2] = query.decimalLongitude.split(',').map(Number)

  const [bottom, top] = lat1 > lat2 ? [lat2, lat1] : [lat1, lat2]
  const [left, right] = lng1 > lng2 ? [lng2, lng1] : [lng1, lng2]

  const x = item.decimalLongitude
  const y = item.decimalLatitude

  return pointCollide({
    x, y
  }, {
    bottom, top,
    left, right
  })
}

module.exports = { inBBOX }