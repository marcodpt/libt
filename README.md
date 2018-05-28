# libT
### Javascript library for object manipulation

```
npm install --save libt
```

### copy
```javascript
  var T = require('libt')

  var obj1 = {
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

  var obj2 = T.copy(obj1)
  obj2.info.sons[0].age = 4

  log(obj2.info.sons[0].age) //4
  log(obj1.info.sons[0].age) //3
```

### compose
```javascript
  var T = require('libt')

  var divide2 = x => x / 2
  var multiply3 = x => x * 3
  var add5 = x => x + 5

  log(T.compose(divide2, multiply3, add5)(7)) //18
  log(T.compose(multiply3, add5, divide2)(7)) //25.5
  log(T.compose(add5, divide2, multiply3)(7)) //15.5
  log(T.compose()(7)) //7
```

### path
```javascript
  var T = require('libt')

  var result = T.path({
    x: 'name',
    y: 'age',
    z: {
      x: 'fruits.2',
      y: 'info.sons.0.age'
    }
  })({
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
  })

  var result = {
    x: 'John',
    y: 35,
    z: {
      x: 'manga',
      y: 3
    }
  }
```

### iterate 
```javascript
  var T = require('libt')

  var result = []

  T.iterate(x => {
    result.push(x)
  })({
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
  })

  var result = [
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
  ]
```

### compare
```javascript
  var T = require('libt')

  var obj1 = {
    x: 'banana',
    y: 5,
    z: {
      a: 7,
      b: [1, 4, 5, 7],
      z: 12
    }
  }

  var obj2 = T.copy(obj1)

  log(T.compare(obj1)(obj2)) //0

  obj2.z.b[0] = 0
  log(T.compare(obj1)(obj2)) //1

  obj2.z.b[0] = 2
  log(T.compare(obj1)(obj2)) //-1
```

### sort
```javascript
  var T = require('libt')

  var V = [2, 8, 1, 7, 19, 32, 4, 6]

  log(T.sort()(V)) //[1, 2, 4, 6, 7, 8, 19, 32]
  log(T.sort('-')(V)) //[32, 19, 8, 7, 6, 4, 2, 1]

  var result = T.sort(['tag', '-id'])([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])
  var result = [
    {id: 7, tag: 'bike'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'car'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'train'},
    {id: 2, tag: 'train'}
  ]
```

### distinct
```javascript
  var T = require('libt')

  var result = T.distinct({tag: 'tag'})([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])
  var result = [
    {tag: 'bike'},
    {tag: 'car'},
    {tag: 'plane'},
    {tag: 'train'}
  ]

  log(T.distinct()([1, 5, 6, 8, 4, 2, 4, 1, 4, 2, 3, 7, 8])) //[1, 2, 3, 4, 5, 6, 7, 8]
```

### where
```javascript
  var T = require('libt')

  var result = T.where([
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
  ])
  var result = [
    {id: 7, tag: 'car'}
  ]

  var result = T.where([
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
  ])
  var result = [
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'}
  ]
```

### merge
```javascript
  var T = require('libt')

  var result = T.merge({test: 'merge', fruit: 'apple'})({help: 'please', test: 'merge2'})
  var result = {
    test: 'merge2',
    fruit: 'apple',
    help: 'please'
  }

  var result = T.merge([
    {test: 'merge', fruit: 'apple'},
    {test: 'array', fruit: 'banana'},
    {test: 'first', fruit: 'orange'}
  ])({help: 'please', test: 'merge2'}), 
  var result = [
    {test: 'merge2', fruit: 'apple', help: 'please'},
    {test: 'merge2', fruit: 'banana', help: 'please'},
    {test: 'merge2', fruit: 'orange', help: 'please'}
  ]
```

