( function( window, $, undefined ) {

	/* Noise Module Object */

	$.NoiseModule				= function ( options, element, radio ) {

		this.$el = $( element );
		this.$radio = $( radio );

		this._init ( options );

	};

	$.NoiseModule.defaults		= {

		/* Node Type :
			noise 				{ white, pink, brown }
			oscillator 			{ sine, square, sawtooth, triangle }
			biquadfilter 		{ lowpass, highpass, bandpass, lowshelf, highshelf, peaking, notch, allpass }
			delay
			dynamicscompressor
			gain
			stereopannernode
			waveshapernode
			periodicwave
			analyser
		*/
		modules 				: [

			{ name: "WhiteNoise", nodeType: "noise", type: "white" },
			{ name: "SineWave", nodeType: "oscillator", type: "sine" },
			{ name: "Gain", nodeType: "gain", type: "" }

		],

		connections				: [

			{ srcNode: "WhiteNoise", destNode: "Gain" },
			// { srcNode: "Gain", destNode: "output" }

		],

		oscillatorFrequency		: 900,
		oscillatorDetune		: 100,

		biquadFilterFrequency	: 900,
		biquadFilterDetune		: 400,
		biquadFilterQ 			: 100,
		biquadFilterGain		: 25,

		delayTime				: 5.0,

		compressorThreshold 	: -50,
		compressorKnee			: 40,
		compressorRatio 		: 12,
		compressorReduction		: -20,
		compressorAttack		: 0,
		compressorRelease		: 0.25,

		gainGain				: 0.7,

		stereoPannerPan			: 0,

		waveShapperCurveAmount	: 400,

		/* none, 2x, 4x */
		waveShapperOversample	: '4x', 

		periodicWaveRealArray	: new Float32Array( [ 0, 1 ] ),
		periodicWaveImagArray	: new Float32Array( [ 0, 0 ] ),
		periodicWaveDisableNorm	: false,

		analyserFftSize			: 2048,

	};

	$.NoiseModule.prototype		= {

		_init						: function ( options ) {

			// the options
			this.options 		= $.extend( true, {}, $.NoiseModule.defaults, options );

			// initialize counters
			this.moduleCounter	= 0;
			this.moduleMap		= [];

			// create audio context
			this._createAudioContext();

			// create modules
			this._createModules();

		},

		_test						: function ( ) {

			var whiteNoise 		= this._createWhiteNoise();
			var pinkNoise 		= this._createPinkNoise();
			var brownNoise 		= this._createBrownNoise();

			var sineWave 		= this._createSineWave();
			var sawWave 		= this._createSawToothWave();
			var squareWave 		= this._createSquareWave();
			var triangleWave	= this._createTriangleWave();

			var radioNode 		= this._createRadioNode();

			var gain 			= this._createGain();

			var biquadFilter 	= this._createBiquadFilter();
			var delay 			= this._createDelay();

			var panner 			= this._createStreoPanner();

			var periodicWave 	= this._connectPeriodicWave ( sineWave );

			this._connectNodes ( sineWave, biquadFilter );

			this._connectNodes ( biquadFilter, delay );

			this._connectNodes ( delay, panner );

			this._connectNodes ( panner, gain );
			// this._connectNodeToDestination ( gain );

			console.log ( sineWave );

		},

		_createAudioContext			: function ( ) {

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

		_createModules				: function ( ) {

			// create container for all modules
			this.$containerEl = $( '<div id="noise-module-container" class="noise-module-container"></div>' );

			this.$el.prepend( this.$containerEl );

			var _self = this;

			
			// create all modules
			$.each( this.options.modules, function( index, module ) {

				_self._createModule( module );

			} );


			// create module connections
			$.each( this.options.connections, function( index, connection ) {

				_self._createConnection( connection );

			} );

		},

		_createModule				: function ( module ) {

			var audioNode 		= this._createAudioNode( module );

			// create div for module
			this._createModuleDiv( module, audioNode );

			// register audio node
			var moduleItem = { name: module.name, node: audioNode };
			this.moduleMap.push( moduleItem );

			// increase module counter
			this.moduleCounter++;

		},

		_createModuleDiv			: function ( module, audioNode ) {

			var name 			= module.name;
			var moduleNumber 	= this._getNextModuleNumber ( );
			var moduleId 		= "module" + moduleNumber;
			var nodeType 		= module.nodeType;
			
			var template 		= '\
			<div id="' + moduleId + '" class="noise-module ' + nodeType + '">\
				<div class="noise-module-content">\
					<h6 class="noise-module-content-title">' + name + '</h6>\
				</div>\
			</div>';

			var $divEl 			= $( template );

			// append content
			this._appendContentToModule( $divEl, nodeType, audioNode );

			$divEl.appendTo( this.$containerEl );
			$divEl.show();

		},

		_appendContentToModule		: function ( $moduleEl, nodeType, audioNode ) {

			if ( nodeType === "noise" ) {
				return this._createNoiseDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "oscillator" ) {
				return this._createOscillatorDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "biquadfilter" ) {
				return this._createBiquadFilterDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "delay" ) {
				return this._createDelayDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "dynamicscompressor" ) {
				return this._createDynamicsCompressorDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "gain" ) {
				return this._createGainDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "stereopannernode" ) {
				return this._createStreoPannerDiv( $moduleEl, audioNode );
			};

			if ( nodeType === "waveshapernode" ) {
				return this._createWaveShaperDiv( $moduleEl, audioNode );
			};

			// if ( nodeType === "periodicwave" ) {

			// };

			if ( nodeType === "analyser" ) {
				return this._createAnalyserDiv( $moduleEl, audioNode );
			};

		},

		_createAudioNode			: function ( module ) {

			var nodeType = module.nodeType;

			if ( nodeType === "noise" ) {
				return this._createNoise( module.type );
			};

			if ( nodeType === "oscillator" ) {
				return this._createOscillator( module.type );
			};

			if ( nodeType === "biquadfilter" ) {
				return this._createBiquadFilter( module.type );
			};

			if ( nodeType === "delay" ) {
				return this._createDelay();
			};

			if ( nodeType === "dynamicscompressor" ) {
				return this._createDynamicsCompressor();
			};

			if ( nodeType === "gain" ) {
				return this._createGain();
			};

			if ( nodeType === "stereopannernode" ) {
				return this._createStreoPanner();
			};

			if ( nodeType === "waveshapernode" ) {
				return this._createWaveShaper();
			};

			// if ( nodeType === "periodicwave" ) {

			// };

			if ( nodeType === "analyser" ) {
				return this._createAnalyser();
			};

		},

		_createConnection			: function ( connection ) {

			var srcNode = this._findAudioNode( connection.srcNode );
			var destNode;

			if ( connection.destNode === "output" ) {
				
				this._connectNodeToDestination( srcNode );

			}
			else {
				
				destNode = this._findAudioNode( connection.destNode );
				this._connectNodes( srcNode, destNode );

			};

		},

		_findAudioNode				: function ( moduleName ) {

			var node;

			$.each( this.moduleMap, function( index, map ) {

				if ( map.name === moduleName ) {
					
					node = map.node;
					return;

				};

			} );

			return node;

		},

		_getNextModuleNumber		: function ( ) {

			return this.moduleCounter + 1;

		},

		_createNoise 				: function ( type ) {

			if ( type === "white" ) {
				return this._createWhiteNoise();
			};

			if ( type === "pink" ) {
				return this._createPinkNoise();
			};

			if ( type === "brown" ) {
				return this._createBrownNoise();
			};

		},

		_createNoiseDiv 			: function ( $moduleEl, audioNode ) {

			var template 	= '<img src=""></img>';

			var $divEl		= $( template );
			$divEl.appendTo( $moduleEl );

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

			var node = this.audioContext.createScriptProcessor ( bufferSize, 1, 1 );

			node.onaudioprocess = function( e ) {

				var output = e.outputBuffer.getChannelData ( 0 );

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

		_createOscillator			: function ( type ) {

			var wave = this.audioContext.createOscillator();

			wave.type = type;
			wave.frequency.value = this.options.oscillatorFrequency;
			wave.detune.value = this.options.oscillatorDetune;

			wave.start ( 0 );

			return wave;

		},

		_createOscillatorDiv		: function ( $moduleEl, audioNode ) {

		},

		_createSineWave				: function ( ) {

			return this._createOscillator ( 'sine' );

		},

		_createSawToothWave			: function ( ) {

			return this._createOscillator ( 'sawtooth' );

		},

		_createSquareWave			: function ( ) {

			return this._createOscillator ( 'square' );

		},

		_createTriangleWave			: function ( ) {

			return this._createOscillator ( 'triangle' );

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

		_createGain					: function ( ) {

			var gain = this.audioContext.createGain ();

			gain.gain.value = this.options.gainGain;

			return gain;

		},

		_createGainDiv				: function ( $moduleEl, audioNode ) {

		},

		_createBiquadFilter			: function ( type ) {

			var node = this.audioContext.createBiquadFilter();

			node.type = type;
			node.frequency.value = this.options.biquadFilterFrequency;
			node.detune.value = this.options.biquadFilterDetune;
			node.Q.value = this.options.biquadFilterQ;
			node.gain.value = this.options.biquadFilterGain;

			return node;

		},

		_createBiquadFilterDiv		: function ( $moduleEl, audioNode ) {

		},

		_createDelay				: function ( ) {

			var node = this.audioContext.createDelay ();

			node.delayTime.value = this.options.delayTime;

			return node;

		},

		_createDelayDiv				: function ( $moduleEl, audioNode ) {

		},

		_createDynamicsCompressor	: function ( ) {

			var node = this.audioContext.createDynamicsCompressor ();

			node.threshold.value = this.options.compressorThreshold;
			node.knee.value = this.options.compressorKnee;
			node.ratio.value = this.options.compressorRatio;
			node.reduction.value = this.options.compressorReduction;
			node.attack.value = this.options.compressorAttack;
			node.release.value = this.options.compressorRelease;

			return node;

		},

		_createDynamicsCompressorDiv: function ( $moduleEl, audioNode ) {

		},

		_createStreoPanner			: function ( ) {

			var node = this.audioContext.createStereoPanner ( );

			node.pan.value = this.options.stereoPannerPan;

			return node;

		},

		_createStreoPannerDiv		: function ( $moduleEl, audioNode ) {

		},

		_createDistortionCurve		: function ( amount ) {

			var k = typeof amount === 'number' ? amount : 50;
		    var n_samples = 44100;

		    var curve = new Float32Array(n_samples);
		    var deg = Math.PI / 180;
		    var i = 0
		    var x;

			for ( ; i < n_samples; ++i ) {
				
				x = i * 2 / n_samples - 1;

				curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
			}

			return curve;

		},

		_createWaveShaper			: function ( ) {

			var node = this.audioContext.createWaveShaper ( );

			node.curve = this._createDistortionCurve ( this.options.waveShapperCurveAmount );
			node.oversample = this.options.waveShapperOversample;

			return node;

		},

		_createWaveShaperDiv		: function ( $moduleEl, audioNode ) {

		},

		_createAnalyser				: function ( ) {

			var analyser = this.audioContext.createAnalyser ( );

			analyser.fftSize = this.options.analyserFftSize;

			var bufferLength = analyser.frequencyBinCount;
			var dataArray = new Uint8Array ( bufferLength );
			
			analyser.getByteTimeDomainData ( dataArray );

			return analyser;

		},

		_createAnalyserDiv			: function ( $moduleEl, audioNode ) {

		},

		_connectPeriodicWave		: function ( oscillator ) {

			var wave = this.audioContext.createPeriodicWave(
				this.options.periodicWaveRealArray, 
				this.options.periodicWaveImagArray, 
				{
					disableNormalization: this.options.periodicWaveDisableNorm
				});

			oscillator.setPeriodicWave ( wave );

			return wave;

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