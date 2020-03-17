const { tinyFaceDetector, faceLandmark68Net, faceRecognitionNet, faceExpressionNet } = faceapi.nets;

const video = document.getElementById('video');
const contentEl = document.querySelector('.content');
const peopleCountEl = document.querySelector('.people-count__number');

const expressionsCheckbox = document.getElementById('expressions-checkbox');
const landmarksCheckbox = document.getElementById('landmarks-checkbox');

Promise.all([
  loadFromNet(tinyFaceDetector),
  loadFromNet(faceLandmark68Net),
  loadFromNet(faceRecognitionNet),
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
    const faceDetections = await determineFaceDetections();

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    drawResults(faceDetections, canvas, displaySize);
    
    peopleCountEl.textContent = faceDetections.length.toString();
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

async function determineFaceDetections() {
  switch (true) {
    case expressionsOnly():
      return await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();
    case landmarksOnly():
      return await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
    case expressionsAndLandmarks():
      return await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
    default:
      return await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
  } 
}

function drawResults(faceDetections, canvas, displaySize) {
  const resizedDetections = faceapi.resizeResults(faceDetections, displaySize);

  faceapi.draw.drawDetections(canvas, resizedDetections);

  switch (true) {
    case expressionsOnly():
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      break;
    case landmarksOnly():
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      break;
    case expressionsAndLandmarks():
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      break;
    default:
      break;
  }
}

function expressionsOnly() {
  return expressionsCheckbox.checked && !landmarksCheckbox.checked;
}

function landmarksOnly() {
  return !expressionsCheckbox.checked && landmarksCheckbox.checked;
}

function expressionsAndLandmarks() {
  return expressionsCheckbox.checked && landmarksCheckbox.checked;
}
