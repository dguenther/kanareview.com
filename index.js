// --- HELPER FUNCTIONS ---

function flatten(array) {
  var flattenedArray = [];
  for (var i = 0; i < array.length; i++) {
    flattenedArray = flattenedArray.concat(array[i]);
  }
  return flattenedArray;
}

// Fisher-Yates shuffle (from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array)
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// --- HTML BUILDER ---

function buildDragHtml(array) {
  var html = [];
  for (var i = 0; i < array.length; i++) {
    html.push('<div class="group">');
    for (var j = 0; j < array[i].length; j++) {
      html.push('<div class="group-item">');
      html.push('<div class="drag-target space" data-kana="');
      html.push(array[i][j][0]);
      html.push('"></div><span class="kana-english">');
      html.push(array[i][j][0]);
      html.push('</div>');
    }
    html.push('</div>');
  }
  return html.join('');
}

function buildKanaHtml(array) {
  var html = [];
  var kana = shuffle(flatten(array));
  for (var i = 0; i < kana.length; i++) {
    html.push('<div class="drag-kana kana kana-background" data-kana="');
    html.push(kana[i][0]);
    html.push('">');
    html.push(kana[i][1]);
    html.push('</div>');
  }
  return html.join('');
}

function buildHtml() {
  var dragContainer = document.querySelector('.container');
  var kanaContainer = document.querySelector('.kana-container');
  // add kana to container
  dragContainer.innerHTML = buildDragHtml(kana);
  kanaContainer.innerHTML = buildKanaHtml(kana);
}

// Immediately build the HTML for the page
buildHtml();

// --- DRAGGABLE ---

var startPos = {x: 0, y: 0};

interact('.drag-target').dropzone({
  accept: '.drag-kana',
  ondragenter: function(event) {
    var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;

    if (draggableElement.getAttribute('data-kana') === dropzoneElement.getAttribute('data-kana')) {
      var dropRect = interact.getElementRect(event.target),
      dropCenter = {
        x: dropRect.left + dropRect.width / 2,
        y: dropRect.top  + dropRect.height / 2,
      };

      event.draggable.draggable({
        snap: {
          targets: [ dropCenter ]
        }
      });
    }
  },
  ondragleave: function(event) {
    event.draggable.draggable({
      snap: {
        targets: [ startPos ]
      }
    });
  },
  ondrop: function(event) {
    // get rid of the draggable element
    event.target.classList.add('kana', 'kana-background');
    event.target.classList.remove('space');
    event.target.innerText = event.relatedTarget.innerText;
    event.relatedTarget.innerText = '';
    event.relatedTarget.style.webkitTransform =
      event.relatedTarget.style.transform = null;
    event.relatedTarget.classList.remove('drag-kana');

    if (document.getElementsByClassName('drag-kana').length == 0) {
      stopTimer();
    }
  },
});

interact('.drag-kana').draggable({
  autoScroll: true,
  snap: {
    targets: [startPos],
    range: Infinity,
    relativePoints: [ { x: 0.5, y: 0.5 } ],
    endOnly: true
  },
  onstart: function(event) {
    if (!timerStarted()) {
        startTimer();
    }

    var rect = interact.getElementRect(event.target);

    // record center point when starting the very first drag
    startPos = {
      x: rect.left + rect.width  / 2,
      y: rect.top  + rect.height / 2
    }

    event.interactable.draggable({
      snap: {
        targets: [startPos]
      }
    });
  },
  onmove: function(event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
      target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },
});

// --- TIMER ---

var timer = document.getElementById('timer');
var interval;
var timerDate;

function timerStarted() {
  return !!timerDate;
}

function startTimer() {
  if (timerStarted()) {
    return;
  }

  timerDate = new Date();

  interval = setInterval(function () {
    var d = new Date();
    var ms = d - timerDate;
    var seconds = (Math.round(ms / 1000) % 60).toString();
    if (seconds.length == 1) {
      seconds = "0" + seconds;
    }
    var minutes = Math.floor(ms / 60000).toString();
    if (minutes.length == 1) {
      minutes = "0" + minutes;
    }
    timer.innerText = minutes + ":" + seconds;
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

function clearTimer() {
  timer.innerText = '00:00';
  timerDate = null;
  stopTimer();
}

document.querySelector('#reset').addEventListener('click', function () {
  clearTimer();
  buildHtml();
});
