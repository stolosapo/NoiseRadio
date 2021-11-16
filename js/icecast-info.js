let IcecastInfo = function(options) {
    this._init(options);
};

IcecastInfo.defaults = {

    sources: [
        /* Example
        {
            src: "noise/PinkNoise.mp3",
            listenUrl: "noise/PinkNoise.mp3",
            fallbackListenUrl: "noise/FallbackPinkNoise.mp3",
            statusUrl: "https://radio.fm:8000/status-json.xsl"
        }
        */
    ],

    /* Events */
    applyIceCastInfo: undefined, // function(icecastSourceInfo) {}
    resetIceCastInfo: undefined, // function() {}

    timerInterval: 5000,
    timerErrorThreshold: 3,
};

IcecastInfo.prototype = {

    _init: function(options) {

        /* TODO: this.options = $.extend(true, {}, IcecastInfo.defaults, options); */
        this.options = options;
    },

    _findSourceObject: function(audioSrc) {

        if (!this.options.sources) {
            return void(0);
        }

        let sources =
            this.options
                .sources
                .filter(i => i.src === audioSrc);

        if (!sources || !sources.length) {
            return void(0);
        }

        return sources[0];
    },

    _registerTimerInfo: function(sourceObject) {

        let _self = this;

        let id = setInterval(function() {

            _self._readIceCastInfo(sourceObject);

        }, _self.options.timerInterval);

        _self.timerId = id;
        _self.timerErrorCounter = 0;
    },

    _removeTimerInfo: function(forced) {

        if (!this.timerId) {
            return;
        };

        /* Remove timer after threshold failed tries */
        this.timerErrorCounter = this.timerErrorCounter + 1;

        if (this.timerErrorCounter >= this.options.timerErrorThreshold || forced) {

            clearInterval(this.timerId);
            console.log("timer canceled", forced);
        }

        this._resetIceCastInfo();
    },

    _readIceCastInfo: function(sourceObject) {

        let _self = this;
        let statusUrl = sourceObject.statusUrl;

        if (!statusUrl) {
            return;
        };

        this._requestGET(statusUrl, function(response) {

            if (!response) {

                _self._removeTimerInfo(false);
                return;
            }

            let iceStats = response;

            let arrSources = [];

            if (iceStats.icestats.source instanceof Array) {
                arrSources = iceStats.icestats.source;
            } else if (iceStats.icestats.source !== undefined) {
                arrSources.push(iceStats.icestats.source);
            }

            let filterUrl;
            if ( sourceObject.listenUrl ) {
                filterUrl = sourceObject.listenUrl;
            }
            else {
                filterUrl = sourceObject.src;
            }

            let iceSource =
                arrSources.filter(i => i.listenurl === filterUrl);

            let iceFallbackSource =
                arrSources.filter(i => i.listenurl === sourceObject.fallbackListenUrl);

            if (iceSource.length  && _self._checkIfStreamIsStarted(iceSource)) {

                _self._applyIceCastInfo(iceSource[0]);
            } else if (iceFallbackSource.length && _self._checkIfStreamIsStarted(iceFallbackSource)) {

                _self._applyIceCastInfo(iceFallbackSource[0]);
            } else {

                console.error(`Cannot find status for '${sourceObject.src}' source`);
                _self._removeTimerInfo(false);
                _self._resetIceCastInfo();
            };

        });
    },

    _checkIfStreamIsStarted: function(iceSourceArray) {
        if (!iceSourceArray.length) {
            return false
        }

        let iceSource = iceSourceArray[0]

        if (!iceSource.stream_start) {
            return false
        }

        return true
    },

    _applyIceCastInfo: function(icecastSourceInfo) {

        if (!this.options.applyIceCastInfo) {
            return;
        }

        this.options.applyIceCastInfo(icecastSourceInfo)
    },

    _resetIceCastInfo: function() {

        if (!this.options.resetIceCastInfo) {
            return;
        }

        this.options.resetIceCastInfo();
    },

    _requestGET: function(url, callback) {

        let _self = this;

        this._callAjax(url, callback, function(xmlhttp) {

            console.error(`Error '${url}'`, xmlhttp);
            _self._removeTimerInfo(false);
        });
    },

    _callAjax: function(url, success, error) {

        let xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {

            // console.log(this.readyState, this.status);

            if (this.readyState == 4 && this.status == 200) {

                success(JSON.parse(this.responseText));
            } else if (this.readyState == 4 && this.status != 200) {

                error(this);
            }
        };

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    },

    register: function(audioSrc) {

        this._removeTimerInfo(true);

        let sourceObject = this._findSourceObject(audioSrc);

        if (!sourceObject) {
            console.error(`Could not find config for '${audioSrc}'`);
            return;
        }

        this._registerTimerInfo(sourceObject);
    },
}
