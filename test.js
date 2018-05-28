'use strict'
var test = require('tape')
var _ = require('./index.js')
var data = require('./sample.json')

function stringify (X) {
  return JSON.stringify(X, undefined, 2)
}

test('#copy', function (assert) {
  var obj = {
    name: 'John',
    age: 35,
    fruits: ['apple', 'banana', 'manga'],
    info: {
      sons: [
        {
          name: 'Clara',
          age: 3
        }, {
          name: 'Pedro',
          age: 2
        }
      ]
    },
    job: null
  }

  var X = _.copy(obj)

  assert.deepEqual(stringify(X), stringify(obj))

  X.job = 'doctor'

  assert.deepEqual(X.job, 'doctor')
  assert.deepEqual(obj.job, null)

  assert.end()
})

test('#compose', function (assert) {
  var divide2 = x => x / 2
  var multiply3 = x => x * 3
  var add5 = x => x + 5

  assert.deepEqual(_.compose(divide2, multiply3, add5)(7), 18)
  assert.deepEqual(_.compose(multiply3, add5, divide2)(7), 25.5)
  assert.deepEqual(_.compose(add5, divide2, multiply3)(7), 15.5)
  assert.deepEqual(_.compose()(7), 7)

  assert.end()
})

test('#path', function (assert) {
  var obj = {
    name: 'John',
    age: 35,
    fruits: ['apple', 'banana', 'manga'],
    info: {
      sons: [
        {
          name: 'Clara',
          age: 3
        }, {
          name: 'Pedro',
          age: 2
        }
      ]
    },
    job: null
  }
  var obj2 = _.copy(obj)

  var X = [null, undefined, true, false, 0, 3.14, '', 'identity']
  var Y = _.copy(X)

  X.forEach(x => {
    assert.deepEqual(_.path()(x), x)
  })
  assert.deepEqual(stringify(obj), stringify(obj2))
  assert.deepEqual(stringify(X), stringify(Y))
  assert.deepEqual(stringify(_.path([])(obj)), stringify([]))
  assert.deepEqual(stringify(_.path({})(obj)), stringify({}))
  assert.deepEqual(stringify(_.path(null)(obj)), stringify(obj))
  assert.deepEqual(_.path('name')(obj), 'John')
  assert.deepEqual(_.path('name.3.2')(obj), undefined)
  assert.deepEqual(_.path('fruits.2')(obj), 'manga')
  assert.deepEqual(_.path('info.sons.0.age')(obj), 3)
  assert.deepEqual(_.path('info.sons.4.age')(obj), undefined)
  assert.deepEqual(_.path('job')(obj), null)
  assert.deepEqual(_.path('job.3')(obj), undefined)
  assert.deepEqual(_.path('info.sons.length')(obj), 2)

  var obj3 = {
    x: 'name',
    y: 'age',
    z: {
      x: 'fruits.2',
      y: 'info.sons.0.age'
    }
  }
  var obj4 = _.copy(obj3)

  assert.deepEqual(stringify(_.path(obj3)(obj)), stringify({
    x: 'John',
    y: 35,
    z: {
      x: 'manga',
      y: 3
    }
  }))
  assert.deepEqual(stringify(obj3), stringify(obj4))

  var Z = ['name', 'age', 'fruits.2', 'info.sons.0.age']
  var W = _.copy(Z)

  assert.deepEqual(stringify(_.path(Z)(obj)), stringify(['John', 35, 'manga', 3]))
  assert.deepEqual(stringify(Z), stringify(W))

  assert.end()
})

test('#iterate', function (assert) {
  var obj = {
    name: 'John',
    age: 35,
    fruits: ['apple', 'banana', 'manga'],
    info: {
      sons: [
        {
          name: 'Clara',
          age: 3
        }, {
          name: 'Pedro',
          age: 2
        }
      ]
    },
    job: null
  }

  var obj2 = _.copy(obj)
  var obj3 = _.copy(obj)
  obj3.age += 1
  obj3.info.sons[0].age += 1
  obj3.info.sons[1].age += 1

  var obj4 = _.iterate(x => {
    if (typeof x === 'number') {
      return x + 1
    } else {
      return x
    }
  })(obj)

  var X = []

  _.iterate(x => {
    X.push(x)
  })(obj)

  assert.deepEqual(stringify(obj), stringify(obj2))
  assert.deepEqual(stringify(obj3), stringify(obj4))
  assert.deepEqual(stringify(X), stringify([
    'John',
    35,
    'apple',
    'banana',
    'manga',
    'Clara',
    3,
    'Pedro',
    2,
    null
  ]))

  assert.end()
})

