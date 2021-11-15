const AUDIO_EVENTS = [
    "abort", /* Fires when the loading of an audio/video is aborted */
    "canplay", /* Fires when the browser can start playing the audio/video */
    "canplaythrough", /* Fires when the browser can play through the audio/video without stopping for buffering */
    "durationchange", /* Fires when the duration of the audio/video is changed */
    "emptied", /* Fires when the current playlist is empty */
    "ended", /*	Fires when the current playlist is ended */
    "error", /*	Fires when an error occurred during the loading of an audio/video */
    "loadeddata", /* Fires when the browser has loaded the current frame of the audio/video */
    "loadedmetadata", /* Fires when the browser has loaded meta data for the audio/video */
    "loadstart", /*	Fires when the browser starts looking for the audio/video */
    "pause", /*	Fires when the audio/video has been paused */
    "play", /* Fires when the audio/video has been started or is no longer paused */
    "playing", /* Fires when the audio/video is playing after having been paused or stopped for buffering */
    "progress", /* Fires when the browser is downloading the audio/video */
    "ratechange", /* Fires when the playing speed of the audio/video is changed */
    "seeked", /* Fires when the user is finished moving/skipping to a new position in the audio/video */
    "seeking", /* Fires when the user starts moving/skipping to a new position in the audio/video */
    "stalled", /* Fires when the browser is trying to get media data, but data is not available */
    "suspend", /* Fires when the browser is intentionally not getting media data */
    "timeupdate", /* Fires when the current playback position has changed */
    "volumechange", /* Fires when the volume has been changed */
    "waiting", /* Fires when the video stops because it needs to buffer the next frame */
];

let AudioClass = function(options) {
    this._init(options);
};

AudioClass.defaults = {

    /* Element related */
    audioElId: undefined,
    statusElId: undefined,
    descriptionElId: undefined,
    descriptionElTag: undefined,
    clickablePlayElId: undefined,
    clickablePauseElId: undefined,
    clickableReloadElId: undefined,
    inputVolumeElId: undefined,

    /* Audio related */
    autoplay: false,
    controls: false,
    loop: true,
    preload: "none",
    muted: false,
    volume: 0.7,
    log: false,

    sources: [
        /* Example
        {
            id: 0,
            title: "",
            description: "",
            src: "noise/PinkNoise.mp3",
            type: "audio/mpeg"
        }
        */
    ],

    /* Events related */
    useDefaultEventHandler: false,
    addAllEvents: false,
    allAudioEvents: AUDIO_EVENTS,
    audioEvents: [
        /* Example:
        {
          name: "eventName",
          handler: function(audio) { return function(e) {  }; },
          status: "status",
          description: "description"
        } */
    ],

    /* Methods */
    defaultAudioEventHandler: undefined,
};

