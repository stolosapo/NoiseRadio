let loadedMetadataEvent = function(icecastInfo) {
    return function(audio) {
        return function(e) {

            document.getElementById("listen").href = e.srcElement.currentSrc;

            icecastInfo.register(e.srcElement.currentSrc);
        }
    }
}

let seekedEvent = function(audio) {
    return function(e) {
        console.error("Source on Seeked Event!! Start reloading..", e);
        audio.load();
        console.log("Source reloaded");
        audio.play();
    }
};

let errorEvent = function(audio) {
    return function(e) {
        console.error(e);
    }
}

let progressEvent = function(audio) {
    return function(e) {

        // console.log(e);

        document.getElementById("current-time").textContent = audio.progressTime();
        document.getElementById("current-progressbar").value = audio.getCurrentTime();
    }
};

let timeUpdateEvent = function(audio) {
    return function(e) {

        // console.log(e);

        let duration = audio.getDuration();

        if (duration === undefined ||
            duration === Infinity ||
            duration === NaN) {
            return;
        }

        let delimiter = audio.durationTime() === "" ? "" : " / ";

        document.getElementById("current-duration").textContent = `${delimiter}${audio.durationTime()}`;
        document.getElementById("current-progressbar").max = duration;
    };
};

let eventFactory = function(name, handler, status, description) {
    return {
        name: name,
        handler: handler,
        status: status,
        description: description
    };
}

let applyIceCastInfo = function(sourceInfo) {

    // console.log("applyIceCastInfo", sourceInfo);

    document.getElementById("listeners-container").style.display = "block";
    document.getElementById("track-container").style.display = "block";

    document.getElementById("current-listeners").textContent = sourceInfo.listeners;
    document.getElementById("current-listener-peak").textContent = " / " + sourceInfo.listener_peak;
    document.getElementById("current-track").textContent = sourceInfo.title;
}

let resetIceCastInfo = function() {

    // console.log("resetIceCastInfo");

    document.getElementById("listeners-container").style.display = "none";
    document.getElementById("track-container").style.display = "none";

    document.getElementById("current-listeners").textContent = "";
    document.getElementById("current-listener-peak").textContent = "";
    document.getElementById("current-track").textContent = "";
}

let icecastInfoInit = function() {

    let config = IcecastInfo.defaults;

    config.sources = [
        {
            src: "https://stream.thefirstkube.net/stream.mp3",
            listenUrl: "http://stream.thefirstkube.net:80/live.mp3",
            fallbackListenUrl: "http://stream.thefirstkube.net:80/thefirstkube.mp3",
            statusUrl: "https://noise-module-service.herokuapp.com/icestats/get?url=https://stream.thefirstkube.net/status-json.xsl"
        },
    ];

    config.applyIceCastInfo = applyIceCastInfo;
    config.resetIceCastInfo = resetIceCastInfo;

    let icecastInfo = new IcecastInfo(config);

    return icecastInfo;
}

let radioInit = function() {

    let icecastInfo = icecastInfoInit();

    let audioConfig = AudioClass.defaults;

    audioConfig.audioElId = "radio-audio";
    audioConfig.statusElId = "play";
    audioConfig.descriptionElId = "play";
    audioConfig.descriptionElTag = "textContent";
    audioConfig.clickablePlayElId = "play";
    audioConfig.clickablePauseElId = "play";
    audioConfig.clickableReloadElId = "reload";
    audioConfig.inputVolumeElId = "volume";
    audioConfig.preload = "metadata";
    audioConfig.log = true;

    let loadedmetadata = eventFactory("loadedmetadata", loadedMetadataEvent(icecastInfo), "loadedmetadata", "play");
    let loadstart = eventFactory("loadstart", undefined, "loadstart", "loadstart");
    let error = eventFactory("error", errorEvent, "error", "error");
    let play = eventFactory("play", undefined, "play", "pause");
    let playing = eventFactory("playing", undefined, "playing", "pause");
    let progress = eventFactory("progress", progressEvent);
    let pause = eventFactory("pause", undefined, "pause", "play");
    let waiting = eventFactory("waiting", undefined, "waiting", "waiting");
    let ratechange = eventFactory("ratechange", undefined, "ratechange", "ratechange");
    let seeked = eventFactory("seeked", seekedEvent, "seeked", "seeked");
    let seeking = eventFactory("seeking", undefined, "seeking", "seeking");
    let emptied = eventFactory("emptied", undefined, "emptied", "emptied");
    let timeupdate = eventFactory("timeupdate", timeUpdateEvent);

    audioConfig.audioEvents = [
        loadstart,
        loadedmetadata,
        error,
        play,
        playing,
        progress,
        pause,
        waiting,
        ratechange,
        seeked,
        seeking,
        emptied,
        timeupdate
    ];

    let audioClass = new AudioClass(audioConfig);

    // console.log(audioClass);
};