test('#compare', function (assert) {
  assert.deepEqual(_.compare(null)(true), -1)
  assert.deepEqual(_.compare(null)(false), -1)
  assert.deepEqual(_.compare(false)(false), 0)
  assert.deepEqual(_.compare(true)(false), 1)
  assert.deepEqual(_.compare(true)(1), 0)
  assert.deepEqual(_.compare(false)(0), 0)
  assert.deepEqual(_.compare('7')(7), 0)
  assert.deepEqual(_.compare('7')(37), -1)
  assert.deepEqual(_.compare(37)('7'), 1)
  assert.deepEqual(_.compare('zzz')('zza'), 1)
  assert.deepEqual(_.compare('zz')('zza'), -1)
  assert.deepEqual(_.compare('zza')('zza'), 0)
  assert.deepEqual(_.compare('zza')([]), -1)
  assert.deepEqual(_.compare('zza')({}), -1)
  assert.deepEqual(_.compare([1, 2, 3])([1, 2, 3, 4]), 0)
  assert.deepEqual(_.compare([1, 2, 3, 4])([1, 2, 3]), 1)
  assert.deepEqual(_.compare([1, 1000, 3, 4])([1, 999, 999]), 1)

  var obj = {
    x: 'banana',
    y: 5,
    z: {
      a: 7,
      b: [1, 4, 5, 7],
      z: 12
    }
  }
  var obj2 = _.copy(obj)
  var obj3 = _.copy(obj)
  var obj4 = _.copy(obj)
  obj3.z.b[2] = 3
  obj4.z.b.push('x')

  assert.deepEqual(_.compare(obj)(obj2), 0)
  assert.deepEqual(_.compare(obj)(obj4), 0)
  assert.deepEqual(_.compare(obj4)(obj), 1)
  assert.deepEqual(_.compare(obj3)(obj), -1)
  assert.deepEqual(_.compare(obj)(obj3), 1)

  assert.end()
})

test('#sort', function (assert) {
  var V, U

  var orig = _.copy(data)
  var sort = _.sort()(orig)

  assert.deepEqual(stringify(_.sort(null)(data)), stringify(sort))
  assert.deepEqual(stringify(_.sort()(data)), stringify(sort))
  assert.deepEqual(stringify(_.sort([])(data)), stringify(data))
  assert.deepEqual(stringify(_.sort([null])(data)), stringify(sort))
  assert.deepEqual(_.compare(data)(orig), 0)

  V = _.sort(['strangeField'])(data)
  U = _.sort(['-strangeField'])(data)

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(data))
  assert.deepEqual(stringify(U), stringify(data))

  V = _.sort(['age'])(data)
  U = _.sort(['-age'])(data)

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].age, 24)
  assert.deepEqual(V[9].age, 40)
  assert.deepEqual(U[0].age, 40)
  assert.deepEqual(U[9].age, 24)

  V = _.sort(['balance'])(data)
  U = _.sort(['-balance'])(data)

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].balance, 1196.56)
  assert.deepEqual(V[9].balance, 3546.79)
  assert.deepEqual(U[0].balance, 3546.79)
  assert.deepEqual(U[9].balance, 1196.56)

  V = _.sort(['isActive'])(data)
  U = _.sort(['-isActive'])(data)

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].isActive, false)
  assert.deepEqual(V[9].isActive, true)
  assert.deepEqual(U[0].isActive, true)
  assert.deepEqual(U[9].isActive, false)

  V = _.sort(['eyeColor'])(data)
  U = _.sort(['-eyeColor'])(data)

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].eyeColor, 'blue')
  assert.deepEqual(V[9].eyeColor, 'green')
  assert.deepEqual(U[0].eyeColor, 'green')
  assert.deepEqual(U[9].eyeColor, 'blue')

  V = _.sort(['since'])(data)
  U = _.sort(['-since'])(data)

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].since, '2010-09-25')
  assert.deepEqual(V[9].since, '2014-12-01')
  assert.deepEqual(U[0].since, '2014-12-01')
  assert.deepEqual(U[9].since, '2010-09-25')

  V = _.sort(['eyeColor', '-age'])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].eyeColor, 'blue')
  assert.deepEqual(V[0].age, 38)
  assert.deepEqual(V[9].eyeColor, 'green')
  assert.deepEqual(V[9].age, 32)

  V = _.sort(['tags.length'])(data)
  U = _.sort(['-tags.length'])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].tags.length, 0)
  assert.deepEqual(V[9].tags.length, 6)
  assert.deepEqual(U[0].tags.length, 6)
  assert.deepEqual(U[9].tags.length, 0)

  V = _.sort(['tags.2'])(data)
  U = _.sort(['-tags.2'])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V[0].tags[2], undefined)
  assert.deepEqual(V[1].tags[2], undefined)
  assert.deepEqual(V[2].tags[2], undefined)
  assert.deepEqual(V[3].tags[2], 'ad')
  assert.deepEqual(V[9].tags[2], 'sint')
  assert.deepEqual(U[9].tags[2], undefined)
  assert.deepEqual(U[8].tags[2], undefined)
  assert.deepEqual(U[7].tags[2], undefined)
  assert.deepEqual(U[6].tags[2], 'ad')
  assert.deepEqual(U[0].tags[2], 'sint')

  var W = [2, 8, 1, 7, 19, 32, 4, 6]
  V = _.sort()(W)
  U = _.sort('-')(W)
  assert.deepEqual(stringify(V), stringify([1, 2, 4, 6, 7, 8, 19, 32]))
  assert.deepEqual(stringify(U), stringify([32, 19, 8, 7, 6, 4, 2, 1]))

  assert.deepEqual(stringify(_.sort(['tag', '-id'])([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])), stringify([
    {id: 7, tag: 'bike'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'car'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'train'},
    {id: 2, tag: 'train'}
  ]))

  assert.end()
})

