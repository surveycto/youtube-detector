/* global fieldProperties, setAnswer, goToNextField, getMetaData, setMetaData, getPluginParameter, YT */

var choices = fieldProperties.CHOICES
var appearance = fieldProperties.APPEARANCE
var fieldType = fieldProperties.FIELDTYPE
var numChoices = choices.length

var labelContainer = document.querySelector('#label')
var hintContainer = document.querySelector('#hint')

var choiceContainers // Will eventually contain all choice containers, either from no appearance, or 'list-nolabel' appearance
var radioButtonsContainer = document.querySelector('#radio-buttons-container') // default radio buttons
var selectDropDownContainer = document.querySelector('#select-dropdown-container') // minimal appearance
var likertContainer = document.querySelector('#likert-container') // likert
var choiceLabelContainer = document.querySelector('#choice-labels')
var listNoLabelContainer = document.querySelector('#list-nolabel')

var playerContainer = document.querySelector('#player')

var loadingNode = document.querySelector('.loader')

if (playerContainer == null) {
  loadingNode.style.display = 'none'
  document.querySelector('.error').style.display = ''
}

var currentAnswer // Stores the currently selected value, but will not set until minSeconds has been met

var platform // Used later to determine the width of the device, since different in SurveyCTO Collect
if (document.body.className.indexOf('web-collect') >= 0) {
  platform = 'web'
} else {
  platform = 'mobile' // Currently, iOS or Android does not matter, but will add the distinction later if needed
}

var labelOrLnl

if (appearance.indexOf('label') === -1) {
  labelOrLnl = false
} else {
  labelOrLnl = true
}

if (labelOrLnl) {
  choiceContainers = document.querySelectorAll('.fl-radio') // Go through all  the available choices if 'list-nolabel'
} else {
  choiceContainers = document.querySelectorAll('.choice-container') // go through all the available choices
}

if (!labelOrLnl) {
  if (fieldProperties.LABEL) {
    labelContainer.innerHTML = unEntity(fieldProperties.LABEL)
  }
  if (fieldProperties.HINT) {
    hintContainer.innerHTML = unEntity(fieldProperties.HINT)
  }
}

var player // The YouTube player object
var timePlayed // The amount of time the video has been played so far. Will be stored in the metadata
var savedTime // The time the video has been played so far, not counting the current play session (e.g. amount of time video was played before the last time the video was paused)
var playing = false // Whether or not the video is currently playing
var playedSession = false // Whether or not the video has been played at all since the field was opened
var videoEnded

var metadata = getMetaData()
if (metadata == null) {
  savedTime = 0
  videoEnded = false
  setMetaData('0|0') // Start at no time, and not ended
} else {
  var mdSplit = metadata.split(' ')
  savedTime = parseInt(mdSplit[0]) // Retreive time from last time
  if (mdSplit[1] === '1') { // Retrieve from last time whether video ended
    videoEnded = true
  } else {
    videoEnded = false
  }
}
timePlayed = savedTime

var videoId = getPluginParameter('video') // YouTube ID of the video
var resetTime = getPluginParameter('reset') // Whether time should reset after returning to field and restarting
if (resetTime === 1) {
  resetTime = true
} else {
  resetTime = false
}

var autoplay = getPluginParameter('autoplay') // Whether video should play as soon as it loads
if (autoplay === 1) {
  autoplay = true
} else {
  autoplay = false
}

var minSeconds = getPluginParameter('min_seconds') // Minimum number of seconds the video must be played for
if ((minSeconds == null) || (isNaN(minSeconds))) {
  minSeconds = 0
}

