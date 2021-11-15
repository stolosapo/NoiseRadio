# NoiseRadio
A HTML5 audio player, suitable for WebRadio streams and more...

you can view a demo [here](https://stolosapo.github.io/NoiseRadio/)

## Install
To install the `NoiseRadio` module, just copy the `js/audio.js` file in your website. In case that you may want to use an Icecast stream then you can use also the `js/icecast-info.js`. This file can get the informations of the stream you want to play like current playing track, current and max listeners. Then in the `index.html` or in any `.html` page (that you want to add the `NoiseRadio` module) add the following in `<head>` section

```HTML
<!-- The icecast-info is optional -->
<script src="js/icecast-info.js"></script>
<script src="js/audio.js"></script>
```

then you can use the `AudioClass` as shown in the `js/example.js`.


## Configuration

In order to configure the `AudioClass` module, we have to pass some configurations. If we don't pass any, then the `AudioClass` uses the default configurations whitch are the following

```JavaScript
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
```

Let's see them one by one..


#### `audioElId`

This is the element id of the `<audio>` that we want to wrap.

<!-- ###### src

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

The initial volume of the `NoiseRadio` module -->


Enjoy...
