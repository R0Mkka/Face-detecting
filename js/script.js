const { tinyFaceDetector, faceLandmark68Net, faceExpressionNet } = faceapi.nets;

const video = document.getElementById('video');
const contentEl = document.querySelector('.content');
const peopleCountEl = document.querySelector('.people-count__number');

Promise.all([
  loadFromNet(tinyFaceDetector),
  loadFromNet(faceLandmark68Net),
  loadFromNet(faceExpressionNet),
]).then(startVideo);

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  const context = canvas.getContext('2d');
  const displaySize = {
    width: video.width,
    height: video.height,
  };

  contentEl.append(canvas);
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      // .withFaceLandmarks()
      // .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    context.clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    peopleCountEl.textContent = detections.length.toString();
  }, 100);
});

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err),
  );
}

function loadFromNet(net) {
  return net.loadFromUri('./models');
}