### group
```javascript
  var T = require('libt')

  var result = T.group({}, {N: 'sum("1")', Total: 'sum("$.id")'})([
    {id: 2, tag: 'plane'},
    {id: 8, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 7, tag: 'car'},
    {id: 2, tag: 'train'},
    {id: 8, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'bike'}
  ])
  var result = [
    {N: 8, Total: 36}
  ]

  var result = T.group({tag: 'tag'}, {N: 'sum("1")', Total: 'sum("$.id")'})([
    {id: 2, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'train'},
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'train'},
    {id: 1, tag: 'bike'},
    {id: 7, tag: 'car'},
    {id: 7, tag: 'bike'}
  ])
  var result = [
    {tag: 'bike', N: 2, Total: 8},
    {tag: 'car', N: 2, Total: 8},
    {tag: 'plane', N: 2, Total: 10},
    {tag: 'train', N: 2, Total: 10}
  ]
```

### pager
```javascript
  var T = require('libt')

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

  var result = T.pager(3)(1)(V)
  var result = [
    {id: 2, tag: 'plane'},
    {id: 1, tag: 'car'},
    {id: 8, tag: 'train'}
  ]

  var result = T.pager(3)(2)(V)
  var result = [
    {id: 8, tag: 'plane'},
    {id: 2, tag: 'train'},
    {id: 1, tag: 'bike'}
  ]

  var result = T.pager(3)(3)(V)
  var result = [
    {id: 7, tag: 'car'},
    {id: 7, tag: 'bike'}
  ]
```

### evaluate
```javascript
  var T = require('libt')

  log(T.evaluate('1')()) //1
  log(T.evaluate('true')()) //true
  log(T.evaluate('3 * 7')()) //21
  log(T.evaluate('3 * $')(12)) //36
  log(T.evaluate('"Me"')()) //Me
```

### parse
```javascript
  var T = require('libt')

  log(T.parse('integer')('-21.c'), -21)
  log(T.parse('integer')('-21.3c'), -21)

  log(T.parse('number')('-21.2c'), -21.2)
  log(T.parse('number:2')('-21,386c'), -21.39)
  log(T.parse('number:3')(3.4567), 3.457)

  log(T.parse('date')('2018-01-01zzzzzz'), '2018-01-01')
  log(T.parse('date')('2018-01'), '')

  log(T.parse('string:6')('Albert Eistein'), 'Albert')
  log(T.parse('string:lower')('Albert Eistein'), 'albert eistein')
  log(T.parse('string:upper')('Albert Eistein'), 'ALBERT EISTEIN')
  log(T.parse('string:6:lower')('Albert Eistein'), 'albert')
  log(T.parse('string:6:upper')('Albert Eistein'), 'ALBERT')
```

### match
```javascript
  var T = require('libt')

  log(T.match('integer')(143.56)) //false
  log(T.match('integer')(143)) //true

  log(T.match('number')('-91.4')) //true
  log(T.match('number')(143.56)) //true
  log(T.match('number')('true')) //false

  log(T.match('date')('1879-03-14')) //true
  log(T.match('date')('test')) //false

  log(T.match('text')('one line\ntwo lines')) //true
  log(T.match('text')('only one line')) //false

  log(T.match('bool')('100011010101')) //true
  log(T.match('bool')('1001011101x')) //false

  log(T.match('hex')('ab4371FE')) //true
  log(T.match('hex')('34t56Ad')) //false

  log(T.match(/abc/)('abc dfg')) //true
  log(T.match(/abc$/)('abc dfg')) //false
```

### randomId
```javascript
  var T = require('libt')

  log(T.match(/^[\d]{20}$/)(T.randomId('int')(20))) //true

  log(T.match(/^[a-z]{20}$/)(T.randomId('char')(20))) //true

  log(T.match(/^[a-f\d]{20}$/)(T.randomId('hex')(20))) //true

  log(T.match(/^[0-1]{20}$/)(T.randomId('bool')(20))) //true

  log(T.match(/^[a-z\d]{20}$/)(T.randomId()(20))) //true
```

### replaceAll
```javascript
  var T = require('libt')

  log(T.replaceAll(' ')('Hello! My name is Mario!')) //Hello!MynameisMario!
```