test('#distinct', function (assert) {
  var V, U
  var orig = _.copy(data)

  assert.deepEqual(stringify(_.distinct(null)(data)), stringify(_.sort()(data)))
  assert.deepEqual(stringify(_.distinct()(data)), stringify(_.sort()(data)))
  assert.deepEqual(stringify(_.distinct([])(data)), stringify([[]]))
  assert.deepEqual(stringify(_.distinct({})(data)), stringify([{}]))
  assert.deepEqual(stringify(orig), stringify(data))

  V = _.distinct({age: 'age'})(data)
  U = [
    {age: 24},
    {age: 32},
    {age: 35},
    {age: 36},
    {age: 38},
    {age: 39},
    {age: 40}
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.distinct('age')(data)
  U = [24, 32, 35, 36, 38, 39, 40]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.distinct({balance: 'balance'})(data)
  U = [
    {balance: 1196.56},
    {balance: 1272.02},
    {balance: 1706.27},
    {balance: 2013.82},
    {balance: 2166.09},
    {balance: 2246.42},
    {balance: 2941.73},
    {balance: 3231.2},
    {balance: 3453.76},
    {balance: 3546.79}
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.distinct({isActive: 'isActive'})(data)
  U = [
    {isActive: false},
    {isActive: true}
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.distinct({eyeColor: 'eyeColor'})(data)
  U = [
    {eyeColor: 'blue'},
    {eyeColor: 'brown'},
    {eyeColor: 'green'}
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.distinct({since: 'since'})(data)
  U = [
    {since: '2010-09-25'},
    {since: '2011-03-15'},
    {since: '2014-12-01'}
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.distinct({eyeColor: 'eyeColor', isActive: 'isActive'})(data)
  U = [
    {eyeColor: 'blue', isActive: true},
    {eyeColor: 'brown', isActive: false},
    {eyeColor: 'brown', isActive: true},
    {eyeColor: 'green', isActive: false},
    {eyeColor: 'green', isActive: true}
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  assert.deepEqual(stringify(_.distinct({tag: 'tag'})([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])), stringify([
    {tag: 'bike'},
    {tag: 'car'},
    {tag: 'plane'},
    {tag: 'train'}
  ]))

  V = _.distinct()([1, 5, 6, 8, 4, 2, 4, 1, 4, 2, 3, 7, 8])
  U = [1, 2, 3, 4, 5, 6, 7, 8]

  assert.deepEqual(stringify(V), stringify(U))

  assert.end()
})

test('#where', function (assert) {
  var V
  var orig = _.copy(data)

  assert.deepEqual(stringify(_.where(null)(data)), stringify([]))
  assert.deepEqual(stringify(_.where()(data)), stringify([]))
  assert.deepEqual(stringify(_.where({})(data)), stringify([]))
  assert.deepEqual(stringify(_.where([])(data)), stringify(orig))
  assert.deepEqual(stringify(orig), stringify(data))

  V = _.where({
    path: 'age',
    operator: '===',
    value: 24
  })(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 1)
  V.forEach(function (v) {
    assert.deepEqual(v.age, 24)
  })

  V = _.where([{
    path: 'eyeColor',
    operator: '===',
    value: 'brown'
  }])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 6)
  V.forEach(function (v) {
    assert.deepEqual(v.eyeColor, 'brown')
  })

  V = _.where({
    path: 'age',
    operator: '!==',
    value: 24
  })(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 9)
  V.forEach(function (v) {
    assert.notDeepEqual(v.age, 24)
  })

  V = _.where([{
    path: 'eyeColor',
    operator: '!==',
    value: 'brown'
  }])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 4)
  V.forEach(function (v) {
    assert.notDeepEqual(v.eyeColor, 'brown')
  })

  V = _.where({
    path: 'age',
    operator: '>',
    value: 30
  })(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 9)
  V.forEach(function (v) {
    assert.deepEqual(v.age > 30, true)
  })

  V = _.where([{
    path: 'eyeColor',
    operator: '<=',
    value: 'brown'
  }])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 7)
  V.forEach(function (v) {
    assert.notDeepEqual(v.eyeColor, 'green')
  })

  V = _.where([
    {
      path: 'age',
      operator: '>',
      value: 30
    }, {
      path: 'eyeColor',
      operator: '<=',
      value: 'brown'
    }
  ])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 6)
  V.forEach(function (v) {
    assert.deepEqual(v.age > 30, true)
    assert.notDeepEqual(v.eyeColor, 'green')
  })

  V = _.where([{
    path: 'eyeColor',
    operator: '~',
    value: 'bro'
  }])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 6)
  V.forEach(function (v) {
    assert.deepEqual(v.eyeColor, 'brown')
  })

  V = _.where([{
    path: 'eyeColor',
    operator: '!~',
    value: 'bro'
  }])(data)
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(V.length, 4)
  V.forEach(function (v) {
    assert.notEqual(v.eyeColor, 'brown')
  })

  assert.deepEqual(stringify(_.where([
    {
      path: 'id',
      operator: '>',
      value: 2
    }, {
      path: 'tag',
      operator: '===',
      value: 'car'
    }
  ])([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])), stringify([
    {id: 7, tag: 'car'}
  ]))

  assert.deepEqual(stringify(_.where([
    {
      path: 'tag',
      operator: '~',
      value: 'ar'
    }
  ])([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])), stringify([
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'}
  ]))

  assert.end()
})

test('#merge', function (assert) {
  var x, y, X, Y

  x = 5
  y = 'merge test'

  assert.deepEqual(_.merge(x)(y), x)

  x = {test: 'merge'}
  y = 'merge test'

  assert.deepEqual(stringify(_.merge(x)(y)), stringify(x))

  x = {test: 'merge', fruit: 'apple'}
  y = {help: 'please', test: 'merge2'}

  assert.deepEqual(stringify(_.merge(x)(y)), stringify({
    test: 'merge2', fruit: 'apple', help: 'please'
  }))

  x = {test: 'merge', fruit: 'apple'}
  y = {help: 'please', test: 'merge2'}

  assert.deepEqual(stringify(_.merge(x)(y)), stringify({
    test: 'merge2', fruit: 'apple', help: 'please'
  }))

  X = [
    {test: 'merge', fruit: 'apple'},
    {test: 'array', fruit: 'banana'},
    {test: 'first', fruit: 'orange'}
  ]
  y = {help: 'please', test: 'merge2'}

  assert.deepEqual(stringify(_.merge(X)(y)), stringify([
    {test: 'merge2', fruit: 'apple', help: 'please'},
    {test: 'merge2', fruit: 'banana', help: 'please'},
    {test: 'merge2', fruit: 'orange', help: 'please'}
  ]))

  assert.deepEqual(stringify(_.merge(X)(y)), stringify([
    {test: 'merge2', fruit: 'apple', help: 'please'},
    {test: 'merge2', fruit: 'banana', help: 'please'},
    {test: 'merge2', fruit: 'orange', help: 'please'}
  ]))

  x = {help: 'please', test: 'merge2'}
  Y = [
    {test: 'merge', fruit: 'apple'},
    {test: 'array', fruit: 'banana'},
    {test: 'first', fruit: 'orange'}
  ]

  assert.deepEqual(stringify(_.merge(x)(Y)), stringify([
    {help: 'please', test: 'merge', fruit: 'apple'},
    {help: 'please', test: 'array', fruit: 'banana'},
    {help: 'please', test: 'first', fruit: 'orange'}
  ]))

  assert.deepEqual(stringify(_.merge(x)(Y)), stringify([
    {help: 'please', test: 'merge', fruit: 'apple'},
    {help: 'please', test: 'array', fruit: 'banana'},
    {help: 'please', test: 'first', fruit: 'orange'}
  ]))

  X = [
    {test: 'merge', fruit: 'apple'},
    {test: 'array', fruit: 'banana'},
    {test: 'first', fruit: 'orange'}
  ]

  Y = [
    {test: 'mergeY', fruitY: 'apple'},
    {test: 'arrayY', fruitY: 'banana'},
    {test: 'firstY', fruitY: 'orange'}
  ]

  assert.deepEqual(stringify(_.merge(X)(Y)), stringify([
    [
      {test: 'mergeY', fruit: 'apple', fruitY: 'apple'},
      {test: 'arrayY', fruit: 'apple', fruitY: 'banana'},
      {test: 'firstY', fruit: 'apple', fruitY: 'orange'}
    ], [
      {test: 'mergeY', fruit: 'banana', fruitY: 'apple'},
      {test: 'arrayY', fruit: 'banana', fruitY: 'banana'},
      {test: 'firstY', fruit: 'banana', fruitY: 'orange'}
    ], [
      {test: 'mergeY', fruit: 'orange', fruitY: 'apple'},
      {test: 'arrayY', fruit: 'orange', fruitY: 'banana'},
      {test: 'firstY', fruit: 'orange', fruitY: 'orange'}
    ]
  ]))

  assert.end()
})

test('#group', function (assert) {
  var orig = _.copy(data)
  var dataN = _.sort()(data)
  dataN.forEach((n, i) => {
    dataN[i].N = 1
  })

  var G = {eyeColor: 'eyeColor'}
  var R = [{eyeColor: 'blue'}, {eyeColor: 'brown'}, {eyeColor: 'green'}]
  assert.deepEqual(stringify(_.group(G, null)(data)), stringify(R))
  assert.deepEqual(stringify(_.group(G)(data)), stringify(R))
  assert.deepEqual(stringify(_.group(G, {})(data)), stringify(R))

  var A = {N: 'sum("1")'}
  R = [{N: 10}]
  assert.deepEqual(stringify(_.group(null, A)(data)), stringify(dataN))
  assert.deepEqual(stringify(_.group(undefined, A)(data)), stringify(dataN))
  assert.deepEqual(stringify(_.group({}, A)(data)), stringify(R))

  assert.deepEqual(stringify(_.group({}, {})(data)), stringify([{}]))

  assert.deepEqual(stringify(orig), stringify(data))

  var V = _.group({eyeColor: 'eyeColor'}, {N: 'sum("1")'})(data)
  var U = [
    {
      eyeColor: 'blue',
      N: 1
    }, {
      eyeColor: 'brown',
      N: 6
    }, {
      eyeColor: 'green',
      N: 3
    }
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  V = _.group({eyeColor: 'eyeColor', isActive: 'isActive'}, {N: 'sum("1")'})(data)
  U = [
    {
      eyeColor: 'blue',
      isActive: true,
      N: 1
    }, {
      eyeColor: 'brown',
      isActive: false,
      N: 4
    }, {
      eyeColor: 'brown',
      isActive: true,
      N: 2
    }, {
      eyeColor: 'green',
      isActive: false,
      N: 2
    }, {
      eyeColor: 'green',
      isActive: true,
      N: 1
    }
  ]
  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(stringify(V), stringify(U))

  assert.deepEqual(stringify(_.group({}, {N: 'sum("1")', Total: 'sum("$.id")'})([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])), stringify([
    {N: 8, Total: 36}
  ]))
  assert.deepEqual(stringify(_.group({tag: 'tag'}, {N: 'sum("1")', Total: 'sum("$.id")'})([
    {id: 2, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'train'},
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'car'},
    {id: 7, tag: 'bike'}
  ])), stringify([
    {tag: 'bike', N: 2, Total: 8},
    {tag: 'car', N: 2, Total: 8},
    {tag: 'plane', N: 2, Total: 10},
    {tag: 'train', N: 2, Total: 10}
  ]))

  assert.end()
})

test('#pager', function (assert) {
  var orig = _.copy(data)
  assert.deepEqual(_.pager(0)([]), 1)
  assert.deepEqual(_.pager(1)([]), 1)
  assert.deepEqual(_.pager(5)([]), 1)

  assert.deepEqual(_.pager(1)(data), 10)
  assert.deepEqual(_.pager(10)(data), 1)
  assert.deepEqual(_.pager(2)(data), 5)
  assert.deepEqual(_.pager(5)(data), 2)

  assert.deepEqual(_.pager(3)(data), 4)
  assert.deepEqual(_.pager(4)(data), 3)
  assert.deepEqual(_.pager(6)(data), 2)
  assert.deepEqual(_.pager(9)(data), 2)

  assert.deepEqual(stringify(_.pager(0)(1)([])), stringify([]))
  assert.deepEqual(stringify(_.pager(1)(1)([])), stringify([]))
  assert.deepEqual(stringify(_.pager(5)(3)([])), stringify([]))

  assert.deepEqual(_.pager(0)(5)(data).length, 10)
  assert.deepEqual(_.pager(0)(1)(data).length, 10)
  assert.deepEqual(_.pager(0)(0)(data).length, 10)
  assert.deepEqual(_.pager(0)(6)(data).length, 10)

  assert.deepEqual(stringify(orig), stringify(data))

  assert.deepEqual(_.pager(2)(5)(data).length, 2)
  assert.deepEqual(_.pager(2)(1)(data).length, 2)
  assert.deepEqual(_.pager(2)(0)(data).length, 0)
  assert.deepEqual(_.pager(2)(6)(data).length, 0)

  assert.deepEqual(stringify(orig), stringify(data))

  assert.deepEqual(_.pager(3)(1)(data).length, 3)
  assert.deepEqual(_.pager(3)(4)(data).length, 1)
  assert.deepEqual(_.pager(9)(1)(data).length, 9)
  assert.deepEqual(_.pager(9)(2)(data).length, 1)

  assert.deepEqual(stringify(orig), stringify(data))

  var V = [
    {id: 2, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'train'},
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'car'},
    {id: 7, tag: 'bike'}
  ]

  assert.deepEqual(stringify(_.pager(3)(1)(V)), stringify([
    {id: 2, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'train'}
  ]))

  assert.deepEqual(stringify(_.pager(3)(2)(V)), stringify([
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'train'},
    {id: 1, tag: 'bike'}
  ]))

  assert.deepEqual(stringify(_.pager(3)(3)(V)), stringify([
    {id: 7, tag: 'car'},
    {id: 7, tag: 'bike'}
  ]))

  assert.end()
})

