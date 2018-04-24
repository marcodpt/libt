'use strict'
var _ = {}

/* mix */
_.debug = function () {
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] === 'object' && arguments[i] != null) {
      console.log(JSON.stringify(arguments[i], undefined, 2))
    } else {
      console.log(arguments[i])
    }
  }
}

_.compose = function () {
  var args = arguments
  return (X) => {
    for (var i = args.length - 1; i >= 0; i--) {
      X = args[i](X)
    }
    return X
  }
}

_.evaluate = function (expression) {
  const step = (expression, $) => {
    function sum (e) {
      var sum
      $.forEach(function ($) {
        var exp = step(e, $)
        if (exp != null) {
          sum = sum == null ? exp : sum + exp
        }
      })
      return sum
    }

    function minmax (type, e) {
      var min
      var max
      $.forEach(function ($) {
        var exp = step(e, $)
        if (exp != null) {
          min = min == null ? exp : (exp < min ? exp : min)
          max = max == null ? exp : (exp > max ? exp : max)
        }
      })
      return type === 'min' ? min : max
    }

    function min (e) {
      return minmax('min', e)
    }

    function max (e) {
      return minmax('max', e)
    }

    var result
    try {
      result = eval(expression)
    } catch (err) {}

    return result
  }

  return V => {
    return step(expression, V)
  }
}

_.parse = function (format) {
  return value => {
    if (value == null || !(typeof format === 'string')) {
      if (!(typeof format === 'string')) {
        return value
      } else if (format.split(':')[0] === 'boolean') {
        return 0
      } else if (format.split(':')[0] === 'date' || format.split(':')[0] === 'string') {
        return ''
      } else {
        return null
      }
    }

    var F = format.split(':')
    var type = F[0]
    var p1 = parseInt(F[1] || 0)

    var x // helper variables

    if (type === 'boolean') {
      if (value && value !== 'false' && value !== '0') {
        return 1
      } else {
        return 0
      }
    } else if (type === 'integer') {
      x = parseInt(value)
      return isNaN(x) ? undefined : x
    } else if (type === 'number') {
      if (typeof value === 'string') {
        value = value.replace(',', '.')
      }
      x = parseFloat(value)
      return isNaN(x) ? undefined : (p1 ? parseFloat(x.toFixed(p1)) : x)
    } else if (type === 'string' || type === 'json') {
      x = String(value)
      if (p1) {
        x = x.substr(0, p1)
      }
      if (F.indexOf('upper') !== -1) {
        x = x.toUpperCase()
      }
      if (F.indexOf('lower') !== -1) {
        x = x.toLowerCase()
      }
      return x
    } else if (type === 'date') {
      if (value instanceof Date) {
        return value.toISOString().substr(0, 10)
      } else if (_.match('date')(value)) {
        return String(value).substr(0, 10)
      } else {
        return ''
      }
    }
  }
}

/* string and regex */
_.match = function (regex) {
  return (X) => {
    if (regex === 'integer') {
      regex = /^[+-]?\d+$/
    } else if (regex === 'number') {
      regex = /^[+-]?((\d+(\.\d*)?)|(\.\d+))$/
    } else if (regex === 'date') {
      regex = /^\d{4}-\d{2}-\d{2}/
    } else if (regex === 'text') {
      regex = /\n/
    } else if (regex === 'bool') {
      regex = /^[+-]?[01]+$/
    } else if (regex === 'hex') {
      regex = /^[+-]?[A-Fa-f\d]+$/
    }

    return !!String(X).match(regex)
  }
}

_.randomId = function (type) {
  var set
  if (type === 'int') {
    set = '0123456789'
  } else if (type === 'char') {
    set = 'abcdefghijklmnopqrstuvwxyz'
  } else if (type === 'hex') {
    set = 'abcdef0123456789'
  } else if (type === 'bool') {
    set = '01'
  } else {
    set = 'abcdefghijklmnopqrstuvwxyz0123456789'
  }

  return length => {
    length = length || 20
    var text = ''

    for (var i = 0; i < length; i++) {
      text += set.charAt(Math.floor(Math.random() * set.length))
    }

    return text
  }
}

_.replaceAll = function (search, replacement) {
  search = search == null ? '' : String(search)
  replacement = replacement == null ? '' : String(replacement)
  return str => {
    return String(str).split(search).join(replacement)
  }
}

/* array and object */
_.iterate = function (callback) {
  const step = (X) => {
    if (X != null && typeof X === 'object') {
      if (X.forEach) {
        X.forEach((x, i) => {
          if (typeof x !== 'object') {
            X[i] = callback(X[i])
          } else {
            step(X[i])
          }
        })
      } else {
        Object.keys(X).forEach(key => {
          if (typeof X[key] !== 'object') {
            X[key] = callback(X[key])
          } else {
            step(X[key])
          }
        })
      }
      return X
    } else {
      return callback(X)
    }
  }

  return X => {
    return step(_.copy(X))
  }
}

_.copy = function (X) {
  var y
  if (typeof X === 'object' && X != null) {
    if (X.forEach) {
      y = []
      X.forEach(x => {
        y.push(_.copy(x))
      })
    } else {
      y = {}
      Object.keys(X).forEach(key => {
        y[key] = _.copy(X[key])
      })
    }
  } else {
    y = X
  }

  return y
}