// Prepare the current webview, making adjustments for any appearance options
if ((appearance.indexOf('minimal') !== -1) && (fieldType === 'select_one')) { // minimal appearance
  removeContainer('minimal')
  selectDropDownContainer.style.display = 'block' // show the select dropdown
} else if (appearance.indexOf('list-nolabel') !== -1) { // list-nolabel appearance
  removeContainer('nolabel')
  labelContainer.parentElement.removeChild(labelContainer)
  hintContainer.parentElement.removeChild(hintContainer)
} else if (labelOrLnl) { // If 'label' appearance
  removeContainer('label')
  labelContainer.parentElement.removeChild(labelContainer)
  hintContainer.parentElement.removeChild(hintContainer)
} else if ((appearance.indexOf('likert') !== -1) && (fieldType === 'select_one')) { // likert appearance
  removeContainer('likert')
  likertContainer.style.display = 'flex' // show the likert container
  // likert-min appearance
  if (appearance.indexOf('likert-min') !== -1) {
    var likertChoices = document.querySelectorAll('.likert-choice-container')
    for (var i = 1; i < likertChoices.length - 1; i++) {
      likertChoices[i].querySelector('.likert-choice-label').style.display = 'none' // hide all choice labels except the first and last
    }
    likertChoices[0].querySelector('.likert-choice-label').classList.add('likert-min-choice-label-first') // apply a special class to the first choice label
    likertChoices[likertChoices.length - 1].querySelector('.likert-choice-label').classList.add('likert-min-choice-label-last') // apply a special class to the last choice label
  }
} else { // all other appearances
  removeContainer('radio')
  if (fieldProperties.LANGUAGE !== null && isRTL(fieldProperties.LANGUAGE)) {
    radioButtonsContainer.dir = 'rtl'
  }

  // quick appearance
  if ((appearance.indexOf('quick') !== -1) && (fieldType === 'select_one')) {
    for (var i = 0; i < choiceContainers.length; i++) {
      choiceContainers[i].classList.add('appearance-quick') // add the 'appearance-quick' class
      choiceContainers[i].querySelectorAll('.choice-label-text')[0].insertAdjacentHTML('beforeend', '<svg class="quick-appearance-icon"><use xlink:href="#quick-appearance-icon" /></svg>') // insert the 'quick' icon
    }
  }
}

// minimal appearance
if ((appearance.indexOf('minimal') !== -1) && (fieldType === 'select_one')) {
  selectDropDownContainer.onchange = change // when the select dropdown is changed, call the change() function (which will update the current value)
} else if ((appearance.indexOf('likert') !== -1) && (fieldType === 'select_one')) { // likert appearance
  var likertButtons = document.querySelectorAll('div[name="opt"]')
  for (var i = 0; i < likertButtons.length; i++) {
    likertButtons[i].onclick = function () {
      // clear previously selected option (if any)
      var selectedOption = document.querySelector('.likert-input-button.selected')
      if (selectedOption) {
        selectedOption.classList.remove('selected')
      }
      this.classList.add('selected') // mark clicked option as selected
      change.apply({ value: this.getAttribute('data-value') }) // call the change() function and tell it which value was selected
    }
  }
} else { // all other appearances
  var buttons = document.querySelectorAll('input[name="opt"]')
  var numButtons = buttons.length
  if (fieldType === 'select_one') { // Change to radio buttons if select_one
    for (var i = 0; i < numButtons; i++) {
      buttons[i].type = 'radio'
    }
  }
  for (var i = 0; i < numButtons; i++) {
    buttons[i].onchange = function () {
      // remove 'selected' class from a previously selected option (if any)
      var selectedOption = document.querySelector('.choice-container.selected')
      if ((selectedOption) && (fieldType === 'select_one')) {
        selectedOption.classList.remove('selected')
      }
      this.parentElement.classList.add('selected') // add 'selected' class to the new selected option
      change.apply(this) // call the change() function and tell it which value was selected
    }
  }
}

setInterval(continuous, 1) // To continously update metadata, in case enumerator leaves while the video is playing

function onYouTubeIframeAPIReady () { // The API activates this function when it is ready to load the video
  var windowWidth
  if (platform === 'web') {
    windowWidth = window.innerWidth
  } else {
    windowWidth = window.screen.width
  }

  // Using the width of the window, determines how much to shrink the video by, rounding down to fit the screen. Takes default height and width, and divides them by the same number
  var shrinker = Math.ceil(1920 / windowWidth)
  var playerHeight = 1170 / shrinker
  var playerWidth = 1920 / shrinker

  player = new YT.Player('player', {
    height: String(playerHeight),
    width: String(playerWidth),
    // height: 390,
    // width: 640,
    videoId: videoId,
    playerVars: {
      playsinline: 1
    },
    events: {
      onStateChange: onPlayerStateChange,
      onReady: function () { // When video is done loading, hides the "Loading..." div, and plays video if "autoplay" is true.
        loadingNode.style.display = 'none'
        if (autoplay) {
          player.playVideo()
        }
      },
      onError: function (e) {
        var errorData = e.data
        var errorText
        if (errorData === 2) {
          errorText = 'Error: Invalid video ID. Please check the "video" parameter of the field plug-in, and make sure it is a valid video ID. A video ID should be 11 characters long.'
        } else if (errorData === 5) {
          errorText = 'Error: Sorry, but the video cannot be played here. Make sure you have the latest version of Web View.'
        } else if (errorData === 100) {
          errorText = 'Error: Requested video not found.'
        } else if ((errorData === 101) || (errorData === 150)) {
          errorText = 'Error: Sorry, but the owner of this video does not allow it to be played in embedded players.'
        }
        playerContainer.style.color = '#a8000e'
        playerContainer.style.display = ''
        playerContainer.innerHTML = errorText
      }
    }
  })
}

