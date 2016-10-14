( function( window, $, undefined ) {


	/* Noise Radio Oblect */

	$.NoiseRadio				= function ( options, element ) {

		this.$el = $(element);
		this._init(options);

	};

	$.NoiseRadio.defaults		= {

		sources			: [ 

			{ src: "noise/PinkNoise.mp3", type: "audio/mpeg", title: "", imgWidth: "", imgHeight: "", images: [ 'img/noise.gif' ] },
			{ src: "noise/PinkNoise.ogg", type: "audio/ogg", title: "", imgWidth: "", imgHeight: "", images: [ 'img/noise.gif' ] },

		],

		showImage		: true,
		showLogs		: false,

		preload			: "none",
		loop			: true,
		fallbackMessage	: 'Your browser does not support the <code>audio</code> element.',
		
		/* volumeType = knob, controls */
		volumeType		: "knob",
		initialVolume	: 0.7

	};

	$.NoiseRadio.prototype		= {

		_init				: function ( options ) {

			var _self = this;

			// the options
			this.options		= $.extend(true, {}, $.NoiseRadio.defaults, options);

			// create player
			_self._createPlayer();

			// load events
			_self._loadEvents();

		},

		_createPlayerDiv	: function() {

			this.$containerEl = $( '<div id="noise-radio" class="noise-radio"></div>' );

			this.$el.prepend( this.$containerEl );

		},

		_createPlayer		: function() {

			// Create the container of radio player
			this._createPlayerDiv();

			// create a new HTML5 audio element
			this.$audioEl	= $( '<audio id="noise-element" preload="' + this.options.preload + '" loop="' + this.options.loop + '"><p>' + this.options.fallbackMessage + '</p></audio>' );

			this.$containerEl.prepend( this.$audioEl );

			this.audio 		= this.$audioEl.get(0);

			// fill sources
			this._loadSources();

			// create controls
			this._createControls();

			this._createStatusElement();

			this._createLogElement();

			this._createImgElement();

		},

		_loadSources		: function() {

			var _self = this;

			$.each( this.options.sources, function( index, source ) {

				var s = $( '<source src="' + source.src + '" type="' + source.type + '">' );
				_self.$audioEl.append(s);

			} );

		},

		_createControls		: function() {

			var _self		= this;

			// this.$controls 	= $( '<ul class="nr-controls" />' );
			this.$controls 	= $( '<ul class="nr-controls" style="display:none;"/>' );

			this.$cPlay		= $( '<li class="nr-control-button nr-control-play">Play<span></span></li>' );
			this.$cPause	= $( '<li class="nr-control-button nr-control-pause">Pause<span></span></li>' );
			this.$cStop		= $( '<li class="nr-control-button nr-control-stop">Stop<span></span></li>' );
			this.$cReset	= $( '<li class="nr-control-button nr-control-reset">Reset<span></span></li>' );

			this.$controls.append( this.$cPlay )
						  .append( this.$cPause )
						  .append( this.$cStop )
						  .append( this.$cReset )
						  .appendTo( this.$containerEl );

			if (document.createElement('audio').canPlayType) {

				if (!document.createElement('audio').canPlayType('audio/mpeg') && 
					!document.createElement('audio').canPlayType('audio/ogg')) {

					// TODO: Error!!!

				}
				else {

					this.$controls.show();

					// show volume controls
					this._createVolControls();

					this.audio.volume = this.options.initialVolume;

				}

			};

		},

		_createVolControls	: function() {

			var _self = this;

			
			if (this.options.volumeType === 'controls') {

				this.$cVolUp	= $( '<li class="nr-control-button nr-control-vol-up">+<span></span></li>' );
				this.$cVolDown	= $( '<li class="nr-control-button nr-control-vol-down">-<span></span></li>' );

				this.$controls.append( this.$cVolUp )
							  .append( this.$cVolDown );

			}

			else if (this.options.volumeType === 'knob') {

				this.$volume 	= $( '<div style="display:none;" class="nr-volume-wrap"><div class="nr-volume-control"><div class="nr-volume-knob"></div></div></div>')
				.appendTo( this.$containerEl );

				this.$volume.show();
				this.$volume.find( 'div.nr-volume-knob' ).knobKnob({
					snap : 10,
					value: 359 * this.options.initialVolume,
					turn : function( ratio ) {
						
						_self._changeVolume( ratio );
					
					}
				});

			};

		},

		_createStatusElement: function() {

			this.$statusElement 	= $( '<label class="nr-status-element"></label>' );

			this.$statusElement.appendTo( this.$containerEl );
			this.$statusElement.show();

		},

		_createLogElement	: function() {

			this.$logElement 		= $( '<textarea class="nr-log-element" readonly></textarea>' );

			this.$logElement.appendTo( this.$containerEl );

			if (this.options.showLogs) {

				this.$logElement.show();
			}
			else {
				this.$logElement.hide()	;
			}

		},

		_createImgElement	: function() {

			if (this.options.showImage != true) {
				return;
			}

			this.$imgElement 	= $( '<img class="nr-control-image"></img>' );

			this.$imgElement.appendTo( this.$containerEl );
			this.$imgElement.show();

		},

		_loadEvents			: function() {

			var _self = this;

			_self._loadAudioEvents();
			_self._loadLoggingEvents();
			_self._loadControlEvents();

		},

		_loadControlEvents	: function() {

			var _self = this;

			this.$cPlay.on( 'mousedown', function(e) {

				_self._setButtonActive( $( this ) );
				_self._play();

			} );

			this.$cPause.on( 'mousedown', function(e) {

				_self._setButtonActive( $( this ) );
				_self._pause();

			} );

			this.$cStop.on( 'mousedown', function(e) {

				_self._setButtonActive( $( this ) );
				_self._stop();

			} );

			this.$cReset.on( 'mousedown', function(e) {

				_self._setButtonActive( $( this ) );
				_self._reset();

			} );


			if (this.options.volumeType === "controls") {

				this.$cVolUp.on( 'mousedown', function(e) {

					_self._setButtonActive( $( this ) );
					_self._volUp();

				} );

				this.$cVolDown.on( 'mousedown', function(e) {

					_self._setButtonActive( $( this ) );
					_self._volDown();

				} );

			};

		},

		_loadAudioEvents	: function() {

			var _self = this;

			this.audio.addEventListener( 'error', function(e) {

				var log = "error on: " + e.target.src;

				_self._log(log);

			}, true );

			this.$audioEl.on( 'loadstart', function(e) {

				var log = "ready to play: " + this.currentSrc;

				_self._log(log);

				var currentSource = _self._findSource();
				_self._showRandomImage(currentSource);

			} );

			this.$audioEl.on( 'loadedmetadata', function(e) {

				var log = "loaded metadata: " + this.currentSrc;

				_self._log(log);

				var currentSource = _self._findSource();
				_self._showRandomImage(currentSource);

			} );

		},

		_loadLoggingEvents	: function() {

			var _self = this;

			this.$audioEl.on( 'progress', function(e) {

				if (this.paused) { 
					return;
				};

				var text = "Playing";

				var timeStamp = e.timeStamp;
				var time = e.target.currentTime;
				var title = e.target.title;

				text = text + " " + title + " " + " [" + _self._progressTime(parseInt(time)) + "]";

				_self.$statusElement.text(text);

			} );


			this.$audioEl.on( 'playing', function(e) {

				var text = "Playing";

				_self.$statusElement.text(text);

			} );


			this.$audioEl.on( 'pause', function(e) {

				var text = "Paused";

				_self.$statusElement.text(text);

			} );


			this.$audioEl.on( 'play', function(e) {

				var text = "Play";

				_self.$statusElement.text(text);

			} );


			this.$audioEl.on( 'seeked', function(e) {

				var text = "Seeked";

				_self.$statusElement.text(text);

			} );


			this.$audioEl.on( 'seeking', function(e) {

				var text = "Seeking";

				_self.$statusElement.text(text);

			} );

			this.$audioEl.on( 'waiting', function(e) {

				var text = "Waiting";

				_self.$statusElement.text(text);

			} );


			this.$audioEl.on( 'emptied', function(e) {

				var text = "Stopped";

				_self.$statusElement.text(text);

			} );

		},

		_setButtonActive	: function( $button ) {

			$button.addClass( 'nr-control-pressed' );

			setTimeout( function() {
				
				$button.removeClass( 'nr-control-pressed' );	
				
			}, 100 );

		},

		_updateButtons		: function( button ) {

			var pressedClass = 'nr-control-active';

			if (button === 'volUp' || button === 'volDown' ) {
				return;
			}

			this.$cPlay.removeClass( pressedClass );
			this.$cPause.removeClass( pressedClass );
			this.$cStop.removeClass( pressedClass );
			this.$cReset.removeClass( pressedClass );
			
			if (this.options.volumeType === 'controls') {

				this.$cVolUp.removeClass( pressedClass );
				this.$cVolDown.removeClass( pressedClass );

			};

			switch( button ) {

				case 'play'		: this.$cPlay.addClass( pressedClass ); break;
				case 'pause'	: this.$cPause.addClass( pressedClass ); break;

			}

		},

		_changeVolume		: function( ratio ) {

			this.audio.volume = ratio;
			
		},

		_findSource			: function() {

			var current = this.audio.currentSrc;
			var currentSource = {};

			$.each(this.options.sources, function( i, s ) {

				if (s.src === current) {
					
					currentSource = s;

				}

			} );

			return currentSource;

		},

		_getRandomImage		: function( source ) {

			if (!source.images || !this.options.showImage) {
				return;
			}

			var len = source.images.length;

			if (len === 1) {

				return source.images[0];

			}

			var index = Math.floor( Math.random() * len ) + 1 ;

			return source.images[index - 1];

		},

		_showRandomImage	: function( source ) {

			var img = this._getRandomImage( source );

			if (!img) {
				return;
			}

			var width;
			var height;

			if (source.imgWidth && source.imgHeight) {
				
				width = source.imgWidth;
				height = source.imgHeight;

			}

			else {

				width = this.$containerEl[0].width;
				height = this.$containerEl[0].height;

			}

			this.$imgElement.attr( 'width', width );
			this.$imgElement.attr( 'height', height );

			this.$imgElement.attr( 'src', img );

		},

		_play 				: function() {

			this._updateButtons( 'play' );

			this.audio.play();

		},

		_pause 				: function() {

			this._updateButtons( 'pause' );

			this.audio.pause();

		},

		_stop				: function() {

			this._updateButtons( 'stop' );

			this.audio.removeAttribute("src");
			this.audio.load();

		},

		_reset				: function() {

			this._updateButtons( 'reset' );

			this._log("", true);

			this.audio.removeAttribute("src");
			this.audio.load();

		},

		_volUp				: function() {

			if (this.audio.volume >= 0.999) {
				return
			};

			this._updateButtons( 'volUp' );

			this.audio.volume += 0.1

		},

		_volDown			: function() {

			if (this.audio.volume <= 0.001) {
				return
			};

			this._updateButtons( 'volDown' );

			this.audio.volume -= 0.1

		},

		_log 				: function( message, clean ) {

			var _self = this;

			if (clean === undefined || clean === false) {

				message = _self.$logElement.val() + message + "\n";

			};

			_self.$logElement.val( message );

		},

		_progressDot		: function( progress ) {

			var text;

			if (progress % 5 == 0) {
				text = "";
			}
			else if (progress % 5 == 1) {
				text = ".";
			}
			else if (progress % 5 == 2) {
				text = "..";
			}
			else if (progress % 5 == 3) {
				text = "...";
			}
			else {
				text = "....";
			}

			return text;

		},

		_progressBar		: function( progress ) {

			var text;
			
			if (progress % 18 == 0) {
				text = "[===         ]";
			}
			else if (progress % 18 == 1) {			
				text = "[ ===        ]";
			}
			else if (progress % 18 == 2) {			
				text = "[  ===       ]";
			}
			else if (progress % 18 == 3) {			
				text = "[   ===      ]";
			}
			else if (progress % 18 == 4) {			
				text = "[    ===     ]";
			}
			else if (progress % 18 == 5) {			
				text = "[     ===    ]";
			}
			else if (progress % 18 == 6) {			
				text = "[      ===   ]";
			}
			else if (progress % 18 == 7) {			
				text = "[       ===  ]";
			}
			else if (progress % 18 == 8) {			
				text = "[        === ]";
			}
			else if (progress % 18 == 9) {			
				text = "[         ===]";
			}
			else if (progress % 18 == 10) {			
				text = "[       ===  ]";
			}
			else if (progress % 18 == 11) {			
				text = "[      ===   ]";
			}
			else if (progress % 18 == 12) {			
				text = "[     ===    ]";
			}
			else if (progress % 18 == 13) {			
				text = "[    ===     ]";
			}
			else if (progress % 18 == 14) {			
				text = "[   ===      ]";
			}
			else if (progress % 18 == 15) {			
				text = "[  ===       ]";
			}
			else if (progress % 18 == 16) {			
				text = "[ ===        ]";
			}
			else {
				text = "[===         ]";
			}

			return text;

		},

		_progressStar		: function( progress ) {

			var text;

			if (progress % 4 == 0) {
				text = "|";
			}
			else if (progress % 4 == 1) {	
				text = "/";
			}
			else if (progress % 4 == 2) {
				text = "-";
			}
			else {
				text = "\\";
			}

			return text;

		},

		_progressTime		: function( totalSeconds ) {

			var hours = parseInt( totalSeconds / 3600 ) % 24;
			var minutes = parseInt( totalSeconds / 60 ) % 60;
			var seconds = totalSeconds % 60;

			var text = 
			(hours < 10 ? "0" + hours : hours) + ":" + 
			(minutes < 10 ? "0" + minutes : minutes) + ":" + 
			(seconds  < 10 ? "0" + seconds : seconds);

			return text;

		},

	};


	/* Noise Radio Factory */

	$.fn.noiseRadio			= function( options ) {
		
		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'noiseRadio' );
				
				if ( !instance ) {

					window.console.error( "cannot call methods on noiseRadio prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				
				}
				
				if ( !$.isFunction( instance[ options ] ) || options.charAt(0) === "_" ) {

					window.console.error( "no such method '" + options + "' for noiseRadio instance" );
					return;
				
				}
				
				instance[ options ].apply( instance, args );
			
			});
		
		} 
		else {
		
			this.each(function() {
			
				var instance = $.data( this, 'noiseRadio' );
				
				if ( !instance ) {
					$.data( this, 'noiseRadio', new $.NoiseRadio( options, this ) );
				}

			});
		
		}
		
		return this;
		
	};






	/**
	 * @name		jQuery KnobKnob plugin
	 * @author		Martin Angelov
	 * @version 	1.0
	 * @url			http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
	 * @license		MIT License
	 */
	 
	 $.fn.knobKnob 				= function( props ) {
	
		var options = $.extend({
			snap: 0,
			value: 0,
			turn: function() {}
		}, props || {});
	
		var tpl = 	'<div class="knob">\
						<div class="top"></div>\
						<div class="base"></div>\
					</div>';
	
		return this.each( function() {
			
			var el = $( this );
			el.append( tpl );
			
			var knob 		= $( '.knob', el ),
				knobTop 	= knob.find( '.top' ),
				startDeg 	= -1,
				currentDeg 	= 0,
				rotation 	= 0,
				lastDeg 	= 0,
				doc 		= $( document );
			
			if (options.value > 0 && options.value <= 359) {

				rotation = lastDeg = currentDeg = options.value;
				knobTop.css( 'transform', 'rotate(' + ( currentDeg ) + 'deg)' );
				options.turn( currentDeg / 359 );

			}
			
			knob.on( 'mousedown touchstart', function(e) {
			
				e.preventDefault();
			
				var offset = knob.offset();
				var center = {
					y : offset.top + knob.height() / 2,
					x : offset.left + knob.width() / 2
				};
				
				var a, b, deg, tmp,
					rad2deg = 180 / Math.PI;
				
				knob.on( 'mousemove.rem touchmove.rem', function(e) {
					
					e 	= ( e.originalEvent.touches ) ? e.originalEvent.touches[0] : e;
					
					a 	= center.y - e.pageY;
					b 	= center.x - e.pageX;
					deg = Math.atan2( a, b ) * rad2deg;
					
					// we have to make sure that negative
					// angles are turned into positive:
					if (deg < 0) {
						deg = 360 + deg;
					}
					
					// Save the starting position of the drag
					if (startDeg == -1) {
						startDeg = deg;
					}
					
					// Calculating the current rotation
					tmp = Math.floor( ( deg - startDeg ) + rotation );
					
					// Making sure the current rotation
					// stays between 0 and 359
					if ( tmp < 0 ) {
						tmp = 360 + tmp;
					}
					else if ( tmp > 359 ) {
						tmp = tmp % 360;
					}
					
					// Snapping in the off position:
					if ( options.snap && tmp < options.snap ) {
						tmp = 0;
					}
					
					// This would suggest we are at an end position;
					// we need to block further rotation.
					if (Math.abs( tmp - lastDeg ) > 180) {
						return false;
					}
					
					currentDeg = tmp;
					lastDeg = tmp;
		
					knobTop.css( 'transform', 'rotate(' + ( currentDeg ) + 'deg)' );
					options.turn( currentDeg / 360 );

				} );
			

				doc.on( 'mouseup.rem  touchend.rem', function() {

					knob.off('.rem');
					doc.off('.rem');
					
					// Saving the current rotation
					rotation = currentDeg;
					
					// Marking the starting degree as invalid
					startDeg = -1;

				} );
			
			} );

		} );

	};


} )( window, jQuery );