test('#evaluate', function (assert) {
  var orig = _.copy(data)

  assert.deepEqual(_.evaluate('1')(), 1)
  assert.deepEqual(_.evaluate('true')(), true)
  assert.deepEqual(_.evaluate('3 * 7')(), 21)
  assert.deepEqual(_.evaluate('3 * $')(12), 36)
  assert.deepEqual(_.evaluate('"Me"')(), 'Me')

  assert.deepEqual(_.evaluate(null)(data), null)
  assert.deepEqual(_.evaluate()(data), undefined)
  assert.deepEqual(stringify(_.evaluate([])(data)), stringify([]))
  assert.deepEqual(stringify(_.evaluate({})(data)), stringify({}))
  assert.deepEqual(_.evaluate(7)(data), 7)
  assert.deepEqual(stringify(orig), stringify(data))

  assert.deepEqual(stringify(orig), stringify(data))
  assert.deepEqual(_.evaluate('sum("1")')(data), 10)
  var sumAges = _.evaluate('sum("$.age")')(data)
  assert.deepEqual(sumAges > 300 && sumAges < 400, true)
  var avgBalance = _.evaluate('sum("$.balance") / sum("1")')(data)
  assert.deepEqual(avgBalance > 2000 && avgBalance < 3000, true)
  assert.deepEqual(_.evaluate('max("$.age")')(data), 40)
  assert.deepEqual(_.evaluate('min("$.age")')(data), 24)

  assert.end()
})

