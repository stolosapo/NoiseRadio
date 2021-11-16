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

also in the `<body>` section call the construct method as example:
```HTML
<script type="text/javascript">
    // This method is an example method from js/example.js
    radioInit();
</script>
```

then you can use the `AudioClass` as shown in the `js/example.js`.


## `audio.js` Configuration

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

#### `statusElId`

This is the element id of the element that we want to change the status. The status is changed based on the events that we have registered in the `audioEvents` property. Then the status is changed then a class with the specific `audioEvents.status` will be added in the givent element

#### `descriptionElId` and `descriptionElTag`

This is the element id and the tag of the element that we want to change the description when that status of audio changed. Again this is related with the `audioEvents` property and is gonna change accordingly.

#### `clickablePlayElId`

This is the element id of the element that on click will trigger the `play` event of the `<audio>` element. This element should have a `click` event

#### `clickablePauseElId`

This is the element id of the element that on click will trigger the `pause` event of the `<audio>` element. This element should have a `click` event

#### `clickableReloadElId`

This is the element id of the element that on click will trigger the `load` event of the `<audio>` element. This element should have a `click` event

#### `inputVolumeElId`

This is the element id of the element that on input will adjust the volume of the `<audio>` element. This element should have a `input` event

#### `autoplay`, `controls`, `loop`, `preload`, `muted` and `volume`

These properties are original `<audio>` element's properties and passed direct to the element.

#### `log`

This property will enable or disbale logs in console

#### `sources`

This property is responsible to add all the different sources that we want to load into `<audio>` element. If this is empty then will `<audio>` will use the already `sources` as these are created in the `html` file (if any).

Example of `source`:
```JavaScript
{
    id: 0,
    title: "This is a RadioStation",
    description: ".. with the best music in town ..",
    src: "https://www.thebestradio.com/live.mp3",
    type: "audio/mpeg"
}
```

#### `useDefaultEventHandler`, `addAllEvents`, `allAudioEvents` and `defaultAudioEventHandler`

The `useDefaultEventHandler` property indicates if the lib should use the `defaultAudioEventHandler` method for `allAudioEvents` only in case of the `addAllEvents` property is `true`. Usually those properties are useful for debug resons in order to understand how the events of `<audio>` works.

#### `audioEvents`

This property is responsible to add all those events that we want to enable in our app. 

Example of `audioEvent`: 
```JavaScript
// This meens that we want to add an event on `error` and as handler will have the given,
// when this event will triggered then will add the `class` "error" on the status element 
// That we have already set in the above config, and also will add the description "error"
// in the description element that also set in the above config.
{
    name: "error",
    handler: function(audio) { 
        return function(e) { 
            console.error(audio, e); 
        }; 
    },
    status: "error",
    description: "error"
}
```

All the existing valid event that the `<audio>` element supports are:
```JavaScript
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
```

## `icecast-info.js` Configuration

The `icecast-info` is a class that is usefull when we want to use an Icecast server as a streaming server and when we want to get some informations abaout the stream that we want like current track, listeners and listeners peek count..
In order to use it we must create an `IcecastInfo` class with some params as config or the defaults as following
Also in order to be able for the library to work the Icecast streaming server should have a running `/status-json.xsl` endpoint

```JavaScript
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
```

Let's see them one by one..

#### `sources`

In this property we should set all those sources that we want to take infos

Example:
```JavaScript
// This means that we want to get info for the `src` (of the <audio>) "https://stream.thefirstkube.net/stream.mp3"
// and we will make a request to `statusUrl`, in this response we will search for the `listenUrl` if any or else in 
// the `fallbackListenUrl`, if found then we will be able to read the informations of this stream
{
    src: "https://stream.thefirstkube.net/stream.mp3",
    listenUrl: "http://stream.thefirstkube.net:80/live.mp3",
    fallbackListenUrl: "http://stream.thefirstkube.net:80/thefirstkube.mp3",
    statusUrl: "https://noise-module-service.herokuapp.com/icestats/get?url=https://stream.thefirstkube.net/status-json.xsl"
}
```

#### `applyIceCastInfo`

In this property we set the function to run when this icecast information found.

Example:
```JavaScript
let applyIceCastInfo = function(sourceInfo) {
    console.log("applyIceCastInfo", sourceInfo);
}
```

#### `resetIceCastInfo`

In this property we set the function to run when a changed of `<audio>` `src` happen.

Example:
```JavaScript
let resetIceCastInfo = function() {
    console.log("resetIceCastInfo");
}
```

#### `timerInterval`

This property indicates the interval (milliseconds) that the lib should call the `statusUrl` in order to get new values. 

#### `timerErrorThreshold`

When the request to `statusUrl` fails after `timerErrorThreshold` times then cancel all calls to `statusUrl` until a `resetIceCastInfo` called.

Always you can navigate on `js/example.js` in method `radioInit` to see a running example

Try, Experiment and Enjoy...
