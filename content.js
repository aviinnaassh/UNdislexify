console.log("UNdyslexify extension started !!");

let session = {
  'DyslexicFont': {
    'status': false,
    'family': "opendyslexic-regular",
    'size': 14
  },
  'Spacing': {
    'status': false,
    'letter': 0.1,
    'word': 0.5
  },
  'Ruler': {
    'status': false,
    'height' : 24
  },
  'LineHeight': {
    'status': false,
    'factor': 1.5
  }
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.begin) {
      sendResponse({session: session});
    }
    else {
      console.log(request.session);
      var req = request.session;

      session['DyslexicFont'] = req.DyslexicFont;
      session['Spacing'] = req.Spacing;
      session['Ruler'] = req.Ruler;
      session['LineHeight'] = req.LineHeight;
      
      console.log(session);
      // Font
      if (session['DyslexicFont']['status']) {
        applyFont("font-family", session['DyslexicFont']['family']);
        applyFont("font-size", session['DyslexicFont']['size']);
      } else {
          revertFont("font-family");
          revertFont("font-size");
      }

      // Spacing
      if (session['Spacing']['status']) {
        applySpacing("word-spacing", session['Spacing']['word']);
        applySpacing("letter-spacing", session['Spacing']['letter']);
      } else {
          revertSpacing("word-spacing");
          revertSpacing("letter-spacing");
      }

      // Ruler
      createRuler(session['Ruler']['status'], session['Ruler']['height']);

      // Line Height
      if (session['LineHeight']['status']) {
          let tags = ["p","ul", "ol"];
          applyLineHeight(tags, session['LineHeight']['factor']);
      }
      else {
          revertLineHeight(["p", "ul", "ol"]);
      }
    }
  }
);


/* Font */
function applyFont(attr, input) {
    if (attr == "font-size") {
        input = `${input}pt`;
    }
    document.querySelector('body').style[attr] = input;
};

function revertFont(attr) {
    document.querySelector('body').style.removeProperty(attr);
}

/* Spacing */
function applySpacing(attr, input) {
    input = `${input}em`;
    document.querySelector('body').style[attr] = input;
};

function revertSpacing(attr) {
    document.querySelector('body').style.removeProperty(attr);
}

/* Ruler */
function createRuler(active, height) {
  var ruler = document.querySelector("#readingRuler");

  // If ruler doesn't exist:
  if (!ruler) {
      // Make ruler:
      ruler = document.createElement("div");
      ruler.id = "readingRuler";
      let body = document.querySelector("body")
      body.appendChild(ruler);
  }

  if (active) {
      // Active/Inactive:
      if (parseInt(active) === 0) {
          ruler.classList.add("inactive");
      } else {
          ruler.classList.remove("inactive");
      }

      ruler.style.setProperty('--height', `${height}px`);
      document.addEventListener('mousemove', e => {
          ruler.style.setProperty('--mouse-y', `${e.clientY-(height*0.66)}px`);
      });
      ruler.style.setProperty('--hue', 'hsl(54, 97%, 49%)');    
      ruler.style.setProperty('--opacity', 0.2);
  }
  else {
      ruler.style.setProperty('--opacity', 0);
  }
}

/* Line Height */
function getTagList(tag) {
    let body = document.querySelector('body');
    return body.querySelectorAll(tag);
}

function applyLineHeight(tags, input) {
    let factor = parseFloat(input);
    tags.forEach( function(tag) {
        let els = getTagList(tag);
        for (let i=0; i<els.length; i++) {
            let el = els[i];
            el.style.removeProperty('line-height');
            let original = getComputedStyle(el).lineHeight;
            let originalVal = parseFloat(original.slice(0, original.length-2));
            let adjusted = originalVal * factor;
            let adjustedStr = `${adjusted}px`;
            el.style.lineHeight = adjustedStr;
        }
    });
};

function revertLineHeight(tags) {
    tags.forEach( function(tag) {
        let els = getTagList(tag);
        for (let i=0; i<els.length; i++) {
            els[i].style.removeProperty('line-height');
        }
    });
}

/* Text-to-Speech */
document.body.innerHTML += "<div data-ml-modal id='speakModal'><a href='' class='modal-overlay'></a><div class='modal-dialog'><div class='modal-content text-center'><p  id='speakText'></p><div id='imgdiv' style='margin-bottom: 20px; display: none'><img id='textImg' src='' width='50%'></div><button id='text-to-speech-btn' type='button' class='modal-button'><span>SPEAK</span></button></div></div></div>";

window.addEventListener("mouseup", function(e){
  e.preventDefault();
  var selectedText = "Selected Text";
  var modal = document.getElementById("speakText");
  modal.innerHTML = selectedText;
});