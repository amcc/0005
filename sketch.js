// HOW TO USE
// predictWebcam(video) will start predicting landmarks

// pass a video MediaElement using createCapture
// make sure to call predictWebcam as a callback to createCapture
// this ensures the video is ready

// parts index:
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/index

let capture;
let loadedCamera;
let captureEvent;
let confidence = 0.0;
let yOff = 0;
let defaultWeight = 50;
let lerpRate = 0.4;
let madeClone = false;
let lerpLandmarks = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  captureWebcam();
  // blendMode(MULTIPLY)
}

function draw() {
  // background(255);
  let xDiff = width - capture.width;
  let yDiff = height - capture.height;
  clear();
  image(capture, xDiff / 2, yDiff / 2);
  fill(255, 205);
  noStroke();
  rect(0, 0, width, height);

  // console.log({landmarks})
  let first = true;
  if (landmarks.length > 0) {
    for (const hand of landmarks) {
      first ? fill(255, 0, 0) : fill(0, 255, 0);

      for (const m of hand) {
        stroke(0);
        strokeWeight(abs(50 * m.z));

        let x = m.x * capture.width + xDiff/2;
        let y = m.y * capture.height + yDiff/2;
        line(width, 0, x, y);
        line(width, height, x, y);
        line(0, 0, x, y);
        line(0, height, x, y);
        // circle(m.x * capture.width, m.y * capture.height, m.z * 100);
      }
      first = false;
    }
  }
}

function makeBezier({
  index,
  start,
  cont1,
  cont2,
  end,
  fillColour,
  strokeColour = color(0),
  weight = defaultWeight,
}) {
  if (fillColour !== undefined) {
    fill(fillColour);
  } else {
    noFill();
  }

  if (strokeColour === null) {
    noStroke();
  } else {
    stroke(strokeColour);
  }

  strokeWeight(weight);

  let p = landmarks[index];
  let l = lerpLandmarks[index];
  l[start].x = simpLerp(l[start].x, p[start].x, lerpRate);
  l[start].y = simpLerp(l[start].y, p[start].y, lerpRate);
  l[cont1].x = simpLerp(l[cont1].x, p[cont1].x, lerpRate);
  l[cont1].y = simpLerp(l[cont1].y, p[cont1].y, lerpRate);
  l[cont2].x = simpLerp(l[cont2].x, p[cont2].x, lerpRate);
  l[cont2].y = simpLerp(l[cont2].y, p[cont2].y, lerpRate);
  l[end].x = simpLerp(l[end].x, p[end].x, lerpRate);
  l[end].y = simpLerp(l[end].y, p[end].y, lerpRate);

  bezier(
    l[start].x * width,
    l[start].y * height + yOff,
    l[cont1].x * width,
    l[cont1].y * height + yOff,
    l[cont2].x * width,
    l[cont2].y * height + yOff,
    l[end].x * width,
    l[end].y * height + yOff
  );
  // console.log(landmarks[0][start].x);
}

function captureWebcam() {
  capture = createCapture(
    {
      audio: false,
      video: {
        facingMode: "user",
      },
    },
    function (e) {
      captureEvent = e;
      // do things when video ready
      // until then, the video element will have no dimensions, or default 640x480
      capture.srcObject = e;

      setCameraDimensions();
      predictWebcam(capture);
    }
  );
  capture.elt.setAttribute("playsinline", "");
  capture.hide();
}

function setCameraDimensions() {
  loadedCamera = captureEvent.getTracks()[0].getSettings();
  // console.log("cameraDimensions", loadedCamera);
  if (capture.width < capture.height) {
    capture.size(width, (capture.height / capture.width) * width);
  } else {
    capture.size((capture.width / capture.height) * height, height);
  }
  // console.log(capture);
}

function getAngle(v0x, v0y, v1x, v1y) {
  return atan2(v1y - v0y, v1x - v0x);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setCameraDimensions();
}

function simpLerp(a, b, rate) {
  return a + rate * (b - a);
}
