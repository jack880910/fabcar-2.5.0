/**
 * FaceAPI Demo for Browsers
 * Loaded via `webcam-verify.html`
 */

import * as faceapi from '/face-api/dist/face-api.esm.js'; // use when in dev mode
// import * as faceapi from '@vladmandic/face-api'; // use when downloading face-api as npm

// configuration options
const modelPath = '/face-api/model'; // path to model folder that will be loaded using http
// const modelPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'; // path to model folder that will be loaded using http
const minScore = 0.3; // minimum score for minConfidence
const maxResults = 5; // maximum number of results to return
let optionsSSDMobileNet;
let faceLabel = '';

// helper function to pretty-print json object to string
function str(json) {
    let text = '<font color="lightblue">';
    text += json ? JSON.stringify(json).replace(/{|}|"|\[|\]/g, '').replace(/,/g, ', ') : '';
    text += '</font>';
    return text;
}

// helper function to print strings to html document as a log
function log(...txt) {
    console.log(...txt); // eslint-disable-line no-console
    const div = document.getElementById('log');
    if (div) div.innerHTML += `<br>${txt}`;
}

// helper function to draw detected faces
function drawFace(canvas, result, fps) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // draw title
    ctx.font = 'small-caps 20px "Segoe UI"';
    ctx.fillStyle = 'white';
    ctx.fillText(`FPS: ${fps}`, 10, 25);
    ctx.fillText(`Face Verification for ${faceLabel}`, 10, 50);

    // 加入這一個檢查避免丟出例外
    if (result == null || result === undefined) return;

    // 將人臉特徵送到Server-side進行人臉驗證
    let req = new XMLHttpRequest();
    let action = "/verify-by-lfd";  // for face recognition
    let method = "POST";
    let url = window.location.protocol + "//" + window.location.host + action;
    req.open(method, url, true);
    req.onload = function () {
        let message = this.responseText.trim();
        let status = 0;
        if (this.responseText.toLowerCase() == 'fail') {
            message = "人臉驗證不通過";
            status = 0;
        } else if (this.responseText.toLowerCase() == 'success') {
            message = "人臉驗證通過";
            status = 1;
        } else {
            message = "此人臉特徵資料尚未登錄";
            status = 2;
        }

        let person = result;

        // draw box around each face
        ctx.lineWidth = 3;
        if (status == 0) ctx.strokeStyle = 'red'; else if (status == 1) ctx.strokeStyle = 'lime'; else ctx.strokeStyle = 'Magenta';
        if (status == 0) ctx.fillStyle = 'red'; else if (status == 1) ctx.fillStyle = 'lime'; else ctx.fillStyle = 'Magenta';

        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.rect(person.detection.box.x, person.detection.box.y, person.detection.box.width, person.detection.box.height);
        ctx.stroke();
        ctx.globalAlpha = 1;
        // draw text labels
        const expression = Object.entries(person.expressions).sort((a, b) => b[1] - a[1]);
        ctx.fillStyle = 'black';
        ctx.fillText(`gender: ${Math.round(100 * person.genderProbability)}% ${person.gender}`, person.detection.box.x, person.detection.box.y - 59);
        ctx.fillText(`expression: ${Math.round(100 * expression[0][1])}% ${expression[0][0]}`, person.detection.box.x, person.detection.box.y - 41);
        ctx.fillText(`age: ${Math.round(person.age)} years`, person.detection.box.x, person.detection.box.y - 23);
        ctx.fillText(`roll:${person.angle.roll}° pitch:${person.angle.pitch}° yaw:${person.angle.yaw}°`, person.detection.box.x, person.detection.box.y - 5);
        if (status == 0) ctx.fillStyle = 'red'; else if (status == 1) ctx.fillStyle = 'lime'; else ctx.fillStyle = 'yellow';
        ctx.fillText(`gender: ${Math.round(100 * person.genderProbability)}% ${person.gender}`, person.detection.box.x, person.detection.box.y - 60);
        ctx.fillText(`expression: ${Math.round(100 * expression[0][1])}% ${expression[0][0]}`, person.detection.box.x, person.detection.box.y - 42);
        ctx.fillText(`age: ${Math.round(person.age)} years`, person.detection.box.x, person.detection.box.y - 24);
        ctx.fillText(`roll:${person.angle.roll}° pitch:${person.angle.pitch}° yaw:${person.angle.yaw}°`, person.detection.box.x, person.detection.box.y - 6);

        // draw verification message
        //--------------------
        let metrics = ctx.measureText(message);
        let width = metrics.width + 8;  // width of the background box
        let height = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;  // height of the background box
        if (status == 0) ctx.fillStyle = 'red'; else if (status == 1) ctx.fillStyle = 'lime'; else ctx.fillStyle = 'Magenta';
        ctx.fillRect(person.detection.box.x, person.detection.box.y - 107, width, height);
        if (status == 0) ctx.fillStyle = 'white'; else if (status == 1) ctx.fillStyle = 'black'; else ctx.fillStyle = 'white';
        ctx.fillText(message, person.detection.box.x + 4, person.detection.box.y - 85);
        //--------------------

        // draw face points for each face
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = 'gainsboro';
        const pointSize = 2;
        for (let i = 0; i < person.landmarks.positions.length; i++) {
            ctx.beginPath();
            ctx.arc(person.landmarks.positions[i].x, person.landmarks.positions[i].y, pointSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    //Send the proper header information along with the request
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
    let data =
        "faceLabel=" + faceLabel + "&" +
        "descriptor=" + result.descriptor.toString();
    req.send(data);
}

async function detectVideo(video, canvas) {
    if (!video || video.paused) return false;
    const t0 = performance.now();
    faceapi
        .detectSingleFace(video, optionsSSDMobileNet)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor()
        .withAgeAndGender()
        .then((result) => {
            const fps = 1000 / (performance.now() - t0);
            drawFace(canvas, result, fps.toLocaleString());
            requestAnimationFrame(() => detectVideo(video, canvas));
            return true;
        })
        .catch((err) => {
            log(`Detect Error: ${str(err)}`);
            return false;
        });
    return false;
}

// just initialize everything and call main function
async function setupCamera() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (!video || !canvas) return null;

    log('Setting up camera');
    // setup webcam. note that navigator.mediaDevices requires that page is accessed via https
    if (!navigator.mediaDevices) {
        log('Camera Error: access not supported');
        return null;
    }
    let stream;
    const constraints = { audio: false, video: { facingMode: 'user', resizeMode: 'crop-and-scale' } };
    if (window.innerWidth > window.innerHeight) constraints.video.width = { ideal: window.innerWidth };
    else constraints.video.height = { ideal: window.innerHeight };
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
        if (err.name === 'PermissionDeniedError' || err.name === 'NotAllowedError') log(`Camera Error: camera permission denied: ${err.message || err}`);
        if (err.name === 'SourceUnavailableError') log(`Camera Error: camera not available: ${err.message || err}`);
        return null;
    }
    if (stream) {
        video.srcObject = stream;
    } else {
        log('Camera Error: stream empty');
        return null;
    }
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    if (settings.deviceId) delete settings.deviceId;
    if (settings.groupId) delete settings.groupId;
    if (settings.aspectRatio) settings.aspectRatio = Math.trunc(100 * settings.aspectRatio) / 100;
    log(`Camera active: ${track.label}`);
    log(`Camera settings: ${str(settings)}`);
    canvas.addEventListener('click', () => {
        if (video && video.readyState >= 2) {
            if (video.paused) {
                video.play();
                detectVideo(video, canvas);
            } else {
                video.pause();
            }
        }
        log(`Camera state: ${video.paused ? 'paused' : 'playing'}`);
    });
    return new Promise((resolve) => {
        video.onloadeddata = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            video.play();
            detectVideo(video, canvas);
            resolve(true);
        };
    });
}