test('#parse', function (assert) {
  var X = [1, 'dog', 3.14, true, null, undefined]
  X.forEach(function (x) {
    assert.deepEqual(x, _.parse()(x))
  })

  X = ['integer', 'number']
  X.forEach(function (x) {
    assert.deepEqual(null, _.parse(x)())
    assert.deepEqual(null, _.parse(x)(null))
  })

  X = ['date', 'string']
  X.forEach(function (x) {
    assert.deepEqual('', _.parse(x)())
    assert.deepEqual('', _.parse(x)(null))
  })

  var True = [1, '1', 'true', -0.01, [], {}, true]

  True.forEach(function (x) {
    assert.deepEqual(_.parse('boolean')(x), 1)
  })

  var False = [0, '0', 'false', false, '', undefined, null]

  False.forEach(function (x) {
    assert.deepEqual(_.parse('boolean')(x), 0)
  })

  assert.deepEqual(_.parse('integer')('-21.c'), -21)
  assert.deepEqual(_.parse('integer')('-21.3c'), -21)

  assert.deepEqual(_.parse('number')('-21.2c'), -21.2)
  assert.deepEqual(_.parse('number:2')('-21,386c'), -21.39)
  assert.deepEqual(_.parse('number:3')(3.4567), 3.457)

  assert.deepEqual(_.parse('date')('2018-01-01zzzzzz'), '2018-01-01')
  assert.deepEqual(_.parse('date')('2018-01'), '')

  assert.deepEqual(_.parse('string')(3.14), '3.14')
  assert.deepEqual(_.parse('string')(false), 'false')
  assert.deepEqual(_.parse('string')(true), 'true')
  assert.deepEqual(_.parse('string:6')('Albert Eistein'), 'Albert')
  assert.deepEqual(_.parse('string:lower')('Albert Eistein'), 'albert eistein')
  assert.deepEqual(_.parse('string:upper')('Albert Eistein'), 'ALBERT EISTEIN')
  assert.deepEqual(_.parse('string:6:lower')('Albert Eistein'), 'albert')
  assert.deepEqual(_.parse('string:6:upper')('Albert Eistein'), 'ALBERT')

  assert.end()
})