AudioClass.prototype = {

    _init: function(options) {

        /* TODO: this.options = $.extend(true, {}, AudioClass.defaults, options); */
        this.options = options;

        /* Initialize Audio element */
        this.$audioEl = this._audioElInit();

        /* Find status element */
        this.$statusEl = this._getElementById(options.statusElId);

        /* Find descriptionElId element */
        this.$descriptionEl = this._getElementById(options.descriptionElId);

        this._controlElInit();
    },

    _audioElInit: function() {

        let $audioEl = this._getElementById(this.options.audioElId);

        if (!$audioEl) {
            return;
        }

        /* Set properties */
        this._setAudioProperties($audioEl);

        /* Set sources */
        this._setAudioSources($audioEl);

        /* Set Events */
        this._setAudioEvents($audioEl);

        return $audioEl;
    },

    _controlElInit: function() {

        /* Find Play element */
        this.$playEl = this._playElInit();

        /* Find Pause element */
        this.$pauseEl = this._pauseElInit();

        /* Find Reload element */
        this.$reloadEl = this._reloadElInit();

        /* Find Volume element */
        this.$volumeEl = this._volumeElInit();
    },

    _playElInit: function() {
        let $el = this._getElementById(this.options.clickablePlayElId);

        if (!$el) {
            return;
        }

        let _self = this;

        this._setEventHandler($el, "click", function() {
            if (_self.$audioEl.paused) {
                _self.play();
            } else if (_self.options.clickablePlayElId === _self.options.clickablePauseElId) {
                _self.pause();
            }
        });

        return $el;
    },

    _pauseElInit: function() {
        let $el = this._getElementById(this.options.clickablePauseElId);

        if (!$el) {
            return;
        }

        if (this.options.clickablePlayElId === this.options.clickablePauseElId) {
            return $el;
        }

        let _self = this;

        this._setEventHandler($el, "click", function() {
            if (!_self.$audioEl.paused) {
                _self.pause();
            }
        });

        return $el;
    },

    _reloadElInit: function() {
        let $el = this._getElementById(this.options.clickableReloadElId);

        if (!$el) {
            return;
        }

        let _self = this;

        this._setEventHandler($el, "click", function() {
            _self.load();
        });

        return $el;
    },

    _volumeElInit: function() {
        let $el = this._getElementById(this.options.inputVolumeElId);

        if (!$el) {
            return;
        }

        let _self = this;

        $el.value = this.getVolume();

        this._setEventHandler($el, "input", function() {
            _self.setVolume(this.value);
        });

        return $el;
    },

    _getElementById: function(elementId) {
        if (!elementId) {
            return;
        }

        return document.getElementById(elementId);
    },

    _setAudioProperties: function($audioEl) {

        let config = this.options;

        $audioEl.autoplay = config.autoplay;
        $audioEl.controls = config.controls;
        $audioEl.loop = config.loop;
        $audioEl.preload = config.preload;
        $audioEl.muted = config.muted;
        $audioEl.volume = config.volume;
    },

    _setAudioSources: function($audioEl) {

        if (!this.options.sources) {
            return;
        }

        this.options.sources
            .forEach(s => {
                let $audioSource = document.createElement("source");
                $audioSource.src = s.src;
                $audioSource.type = s.type;
                $audioEl.appendChild($audioSource);
            });
    },

    _setAudioEvents: function($audioEl) {

        let _self = this;
        let config = this.options;

        if (config.addAllEvents && config.useDefaultEventHandler) {
            config
                .allAudioEvents
                .forEach(en => {
                    if (config.defaultAudioEventHandler) {
                        _self._setEventHandler($audioEl, en, config.defaultAudioEventHandler(_self));
                    }

                    _self._setChangeStatusEvent($audioEl, en);
                })

            return;
        }

        if (config.audioEvents.length == 0) {
            _self._log("No events to handle");
            return;
        }

        config
            .audioEvents
            .forEach(ev => {
                if (ev.handler) {
                    _self._setEventHandler($audioEl, ev.name, ev.handler(_self));
                }

                _self._setChangeStatusEvent($audioEl, ev.name, ev.status, ev.description);
            })
    },

    _getValidStatuses: function() {
        if (this.options.addAllEvents) {
            return this.options.allAudioEvents;
        }

        return this.options.audioEvents.map(e => e.name);
    },

    _setStatus: function(status) {
        this.status = status;
        this._changeElementStatus(status);
    },

    _setDescription: function(description) {

        this.description = description;

        if (!this.$descriptionEl ||
            !this.options.descriptionElTag) {
            return;
        }

        this.$descriptionEl[this.options.descriptionElTag] = description;
    },

    _setElementStatus: function(status) {
        if (!this.$statusEl) {
            return;
        }

        return this.$statusEl.classList.add(status);
    },

    _hasElementStatus: function(status) {
        if (!this.$statusEl) {
            return;
        }

        return this.$statusEl.classList.contains(status);
    },

    _removeElementStatus: function(status) {
        if (!this.$statusEl) {
            return;
        }

        return this.$statusEl.classList.remove(status);
    },

    _removeOldElementStatuses: function() {

        let _self = this;
        let statuses = this._getValidStatuses();

        statuses
            .filter(s => _self._hasElementStatus(s))
            .forEach(s => _self._removeElementStatus(s));
    },

    _changeElementStatus: function(status) {
        this._removeOldElementStatuses();
        this._setElementStatus(status);
    },

    _changeStatusEventHandler: function(status, description) {

        let _self = this;

        return function(audio) {
            return function(e) {
                _self._setStatus(status);
                _self._log("Event: '" + e.type + "'", "Status: '" + status + "'", "Description: '" + description + "'");

                if (description != undefined) {
                    _self._setDescription(description);
                }
            }
        }
    },

    _setChangeStatusEvent: function($audioEl, eventName, status, description) {
        if (!status) {
            return;
        }

        this._setEventHandler($audioEl, eventName, this._changeStatusEventHandler(status, description)(this))
    },

    _setEventHandler: function($el, eventName, handler) {

        if (!$el || !eventName || !handler) {
            return;
        }

        $el.addEventListener(eventName, handler);
    },

    _log: function(message) {
        if (!this.log) {
            return;
        }

        console.log(message);
    },

    play: function() {
        if (!this.$audioEl) {
            return;
        }

        this.$audioEl.play();
    },

    pause: function() {
        if (!this.$audioEl) {
            return;
        }

        this.$audioEl.pause();
    },

    load: function() {
        if (!this.$audioEl) {
            return;
        }

        this.$audioEl.load();
    },

    setVolume: function(volume) {
        if (!this.$audioEl) {
            return;
        }

        this.$audioEl.volume = volume;
    },

    getVolume: function() {
        if (!this.$audioEl) {
            return this.options.volume;
        }

        return this.$audioEl.volume;
    },

    getCurrentTime: function() {
        if (!this.$audioEl) {
            return 0;
        }

        return this.$audioEl.currentTime;
    },

    getDuration: function() {
        if (!this.$audioEl) {
            return 0;
        }

        return this.$audioEl.duration;
    },

    getCurrentSourceObject: function() {

        let _self = this;

        if (!this.options.sources) {
            return void(0);
        }

        let curSrcs =
            this.options.sources
                .filter(s => _self.$audioEl.currentSrc === s.src);

        if (!curSrcs.length) {
            return void(0);
        }

        return curSrcs[0];
    },

    asFormattedTime: function(durationInSeconds) {
        if (!durationInSeconds ||
            durationInSeconds === Infinity ||
            durationInSeconds === NaN) {
            return "";
        }

        let totalSeconds = parseInt(durationInSeconds);
        let hours = parseInt(totalSeconds / 3600) % 24;
        let minutes = parseInt(totalSeconds / 60) % 60;
        let seconds = totalSeconds % 60;

        let mPadNum = hours > 0 ? 2 : 1;
        let sPadNum = 2;

        let minutesPadded = minutes.toString().padStart(mPadNum, "0");
        let secondsPadded = seconds.toString().padStart(sPadNum, "0");

        if (hours > 0) {
            return `${hours}:${minutesPadded}:${secondsPadded}`;
        }

        return `${minutesPadded}:${secondsPadded}`;
    },

    durationTime: function() {
        return this.asFormattedTime(this.getDuration());
    },

    progressTime: function() {
        return this.asFormattedTime(this.getCurrentTime());
    },
};
