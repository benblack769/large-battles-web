var test = require('tape')
var arraynd = require('../array_nd.js')

test('validate_deep_equals_nd', function (t) {
    var a1 = [
        [1,2],
        [3,4]
    ]
    var a2 = [
        [1,2],
        [3,5]
    ]
    var a3 = [
        1,2
    ]
    t.false(arraynd.deep_equals_arrnd(a1,a2))
    t.false(arraynd.deep_equals_arrnd(a1,a3))
    t.true(arraynd.deep_equals_arrnd(a1,a1))
    t.end()
})

test('validate_flatten', function (t) {
    var orig_array = [
        [[1,2], [3,4], [5,6]],
        [[1,2], [3,4], [5,6]],
    ]
    var flat_arr = new Float32Array([
        1,2,
        3,4,
        5,6,
        1,2,
        3,4,
        5,6,
    ])
    t.true(arraynd.deep_equals_arrnd(arraynd.flatten(orig_array), flat_arr))
    t.true(arraynd.deep_equals_arrnd(arraynd.flatten(flat_arr), flat_arr))
    t.end()
})

test('validate_unravel', function (t) {
    var orig_array = [
        [[1,2], [3,4], [5,6]],
        [[1,2], [3,4], [5,6]],
    ]
    var reraveled = arraynd.spread_to_dim(arraynd.flatten(orig_array),arraynd.get_dims(orig_array))
    t.true(arraynd.deep_equals_arrnd(reraveled, orig_array))
    t.end()
})

test('validate_concat_dims', function (t) {
    var orig_array = [
        [[1,2], [3,4], [5,6]],
        [[1,2], [3,4], [5,6]],
    ]
    var reraveled = arraynd.spread_to_dim(arraynd.flatten(orig_array),arraynd.get_dims(orig_array))
    t.true(arraynd.deep_equals_arrnd(reraveled, orig_array))
    t.end()
})

test('validate_arrnd', function (t) {
    var a1 = [
        [[1,2], [3,4]],
        [[1,2], [3,4]],
    ]
    var a2 = [
        [[5,2], [2,4]],
        [[5,2], [2,4]],
    ]
    var concated = [
        [[1,2], [3,4], [5,2], [2,4]],
        [[1,2], [3,4], [5,2], [2,4]],
    ]
    //console.log(arraynd.concat_dim(a1,a2,1))
    t.true(arraynd.deep_equals_arrnd(arraynd.concat_dim(a1,a2,1), concated))
    t.end()
})

test('arraynd_string_test', function (t) {
    var a1 = [
        [[1,2], [3,4]],
        [[1,2], [3,4]],
    ]
    var arr_str = arraynd.arraynd_to_str(a1)
    var conv_a1 = arraynd.from_arraynd_str(arr_str)
    t.true(arraynd.deep_equals_arrnd(conv_a1, a1))
    t.true((typeof arr_str) === "string")
    t.end()
})
