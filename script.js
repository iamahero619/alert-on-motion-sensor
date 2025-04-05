const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const alertSound = document.getElementById("alertSound");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const toggleCameraBtn = document.getElementById("toggleCameraBtn");

let previousFrame = null;
let detectionRunning = false;
let stream = null;
let usingFrontCamera = true;

async function startCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode: usingFrontCamera ? "user" : "environment"
    },
    audio: false
  };

  stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
}

function detectMotion() {
  if (!detectionRunning) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (previousFrame) {
    const motionDetected = compareFrames(previousFrame.data, currentFrame.data);
    if (motionDetected) {
      alertSound.play();
    }
  }

  previousFrame = currentFrame;
  requestAnimationFrame(detectMotion);
}

function compareFrames(frame1, frame2) {
  let diff = 0;
  for (let i = 0; i < frame1.length; i += 4) {
    const r = Math.abs(frame1[i] - frame2[i]);
    const g = Math.abs(frame1[i + 1] - frame2[i + 1]);
    const b = Math.abs(frame1[i + 2] - frame2[i + 2]);

    if (r + g + b > 30) {
      diff++;
    }
  }
  return diff > 5000;
}

startBtn.onclick = () => {
  if (!detectionRunning) {
    detectionRunning = true;
    detectMotion();
  }
};

stopBtn.onclick = () => {
  detectionRunning = false;
};

toggleCameraBtn.onclick = async () => {
  usingFrontCamera = !usingFrontCamera;
  await startCamera();
};

startCamera();
