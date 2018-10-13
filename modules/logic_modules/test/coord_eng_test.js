var ce = require('../coord_engine.js')
var test = require('tape')

test('distance', function (t) {
  t.equal(ce.distance(ce.make_coord(1,2),ce.make_coord(2,2)), 1)
  t.end()
})
