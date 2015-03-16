var iterations = 0;
var tag = "bookfeels";
var tumblrURL = 'http://ltk-bookfeels.tumblr.com';

(function () {
  "use strict";
  //CHANGES GIF SIZES, BUT I DELETED THOSE - TO BE STREAMLINED LATER
  var mainbutton, gifSizes = {
    normal: [320, 240],
  },
  currentVideoPreset = "640480";

//DOESN'T SUPPORT THIS BROWSER
  function thisBrowserIsBad() {
    track('streaming', 'not supported');
    alert(facetogif.str.nope);
  }

  function getStream(callback, fail) {
    (navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || thisBrowserIsBad).call(navigator, {video: true}, callback, fail);
  }
  

	mainbutton = document.getElementById('start-recording');

	function startGifing() {
		iterations = 0;
		recorder.pause();
        facetogif.recIndicator.classList.remove('on');
        mainbutton.disabled = true;
        mainbutton.classList.add('processing');
        mainbutton.parentNode.classList.add('busy');
        mainbutton.innerHTML = facetogif.str.COMPILING;
        recorder.state = recorder.states.COMPILING;
        recorder.compile(function (blob) {
          var img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          img.dataset.blobindex = facetogif.blobs.push(blob) -1;
          img.dataset.framesindex = facetogif.frames.push(recorder.frames) -1;
          facetogif.displayGIF(img);
          mainbutton.removeAttribute('disabled');
          mainbutton.classList.remove('processing');
          mainbutton.parentNode.classList.remove('busy');
          mainbutton.innerHTML = facetogif.str.START_RECORDING;
          track('generated-gif', 'created');
        });
        track('recording', 'finished');	
	
	
	}

//DEFAULT SETTINGS
  var facetogif = {
    gifSettings: {
      w: 320,
      h: 240,
      ms: 100,
      preset: 'normal'
    },
    
    
    recorderFrame: function () {
      var frame = {
        x: 0, y: 0,
        w: null, h: null
      };
      //FOR SOME REASON IF THESE CASES AREN'T ON IT DOESN'T WORK.
      switch (facetogif.gifSettings.preset) {
        case 'normal':
        case 'full':
        case 'small':
          frame.w = facetogif.gifSettings.w;
          frame.h = facetogif.gifSettings.h;
          break;
        case 'square':
          frame.x = -35;
          frame.w = 320;
          frame.h = facetogif.gifSettings.h;
          break;
      }
      return frame;

    },
    canvas: null,
    video: null,
    initCanvas: function () {
      var c = facetogif.canvas;
      c.width = facetogif.gifSettings.w;
      c.height = facetogif.gifSettings.h;
      return c;
    },
    stream: null,
    gifContainer: null,
    controls: null,
    recIndicator: null,
    str: {
      ASK_FOR_PERMISSION: "put your face here",
      STOP_STREAMING: "stop streaming",
      START_RECORDING: "start recording",
      RECORDING: "\"it's recording...\"",
      STOP_RECORDING: "make gif",
      COMPILING: "\"it's compiling...\"",
      PAUSE: "||",
      RESUME: "►",
      UPLOADED: "uploaded",
      UPLOADING: "uploading",
      OPTIMISING: "optimising",
      nope: "This browser does not support getUserMedia yet.",
      rusure: "Are you sure?"
    },

    displayGIF: function (img) {
      var article = document.createElement('article');
      article.appendChild(facetogif.controls.cloneNode(true));
      article.appendChild(img);
      article.className = "generated-gif separate " + facetogif.gifSettings.preset;
      img.className = "generated-img";
      facetogif.gifContainer.appendChild(article);
    },

    blobs: [],
    frames: [],

    //IMGUR API CALL
    do_up: function (blob, callback) {
      var fd = new FormData();
      fd.append('image', blob);
      fd.append('title', $("#bookName").val());
      fd.append('author', $("#bookAuthor").val());

    	$.ajax({type: "POST", url:"sendit.php", data:fd, contentType: false, processData: false}).done(function(data) {
    		$("#upload").html("uploaded!");
    		$("#upload").removeClass("processing");
    		$("#upload").addClass("finished");
    		$("#gifs-go-here").append("<span class='sub'>check out your gif at <a href='"+tumblrURL+"' target='_blank'>ltk-bookfeels.tumblr.com</a>!</span>");
    		
    		
    	});

     
    },
    upload: function (opts) {
      var blob = opts.blob || facetogif.blobs[opts.img.dataset.blobindex];
      if (facetogif.is_blob_too_big(blob)) {
        if (!opts.is_secod_pass) {
          opts.onoptimize && opts.onoptimize();
          opts.is_secod_pass = true;
          facetogif.optimise(facetogif.frames[opts.img.dataset.framesindex], function (blob) {
            opts.blob = blob;
            facetogif.upload(opts);
          });
        } else {
          opts.oncannotupload && opts.oncannotupload();
        }
      } else {
        opts.oncanupload && opts.oncanupload();
        facetogif.do_up(blob, opts.onuploaded);
      }
    },

    // it's not really an optimization, rather a re-export with very low quality, using a different tool
    optimise: function (frames, callback) {
      //start with the second writer!
      var w = facetogif.secondWorker || (facetogif.secondWorker = new Worker('js/vendor/gifwriter.worker.js'));
      w.onmessage = function (e) {
        var blob = new Blob([e.data.bytes], {type: 'image/gif'});
        callback(blob);
      }
      w.postMessage({
        imageDataList: frames.filter(function (e, i) { return !!i%3 }),
        width: facetogif.gifSettings.width,
        height: facetogif.gifSettings.height,
        paletteSize: 95,
        delayTimeInMS: facetogif.gifSettings.ms
      });
    },

    is_blob_too_big: function (blob, max) {
      return blob.size > (max || (2048 * 1024));
    }
  };
  
  //RECORDER ITSELF WITH STATES
  var recorder = {
    state: 0,
    gif: null,
    interval: null,
    frames: [],
    ctx: null,
    states: {
      IDLE: 0,
      RECORDING: 1,
      PAUSED: 2,
      COMPILING: 3,
      FINISHED: 4,
      BUSY: 5
    },
    setBusy: function () {
      facetogif.video.dataset.state = recorder.state = recorder.states.BUSY;
    },
    setFinished: function () {
      recorder.state = recorder.states.FINISHED;
    },
    start: function () {	
      facetogif.video.dataset.state = recorder.state = recorder.states.RECORDING;
      recorder.interval = setInterval(recorder_fn(recorder.ctx, recorder.gif, recorder.frames), facetogif.gifSettings.ms);
     },
     //facetogif.gifSettings.ms
    pause: function () {
      facetogif.video.dataset.state = recorder.state = recorder.states.PAUSED;
      clearInterval(recorder.interval);
    },
    compile: function (callback) {
      facetogif.video.dataset.state = recorder.state = recorder.states.COMPILING;
      recorder.gif.on('finished', function (blob) {
        recorder.setFinished();
        callback(blob);
        delete facetogif.video.dataset.state;
      });
      recorder.gif.render();
    }

  };

//THIS IS THE FUNCTION THAT DOES ALL THE RECORDING	
  function recorder_fn(ctx, gif, frames) {


    var coords = facetogif.recorderFrame(),
      drawW = facetogif.gifSettings.w,
      drawH = facetogif.gifSettings.h;
      ctx.translate(coords.w, 0);
      ctx.scale(-1, 1);
    return function () {
    	console.log(iterations);
      	iterations++;
    
      if (facetogif.video.src) {
      	if(iterations < 20) {
			ctx.drawImage(facetogif.video, coords.x,coords.y, coords.w,coords.h);
			var frame = ctx.getImageData(0,0, drawW,drawH);
			frames.push(frame);
			gif.addFrame(frame, {delay: facetogif.gifSettings.ms});
		} else {
			startGifing();
		}
      } else {
        clearInterval(recorder.interval);
        facetogif.recIndicator.classList.remove('on');
        recorder.state = recorder.states.IDLE;
      }
    }
  }

  function track() {
    if (typeof ga !== "undefined") {
      ga.apply(ga, ['send', 'event'].concat([].slice.call(arguments)));
    }
  }


  document.addEventListener('DOMContentLoaded', function (e) {
    facetogif.video = document.querySelector('video');
    facetogif.controls = document.getElementById('controls-template');
    facetogif.controls.parentNode.removeChild(facetogif.controls);
    facetogif.controls.removeAttribute('id');

    facetogif.recIndicator = document.getElementById('recording-indicator');

//FINALIZED GIFS GO HERE
    facetogif.canvas = document.createElement('canvas');
    facetogif.gifContainer = document.getElementById('gifs-go-here');

    facetogif.gifContainer.addEventListener('click', function (e) {
      var container = (function (e) {
        while (e.parentNode && !e.classList.contains('generated-gif') && (e = e.parentNode)) ;
        return e;
      } (e.target));
      //DOWNLOAD THE GIF
      if (e.target.classList.contains('download')) {
        track('generated-gif', 'download');
        e.target.href = container.querySelector('.generated-img').src;
        //REMOVE THE GIF
      } else if (e.target.classList.contains('remove')) {
        e.preventDefault();
        track('generated-gif', 'remove');
        if (confirm(facetogif.str.rusure)) {
          var img = container.querySelector('.generated-img');
          img.src = null;
          facetogif.blobs[img.dataset.blobindex] = null;
          facetogif.frames[img.dataset.framesindex] = null;
          container.parentNode.removeChild(container);
        }
        //UPLOAD THE GIF TO IMGUR
      } else if (e.target.classList.contains('upload')) {
        e.preventDefault();
        track('generated-gif', 'imgur');
        console.log(e.target);
        facetogif.upload({
          img: container.querySelector('.generated-img'),
          onuploaded: function (json) {
          	console.log("!");
            e.target.innerHTML = facetogif.str.UPLOADED;
            e.target.href = 'http://imgur.com/' + json.data.id;
            e.target.classList.remove('processing');
            e.target.classList.add('uploaded');
            track('generated-gif', 'is on imgur.com');
          },
          oncanupload: function () {
            e.target.classList.remove('upload');
            e.target.classList.add('processing');
            e.target.innerHTML = facetogif.str.UPLOADING;
          },
          oncannotupload: function () {
            e.target.parentNode.removeChild(e.target);
            alert('The gif is still too big for imgur. :-(');
            track('generated-gif', 'toobig');
          },
          onoptimize: function () {
            track('generated-gif', 'optimising');
            e.target.classList.add('processing');
            e.target.innerHTML = facetogif.str.OPTIMISING;
          }
        });
      }
    }, false);

    document.getElementById('put-your-face-here').addEventListener('click', function (e) {
      var button = e.target;
      if (button.classList.contains('clicked') && facetogif.stream) {      
        track('streaming', 'stop');
        facetogif.stream.stop();
        facetogif.stream = null;
        facetogif.video.removeAttribute('src');
        button.innerHTML = facetogif.str.ASK_FOR_PERMISSION;
        button.classList.remove('streaming');
      } else {
      	$("video").show();

        track('streaming', 'request');
        getStream(function (stream) {
          track('streaming', 'start');
          button.innerHTML = facetogif.str.STOP_STREAMING;
          button.classList.add('streaming');
          facetogif.video.src = window.URL.createObjectURL(stream);
          facetogif.stream = stream;
        }, function (fail) {
          track('streaming', 'failed');
          console.log(fail);
        });
      }
      button.classList.toggle('clicked');
    }, false);

 
	
	
    var pause = document.getElementById('pause-recording');
//Extra mainbutton call
    mainbutton = document.getElementById('start-recording');
    mainbutton.addEventListener('click', function (e) {
//       Something is happening HERE that I want to automate. 
      if (recorder.state === recorder.states.RECORDING || recorder.state === recorder.states.PAUSED) {
        mainbutton.classList.remove('recording');
        mainbutton.innerHTML = facetogif.str.COMPILING;
        pause.innerHTML = facetogif.str.PAUSE;
        recorder.pause();
        facetogif.recIndicator.classList.remove('on');
        mainbutton.disabled = true;
        mainbutton.classList.add('processing');
        mainbutton.parentNode.classList.add('busy');
        recorder.state = recorder.states.COMPILING;
        recorder.compile(function (blob) {
          var img = document.createElement('img');
          img.src = URL.createObjectURL(blob);
          img.dataset.blobindex = facetogif.blobs.push(blob) -1;
          img.dataset.framesindex = facetogif.frames.push(recorder.frames) -1;
          facetogif.displayGIF(img);
          mainbutton.removeAttribute('disabled');
          mainbutton.classList.remove('processing');
          mainbutton.parentNode.classList.remove('busy');
          mainbutton.innerHTML = facetogif.str.START_RECORDING;
          track('generated-gif', 'created');
        });
        track('recording', 'finished');
      } else if (recorder.state === recorder.states.IDLE || recorder.state === recorder.states.FINISHED) {
        track('recording', 'start');
        recorder.gif = new GIF({
          workers: 2,
          width: facetogif.gifSettings.w,
          height: facetogif.gifSettings.h,
          quality: 20,
          workerScript: 'js/vendor/gif.worker.js'
        });
        recorder.setBusy();
        recorder.frames = [];
        recorder.ctx = facetogif.initCanvas().getContext('2d');
        mainbutton.innerHTML = "recording...";
        recorder.start();
        
      }
    }, false);
    pause.addEventListener('click', function (e) {
      if (recorder.state === recorder.states.RECORDING) {
        track('recording', 'pause');
        recorder.pause();
        pause.innerHTML = facetogif.str.RESUME;
        facetogif.recIndicator.classList.remove('on');
      } else if (recorder.state === recorder.states.PAUSED) {
        recorder.setBusy();
        track('recording', 'resume');
        countdown(pause, function () {
          facetogif.recIndicator.classList.add('on');
          pause.innerHTML = facetogif.str.PAUSE;
          recorder.start();
        });
      }
    }, false);



  }, false);




} ());

function processBook(){
	var bookName = document.getElementById('bookName').value;
	var bookAuthor = document.getElementById('bookAuthor').value;

}

$(document).ready(function(){
  $('input[type=text][title],input[type=password][title],textarea[title]').each(function(i){
    $(this).addClass('input-prompt-' + i);
    var promptSpan = $('<span class="input-prompt"/>');
    $(promptSpan).attr('id', 'input-prompt-' + i);
    $(promptSpan).click(function(){
      $(this).hide();
      $('.' + $(this).attr('id')).focus();
    });
    if($(this).val() != ''){
      $(promptSpan).hide();
    }
    $(this).before(promptSpan);
    $(this).focus(function(){
      $('#input-prompt-' + i).hide();
    });
    $(this).blur(function(){
      if($(this).val() == ''){
        $('#input-prompt-' + i).show();
      }
    });
  });
});

