const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const alertSound = document.getElementById("alertSound");

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
});

let previousFrame = null;

function detectMotion() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (previousFrame) {
        let motionDetected = compareFrames(previousFrame.data, currentFrame.data);
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
        let rDiff = Math.abs(frame1[i] - frame2[i]);
        let gDiff = Math.abs(frame1[i + 1] - frame2[i + 1]);
        let bDiff = Math.abs(frame1[i + 2] - frame2[i + 2]);
        if (rDiff + gDiff + bDiff > 30) {
            diff++;
        }
    }
    return diff > 5000; // Threshold to detect motion
}

video.addEventListener("play", detectMotion);
