( function( window, $, undefined ) {

	/* Noise Module Object */

	$.NoiseModule				= function ( options, element, radio ) {

		this.$el = $( element );
		this.$radio = $( radio );

		this._init ( options );

	};

	$.NoiseModule.defaults		= {

		initialVolume	: 0.7

	};

	$.NoiseModule.prototype		= {

		_init						: function ( options ) {

			var _self = this;

			// the options
			this.options 		= $.extend( true, {}, $.NoiseModule.defaults, options );

			// create audio context
			_self._createAudioContext();

			_self._test();

		},

		_test						: function () {

			var whiteNoise 		= this._createWhiteNoise();
			var pinkNoise 		= this._createPinkNoise();
			var brownNoise 		= this._createBrownNoise();

			var sineWave 		= this._createSineWave();
			var sawWave 		= this._createSawToothWave();
			var squareWave 		= this._createSquareWave();
			var triangleWave	= this._createTriangleWave();

			var radioNode 		= this._createRadioNode();

			var gain 			= this._createGain( 0.7 );


			this._connectNodes ( sineWave, gain );
			// this._connectNodeToDestination ( gain );

			// console.log ( sineWave );

		},

		_createAudioContext			: function () {

			var audioContext; 

			if (typeof AudioContext !== "undefined") {     
				audioContext = new AudioContext(); 
			} 
			else if (typeof webkitAudioContext !== "undefined") {     
				audioContext = new webkitAudioContext(); 
			} 
			else {     
				throw new Error('AudioContext not supported. :('); 
			}

			this.audioContext = audioContext;

		},

		_createWhiteNoise			: function ( bufferSize ) {

			bufferSize = bufferSize || 4096;

			var node = this.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

			node.onaudioprocess = function ( e ) {

				var output = e.outputBuffer.getChannelData(0);

				for (var i = 0; i < bufferSize; i++) { 				
				
					output[i] = Math.random() * 2 - 1; 			
				};

			};

			return node;

		},

		_createPinkNoise			: function ( bufferSize ) {

			bufferSize = bufferSize || 4096;

			var b0, b1, b2, b3, b4, b5, b6;
			b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

			var node = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

			node.onaudioprocess = function( e ) {

				var output = e.outputBuffer.getChannelData(0);

				for (var i = 0; i < bufferSize; i++) { 				

					var white = Math.random() * 2 - 1;			

					b0 = 0.99886 * b0 + white * 0.0555179;
					b1 = 0.99332 * b1 + white * 0.0750759;
					b2 = 0.96900 * b2 + white * 0.1538520;
					b3 = 0.86650 * b3 + white * 0.3104856;
					b4 = 0.55000 * b4 + white * 0.5329522;
					b5 = -0.7616 * b5 - white * 0.0168980;

					output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
					output[i] *= 0.11; // (roughly) compensate for gain

					b6 = white * 0.115926;

				};
			};		

			return node;

		},

		_createBrownNoise			: function ( bufferSize ) {

			bufferSize = bufferSize || 4096;

			var lastOut = 0.0;
			var node = this.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

			node.onaudioprocess = function( e ) {

				var output = e.outputBuffer.getChannelData(0);

				for (var i = 0; i < bufferSize; i++) {

					var white = Math.random() * 2 - 1;

					output[i] = (lastOut + (0.02 * white)) / 1.02;
					lastOut = output[i];
					output[i] *= 3.5; // (roughly) compensate for gain

				};

			};

			return node;

		},

		_createOscillator			: function ( type, frequency ) {

			var wave = this.audioContext.createOscillator();

			wave.type = type || "sine";
			wave.frequency.value = frequency || 900;

			wave.start ( 0 );

			return wave;

		},

		_createSineWave				: function ( frequency ) {

			return this._createOscillator ( 'sine', frequency );

		},

		_createSawToothWave			: function ( frequency ) {

			return this._createOscillator ( 'sawtooth', frequency );

		},

		_createSquareWave			: function ( frequency ) {

			return this._createOscillator ( 'square', frequency );

		},

		_createTriangleWave			: function ( frequency ) {

			return this._createOscillator ( 'triangle', frequency );

		},

		_createRadioNode			: function () {

			var _self = this;

			var audio = _self.$radio.get( 0 );

			if (!audio) {
				return;
			};

			var source;

			audio.onplay = function () {

				var stream = audio.captureStream ();

				source = _self.audioContext.createMediaStreamSource ( stream );

			};
		

			return source;

		},

		_createGain					: function ( value ) {

			var gain = this.audioContext.createGain ();

			gain.gain.value = value || 0;

			return gain;

		},

		_connectNodeToDestination	: function ( node ) {

			this._connectNodes ( node, this.audioContext.destination );

		},

		_connectNodes				: function ( srcNode, destNode ) {

			srcNode.connect ( destNode );

		},

		_disconnectNodes			: function ( srcNode, destNode ) {

			srcNode.disconnect ( destNode );

		},

	};


	/* Noise Module Factory */

	$.fn.noiseModule 			= function ( options, radio ) {

		if ( typeof options === 'string' ) {
			
			var args = Array.prototype.slice.call( arguments, 1 );
			
			this.each(function() {
			
				var instance = $.data( this, 'noiseModule' );
				
				if ( !instance ) {

					window.console.error( "cannot call methods on noiseModule prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;
				
				}
				
				if ( !$.isFunction( instance[ options ] ) || options.charAt(0) === "_" ) {

					window.console.error( "no such method '" + options + "' for noiseModule instance" );
					return;
				
				}
				
				instance[ options ].apply( instance, args );
			
			});

			return this;
		
		} 
		else {
		
			var instance;

			this.each(function() {
			
				instance = $.data( this, 'noiseModule' );
				
				if ( !instance ) {

					instance = new $.NoiseModule( options, this, radio );

					$.data( this, 'noiseModule', instance );
				}

			});

			return instance;
		
		}

	};


} )( window, jQuery );