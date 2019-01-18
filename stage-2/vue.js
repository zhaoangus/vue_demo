function defineReactive (obj, key, val) {
  var dep = new Dep()
  Object.defineProperty(obj, key, {
    get: function () {
      if (Dep.target) {
        Dep.target.addDep(dep)
      }
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()
    }
  })
}

function observe (obj) {
  for (var key in obj) {
    defineReactive(obj, key, obj[key])
  }
}

var uid$1 = 0

function Dep () {
  // 用来存放Watcher对象的数组
  this.subs = []
  this.id = uid$1++
}

Dep.target = null

// 在subs中添加一个Watcher对象
Dep.prototype.addSub = function (sub) {
  this.subs.push(sub)
}

// 通知所有Watcher对象更新视图
Dep.prototype.notify = function () {
  this.subs.forEach((sub) => {
    sub.update()
  })
}

function Watcher (vm, exOrFn, cb) {
  this.vm = vm
  this.getter = exOrFn
  this.cb = cb
  this.depIds = []
  this.value = this.get()
}

Watcher.prototype.get = function () {
  // watcher对象赋值给Dep.target
  Dep.target = this 
  var value = this.getter.call(this.vm)
  Dep.target = null
  return value
}

Watcher.prototype.update = function () {
  var value = this.get()
  if (this.value !== value) {
    var oldValue = this.value
    this.value = value
    this.cb.call(this.vm, value, oldValue)
  }
}

Watcher.prototype.addDep = function (dep) {
  var id = dep.id
  if (this.depIds.indexOf(id) === -1) {
    this.depIds.push(id)
    dep.addSub(this)
  }
}

function observe (obj) {
  for (var key in obj) {
    defineReactive(obj, key, obj[key])
  }
}

function proxy (vm, key) {
  Object.defineProperty(vm, key, {
    configurable: true,
    enumerable: true,
    get: function () {
      return vm.$data[key]
    },
    set: function (val) {
      vm.$data[key] = val
    }
  })
}

function initData (vm) {
  var data = vm.$data = vm.$options.data
  var keys = Object.keys(data)
  var i = keys.length

  while (i--) {
    proxy(vm, keys[i])
  }

  observe(data)
}

function Vue(options) {
  var vm = this
  vm.$options = options

  initData(vm)

}

var vm = new Vue({
  el: '#app',
  data: {
    message: 'Hello world!',
    isShow: true
  },
  render () {
    return createElement(
      'div',
      {
        attrs: {
          'class': 'wrapper'
        }
      },
      [
        this.isShow
        ? createElement(
          'p',
          {
            attrs: {
              'class': 'inner'
            }
          },
          this.message
        )
        : createElement(
          'h1',
          {
            attrs: {
              'class': 'inner'
            }
          },
          'Hello world'
        )
      ]
    )
  }
})