async function setupFaceAPI() {
    // load face-api models
    // log('Models loading');
    // await faceapi.nets.tinyFaceDetector.load(modelPath); // using ssdMobilenetv1
    await faceapi.nets.ssdMobilenetv1.load(modelPath);
    await faceapi.nets.ageGenderNet.load(modelPath);
    await faceapi.nets.faceLandmark68Net.load(modelPath);
    await faceapi.nets.faceRecognitionNet.load(modelPath);
    await faceapi.nets.faceExpressionNet.load(modelPath);
    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({ minConfidence: minScore, maxResults });
    // check tf engine state
    log(`Models loaded: ${str(faceapi.tf.engine().state.numTensors)} tensors`);
}

async function main() {
    // require the faceLabel (or login username)
    // do {
    //     faceLabel = window.prompt('請輸入驗證者身分證號碼', '');  // null on cancel or string on confirmation
    //     if (faceLabel == null) window.location.assign('/');  // CANCEL: jump to the home
    //     else faceLabel = faceLabel.trim().toLowerCase();  // CONFIRM
    // } while (faceLabel == '');

    //get userId from qrcode-verify.js
    faceLabel = localStorage.getItem("userId");
    console.log("正在驗證：" + faceLabel);

    // initialize tfjs
    log(`Face Verification for ${faceLabel}`);

    // if you want to use wasm backend location for wasm binaries must be specified
    // await faceapi.tf?.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${faceapi.tf.version_core}/dist/`);
    // await faceapi.tf?.setBackend('wasm');
    // log(`WASM SIMD: ${await faceapi.tf?.env().getAsync('WASM_HAS_SIMD_SUPPORT')} Threads: ${await faceapi.tf?.env().getAsync('WASM_HAS_MULTITHREAD_SUPPORT') ? 'Multi' : 'Single'}`);

    // default is webgl backend
    await faceapi.tf.setBackend('webgl');
    await faceapi.tf.ready();

    // tfjs optimizations
    if (faceapi.tf?.env().flagRegistry.CANVAS2D_WILL_READ_FREQUENTLY) faceapi.tf.env().set('CANVAS2D_WILL_READ_FREQUENTLY', true);
    if (faceapi.tf?.env().flagRegistry.WEBGL_EXP_CONV) faceapi.tf.env().set('WEBGL_EXP_CONV', true);
    if (faceapi.tf?.env().flagRegistry.WEBGL_EXP_CONV) faceapi.tf.env().set('WEBGL_EXP_CONV', true);

    // check version
    log(`Version: FaceAPI ${str(faceapi?.version || '(not loaded)')} TensorFlow/JS ${str(faceapi.tf?.version_core || '(not loaded)')} Backend: ${str(faceapi.tf?.getBackend() || '(not loaded)')}`);

    await setupFaceAPI();
    await setupCamera();
}

// start processing as soon as page is loaded
window.onload = main;