_.path = function (P) {
  const step = (X, Q) => {
    if (Q == null) {
      return _.copy(X)
    } else if (Q instanceof Array) {
      Q = _.copy(Q)
      Q.forEach((q, i) => {
        Q[i] = step(X, Q[i])
      })
      return Q
    } else if (typeof Q === 'object') {
      Q = _.copy(Q)
      Object.keys(Q).forEach(key => {
        Q[key] = step(X, Q[key])
      })
      return Q
    } else {
      try {
        String(Q).split('.').forEach(q => {
          X = X[q]
        })
      } catch (err) {
        X = undefined
      }
      return _.copy(X)
    }
  }

  return X => {
    return step(X, P)
  }
}

_.compare = function (X) {
  const step = (X, Y) => {
    var r = 0
    if (X == null) {
      return Y == null ? 0 : -1
    } else if (Y == null) {
      return 1
    } else if (typeof X === 'object') {
      if (typeof Y !== 'object') {
        return 1
      }
      if (X instanceof Array) {
        X.forEach((x, i) => {
          if (r === 0) {
            r = step(X[i], Y[i])
          }
        })
        return r
      } else {
        Object.keys(X).forEach(k => {
          if (r === 0) {
            r = step(X[k], Y[k])
          }
        })
        return r
      }
    } else {
      if (typeof Y === 'object' || Y > X) {
        return -1
      } else if (X > Y) {
        return 1
      } else {
        return 0
      }
    }
  }

  return Y => {
    return step(X, Y)
  }
}

_.sort = function (X) {
  var P = []
  if (!(X instanceof Array)) {
    X = [X]
  }
  X.forEach(x => {
    if (x && x[0] === '-') {
      P.push({
        path: _.path(x.substr(1) || null),
        reverse: true
      })
    } else {
      P.push({
        path: _.path(x || null),
        reverse: false
      })
    }
  })

  return V => {
    var U = _.copy(V)
    if (typeof U.sort !== 'function') {
      return U
    }
    U.sort((a, b) => {
      var A = []
      var B = []
      P.forEach((p) => {
        if (p.reverse) {
          A.push(p.path(b))
          B.push(p.path(a))
        } else {
          A.push(p.path(a))
          B.push(p.path(b))
        }
      })

      return _.compare(A)(B)
    })
    return U
  }
}

_.distinct = function (X) {
  var S = []
  _.iterate(x => {
    S.push(x)
  })(X)

  return V => {
    var path = _.path(X)
    var R = _.sort(S)(V)
    if (typeof R.reduce !== 'function') {
      return R
    }
    return R.reduce(function (U, v) {
      v = path(v)
      if (!U.length || _.compare(U[U.length - 1])(v)) {
        U.push(v)
      }
      return U
    }, [])
  }
}

_.where = function (X) {
  if (!(X instanceof Array)) {
    X = [X]
  }
  return V => {
    return V.filter(w => {
      var result = true
      X.forEach(x => {
        if (!result || !x || !x.operator) {
          result = false
          return
        }
        var v = _.path(x.path)(w)
        if (x.operator === '===') {
          result = v === x.value
        } else if (x.operator === '!==') {
          result = v !== x.value
        } else if (x.operator === '>') {
          result = v > x.value
        } else if (x.operator === '>=') {
          result = v >= x.value
        } else if (x.operator === '<') {
          result = v < x.value
        } else if (x.operator === '<=') {
          result = v <= x.value
        } else if (x.operator === '~') {
          if (x.value == null) {
            result = false
          } else {
            result = String(v).toLowerCase().indexOf(String(x.value).toLowerCase()) !== -1
          }
        } else {
          result = false
        }
      })

      return result
    })
  }
}

_.merge = function (X) {
  const step = (A, B) => {
    var R
    if (A == null || typeof A !== 'object' || B == null || typeof B !== 'object') {
      return A
    } else if (A instanceof Array) {
      R = []
      A.forEach(a => {
        R.push(step(a, B))
      })
      return R
    } else if (B instanceof Array) {
      R = []
      B.forEach(b => {
        R.push(step(A, b))
      })
      return R
    } else {
      R = {}
      Object.keys(A).forEach(k => {
        R[k] = A[k]
      })
      Object.keys(B).forEach(k => {
        R[k] = B[k]
      })
      return R
    }
  }

  return Y => {
    return step(_.copy(X), _.copy(Y))
  }
}

_.group = function (X, Y) {
  return V => {
    var U = _.distinct(X)(V)

    U.forEach((u, i) => {
      U[i] = _.compose(_.merge(U[i]), _.iterate(y => {
        return _.evaluate(y)(V.filter(v => _.compare(u)(v) === 0))
      }))(Y)
    })

    return U
  }
}

_.pager = function (size) {
  size = parseInt(size) || 0
  return X => {
    if (X instanceof Array) {
      var len = X.length || 1
      return size ? Math.ceil(len / size) : 1
    } else {
      X = parseInt(X) || 0
      return V => {
        if (V instanceof Array) {
          return size ? V.slice((X - 1) * size, X * size) : V
        } else {
          return V
        }
      }
    }
  }
}

module.exports = _