// This function is called by the "player" object whenever the video is played, paused, or has some other state change
function onPlayerStateChange (event) {
  var eventData = event.data
  if (eventData === YT.PlayerState.PLAYING) { // If playing, start keeping track of the time passed
    if (!playedSession && resetTime) { // Reset if playing again and should reset time
      playedSession = true
      savedTime = 0
      videoEnded = false
    }
    playing = true
  } else if (playing) { // Any state other than playing is not playing, so takes the time passed so far, adds it to the previously passed time, and updates the metadata
    playing = false
    timePlayed = savedTime + player.getCurrentTime()
    if (eventData === YT.PlayerState.ENDED) { // IMPORTANT: This determines the second part of the metadata, whether the video has ended
      videoEnded = true
    }
    setMetaData(String(timePlayed) + ' ' + (videoEnded ? '1' : '0'))
  }
}

// While the video is playing, constantly update the metadata, in case the enumerator leaves in the middle of the video
function continuous () {
  if (playing) {
    timePlayed = savedTime + player.getCurrentTime()
    setMetaData(String(timePlayed) + ' ' + (videoEnded ? '1' : '0'))
    if ((minSeconds !== 0) && (timePlayed >= minSeconds)) { // Only set if the minimum number of seconds has passed. To save resources, only does this continously if "minSeconds" is not 0.
      setAnswer(currentAnswer)
    }
  }
}

function clearAnswer () {
  // minimal appearance
  if (appearance.indexOf('minimal') !== -1) {
    selectDropDownContainer.value = ''
  } else if (appearance.indexOf('likert') !== -1) { // likert appearance
    var selectedOption = document.querySelector('.likert-input-button.selected')
    if (selectedOption) {
      selectedOption.classList.remove('selected')
    }
  } else { // all other appearances
    for (var b = 0; b < numButtons; b++) {
      var selectedOption = buttons[b]
      selectedOption.checked = false
      selectedOption.parentElement.classList.remove('selected')
    }
  }
  setAnswer('')
  setMetaData('0|0')
}

// Removed the containers that are not to be used
function removeContainer (keep) {
  if (keep !== 'radio') {
    radioButtonsContainer.parentElement.removeChild(radioButtonsContainer) // remove the default radio buttons
  }

  if (keep !== 'minimal') {
    selectDropDownContainer.parentElement.removeChild(selectDropDownContainer) // remove the select dropdown contrainer
  }

  if (keep !== 'likert') {
    likertContainer.parentElement.removeChild(likertContainer) // remove the likert container
  }

  if (keep !== 'label') {
    choiceLabelContainer.parentElement.removeChild(choiceLabelContainer)
  }

  if (keep !== 'nolabel') {
    listNoLabelContainer.parentElement.removeChild(listNoLabelContainer)
  }
}

// Save the user's response (update the current answer)
function change () {
  if (fieldType === 'select_one') {
    currentAnswer = this.value
  } else {
    var selected = []
    for (var c = 0; c < numChoices; c++) {
      if (choiceContainers[c].querySelector('INPUT').checked === true) {
        selected.push(choices[c].CHOICE_VALUE)
      }
    }
    currentAnswer = selected.join(' ')
  }

  if (timePlayed >= minSeconds) { // Only actually set the answer if the video has been played for the minimum number of seconds (default: 0)
    setAnswer(currentAnswer)
    // If the appearance is 'quick', then also progress to the next field
    if (appearance.indexOf('quick') !== -1) {
      goToNextField()
    }
  }
}

// If the field label or hint contain any HTML that isn't in the form definition, then the < and > characters will have been replaced by their HTML character entities, and the HTML won't render. We need to turn those HTML entities back to actual < and > characters so that the HTML renders properly. This will allow you to render HTML from field references in your field label or hint.
function unEntity (str) {
  return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

// Detect right-to-left languages
function isRTL (s) {
  var ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF'
  var rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC'
  var rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']')

  return rtlDirCheck.test(s)
}
