console.log("Hi, I have been injected whoopie!!!");

var recorder = null;
var stopRecordingButton = null;

function onAccessApproved(stream) {
  recorder = new MediaRecorder(stream);

  recorder.start();

  recorder.onstop = function () {
    stream.getTracks().forEach(function (track) {
      if (track.readyState === "live") {
        track.stop();
      }
    });

    // Remove the stop button when recording is stopped
    if (stopRecordingButton && stopRecordingButton.parentNode) {
      stopRecordingButton.parentNode.removeChild(stopRecordingButton);
    }
  };

  recorder.ondataavailable = function (event) {
    let recordedBlob = event.data;
    let url = URL.createObjectURL(recordedBlob);

    let a = document.createElement("a");

    a.style.display = "none";
    a.href = url;
    a.download = "screen-recording.webm";

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  // Create and style the stop button
  stopRecordingButton = document.createElement("button");
  stopRecordingButton.textContent = "Stop Recording";
  stopRecordingButton.id = "stop-recording-button";

  // Apply CSS styles to the button for larger size and better visibility
  stopRecordingButton.style.borderRadius = "5px";
  stopRecordingButton.style.position = "fixed";
  stopRecordingButton.style.bottom = "10px";
  stopRecordingButton.style.left = "10px";
  stopRecordingButton.style.backgroundColor = "black"; // Set background color to black
  stopRecordingButton.style.color = "white"; // Set text color to white
  stopRecordingButton.style.width = "250px"; // Increased width to 250px
  stopRecordingButton.style.height = "100px"; // Increased height to 100px
  stopRecordingButton.style.fontSize = "24px"; // Increase font size for better visibility

  stopRecordingButton.addEventListener("click", function () {
    if (recorder) {
      recorder.stop();
    }
  });

  // Append the stop button to the body
  document.body.appendChild(stopRecordingButton);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "request_recording") {
    console.log("requesting recording");

    sendResponse(`processed: ${message.action}`);

    navigator.mediaDevices
      .getDisplayMedia({
        audio: true,
        video: {
          width: 9999999999,
          height: 9999999999,
        },
      })
      .then((stream) => {
        onAccessApproved(stream);
      });
  }

  if (message.action === "stopvideo") {
    console.log("stopping video");
    sendResponse(`processed: ${message.action}`);
    if (!recorder) return console.log("no recorder");

    recorder.stop();
  }
});
