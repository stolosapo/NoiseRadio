# NoiseRadio
A HTML5 audio player, suitable for radio stations

you can view a demo [here](https://stolosapo.github.io/NoiseRadio/)

## Install
To install the `NoiseRadio` module, just copy the `js/noise-radio.js` and `css/noise-radio.css` files in your website. Then in the `index.html` or in any `.html` page (that we want to add the `NoiseRadio` module) add the following in `<head>` section

```HTML
<link rel="stylesheet" type="text/css" href="css/noise-radio.css" />
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script src="js/noise-radio.js"></script>
```

then in `<head>` section again, add a `<script>` as following

```HTML
<script type="text/javascript">

	$(document).ready(function() {

		$('body').noiseRadio( {

			sources: [

				{
					src: "http://giss.tv:8000/thefirstkube.mp3",
					type: "audio/mpeg",
					title: ".. dance dance dance dance dance to the radio ..",
					imgWidth: "576px",
					imgHeight: "382px",
					images: [
						'img/pic1.jpg',
						'img/pic2.jpg',
						'img/pic3.jpg',
						'img/pic4.jpg'
						]
				},

				{
					src: "http://giss.tv:8001/thefirstkube.mp3",
					type: "audio/mpeg",
					title: ":: Failover",
					imgWidth: "576px",
					imgHeight: "382px",
					images: [
						'img/pic1.jpg',
						'img/pic2.jpg',
						'img/pic3.jpg',
						'img/pic4.jpg'
						]
				},

				{
					src: "noise/PinkNoise.mp3",
					type: "audio/mpeg",
					title: "Down",
					images: [ 'img/noise.gif' ]
				},

				{
					src: "noise/PinkNoise.ogg",
					type: "audio/ogg",
					title: "Down",
					images: [ 'img/noise.gif' ]
				}
			],

		} );

	});

</script>
```

what that `<script>` means?

This `<script>` says that when `$(document)` is ready then create a new `noiseRadio` module inside `<body>` section. Here we can choose any other `<div>` if we don't want the `<body>`.

Then we pass as argument in the `noiseRadio` module some configurations...


## Configuration

In order to configure the `NoiseRadio` module, we have to pass in the `noiseRadio()` function some configurations. If we don't pass any, then the `noiseRadio` uses the default configurations whitch are the following

```JavaScript
{

	sources: [

		{ src: "noise/PinkNoise.mp3", type: "audio/mpeg", title: "", imgWidth: "", imgHeight: "", images: [ 'img/noise.gif' ] },
		{ src: "noise/PinkNoise.ogg", type: "audio/ogg", title: "", imgWidth: "", imgHeight: "", images: [ 'img/noise.gif' ] },

	],

	showImage		: true,
	showLogs		: false,

	preload			: "none",
	loop			: true,
	fallbackMessage		: 'Your browser does not support the <code>audio</code> element.',

	/* volumeType = knob, controls */
	volumeType		: "knob",
	initialVolume		: 0.7

};
```

Let's see them one by one..


#### Sources

Here we add the radio sources that the module want to load. We can pass more than one. When one source fail to load then fallback to the next source.

Each `source` has the following extra configurations

###### src

This is the actual source that we want to load. It can be a stream like a radio station (like: `http://giss.tv:8000/thefirstkube.mp3`) or can be a file in our system or a url to this file (like: `noise/PinkNoise.mp3`)

###### type

This is the type of the source it can be `audio/mpeg` or `audio/ogg` or any other suppoted `<audio>` [types](https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats)

###### title

This is the `title` of the source it displayed when the source is loaded

###### images

Here we can add images to that source. The images can be files in our system or remote files. These images will be displayed when a source is `loaded` and `loadedmetadata`. When these two events are triggered then a random image is picked and displayed.

###### imgWidth / imgHeight

The size of images


#### showImage

A flag (`true | false`) that indicates if we want to use the `images` functionality or not.

#### showLogs

A flag (`true | false`) that indicates if we want to see logs from `NoiseRadio` module. Logs for some events used for extra info or debug reasons.

#### preLoad

An `enum` for `<audio>` [element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio)

#### fallbackMessage

A message that will diplayed when the browser is not support `<audio>` element.

#### volumeType

An `enum` that indicated the type of volume.

###### knob

It displayed like a knob

###### controls

It displays two extra buttons (`+ | -`) that controls the volume

#### initialVolume

The initial volume of the `NoiseRadio` module


Enjoy...