test('#match', function (assert) {
  assert.deepEqual(_.match('integer')(undefined), false)
  assert.deepEqual(_.match('integer')('false'), false)
  assert.deepEqual(_.match('integer')('true'), false)
  assert.deepEqual(_.match('integer')('1'), true)
  assert.deepEqual(_.match('integer')('0'), true)
  assert.deepEqual(_.match('integer')(1), true)
  assert.deepEqual(_.match('integer')(0), true)
  assert.deepEqual(_.match('integer')('-71'), true)
  assert.deepEqual(_.match('integer')('+0'), true)
  assert.deepEqual(_.match('integer')('-91.4'), false)
  assert.deepEqual(_.match('integer')(143.56), false)
  assert.deepEqual(_.match('integer')(143), true)
  assert.deepEqual(_.match('integer')(-143.56), false)
  assert.deepEqual(_.match('integer')(-143), true)
  assert.deepEqual(_.match('integer')(+0), true)
  assert.deepEqual(_.match('integer')(true), false)
  assert.deepEqual(_.match('integer')(false), false)
  assert.deepEqual(_.match('integer')(null), false)
  assert.deepEqual(_.match('integer')({}), false)
  assert.deepEqual(_.match('integer')([]), false)
  assert.deepEqual(_.match('integer')(function () {}), false)
  assert.deepEqual(_.match('integer')(() => {}), false)

  assert.deepEqual(_.match('number')(undefined), false)
  assert.deepEqual(_.match('number')('false'), false)
  assert.deepEqual(_.match('number')('true'), false)
  assert.deepEqual(_.match('number')('1'), true)
  assert.deepEqual(_.match('number')('0'), true)
  assert.deepEqual(_.match('number')(1), true)
  assert.deepEqual(_.match('number')(0), true)
  assert.deepEqual(_.match('number')('-71'), true)
  assert.deepEqual(_.match('number')('+0'), true)
  assert.deepEqual(_.match('number')('-91.4'), true)
  assert.deepEqual(_.match('number')(143.56), true)
  assert.deepEqual(_.match('number')(143), true)
  assert.deepEqual(_.match('number')(-143.56), true)
  assert.deepEqual(_.match('number')(-143), true)
  assert.deepEqual(_.match('number')(+0), true)
  assert.deepEqual(_.match('number')(true), false)
  assert.deepEqual(_.match('number')(false), false)
  assert.deepEqual(_.match('number')(null), false)
  assert.deepEqual(_.match('number')({}), false)
  assert.deepEqual(_.match('number')([]), false)
  assert.deepEqual(_.match('number')(function () {}), false)
  assert.deepEqual(_.match('number')(() => {}), false)

  assert.deepEqual(_.match('date')(undefined), false)
  assert.deepEqual(_.match('date')('false'), false)
  assert.deepEqual(_.match('date')('true'), false)
  assert.deepEqual(_.match('date')('1'), false)
  assert.deepEqual(_.match('date')('0'), false)
  assert.deepEqual(_.match('date')(1), false)
  assert.deepEqual(_.match('date')(0), false)
  assert.deepEqual(_.match('date')(true), false)
  assert.deepEqual(_.match('date')(false), false)
  assert.deepEqual(_.match('date')(null), false)
  assert.deepEqual(_.match('date')({}), false)
  assert.deepEqual(_.match('date')([]), false)
  assert.deepEqual(_.match('date')('2018-04-30XXX'), true)
  assert.deepEqual(_.match('date')('x2018-04-30XXX'), false)
  assert.deepEqual(_.match('date')(function () {}), false)
  assert.deepEqual(_.match('date')(() => {}), false)

  assert.deepEqual(_.match('text')(undefined), false)
  assert.deepEqual(_.match('text')('false'), false)
  assert.deepEqual(_.match('text')('true'), false)
  assert.deepEqual(_.match('text')('1'), false)
  assert.deepEqual(_.match('text')('0'), false)
  assert.deepEqual(_.match('text')(1), false)
  assert.deepEqual(_.match('text')(0), false)
  assert.deepEqual(_.match('text')(true), false)
  assert.deepEqual(_.match('text')(false), false)
  assert.deepEqual(_.match('text')(null), false)
  assert.deepEqual(_.match('text')({}), false)
  assert.deepEqual(_.match('text')([]), false)
  assert.deepEqual(_.match('text')('2018-04-30XXX\n018-04-30XX'), true)
  assert.deepEqual(_.match('text')('x2018-04-30XXX'), false)
  assert.deepEqual(_.match('text')(function () {}), false)
  assert.deepEqual(_.match('text')(() => {}), false)
  assert.deepEqual(_.match('text')('false'), false)
  assert.deepEqual(_.match('text')('true'), false)
  assert.deepEqual(_.match('text')('1'), false)
  assert.deepEqual(_.match('text')('0'), false)

  assert.deepEqual(_.match('bool')(undefined), false)
  assert.deepEqual(_.match('bool')('false'), false)
  assert.deepEqual(_.match('bool')('true'), false)
  assert.deepEqual(_.match('bool')('1'), true)
  assert.deepEqual(_.match('bool')('0'), true)
  assert.deepEqual(_.match('bool')(1), true)
  assert.deepEqual(_.match('bool')(0), true)
  assert.deepEqual(_.match('bool')('100011010101'), true)
  assert.deepEqual(_.match('bool')('1001011101x'), false)
  assert.deepEqual(_.match('bool')(10110), true)
  assert.deepEqual(_.match('bool')(15101), false)
  assert.deepEqual(_.match('bool')(true), false)
  assert.deepEqual(_.match('bool')(false), false)
  assert.deepEqual(_.match('bool')(null), false)
  assert.deepEqual(_.match('bool')({}), false)
  assert.deepEqual(_.match('bool')([]), false)

  assert.deepEqual(_.match('hex')(undefined), false)
  assert.deepEqual(_.match('hex')('false'), false)
  assert.deepEqual(_.match('hex')('true'), false)
  assert.deepEqual(_.match('hex')('1'), true)
  assert.deepEqual(_.match('hex')('0'), true)
  assert.deepEqual(_.match('hex')(1), true)
  assert.deepEqual(_.match('hex')(0), true)
  assert.deepEqual(_.match('hex')('ab4371FE'), true)
  assert.deepEqual(_.match('hex')('34t56Ad'), false)
  assert.deepEqual(_.match('hex')(10110), true)
  assert.deepEqual(_.match('hex')(15101), true)
  assert.deepEqual(_.match('hex')(true), false)
  assert.deepEqual(_.match('hex')(false), false)
  assert.deepEqual(_.match('hex')(null), false)
  assert.deepEqual(_.match('hex')({}), false)
  assert.deepEqual(_.match('hex')([]), false)

  assert.deepEqual(_.match(/^abc/)('abc dfg'), true)
  assert.deepEqual(_.match(/abc/)('abc dfg'), true)
  assert.deepEqual(_.match(/abc$/)('abc dfg'), false)

  assert.end()
})

