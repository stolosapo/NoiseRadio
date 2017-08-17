( function( window, $, undefined ) {


	/* Noise Radio Oblect */

	$.NoiseRadio				= function ( options, element ) {

		this.$el = $(element);
		this._init(options);

	};

	$.NoiseRadio.defaults		= {

		sources			: [

			{ src: "noise/PinkNoise.mp3", timerId: undefined, iceCastStats: "", type: "audio/mpeg", title: "", imgWidth: "", imgHeight: "", images: [ 'img/noise.gif' ] },
			{ src: "noise/PinkNoise.ogg", timerId: undefined, iceCastStats: "", type: "audio/ogg", title: "", imgWidth: "", imgHeight: "", images: [ 'img/noise.gif' ] },

		],

		showImage		: true,
		showLogs		: false,
		showNavButons		: false,

		preload			: "none",
		loop			: true,
		fallbackMessage		: 'Your browser does not support the <code>audio</code> element.',

		/* volumeType = knob, controls */
		volumeType		: "knob",
		initialVolume		: 0.7,

		timerInterval		: 5000

	};

	$.NoiseRadio.prototype		= {

		_init			: function ( options ) {

			var _self = this;

			// the options
			this.options		= $.extend(true, {}, $.NoiseRadio.defaults, options);

			// create player
			_self._createPlayer();

			// load events
			_self._loadEvents();

		},

		_createPlayerDiv	: function( ) {

			this.$containerEl = $( '<div id="noise-radio" class="noise-radio"></div>' );

			this.$el.prepend( this.$containerEl );

		},

		_createPlayer		: function( ) {

			// Create the container of radio player
			this._createPlayerDiv();

			// create a new HTML5 audio element
			var template	='\
			<audio id="noise-element" preload="' + this.options.preload + '">\
				<p>' + this.options.fallbackMessage + '</p>\
			</audio>';

			this.$audioEl	= $( template );

			if (this.options.loop) {
				this.$audioEl.attr('loop', true);
			};

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

		_loadSources		: function( ) {

			var _self = this;

			$.each( this.options.sources, function( index, source ) {

				var s = $( '<source src="' + source.src + '" type="' + source.type + '">' );
				_self.$audioEl.append(s);

			} );

		},

		_createControls		: function( ) {

			var _self		= this;

			this.$controlsCont	= $( '<div class="nr-controls-container"></div>' );

			// this.$controls 	= $( '<ul class="nr-controls" />' );
			this.$controls 		= $( '<ul class="nr-controls" style="display:none;"/>' );

			this.$cPlay		= $( '<li class="nr-control-button nr-control-play">Play<span></span></li>' );
			this.$cPause		= $( '<li class="nr-control-button nr-control-pause">Pause<span></span></li>' );

			this.$cPrev		= $( '<li class="nr-control-button nr-control-prev">Prev<span></span></li>' );
			this.$cNext		= $( '<li class="nr-control-button nr-control-next">Next<span></span></li>' );

			this.$cStop		= $( '<li class="nr-control-button nr-control-stop">Stop<span></span></li>' );
			this.$cReset		= $( '<li class="nr-control-button nr-control-reset">Reset<span></span></li>' );

			this.$controls
				.append( this.$cPlay )
				.append( this.$cPause );


			if (this.options.showNavButons) {

				this.$controls
					.append( this.$cPrev )
					.append( this.$cNext );
			};


			this.$controls
				.append( this.$cStop )
				.append( this.$cReset )
				.appendTo( this.$controlsCont );

			this.$controlsCont
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

		_createVolControls	: function( ) {

			var _self = this;

			if ( this.options.volumeType === 'controls' ) {

				this.$cVolUp = $( '<li class="nr-control-button nr-control-vol-up">+<span></span></li>' );
				this.$cVolDown = $( '<li class="nr-control-button nr-control-vol-down">-<span></span></li>' );

				this.$controls
					.append( this.$cVolUp )
					.append( this.$cVolDown );

			}
			else if ( this.options.volumeType === 'knob' ) {

				this.$volume = $( '<div style="display:none;" class="nr-volume-wrap"><div class="nr-volume-control"><div class="nr-volume-knob"></div></div></div>')
				.appendTo( this.$controlsCont );

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

		_createStatusElement	: function( ) {

			var template = '\
			<div class="nr-status-element">\
				<div class="nr-status-header">\
					<h1 class="nr-status-title"></h1>\
				</div>\
				<div class="nr-status-prog-section">\
					<p class="nr-status-proggress"></p>\
				</div>\
				<div class="nr-status-info">\
					<p class="nr-status-info-title"></p>\
					<p class="nr-status-info-listeners"></p>\
				</div>\
			</div>';

			this.$statusElement = $( template );

			this.$statusElement.appendTo( this.$containerEl );
			this.$statusElement.show( );

		},

		_createLogElement	: function( ) {

			this.$logElement = $( '<textarea class="nr-log-element" readonly></textarea>' );

			this.$logElement.appendTo( this.$containerEl );

			if (this.options.showLogs) {
				this.$logElement.show( );
			}
			else {
				this.$logElement.hide( )	;
			}

		},

		_createImgElement	: function( ) {

			if ( this.options.showImage != true ) {
				return;
			}

			this.$imgElement = $( '<img class="nr-control-image"></img>' );

			this.$imgElement.appendTo( this.$containerEl );
			this.$imgElement.show( );

		},

		_loadEvents		: function( ) {

			var _self = this;

			_self._loadAudioEvents( );
			_self._loadLoggingEvents( );
			_self._loadControlEvents( );

		},

		_loadControlEvents	: function( ) {

			var _self = this;

			this.$cPlay.on( 'mousedown', function( e ) {

				_self._setButtonActive( $( this ) );
				_self._play( );

			} );

			this.$cPause.on( 'mousedown', function( e ) {

				_self._setButtonActive( $( this ) );
				_self._pause( );

			} );

			if (this.options.showNavButons) {
				this.$cPrev.on( 'mousedown', function( e ) {

					_self._setButtonActive( $( this ) );
					_self._prev( );

				} );

				this.$cNext.on( 'mousedown', function( e ) {

					_self._setButtonActive( $( this ) );
					_self._next( );

				} );
			};

			this.$cStop.on( 'mousedown', function( e ) {

				_self._setButtonActive( $( this ) );
				_self._stop( );

			} );

			this.$cReset.on( 'mousedown', function( e ) {

				_self._setButtonActive( $( this ) );
				_self._reset( );

			} );


			if (this.options.volumeType === "controls") {

				this.$cVolUp.on( 'mousedown', function( e ) {

					_self._setButtonActive( $( this ) );
					_self._volUp( );

				} );

				this.$cVolDown.on( 'mousedown', function( e ) {

					_self._setButtonActive( $( this ) );
					_self._volDown( );

				} );

			};

		},

		_loadAudioEvents	: function( ) {

			var _self = this;

			this.audio.addEventListener( 'error', function( e ) {

				var log = "error on: " + e.target.src;

				_self._log( log );

			}, true );

			this.$audioEl.on( 'loadstart', function( e ) {

				var log = "ready to play: " + this.currentSrc;

				_self._log( log );

				var currentSource = _self._findSource( );

				_self._showTitle( currentSource );
				_self._showRandomImage( currentSource );

			} );

			this.$audioEl.on( 'loadedmetadata', function( e ) {

				var log = "loaded metadata: " + this.currentSrc;

				_self._log( log );

				var currentSource = _self._findSource( );

				_self._showTitle( currentSource );
				_self._showRandomImage( currentSource );

				_self._removeTimerInfo( currentSource, true );
				_self._registerTimerInfo( currentSource );

			} );

			if ( !this.options.loop ) {
				this.$audioEl.on( 'ended', function( e ) {

					var text = "Ended";

					_self._changeStatus( text );

					var currentSource = _self._findSource( );
					var nextSource = _self._findNextSource( currentSource, true );

					if ( nextSource != undefined ) {
						this.src = nextSource.src;
						this.play( );
					}
					else {
						_self._stop();
					};


				} );
			};

		},

		_loadLoggingEvents	: function( ) {

			var _self = this;

			this.$audioEl.on( 'progress', function( e ) {

				if (this.paused) {
					return;
				};

				var text = "Playing";

				var timeStamp = e.timeStamp;
				var time = e.target.currentTime;
				var title = e.target.title;

				text = text + " " + title + " " + " [" + _self._progressTime(parseInt(time)) + "]";

				_self._changeStatus( text );

			} );


			this.$audioEl.on( 'playing', function( e ) {

				var text = "Playing";

				_self._changeStatus( text );

			} );


			this.$audioEl.on( 'pause', function( e ) {

				var text = "Paused";

				_self._changeStatus( text );

			} );


			this.$audioEl.on( 'play', function( e ) {

				var text = "Play";

				_self._changeStatus( text );

			} );


			this.$audioEl.on( 'seeked', function( e ) {

				var text = "Seeked";

				_self._changeStatus( text );

			} );


			this.$audioEl.on( 'seeking', function( e ) {

				var text = "Seeking";

				_self._changeStatus( text );

			} );

			this.$audioEl.on( 'waiting', function( e ) {

				var text = "Waiting";

				_self._changeStatus( text );

			} );


			this.$audioEl.on( 'emptied', function( e ) {

				var text = "Stopped";

				_self._changeStatus( text );

			} );

		},

		_setButtonActive	: function( $button ) {

			$button.addClass( 'nr-control-pressed' );

			setTimeout( function( ) {

				$button.removeClass( 'nr-control-pressed' );

			}, 100 );

		},

		_updateButtons		: function( button ) {

			var pressedClass = 'nr-control-active';

			if ( button === 'volUp' || button === 'volDown' ) {
				return;
			}

			this.$cPlay.removeClass( pressedClass );
			this.$cPause.removeClass( pressedClass );
			this.$cStop.removeClass( pressedClass );
			this.$cReset.removeClass( pressedClass );

			if ( this.options.volumeType === 'controls' ) {

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

		_findSource		: function( ) {

			var current = this.audio.currentSrc;
			var currentSource = {};

			$.each( this.options.sources, function( i, s ) {

				if ( current.endsWith( s.src ) ) {

					currentSource = s;

				}

			} );

			return currentSource;

		},

		_findNextSource		: function( currentSrc, next ) {

			var curSrc = currentSrc.src;
			var prevSrc;
			var nextSrc;

			var found = false;
			var foundCnt = 0;

			console.log(currentSrc, next);

			$.each( this.options.sources, function( index, src ) {

				found = curSrc.endsWith( src.src );

				if ( found && foundCnt === 0 ) {

					foundCnt++;

				}
				else if ( foundCnt === 1 ) {

					nextSrc = src;
					return false;

				}
				else if ( !found ) {

					prevSrc = src;

				};

			} );

			return next ? nextSrc : prevSrc;

		},

		_getRandomImage		: function( source ) {

			if ( !source.images || !this.options.showImage ) {
				return;
			}

			var len = source.images.length;

			if ( len === 1 ) {
				return source.images[0];
			}

			var index = Math.floor( Math.random( ) * len ) + 1 ;

			return source.images[index - 1];

		},

		_showRandomImage	: function( source ) {

			var img = this._getRandomImage( source );

			if ( !img ) {
				return;
			}

			var width;
			var height;

			if ( source.imgWidth && source.imgHeight ) {

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

		_showTitle		: function( source ) {

			var title = source.title;

			if ( !title ) {
				return;
			};

			this._changeTitle( title );

		},

		_play 			: function( ) {

			this._updateButtons( 'play' );

			this.audio.play( );

		},

		_pause 			: function( ) {

			this._updateButtons( 'pause' );

			this.audio.pause( );

		},

		_prev 			: function( ) {

			this._removeTimerInfo( this._findSource(), true );

			this._updateButtons( 'prev' );

			var currentSource	= this._findSource( );
			var prevSource		= this._findNextSource( currentSource, false );

			if ( prevSource != undefined ) {
				this.audio.src	= prevSource.src;
				this._play( );
			}
			else {
				this._stop( );
			};

		},

		_next 			: function( ) {

			this._removeTimerInfo( this._findSource(), true );

			this._updateButtons( 'next' );

			var currentSource	= this._findSource( );
			var nextSource		= this._findNextSource( currentSource, true );

			if ( nextSource != undefined ) {
				this.audio.src	= nextSource.src;
				this._play( );
			}
			else {
				this._stop( );
			};

		},

		_stop			: function( ) {

			this._removeTimerInfo( this._findSource(), true );

			this._updateButtons( 'stop' );

			this.audio.removeAttribute( "src" );
			this.audio.load( );

		},

		_reset			: function( ) {

			this._removeTimerInfo( this._findSource(), true );

			this._updateButtons( 'reset' );

			this._log( "", true );

			this.audio.removeAttribute( "src" );
			this.audio.load( );

		},

		_volUp			: function( ) {

			if ( this.audio.volume >= 0.999 ) {
				return
			};

			this._updateButtons( 'volUp' );

			this.audio.volume += 0.1

		},

		_volDown		: function( ) {

			if ( this.audio.volume <= 0.001 ) {
				return
			};

			this._updateButtons( 'volDown' );

			this.audio.volume -= 0.1

		},

		_log 			: function( message, clean ) {

			var _self = this;

			if (clean === undefined || clean === false) {

				message = _self.$logElement.val() + message + "\n";

			};

			_self.$logElement.val( message );

		},

		_changeStatus		: function( status ) {

			this.$statusElement.find( 'p.nr-status-proggress' ).text( status );

		},

		_changeTitle 		: function( title ) {

			this.$statusElement.find( 'h1.nr-status-title' ).text( title );
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

		_registerTimerInfo	: function( source ) {

			var _self = this;

			var id = setInterval( function( ) {

				_self._readIceCastInfo( source );

			}, _self.options.timerInterval );

			source.timerId = id;
			source.timerErrorCounter = 0;
		},

		_removeTimerInfo	: function( source, forced ) {

			if ( !source.timerId ) {
				return;
			};

			/* Remove timer after 3 failed tries */
			source.timerErrorCounter = source.timerErrorCounter + 1;

			if ( source.timerErrorCounter >= 3 || forced) {

				clearInterval( source.timerId );
				console.log( source, "timer cancled", forced );
			}
		},

		_readIceCastInfo	: function( source ) {

			var _self = this;
			var url = source.iceCastStats;

			if (!url) {
				return false;
			};

			this._requestGET(source, url, function( response ) {

				if ( !response ) {

					_self._removeTimerInfo( source );
					return;
				}

				var iceStats 	= response;

				var iceSource 	= $.grep( iceStats.icestats.source, function( v ) {

					return v.listenurl === source.src;

				} );

				if ( iceSource.length ) {

					_self._applyIceCastInfo( source, iceSource[ 0 ] );
				}
				else {

					console.log( "Cannot find status for '" + source.src + "' source" );
					_self._removeTimerInfo( source );
				};

			});

			return true;
		},

		_applyIceCastInfo	: function( source, sourceInfo ) {

			// console.log( "Title", sourceInfo.title );
			// console.log( "Listeners", sourceInfo.listeners );

			this.$statusElement
				.find( 'p.nr-status-info-listeners' )
				.text( 'Listeners: ' + sourceInfo.listeners + '/' + sourceInfo.listener_peak );

			this.$statusElement.find( 'p.nr-status-info-title' ).text( sourceInfo.title );

		},

		_requestGET		: function( source, url, callback ) {

			var _self = this;

			$.ajax({
				type: "GET",
				url: url,
				crossDomain: true,
				dataType: "json",
				success: callback,
				error: function( jqXHR, textStatus, errorThrown ) {

					console.log( jqXHR, textStatus, errorThrown );

					_self._removeTimerInfo( source );
				}
			});

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
