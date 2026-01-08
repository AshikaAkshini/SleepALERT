const video = document.getElementById('video');
const status = document.getElementById('status');
const alarm = document.getElementById('alarm');
const startBtn = document.getElementById('startBtn');
const videoBox = document.getElementById('video-box');

let sleepTimer = 0;
let absenceTimer = 0;

// Initialize MediaPipe Face Mesh
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 5,
    refineLandmarks: true,
    minDetectionConfidence: 0.5
});

faceMesh.onResults((results) => {
    let personDetected = results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0;

    if (!personDetected) {
        // CASE 1: NO PERSON
        absenceTimer++;
        if (absenceTimer > 50) { 
            triggerAlert(" ALERT: NO STUDENT DETECTED!");
        }
    } else {
        absenceTimer = 0;
        const landmarks = results.multiFaceLandmarks[0];
        
        // Track Eye Opening
        const eyeDistance = landmarks[145].y - landmarks[159].y;

        if (eyeDistance < 0.010) { 
            // CASE 2: EYES CLOSED
            sleepTimer++;
            if (sleepTimer > 30) {
                triggerAlert(" ALERT: STUDENT IS SLEEPING!");
            }
        } else {
            // ALL OK
            sleepTimer = 0;
            stopAlert();
        }
    }
});

function triggerAlert(msg) {
    status.innerText = msg;
    document.body.classList.add('alert-ui');
    if (alarm.paused) alarm.play();
}

function stopAlert() {
    status.innerText = " Student is studying properly";
    document.body.classList.remove('alert-ui');
    alarm.pause();
    alarm.currentTime = 0;
}

async function init() {
    startBtn.style.display = 'none';
    videoBox.style.display = 'block';

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    const runAI = async () => {
        await faceMesh.send({ image: video });
        requestAnimationFrame(runAI);
    };
    runAI();
}

startBtn.addEventListener('click', init);