test('#randomId', function (assert) {
  var r

  for (var i = 0; i < 100; i++) {
    r = _.randomId()(i)
    assert.deepEqual(i || 20, r.length)
    assert.deepEqual(_.match(/^[a-z\d]+$/)(r), true)
  }

  r = _.randomId('int')(500)
  assert.deepEqual(_.match(/^[\d]{500}$/)(r), true)
  assert.notEqual(r.indexOf('0'), -1)
  assert.notEqual(r.indexOf('9'), -1)

  r = _.randomId('char')(5000)
  assert.deepEqual(_.match(/^[a-z]{5000}$/)(r), true)
  assert.notEqual(r.indexOf('a'), -1)
  assert.notEqual(r.indexOf('z'), -1)

  r = _.randomId('hex')(500)
  assert.deepEqual(_.match(/^[a-f\d]{500}$/)(r), true)
  assert.notEqual(r.indexOf('a'), -1)
  assert.notEqual(r.indexOf('f'), -1)
  assert.notEqual(r.indexOf('0'), -1)
  assert.notEqual(r.indexOf('9'), -1)

  r = _.randomId('bool')(50)
  assert.deepEqual(_.match(/^[0-1]{50}$/)(r), true)
  assert.notEqual(r.indexOf('0'), -1)
  assert.notEqual(r.indexOf('1'), -1)

  r = _.randomId()(10000)
  assert.deepEqual(_.match(/^[a-z\d]{10000}$/)(r), true)
  assert.notEqual(r.indexOf('a'), -1)
  assert.notEqual(r.indexOf('z'), -1)
  assert.notEqual(r.indexOf('0'), -1)
  assert.notEqual(r.indexOf('9'), -1)

  assert.end()
})

test('#replaceAll', function (assert) {
  assert.deepEqual(_.replaceAll(1, 0)(1010111000), '0000000000')
  assert.deepEqual(_.replaceAll(' ')('Hello! My name is Mario!'), 'Hello!MynameisMario!')
  assert.deepEqual(_.replaceAll('abc')('Hello! My name is Mario!'), 'Hello! My name is Mario!')
  assert.deepEqual(_.replaceAll('o!', 'o?!')('Hello! My name is Mario!'), 'Hello?! My name is Mario?!')
  assert.deepEqual(_.replaceAll(null, '-')('Hello'), 'H-e-l-l-o')

  assert.end()
})
