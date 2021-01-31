/**
 * html-midi-player@1.1.0
 * https://github.com/cifkao/html-midi-player.git
 * @author Ondřej Cífka (@cifkao)
 * @license BSD-2-Clause
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@magenta/music/es6/core')) :
  typeof define === 'function' && define.amd ? define(['exports', '@magenta/music/es6/core'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.midiPlayer = {}, global.core));
}(this, (function (exports, mm) { 'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var DEFAULT_SOUNDFONT = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';
  var playingPlayer = null; // function formatTime(seconds: number) {
  //   const negative = (seconds < 0);
  //   seconds = Math.floor(Math.abs(seconds || 0));
  //   const s = seconds % 60;
  //   const m = (seconds - s) / 60;
  //   const h = (seconds - s - 60 * m) / 3600;
  //   const sStr = (s > 9) ? `${s}` : `0${s}`;
  //   const mStr = (m > 9 || !h) ? `${m}:` : `0${m}:`;
  //   const hStr = h ? `${h}:` : '';
  //   return (negative ? '-' : '') + hStr + mStr + sStr;
  // }

  /**
   * MIDI player element.
   * See also the [`@magenta/music/core/player` docs](https://magenta.github.io/magenta-js/music/modules/_core_player_.html).
   *
   * The element supports styling using the CSS [`::part` syntax](https://developer.mozilla.org/docs/Web/CSS/::part)
   * (see the list of shadow parts [below](#css-shadow-parts)). For example:
   * ```css
   * midi-player::part(control-panel) {
   *     background: aquamarine;
   *     border-radius: 0px;
   * }
   * ```
   *
   * @prop src - MIDI file URL
   * @prop soundFont - Magenta SoundFont URL, an empty string to use the default SoundFont, or `null` to use a simple oscillator synth
   * @prop noteSequence - Magenta note sequence object representing the currently loaded content
   * @prop currentTime - Current playback position in seconds
   * @prop duration - Content duration in seconds
   * @prop playing - Indicates whether the player is currently playing
   *
   * @fires load - The content is loaded and ready to play
   * @fires start - The player has started playing
   * @fires stop - The player has stopped playing
   * @fires note - A note starts
   *
   * @csspart control-panel - `<div>` containing all the controls
   * @csspart play-button - Play button
   * @csspart time - Numeric time indicator
   * @csspart current-time - Elapsed time
   * @csspart total-time - Total duration
   * @csspart seek-bar - `<input type="range">` showing playback position
   */

  class PlayerElement extends HTMLElement {
    constructor() {
      super();
      this.domInitialized = false;
      this.needInitNs = false;
      this.ns = null;
      this._playing = false; // this.attachShadow({mode: 'open'});
      // this.shadowRoot.appendChild(controlsTemplate.content.cloneNode(true));
      // this.controlPanel = this.shadowRoot.querySelector('.controls');
      // this.playButton = this.controlPanel.querySelector('.play');
      // this.currentTimeLabel = this.controlPanel.querySelector('.current-time');
      // this.totalTimeLabel = this.controlPanel.querySelector('.total-time');
      // this.seekBar = this.controlPanel.querySelector('.seek-bar');
    }

    static get observedAttributes() {
      return ['sound-font', 'src'];
    }

    connectedCallback() {
      if (this.domInitialized) {
        return;
      }

      this.domInitialized = true; // const applyFocusVisiblePolyfill =
      //   (window as any).applyFocusVisiblePolyfill as (scope: Document | ShadowRoot) => void;
      // if (applyFocusVisiblePolyfill != null) {
      //   applyFocusVisiblePolyfill(this.shadowRoot);
      // }
      // this.playButton.addEventListener('click', () => {
      //   if (this.player.isPlaying()) {
      //     this.stop();
      //   } else {
      //     this.start();
      //   }
      // });
      // this.seekBar.addEventListener('input', () => {
      //   // Pause playback while the user is manipulating the control
      //   if (this.player && this.player.getPlayState() === 'started') {
      //     this.player.pause();
      //   }
      // });
      // this.seekBar.addEventListener('change', () => {
      //   const time = this.currentTime;  // This returns the seek bar value as a number
      //   this.currentTimeLabel.textContent = formatTime(time);
      //   if (this.player) {
      //     if (this.player.isPlaying()) {
      //       this.player.seekTo(time);
      //       if (this.player.getPlayState() === 'paused') {
      //         this.player.resume();
      //       }
      //     }
      //   }
      // });

      this.initPlayerNow();
    }

    attributeChangedCallback(name, _oldValue, newValue) {
      if (!this.hasAttribute(name)) {
        newValue = null;
      }

      if (name === 'sound-font' || name === 'src') {
        this.initPlayer();
      }

      console.log(newValue);
    }

    initPlayer(initNs = true) {
      this.needInitNs = this.needInitNs || initNs;

      if (this.initTimeout == null) {
        this.stop();
        this.freeze();
        this.initTimeout = window.setTimeout(() => this.initPlayerNow(this.needInitNs));
      }
    }

    initPlayerNow(initNs = true) {
      var _this = this;

      return _asyncToGenerator(function* () {
        _this.initTimeout = null;
        _this.needInitNs = false;

        if (!_this.domInitialized) {
          return;
        }

        var ns = null;

        if (initNs) {
          if (_this.src) {
            _this.ns = null;
            _this.ns = yield mm.urlToNoteSequence(_this.src);
            _this.ns = mm.sequences.applySustainControlChanges(_this.ns);
          }

          _this.currentTime = 0;
        }

        ns = _this.ns;

        if (ns) ; else {
          // this.seekBar.max = '0';
          // this.totalTimeLabel.textContent = formatTime(0);
          return;
        }

        var soundFont = _this.soundFont;
        var callbackObject = {
          // Call callbacks only if we are still playing the same note sequence.
          run: n => _this.ns === ns && _this.noteCallback(n),
          stop: () => {}
        };

        if (soundFont === null) {
          _this.player = new mm.Player(false, callbackObject);
        } else {
          if (soundFont === "") {
            soundFont = DEFAULT_SOUNDFONT;
          }

          _this.player = new mm.SoundFontPlayer(soundFont, undefined, undefined, undefined, callbackObject);
          yield _this.player.loadSamples(ns);
        }

        if (_this.ns !== ns) {
          // If we started loading a different sequence in the meantime...
          return;
        }

        _this.unfreeze();

        _this.dispatchEvent(new CustomEvent('load'));
      })();
    }

    start() {
      var _this2 = this;

      _asyncToGenerator(function* () {
        if (_this2.player) {
          if (_this2.player.getPlayState() == 'stopped') {
            if (playingPlayer && playingPlayer.playing) {
              playingPlayer.stop();
            }

            playingPlayer = _this2;
            _this2._playing = true;

            // _this2.controlPanel.classList.remove('stopped');

            // _this2.controlPanel.classList.add('playing');

            try {
              var promise = _this2.player.start(_this2.ns);

              _this2.dispatchEvent(new CustomEvent('start'));

              yield promise;

              _this2.handleStop(true);
            } catch (error) {
              _this2.handleStop();

              throw error;
            }
          } else if (_this2.player.getPlayState() == 'paused') {
            // This normally should not happen, since we pause playback only when seeking.
            _this2.player.resume();
          }
        }
      })();
    }

    stop() {
      if (this.player && this.player.isPlaying()) {
        this.player.stop();
      }

      this.handleStop(false);
    }

    pause() {
      if (this.player && this.player.isPlaying()) {
        this.player.pause();
      }
    }

    resume() {
      this.player.resume();
    }

    noteCallback(note) {
      if (!this.playing) {
        return;
      }

      this.dispatchEvent(new CustomEvent('note', {
        detail: {
          note
        }
      })); // this.seekBar.value = String(note.startTime);
      // this.currentTimeLabel.textContent = formatTime(note.startTime);
    }

    handleStop(finished = false) {
      if (finished) {
        this.currentTime = this.duration;
      } // this.controlPanel.classList.remove('playing');
      // this.controlPanel.classList.add('stopped');


      if (this._playing) {
        this._playing = false;
        this.dispatchEvent(new CustomEvent('stop', {
          detail: {
            finished
          }
        }));
      }
    }

    freeze() {// this.playButton.disabled = true;
      // this.seekBar.disabled = true;
      // this.controlPanel.classList.add('frozen');
    }

    unfreeze() {// this.controlPanel.classList.remove('frozen');
      // this.playButton.disabled = false;
      // this.seekBar.disabled = false;
    }

    get noteSequence() {
      return this.ns;
    }

    set noteSequence(value) {
      this.ns = value;
      this.removeAttribute('src'); // Triggers initPlayer only if src was present.

      this.initPlayer();
    }

    get src() {
      return this.getAttribute('src');
    }

    set src(value) {
      this.ns = null;
      this.setOrRemoveAttribute('src', value); // Triggers initPlayer only if src was present.

      this.initPlayer();
    }
    /**
     * @attr sound-font
     */


    get soundFont() {
      return this.getAttribute('sound-font');
    }

    set soundFont(value) {
      this.setOrRemoveAttribute('sound-font', value);
    }

    get currentTime() {
      return parseFloat(this.seekBar.value);
    }

    set currentTime(value) {
      // this.seekBar.value = String(value);
      // this.currentTimeLabel.textContent = formatTime(this.currentTime);
      if (this.player && this.player.isPlaying()) {
        this.player.seekTo(value);
      }
    }

    get duration() {
      return 60; //parseFloat(this.seekBar.max);
    }

    get playing() {
      return this._playing;
    }

    setOrRemoveAttribute(name, value) {
      if (value == null) {
        this.removeAttribute(name);
      } else {
        this.setAttribute(name, value);
      }
    }

  }

  var VISUALIZER_TYPES = ['piano-roll', 'waterfall', 'staff'];
  /**
   * MIDI visualizer element.
   *
   * The visualizer is implemented via SVG elements which support styling as described
   * [here](https://magenta.github.io/magenta-js/music/demos/visualizer.html).
   *
   * See also the
   * [`@magenta/music/core/visualizer` docs](https://magenta.github.io/magenta-js/music/modules/_core_visualizer_.html).
   *
   * @prop src - MIDI file URL
   * @prop type - Visualizer type
   * @prop noteSequence - Magenta note sequence object representing the currently displayed content
   * @prop config - Magenta visualizer config object
   */

  class VisualizerElement extends HTMLElement {
    constructor() {
      super(...arguments);
      this.domInitialized = false;
      this.ns = null;
      this._config = {};
    }

    static get observedAttributes() {
      return ['src', 'type'];
    }

    connectedCallback() {
      if (this.domInitialized) {
        return;
      }

      this.domInitialized = true;
      this.wrapper = document.createElement('div');
      this.appendChild(this.wrapper);
      this.initVisualizerNow();
    }

    attributeChangedCallback(name, _oldValue, _newValue) {
      if (name === 'src' || name === 'type') {
        this.initVisualizer();
      }
    }

    initVisualizer() {
      if (this.initTimeout == null) {
        this.initTimeout = window.setTimeout(() => this.initVisualizerNow());
      }
    }

    initVisualizerNow() {
      var _this = this;

      return _asyncToGenerator(function* () {
        _this.initTimeout = null;

        if (!_this.domInitialized) {
          return;
        }

        if (_this.src) {
          _this.ns = null;
          _this.ns = yield mm.urlToNoteSequence(_this.src);
        }

        _this.wrapper.innerHTML = '';

        if (!_this.ns) {
          return;
        }

        if (_this.type === 'piano-roll') {
          _this.wrapper.classList.add('piano-roll-visualizer');

          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

          _this.wrapper.appendChild(svg);

          _this.visualizer = new mm.PianoRollSVGVisualizer(_this.ns, svg, _this._config);
        } else if (_this.type === 'waterfall') {
          _this.wrapper.classList.add('waterfall-visualizer');

          _this.visualizer = new mm.WaterfallSVGVisualizer(_this.ns, _this.wrapper, _this._config);
        } else if (_this.type === 'staff') {
          _this.wrapper.classList.add('staff-visualizer');

          var div = document.createElement('div');

          _this.wrapper.appendChild(div);

          _this.visualizer = new mm.StaffSVGVisualizer(_this.ns, div, _this._config);
        }
      })();
    }

    redraw(activeNote) {
      if (this.visualizer) {
        this.visualizer.redraw(activeNote, activeNote != null);
      }
    }

    clearActiveNotes() {
      if (this.visualizer) {
        this.visualizer.clearActiveNotes();
      }
    }

    get noteSequence() {
      return this.ns;
    }

    set noteSequence(value) {
      this.ns = value;
      this.removeAttribute('src'); // Triggers initVisualizer only if src was present.

      this.initVisualizer();
    }

    get src() {
      return this.getAttribute('src');
    }

    set src(value) {
      this.ns = null;
      this.setOrRemoveAttribute('src', value); // Triggers initVisualizer only if src was present.

      this.initVisualizer();
    }

    get type() {
      var value = this.getAttribute('type');

      if (VISUALIZER_TYPES.indexOf(value) < 0) {
        value = 'piano-roll';
      }

      return value;
    }

    set type(value) {
      if (value != null && VISUALIZER_TYPES.indexOf(value) < 0) {
        throw new Error("Unknown visualizer type ".concat(value, ". Allowed values: ").concat(VISUALIZER_TYPES.join(', ')));
      }

      this.setOrRemoveAttribute('type', value);
    }

    get config() {
      return this._config;
    }

    set config(value) {
      this._config = value;
      this.initVisualizer();
    }

    setOrRemoveAttribute(name, value) {
      if (value == null) {
        this.removeAttribute(name);
      } else {
        this.setAttribute(name, value);
      }
    }

  }

  window.customElements.define('midi-player', PlayerElement);
  window.customElements.define('midi-visualizer', VisualizerElement);

  exports.PlayerElement = PlayerElement;
  exports.VisualizerElement = VisualizerElement;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
