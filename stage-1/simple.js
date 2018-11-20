;(function() {
  var vm = {};
  Object.defineProperty(vm, 'Input', {
    set: function(val) {
      document.getElementById('input').value = val;
      document.getElementById('show').innerHTML = val;
    }
  });

  document.addEventListener('keyup', function(e) {
    vm.Input = e.target.value || '';
  })
})();