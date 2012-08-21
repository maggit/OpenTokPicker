// Generated by CoffeeScript 1.3.3
(function() {
  var DOWNLOAD, PROCESS, READY, RECORD, RSTOP, archiveClosedHandler, archiveCreatedHandler, archiveLoadedHandler, downloadURL, getDownloadUrl, interval, key, parseArchiveResponse, publisher, session, sessionConnectedHandler, sessionId, setRecordingCapability, streamCreatedHandler, streamDestroyedHandler, subscribeStreams, token, users;

  RECORD = "Record Videos";

  RSTOP = "Stop Recording";

  DOWNLOAD = "Process Video";

  PROCESS = "Video Processing...";

  READY = "Download";

  interval = "";

  key = $('#info').attr('key');

  sessionId = $('#info').attr('session');

  token = $('#info').attr('token');

  downloadURL = "";

  users = 0;

  TB.setLogLevel(TB.DEBUG);

  filepicker.setKey($('#info').attr('FPKey'));

  parseArchiveResponse = function(response) {
    console.log(response);
    if (response.status !== "fail") {
      window.clearInterval(interval);
      $('#startRecording').text(READY);
      downloadURL = 'http://' + response.url.split('https://')[1];
      return $('#processingMessage').fadeOut();
    }
  };

  getDownloadUrl = function() {
    return $.post("/archive/" + window.archive.archiveId, {}, parseArchiveResponse);
  };

  setRecordingCapability = function() {
    $('#startRecording').text(RECORD);
    $('#startRecording').addClass('recordButton');
    $('#startRecording').removeClass('initialButton');
    return $('#startRecording').click(function() {
      console.log("button click");
      console.log(window.archive);
      switch ($(this).text()) {
        case RECORD:
          if (window.archive === "") {
            session.createArchive(key, 'perSession', "" + (Date.now()));
          } else {
            session.startRecording(window.archive);
          }
          return $(this).text(RSTOP);
        case RSTOP:
          session.stopRecording(window.archive);
          session.closeArchive(window.archive);
          $(this).text(PROCESS);
          return $('#processingMessage').fadeIn();
        case READY:
          $('#endMessage').fadeIn();
          return filepicker.saveAs(downloadURL, 'video/mp4', function(url) {
            return $('#endMessage').fadeIn();
          });
      }
    });
  };

  archiveClosedHandler = function(event) {
    console.log(window.archive);
    return interval = window.setInterval(getDownloadUrl, 5000);
  };

  archiveCreatedHandler = function(event) {
    window.archive = event.archives[0];
    session.startRecording(window.archive);
    return console.log(window.archive);
  };

  archiveLoadedHandler = function(event) {
    window.archive = event.archives[0];
    return window.archive.startPlayback();
  };

  subscribeStreams = function(streams) {
    var div, divId, stream, _i, _len;
    for (_i = 0, _len = streams.length; _i < _len; _i++) {
      stream = streams[_i];
      if (stream.connection.connectionId === session.connection.connectionId) {
        return;
      }
      divId = "stream" + stream.streamId;
      div = $('<div />', {
        id: divId
      });
      $('#pubContainer').append(div);
      session.subscribe(stream, divId);
      users += 1;
    }
  };

  sessionConnectedHandler = function(event) {
    console.log(event.archives);
    if (event.archives[0]) {
      window.archive = event.archives[0];
    }
    subscribeStreams(event.streams);
    session.publish(publisher);
    users = event.streams.length;
    if (users === 0) {
      return setRecordingCapability();
    }
  };

  streamCreatedHandler = function(event) {
    return subscribeStreams(event.streams);
  };

  streamDestroyedHandler = function(event) {
    users -= 1;
    if (users === 0) {
      return setRecordingCapability();
    }
  };

  window.archive = "";

  publisher = TB.initPublisher(key, 'myPublisherDiv');

  session = TB.initSession(sessionId);

  session.addEventListener('sessionConnected', sessionConnectedHandler);

  session.addEventListener('streamCreated', streamCreatedHandler);

  session.addEventListener('streamDestroyed', streamDestroyedHandler);

  session.addEventListener('archiveCreated', archiveCreatedHandler);

  session.addEventListener('archiveClosed', archiveClosedHandler);

  session.addEventListener('archiveLoaded', archiveLoadedHandler);

  session.connect(key, token);

  $('#refresh').click(function() {
    return window.location = window.location;
  });

}).call(this);
