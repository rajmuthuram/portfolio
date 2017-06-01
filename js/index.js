var steps = $(".step");
console.dir(steps);

setTimeout(function() {
  steps.each(function(index) {
    var _t = $(this);
    setTimeout(function() {
      _t.addClass('done');
    }, 1250*index*1.5);
  });
}, 500);