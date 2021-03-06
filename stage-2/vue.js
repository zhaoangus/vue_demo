;(function () {
  
  function defineReactive (obj, key, val) {
    var dep = new Dep()
    Object.defineProperty(obj, key, {
      get: function () {
        if (Dep.target) {
          // Dep.target即当前watcher对象
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
  
  // 订阅者
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
  
  // 观察者
  function Watcher (vm, exOrFn, cb) {
    this.vm = vm
    this.getter = exOrFn
    // 数据改变后执行的操作（更新视图或其他操作）
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
  
  function vnode (tag, data, children, text, elm) {
    this.tag = tag
    this.data = data
    // 是一个数组
    this.children = children
    this.text = text
    // 当前虚拟节点对应的真实dom节点
    this.elm = elm
  }
  
  function createTextVNode (val) {
    return new vnode(undefined, undefined, undefined, String(val))
  }
  
  function normalizedChildren (children) {
    if (typeof children === 'string') {
      return [createTextVNode(children)]
    }
    return children
  }
  
  function createElement (tag, data, children) {
    return new vnode(tag, data, normalizedChildren(children), undefined, undefined)
  }
  
  // 创建实际dom
  function createElm (vnode) {
    var tag = vnode.tag
    var data = vnode.data
    var children = vnode.children
  
    if (tag !== undefined) {
      vnode.elm = document.createElement(tag)
      if (data.attrs !== undefined) {
        var attrs = data.attrs
        for (var key in attrs) {
          vnode.elm.setAttribute(key, attrs[key])
        }
      }
      if (children) {
        createChildren(vnode, children)
      }
    } else {
      vnode.elm = document.createTextNode(vnode.text)
    }
  
    return vnode.elm
  }
  
  function createChildren (vnode, children) {
    for (var i = 0; i < children.length; ++i) {
      vnode.elm.appendChild(createElm(children[i]))
    }
  }
  
  function sameVnode (vnode1, vnode2) {
    return vnode1.tag === vnode2.tag
  }
  
  function emptyNodeAt (elm) {
    return new vnode(elm.tagName.toLowerCase(), {}, [], undefined, elm)
  }
  
  function patchVnode (oldVnode, vnode) {
    var elm = vnode.elm = oldVnode.elm
    var oldCh = oldVnode.children
    var ch = vnode.children
    if (!vnode.text) {
      if (oldCh && ch) {
        updateChildren(oldCh, ch)
      }
    } else if (oldVnode.text !== vnode.text) {
      elm.textContent = vnode.text
    }
  }
  
  function updateChildren (oldCh, newCh) {
    if (sameVnode(oldCh[0], newCh[0])) {
      patchVnode(oldCh[0], newCh[0])
    } else {
      patch(oldCh[0], newCh[0])
    }
  }
  
  function patch (oldVnode, vnode) {
    var isRealElement = oldVnode.nodeType !== undefined
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode)
    } else {
      if (isRealElement) {
        oldVnode = emptyNodeAt(oldVnode)
      }
      var elm = oldVnode.elm
      var parent = elm.parentNode
  
      createElm(vnode)
  
      parent.insertBefore(vnode.elm, elm)
      parent.removeChild(elm)
    }
    return vnode.elm
  }
  
  // data中的数据代理，使得可以使用`this.key`而不是`this.$data.key`
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
    vm.mount(document.querySelector(options.el))
  }
  
  Vue.prototype.mount = function (el) {
    var vm = this
    vm.$el = el
    new Watcher(vm, function () {
      vm.update(vm.render())
    })
  }
  
  Vue.prototype.update = function (vnode) {
    var vm = this
    var prevVnode = vm._vnode
    vm._vnode = vnode
    if (!prevVnode) {
      vm.$el = vm.patch(vm.$el, vnode)
    } else {
      vm.$el = vm.patch(prevVnode, vnode)
    }
  }
  
  Vue.prototype.patch = patch
  
  Vue.prototype.render = function () {
    var vm = this
    return vm.$options.render.call(vm)
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
  
  // test
  setTimeout(function () {
    vm.message = 'Hello'
  }, 2000)
  
  setTimeout(function () {
    vm.isShow = false
  }, 4000)
  
})()