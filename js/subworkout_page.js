let detector;
let videoElement;
let canvasElement;
let canvasContext;
let isRunning = false;
let cameras = [];
let animationFrameId;
let isInitialized = false;
const DEFAULT_SETTINGS = {
    mewtrackEnabled: true,
    notificationsEnabled: true,
    skeletonStyle: 'both',
    cameraEnabled: true,
};

// Load settings from local storage
let isMewTrackEnabled = localStorage.getItem('mewtrackEnabled') !== null
    ? localStorage.getItem('mewtrackEnabled') === 'true'
    : DEFAULT_SETTINGS.mewtrackEnabled;
let notificationsEnabled = localStorage.getItem('notificationsEnabled') !== null
    ? localStorage.getItem('notificationsEnabled') === 'true'
    : DEFAULT_SETTINGS.notificationsEnabled;
let skeletonStyle = localStorage.getItem('skeletonStyle') || DEFAULT_SETTINGS.skeletonStyle;
let isCameraEnabled = localStorage.getItem('cameraEnabled') !== null
    ? localStorage.getItem('cameraEnabled') === 'true'
    : DEFAULT_SETTINGS.cameraEnabled;

const pauseBtn = document.querySelector('.pause');
const closeBtn = document.getElementById('close-btn');
const skipBtn = document.querySelector('.skip');
const popupContainer = document.getElementById('popup-container');
const popupTitle = document.getElementById('popup-title');
const popupBody = document.getElementById('popup-body');

// Initialize TensorFlow backend
async function initializeTF() {
    if (isInitialized) return true;

    try {
        await tf.ready();
        await tf.setBackend('webgl');
        console.log('TensorFlow.js initialized successfully');
        isInitialized = true;
        return true;
    } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        return false;
    }
}

// Modified init function
async function init() {
    console.log('Initializing pose detection...');
    const workoutUser = document.querySelector('.workout-user');

    try {
        const tfInitialized = await initializeTF();
        console.log('TensorFlow initialized:', tfInitialized);

        if (!tfInitialized) {
            throw new Error('Could not initialize TensorFlow. Please check if your browser supports WebGL.');
        }

        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            }
        );
        console.log('Detector created:', !!detector);

        await requestCameraPermission();
        console.log('Camera permission granted, MewTrack enabled:', isMewTrackEnabled);

    } catch (error) {
        console.error('Initialization error:', error);
        showErrorModal(error.message);
    }
}

// Update the window load event handler
window.addEventListener('load', async () => {
    setTimeout(async () => {
        await init();
    }, 1000);
});

// Add function to handle device enumeration and selection
async function getAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameras = devices.filter(device => device.kind === 'videoinput');
        return cameras;
    } catch (error) {
        console.error('Error getting camera devices:', error);
        return [];
    }
}

// Modified camera permission request with device selection
async function requestCameraPermission() {
    const workoutUser = document.querySelector('.workout-user');

    try {
        // First try to get the list of available cameras
        const cameras = await getAvailableCameras();

        // Check if we have any cameras available
        if (cameras.length === 0) {
            workoutUser.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px;">
                    <i class="fa-solid fa-video-slash" style="font-size: 48px; margin-bottom: 20px; color: #ff6060;"></i>
                    <h3 style="margin-bottom: 15px;">No Camera Detected</h3>
                    <p style="margin-bottom: 20px;">Please ensure your camera is properly connected and not in use by another application.</p>
                    <button onclick="location.reload()" style="
                        background-color: #ff6060;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 12px 24px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Try Again</button>
                </div>
            `;
            return;
        }

        // Attempt to start the camera with more specific constraints
        let stream;
        for (const camera of cameras) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        deviceId: camera.deviceId,
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        frameRate: { ideal: 60 }
                    },
                    audio: false
                });

                if (stream) break; // Successfully got a stream
            } catch (err) {
                console.log(`Failed to get stream from camera ${camera.deviceId}:`, err);
                continue;
            }
        }

        if (!stream) {
            throw new Error('Could not access any camera');
        }

        // If we got a stream, proceed with initialization
        await initializeVideoElements(stream);

    } catch (error) {
        console.error('Camera access error:', error);

        let errorMessage;
        let errorTitle;
        let errorIcon = 'fa-circle-exclamation';

        switch (error.name) {
            case 'NotReadableError':
                errorTitle = 'Camera Not Available';
                errorMessage = `
                    <p>The camera is currently in use by another application or encountered a hardware error.</p>
                    <br>
                    <p>Please try:</p>
                    <ol style="text-align: left; margin-top: 10px;">
                        <li>Closing other applications that might be using the camera</li>
                        <li>Disconnecting and reconnecting your camera</li>
                        <li>Restarting your browser</li>
                        <li>Checking your computer's privacy settings</li>
                    </ol>
                `;
                break;
            case 'NotAllowedError':
                errorTitle = 'Camera Access Denied';
                errorMessage = 'Please enable camera access in your browser settings.';
                break;
            case 'NotFoundError':
                errorTitle = 'No Camera Found';
                errorIcon = 'fa-video-slash';
                errorMessage = 'Please connect a camera and refresh the page.';
                break;
            default:
                errorTitle = 'Camera Error';
                errorMessage = `An error occurred: ${error.message}`;
        }

        workoutUser.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px;">
                <i class="fa-solid ${errorIcon}" style="font-size: 48px; margin-bottom: 20px; color: #ff6060;"></i>
                <h3 style="margin-bottom: 15px;">${errorTitle}</h3>
                <div style="margin-bottom: 20px;">${errorMessage}</div>
                <button onclick="retryInitialization()" style="
                    background-color: #ff6060;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    cursor: pointer;
                    font-size: 16px;
                ">Try Again</button>
            </div>
        `;
    }
}

// Add retry function
async function retryInitialization() {
    const workoutUser = document.querySelector('.workout-user');
    workoutUser.innerHTML = '<div style="text-align: center; padding: 20px;">Retrying camera initialization...</div>';

    // Small delay before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    await initPoseDetection();
}

// Modified initializeVideoElements to handle potential errors
async function initializeVideoElements(stream) {
    const workoutUser = document.querySelector('.workout-user');
    workoutUser.innerHTML = '';

    try {
        // Create container for video and canvas
        const videoContainer = document.createElement('div');
        videoContainer.style.position = 'relative';
        videoContainer.style.width = '100%';
        videoContainer.style.height = '100%';
        videoContainer.style.overflow = 'hidden';
        videoContainer.style.borderRadius = '16px';

        // Create video element
        videoElement = document.createElement('video');
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.style.objectFit = 'cover';
        videoElement.autoplay = true;
        videoElement.playsinline = true;

        // Create canvas element
        canvasElement = document.createElement('canvas');
        canvasElement.style.position = 'absolute';
        canvasElement.style.top = '0';
        canvasElement.style.left = '0';
        canvasElement.style.width = '100%';
        canvasElement.style.height = '100%';

        // Add elements to container
        videoContainer.appendChild(videoElement);
        videoContainer.appendChild(canvasElement);
        workoutUser.appendChild(videoContainer);

        // Set up video stream
        videoElement.srcObject = stream;
        canvasContext = canvasElement.getContext('2d');

        // Update canvas size on video load
        videoElement.onloadedmetadata = () => {
            const updateCanvasSize = () => {
                const rect = videoContainer.getBoundingClientRect();
                canvasElement.width = rect.width;
                canvasElement.height = rect.height;

                canvasElement.scaleX = canvasElement.width / videoElement.videoWidth;
                canvasElement.scaleY = canvasElement.height / videoElement.videoHeight;
                canvasElement.offsetX = 0;
                canvasElement.offsetY = 0;
            };

            updateCanvasSize();
            window.addEventListener('resize', updateCanvasSize);

            isRunning = true;
            startDetection();
        };

    } catch (error) {
        console.error('Error in video initialization:', error);
        showErrorModal(error.message);
    }
}


// Initialize the pose detection system
async function initPoseDetection() {
    console.log('Starting pose detection initialization...', { isCameraEnabled });

    if (!isCameraEnabled) {
        showCameraOffMessage('Camera is currently turned off');
        return;
    }

    try {
        // Access webcam
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        // Load pose detection model
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            }
        );

        await initializeVideoElements(stream);

    } catch (error) {
        console.error('Error initializing pose detection:', error);
        const workoutUser = document.querySelector('.workout-user');
        workoutUser.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <p>Error: Could not access camera or initialize pose detection. Please check your camera permissions and refresh the page.</p>
                <p>Error details: ${error.message}</p>
                <button onclick="retryInitialization()" style="
                    background-color: #ff6060;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    margin-top: 15px;
                    cursor: pointer;
                ">Try Again</button>
            </div>
        `;
    }
}

// Modify the camera settings handler
async function handleCameraSettings() {
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');

    popupTitle.innerHTML = `
        Camera Settings
        <button id="close-settings" style="
            position: absolute;
            right: 15px;
            top: 15px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            font-size: 16px;
        ">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    // Show loading state
    popupBody.innerHTML = `
        <div style="padding: 20px;">
            <div style="text-align: center;">Loading camera settings...</div>
        </div>
    `;

    popupContainer.style.display = 'flex';

    // Wait for cameras to be loaded
    const availableCameras = await getAvailableCameras();

    // Create settings UI
    const settingsHTML = `
        <div style="padding: 20px;">
            <div class="setting-option" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">Enable Camera</span>
                    <label class="switch">
                        <input type="checkbox" id="camera-toggle" ${isCameraEnabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
                <p style="color: #666; margin: 20px 0 0 0; font-size: 14px;">
                    Toggle camera on/off. When disabled, the camera will be completely turned off.
                </p>
            </div>

            <div class="setting-option" style="margin-bottom: 20px;">
                <label for="cameraSelect" style="display: block; margin-bottom: 8px; font-weight: 500;">Select Camera</label>
                <select id="cameraSelect" style="
                    width: 100%;
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    background-color: white;
                    font-size: 14px;
                " ${!isCameraEnabled ? 'disabled' : ''}>
                    ${availableCameras.map((device, index) => `
                        <option value="${device.deviceId}">
                            ${device.label || `Camera ${index + 1}`}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 15px;
                background: white;
                border-top: 1px solid #eee;
                text-align: right;
            ">
                <button id="apply-camera-settings" style="
                    padding: 8px 24px;
                    background: #ffb089;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">Apply</button>
            </div>
        </div>
    `;

    popupBody.innerHTML = settingsHTML;

    // Add event listeners
    document.getElementById('camera-toggle').addEventListener('change', (e) => {
        document.getElementById('cameraSelect').disabled = !e.target.checked;
    });

    document.getElementById('apply-camera-settings').addEventListener('click', async () => {
        const newCameraEnabled = document.getElementById('camera-toggle').checked;
        const selectedDeviceId = document.getElementById('cameraSelect').value;

        // First stop any existing camera
        stopCamera();

        if (newCameraEnabled) {
            try {
                await initializeCamera(selectedDeviceId);
                // Add a small delay before starting detection
                setTimeout(() => {
                    startDetection();
                }, 1000);
            } catch (error) {
                console.error('Failed to start camera:', error);
                showCameraOffMessage('Failed to start camera. Please check permissions and try again.');
            }
        } else {
            showCameraOffMessage('Camera is currently turned off');
        }

        popupContainer.style.display = 'none';
    });

    document.getElementById('close-settings').addEventListener('click', () => {
        popupContainer.style.display = 'none';
    });
}

// Helper function to get current camera ID
function getCurrentCameraId() {
    if (videoElement && videoElement.srcObject) {
        const track = videoElement.srcObject.getVideoTracks()[0];
        if (track) {
            return track.getSettings().deviceId;
        }
    }
    return null;
}

// Function to stop camera
function stopCamera() {
    // Stop detection if running
    if (isRunning) {
        stopDetection();
        isRunning = false;
    }

    // Stop all video tracks
    if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    // Clear canvas
    if (canvasElement && canvasContext) {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }

    // Reset detector
    detector = null;
}


// Function to show camera off message
function showCameraOffMessage(message) {
    const workoutUser = document.querySelector('.workout-user');
    workoutUser.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            background: #f8f8f8;
            border-radius: 16px;
        ">
            <i class="fa-solid fa-video-slash" style="
                font-size: 48px;
                color: #ffb089;
                margin-bottom: 20px;
            "></i>
            <h3 style="margin-bottom: 10px; color: #333;">Camera Off</h3>
            <p style="color: #666;">${message}</p>
            ${!isCameraEnabled ? `
                <button onclick="handleCameraSettings()" style="
                    margin-top: 20px;
                    padding: 8px 16px;
                    background: #ffb089;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Enable Camera</button>
            ` : ''}
        </div>
    `;
}

// Modify initPoseDetection to check camera state
async function initPoseDetection() {
    if (!isCameraEnabled) {
        showCameraOffMessage('Camera is currently turned off');
        return;
    }

    await requestCameraPermission();
}

// Update window load event to respect camera state
window.addEventListener('load', async () => {
    // Wait a moment to ensure all scripts are loaded
    setTimeout(async () => {
        if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined') {
            console.log('Libraries loaded, initializing with settings:', {
                isCameraEnabled,
                isMewTrackEnabled,
                skeletonStyle
            });

            if (isCameraEnabled) {
                await init();
            } else {
                showCameraOffMessage('Camera is currently turned off');
            }
        } else {
            showErrorModal('Required libraries not loaded. Please refresh the page.');
        }
    }, 1000);
});

function showErrorModal(errorMessage) {
    const workoutUser = document.querySelector('.workout-user');
    const modalContainer = document.createElement('div');
    modalContainer.style.position = 'absolute';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';

    modalContainer.innerHTML = `
        <div style="
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 80%;
        ">
            <i class="fa-solid fa-circle-exclamation" style="font-size: 48px; color: #ffb089; margin-bottom: 15px;"></i>
            <h3 style="margin-bottom: 15px;">Camera Error</h3>
            <p style="margin-bottom: 20px;">${errorMessage}</p>
            <button onclick="retryInitialization()" style="
                background-color: #ffb089;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                cursor: pointer;
                font-size: 16px;
            ">Try Again</button>
        </div>
    `;

    workoutUser.appendChild(modalContainer);
}

// Detect poses and draw them
async function detectPose() {
    if (!isRunning || !detector || !isMewTrackEnabled) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        console.log('Pose detection stopped:', { isRunning, hasDetector: !!detector, isMewTrackEnabled });
        return;
    }

    // Check if video is ready and has valid dimensions
    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.log('Video not ready or has invalid dimensions, retrying...');
        animationFrameId = requestAnimationFrame(() => detectPose());
        return;
    }

    try {
        const poses = await detector.estimatePoses(videoElement);

        // Clear previous frame
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (poses.length > 0) {
            const keypoints = poses[0].keypoints;

            // Use canvas scale factors for correct drawing
            const scale = Math.min(canvasElement.scaleX, canvasElement.scaleY);
            const offsetX = (canvasElement.width - videoElement.videoWidth * scale) / 2;
            const offsetY = (canvasElement.height - videoElement.videoHeight * scale) / 2;

            // Draw skeleton with proper scaling
            drawSkeleton(keypoints, scale, offsetX, offsetY);
            drawKeypoints(keypoints, scale, offsetX, offsetY);

            // Form validation if enabled
            if (this.repCounter) {
                const formFeedback = validateForm(keypoints, this.repCounter.exerciseType);
                showFormFeedback(formFeedback);
            }
        }

        animationFrameId = requestAnimationFrame(() => detectPose());
    } catch (error) {
        console.error('Detection error:', error);
        // Continue the detection loop even if there's an error
        animationFrameId = requestAnimationFrame(() => detectPose());
    }
}

function validateForm(keypoints, exerciseType) {
    const feedback = [];

    switch (exerciseType) {
        case 'Squats':
            const kneeAngle = calculateAngle(
                getKeypointByName(keypoints, 'left_hip'),
                getKeypointByName(keypoints, 'left_knee'),
                getKeypointByName(keypoints, 'left_ankle')
            );
            if (kneeAngle < 80) feedback.push('Keep knees behind toes!');
            break;

        case 'Push Ups':
            const bodyAngle = calculateAngle(
                getKeypointByName(keypoints, 'left_shoulder'),
                getKeypointByName(keypoints, 'left_hip'),
                getKeypointByName(keypoints, 'left_ankle')
            );
            if (bodyAngle > 170) feedback.push('Keep your body straight!');
            break;
    }

    return feedback;
}

function showFormFeedback(messages) {
    const feedbackElement = document.getElementById('form-feedback') ||
        document.createElement('div');

    feedbackElement.id = 'form-feedback';
    feedbackElement.innerHTML = messages.map(msg => `
    <div class="form-alert">
        <i class="fas fa-exclamation-triangle"></i>
        ${msg}
    </div>
    `).join('');

    if (!document.getElementById('form-feedback')) {
        document.body.appendChild(feedbackElement);
    }
}

// Modified window load event handler
window.addEventListener('load', async () => {
    // Wait for DOM to be fully loaded
    setTimeout(async () => {
        if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined') {
            await init();
        } else {
            const workoutUser = document.querySelector('.workout-user');
            showErrorModal('Required libraries not loaded. Please refresh the page.');
        }
    }, 1000);
});

// Draw detected keypoints
function drawKeypoints(keypoints, scale, offsetX, offsetY) {
    for (const keypoint of keypoints) {
        if (keypoint.score > 0.3) {
            const x = keypoint.x * scale + offsetX;
            const y = keypoint.y * scale + offsetY;

            canvasContext.beginPath();
            canvasContext.arc(x, y, 4, 0, 2 * Math.PI);
            canvasContext.fillStyle = '#FF6060';
            canvasContext.fill();
        }
    }
}

// Draw skeleton connecting keypoints
function drawSkeleton(keypoints, scale, offsetX, offsetY) {
    const connections = [
        ['nose', 'left_eye'], ['nose', 'right_eye'],
        ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
        ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
        ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
    ];

    canvasContext.strokeStyle = '#FFA476';
    canvasContext.lineWidth = 2;

    for (const [p1Name, p2Name] of connections) {
        const p1 = keypoints.find(kp => kp.name === p1Name);
        const p2 = keypoints.find(kp => kp.name === p2Name);

        if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
            const x1 = p1.x * scale + offsetX;
            const y1 = p1.y * scale + offsetY;
            const x2 = p2.x * scale + offsetX;
            const y2 = p2.y * scale + offsetY;

            canvasContext.beginPath();
            canvasContext.moveTo(x1, y1);
            canvasContext.lineTo(x2, y2);
            canvasContext.stroke();
        }
    }
}

// function startWorkoutCountdown(workoutName, onCompleteCallback) {
//     let currentCount = 3;
//     let countdownInterval;

//     // Create countdown content
//     const countdownContent = `
//         <div class="countdown-main">
//             <h1 class="ready-text">READY TO GO</h1>
//             <div class="count-circle">${currentCount}</div>
//             <div class="warmup-text">Warm-up Exercise: ${workoutName}</div>
//         </div>
//     `;

//     // Create overlay div
//     const overlay = document.createElement('div');
//     overlay.className = 'countdown-overlay';
//     overlay.innerHTML = countdownContent;
//     document.body.appendChild(overlay);

//     const styleSheet = document.createElement('style');
//     styleSheet.textContent = styles;
//     document.head.appendChild(styleSheet);

//     // Start countdown
//     let isPaused = false;
//     countdownInterval = setInterval(() => {
//         if (!isPaused) {
//             currentCount--;
//             const countCircle = overlay.querySelector('.count-circle');
//             if (countCircle) {
//                 countCircle.textContent = currentCount;
//             }

//             if (currentCount <= 0) {
//                 clearInterval(countdownInterval);
//                 overlay.remove();
//                 styleSheet.remove();
//                 if (onCompleteCallback) {
//                     onCompleteCallback();
//                 }
//             }
//         }
//     }, 1000);

//     // Add event listeners
//     const pauseBtn = overlay.querySelector('#countdown-pause');
//     const closeBtn = overlay.querySelector('#countdown-close');

//     pauseBtn.addEventListener('click', () => {
//         isPaused = !isPaused;
//         const pauseIcon = pauseBtn.querySelector('i');
//         const pauseText = pauseBtn.querySelector('.pause-text');

//         if (isPaused) {
//             pauseIcon.className = 'fa-solid fa-play';
//             pauseText.textContent = 'Resume';
//         } else {
//             pauseIcon.className = 'fa-solid fa-pause';
//             pauseText.textContent = 'Pause';
//         }
//     });

//     closeBtn.addEventListener('click', () => {
//         clearInterval(countdownInterval);
//         overlay.remove();
//         styleSheet.remove();
//     });
// }

// Start detection
async function startDetection() {
    if (!videoElement || !videoElement.srcObject || videoElement.readyState < 2) {
        console.warn('Video not ready, delaying pose detection start');
        setTimeout(startDetection, 500);
        return;
    }

    isRunning = true;
    detectPose();
}

// Stop detection
function stopDetection() {
    isRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined') {
        initPoseDetection();
    } else {
        const workoutUser = document.querySelector('.workout-user');
        workoutUser.innerHTML = 'Error: Required libraries not loaded';
    }
});

// Add a function to check if libraries are loaded
function areLibrariesLoaded() {
    return typeof tf !== 'undefined' &&
        typeof poseDetection !== 'undefined' &&
        tf.backend() !== undefined;
}

//.........................................................................................//
// More Function (pop up window)

document.addEventListener('DOMContentLoaded', function () {
    let popupContainer = document.getElementById('popup-container-more');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'popup-container-more';
        document.body.appendChild(popupContainer);
    }

    const createSettingsPopup = () => {
        const moreButton = document.getElementById('more');
        if (!moreButton) {
            console.error('More button not found');
            return;
        }

        let popup = null;

        function createPopup() {
            const popupElement = document.createElement('div');
            popupElement.className = 'popup-settings';

            const options = [
                { icon: 'fa-camera', label: 'Camera Settings' },
                { icon: 'fa-chart-line', label: 'MewTrack' },
                { icon: 'fa-table-cells-large', label: 'Layout' }
            ];

            const optionsHTML = options.map(option => `
                <div class="settings-option">
                    <i class="fas ${option.icon}"></i>
                    <span>${option.label}</span>
                </div>
            `).join('');

            popupElement.innerHTML = optionsHTML;
            return popupElement;
        }

        function updatePopupPosition() {
            if (!popup) return;

            const buttonRect = moreButton.getBoundingClientRect();
            const popupRect = popup.getBoundingClientRect();

            // Position popup above the button
            let top = buttonRect.top - popupRect.height - 12;
            let left = buttonRect.left - (popupRect.width - buttonRect.width) / 2;

            // Ensure popup stays within viewport
            if (left + popupRect.width > window.innerWidth) {
                left = window.innerWidth - popupRect.width - 40;
            }
            if (left < 10) {
                left = 10;
            }
            if (top < 10) {
                top = buttonRect.bottom + 10; // Show below if not enough space above
            }

            popup.style.top = `${top}px`;
            popup.style.left = `${left}px`;
        }

        function showPopup() {
            if (!popup) {
                popup = createPopup();
                popupContainer.appendChild(popup);
            }

            popupContainer.style.display = 'block';
            updatePopupPosition();

            // Add click handlers for options
            popup.querySelectorAll('.settings-option').forEach((option, index) => {
                option.onclick = () => {
                    switch (index) {
                        case 0:
                            handleCameraSettings();
                            break;
                        case 1:
                            handleMewTrack();
                            break;
                        case 2:
                            handleLayout();
                            break;
                    }
                    hidePopup();
                };
            });
        }

        function hidePopup() {
            popupContainer.style.display = 'none';
        }

        // Handle window resize
        window.addEventListener('resize', updatePopupPosition);

        // Toggle popup on more button click
        moreButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (popupContainer.style.display === 'block') {
                hidePopup();
            } else {
                showPopup();
            }
        });

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            if (popupContainer.style.display === 'block' &&
                !popup?.contains(e.target) &&
                e.target !== moreButton) {
                hidePopup();
            }
        });
    };

    // Initialize settings popup
    createSettingsPopup();
});

//.........................................................................................//
// Camera Settings function (pop up window)

// Settings option handlers
function handleCameraSettings() {
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');

    popupTitle.innerHTML = `
    Camera Settings
    <button id="close-settings" style="
        position: absolute;
        right: 15px;
        top: 15px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        font-size: 16px;
    ">
        <i class="fa-solid fa-xmark"></i>
    </button>
    `;

    // Initialize with loading state
    popupBody.innerHTML = `
    <div style="padding: 20px;">
        <div style="text-align: center;">Loading camera settings...</div>
    </div>
    `;

    // Create camera settings interface with switch
    const settingsHTML = `
        <div style="padding: 20px;">
            <div class="setting-option" style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0;">Enable Camera</h3>
                    <label class="switch">
                        <input type="checkbox" id="camera-toggle" ${isCameraEnabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
                <p style="color: #666; margin: 5px 0 0 0;">
                    Toggle camera on/off. When disabled, the camera will be completely turned off.
                </p>
            </div>

            <div class="setting-option" style="margin-bottom: 20px;">
                <label for="cameraSelect" style="display: block; margin-bottom: 8px; font-weight: 500;">Select Camera</label>
                <select id="cameraSelect" style="
                    width: 100%;
                    padding: 8px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    background-color: white;
                    font-size: 14px;
                " ${!isCameraEnabled ? 'disabled' : ''}>
                    ${cameras.map((device, index) => `
                        <option value="${device.deviceId}">
                            ${device.label || `Camera ${index + 1}`}
                        </option>
                    `).join('')}
                </select>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 30px;">
                <button id="apply-camera-settings" style="
                    padding: 8px 16px;
                    background: #ffb089;
                    width: 100%;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-right: 0px;
                    transition: background-color 0.3s;
                    padding: 12px 24px;
                    font-size: 16px;
                ">Apply Changes</button>
            </div>
        </div>
    `;

    popupBody.innerHTML = settingsHTML;
    popupContainer.style.display = 'flex';

    // Set current camera as selected in dropdown
    if (videoElement && videoElement.srcObject) {
        const currentTrack = videoElement.srcObject.getVideoTracks()[0];
        if (currentTrack) {
            const select = document.getElementById('cameraSelect');
            const options = Array.from(select.options);
            const currentOption = options.find(option => {
                const device = cameras.find(d => d.deviceId === option.value);
                return device && device.label === currentTrack.label;
            });
            if (currentOption) {
                select.value = currentOption.value;
            }
        }
    }

    // Handle camera toggle affecting dropdown
    document.getElementById('camera-toggle').addEventListener('change', async (e) => {
        const cameraSelect = document.getElementById('cameraSelect');
        cameraSelect.disabled = !e.target.checked;

        // Immediately handle camera state when toggled
        const newCameraEnabled = e.target.checked;
        const selectedDeviceId = cameraSelect.value;

        if (newCameraEnabled !== isCameraEnabled) {
            isCameraEnabled = newCameraEnabled;

            if (isCameraEnabled) {
                try {
                    const success = await initializeCamera(selectedDeviceId);
                    if (success) {
                        startDetection(); // Only if camera initialization was successful
                    }
                } catch (error) {
                    console.error('Failed to start camera:', error);
                    showCameraOffMessage('Failed to start camera. Please check permissions and try again.');
                    // Reset the toggle if camera fails to start
                    e.target.checked = false;
                    cameraSelect.disabled = true;
                }
            } else {
                stopCamera();
                showCameraOffMessage('Camera is currently turned off');
            }
        }
    });

    // Handle apply button
    document.getElementById('apply-camera-settings').addEventListener('click', async () => {
        const newCameraEnabled = document.getElementById('camera-toggle').checked;
        const selectedDeviceId = document.getElementById('cameraSelect').value;

        if (newCameraEnabled !== isCameraEnabled ||
            (newCameraEnabled && selectedDeviceId !== getCurrentCameraId())) {

            isCameraEnabled = newCameraEnabled;

            if (isCameraEnabled) {
                try {
                    await initializeCamera(selectedDeviceId);
                    startDetection();
                } catch (error) {
                    console.error('Failed to start camera:', error);
                    showCameraOffMessage('Failed to start camera. Please check permissions and try again.');
                }
            } else {
                stopCamera();
                showCameraOffMessage('Camera is currently turned off');
            }
        }

        popupContainer.style.display = 'none';
    });

    // Handle x-mark close button
    document.getElementById('close-settings').addEventListener('click', () => {
        popupContainer.style.display = 'none';
    });
}

// Helper function to get current camera ID
function getCurrentCameraId() {
    if (videoElement && videoElement.srcObject) {
        const track = videoElement.srcObject.getVideoTracks()[0];
        if (track) {
            return track.getSettings().deviceId;
        }
    }
    return null;
}

// Function to stop camera
function stopCamera() {
    // Stop detection if running
    if (isRunning) {
        stopDetection();
    }

    // Stop all video tracks
    if (videoElement && videoElement.srcObject) {
        const tracks = videoElement.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoElement.srcObject = null;
    }

    // Clear canvas
    if (canvasElement && canvasContext) {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
}

// Function to show camera off message
function showCameraOffMessage(message) {
    const workoutUser = document.querySelector('.workout-user');
    workoutUser.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            background: #f8f8f8;
            border-radius: 16px;
        ">
            <i class="fa-solid fa-video-slash" style="
                font-size: 48px;
                color: #ff6060;
                margin-bottom: 20px;
            "></i>
            <h3 style="margin-bottom: 10px; color: #333;">Camera Off</h3>
            <p style="color: #666;">${message}</p>
            ${!isCameraEnabled ? `
                <button onclick="handleCameraSettings()" style="
                    margin-top: 20px;
                    padding: 8px 16px;
                    background: #ffb089;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                ">Enable Camera</button>
            ` : ''}
        </div>
    `;
}

async function initializeCamera(deviceId) {
    try {
        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 60 }
            }
        };

        // Stop any existing camera stream
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play(); // Ensure video is playing
                resolve();
            };
        });

        // Add an additional delay to ensure video is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));

        // Update canvas size
        const videoContainer = videoElement.parentElement;
        const rect = videoContainer.getBoundingClientRect();
        canvasElement.width = rect.width;
        canvasElement.height = rect.height;

        return true;
    } catch (error) {
        console.error('Error initializing camera:', error);
        throw error;
    }
}

//.........................................................................................//
// MewTrack function (pop up window)
function handleMewTrack() {
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');

    popupTitle.textContent = 'MewTrack Settings';

    // Create settings HTML
    const settingsHTML = `
        <div class="mewtrack-settings">
            <!-- Enable MewTrack -->
            <div class="setting-option">
                <div class="setting-header">
                    <h3>Enable MewTrack</h3>
                    <label class="switch">
                        <input type="checkbox" id="enable-mewtrack" ${isMewTrackEnabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
                <p class="setting-description">
                    MewTrack helps detect incorrect postures during your workout.
                    Disable this to hide skeletal tracking and posture warnings.
                </p>
            </div>

            <!-- Posture Notifications -->
            <div class="setting-option">
                <div class="setting-header">
                    <h3>Posture Notifications</h3>
                    <label class="switch">
                        <input type="checkbox" id="enable-notifications" ${notificationsEnabled ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
                <p class="setting-description">
                    Show pop-up notifications when incorrect posture is detected.
                </p>
            </div>

            <!-- Skeleton Style -->
            <div class="setting-option">
                <h3>Skeleton Style</h3>
                <div class="skeleton-styles">
                    <div class="style-option" data-style="line">
                        <div class="style-preview line-style"></div>
                        <span>Lines</span>
                    </div>
                    <div class="style-option" data-style="dot">
                        <div class="style-preview dot-style"></div>
                        <span>Dots</span>
                    </div>
                    <div class="style-option" data-style="both">
                        <div class="style-preview both-style"></div>
                        <span>Both</span>
                    </div>
                </div>
            </div>

            <!-- Apply Button -->
            <button id="apply-mewtrack">Apply Changes</button>
        </div>
    `;

    // Set popup content
    popupBody.innerHTML = settingsHTML;
    popupContainer.style.display = 'flex';

    // Handle skeleton style selection
    const styleOptions = document.querySelectorAll('.style-option');
    styleOptions.forEach(option => {
        option.addEventListener('click', () => {
            styleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });

    // Set initial active style based on current setting
    const currentStyle = localStorage.getItem('skeletonStyle') || 'both';
    document.querySelector(`[data-style="${currentStyle}"]`).classList.add('active');

    // Handle apply button click
    document.getElementById('apply-mewtrack').addEventListener('click', () => {
        const enableMewTrack = document.getElementById('enable-mewtrack').checked;
        const enableNotifications = document.getElementById('enable-notifications').checked;
        const selectedStyle = document.querySelector('.style-option.active').dataset.style;

        // Save settings
        localStorage.setItem('mewtrackEnabled', enableMewTrack);
        localStorage.setItem('notificationsEnabled', enableNotifications);
        localStorage.setItem('skeletonStyle', selectedStyle);

        // Apply settings
        updateMewTrackSettings(enableMewTrack, enableNotifications, selectedStyle);

        // Close popup
        popupContainer.style.display = 'none';
    });
}

function updateMewTrackSettings(enableMewTrack, enableNotifications, style) {
    isMewTrackEnabled = enableMewTrack;
    notificationsEnabled = enableNotifications;
    skeletonStyle = style;
    console.log('MewTrack Enabled:', enableMewTrack, 'Running:', isRunning);

    // Update detection state based on MewTrack setting
    if (enableMewTrack && !isRunning) {
        startDetection();
        isRunning = true; // Ensure isRunning reflects the state
    } else if (!enableMewTrack && isRunning) {
        stopDetection();
        isRunning = false; // Ensure isRunning reflects the state
    } else if (enableMewTrack && isRunning) {
        startDetection();
        isRunning = true;
    }

    // Clear canvas if MewTrack is disabled, but only if canvas is initialized
    if (!enableMewTrack && canvasElement && canvasContext) {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize canvas element and context
    canvasElement = document.getElementById('mewtrack-canvas');
    canvasContext = canvasElement ? canvasElement.getContext('2d') : null;

    console.log('Stored MewTrackEnabled:', localStorage.getItem('mewtrackEnabled'));

    // Load settings from localStorage
    const storedMewTrackEnabled = localStorage.getItem('mewtrackEnabled');
    const storedNotificationsEnabled = localStorage.getItem('notificationsEnabled');
    const storedSkeletonStyle = localStorage.getItem('skeletonStyle');

    isMewTrackEnabled = storedMewTrackEnabled !== null ? storedMewTrackEnabled === 'true' : false;
    notificationsEnabled = storedNotificationsEnabled !== null ? storedNotificationsEnabled === 'true' : true;
    skeletonStyle = storedSkeletonStyle || 'both';

    // Correctly initialize isRunning and trigger detection if enabled
    if (isMewTrackEnabled) {
        isRunning = true;
        startDetection(); // Ensure detection starts if enabled
    } else {
        isRunning = false;
    }

    // Update settings
    updateMewTrackSettings(isMewTrackEnabled, notificationsEnabled, skeletonStyle);
});

//.........................................................................................//
// Loyout function (pop up window)
function handleLayout() {
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');

    popupTitle.textContent = 'Layout Settings';

    // Create layout options
    const layouts = [
        {
            id: 'side-by-side',
            name: 'Side by Side',
            description: 'Equal width displays',
            preview: `
                <div class="layout-preview side-by-side">
                    <div class="preview-guide">Guide</div>
                    <div class="preview-camera">Camera</div>
                </div>
            `
        },
        {
            id: 'guide-focus',
            name: 'Guide Focus',
            description: 'Larger guide display',
            preview: `
                <div class="layout-preview guide-focus">
                    <div class="preview-guide">Guide</div>
                    <div class="preview-camera">Camera</div>
                </div>
            `
        },
        {
            id: 'camera-focus',
            name: 'Camera Focus',
            description: 'Larger camera display',
            preview: `
                <div class="layout-preview camera-focus">
                    <div class="preview-guide">Guide</div>
                    <div class="preview-camera">Camera</div>
                </div>
            `
        },
        {
            id: 'stacked',
            name: 'Stacked',
            description: 'Vertical arrangement',
            preview: `
                <div class="layout-preview stacked">
                    <div class="preview-guide">Guide</div>
                    <div class="preview-camera">Camera</div>
                </div>
            `
        }
    ];

    // Create layout selector HTML
    const layoutsHTML = layouts.map(layout => `
        <div class="layout-option" data-layout="${layout.id}">
            <div class="layout-info">
                <h3>${layout.name}</h3>
                <p>${layout.description}</p>
            </div>
            ${layout.preview}
            <div class="layout-check">
                <i class="fa-solid fa-check"></i>
            </div>
        </div>
    `).join('');

    // Set popup content
    popupBody.innerHTML = `
        <div class="layouts-container">
            ${layoutsHTML}
        </div>
        <div class="layout-actions">
            <button class="apply-layout">Apply Layout</button>
        </div>
    `;

    // Show popup
    popupContainer.style.display = 'flex';

    // Add event listeners
    const layoutOptions = popupBody.querySelectorAll('.layout-option');
    let selectedLayout = 'side-by-side'; // Default layout

    layoutOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            layoutOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to selected option
            option.classList.add('active');
            selectedLayout = option.dataset.layout;
        });
    });

    // Set initial active state
    document.querySelector(`[data-layout="side-by-side"]`).classList.add('active');

    // Handle apply button click
    const applyButton = popupBody.querySelector('.apply-layout');
    applyButton.addEventListener('click', () => {
        applyLayout(selectedLayout);
        popupContainer.style.display = 'none';
    });
}

function applyLayout(layoutId) {
    const workoutContainer = document.querySelector('.workout-container');
    const workoutGuide = document.querySelector('.workout-guide');
    const workoutUser = document.querySelector('.workout-user');

    // Remove all previous layout classes
    workoutContainer.classList.remove('layout-side-by-side', 'layout-guide-focus', 'layout-camera-focus', 'layout-stacked');

    // Add new layout class
    workoutContainer.classList.add(`layout-${layoutId}`);

    // Update canvas size after layout change
    if (canvasElement) {
        const rect = workoutUser.getBoundingClientRect();
        canvasElement.width = rect.width;
        canvasElement.height = rect.height;

        // Redraw pose if detection is running
        if (isRunning) {
            detectPose();
        }
    }
}

// Add layout class to container on initial load
document.addEventListener('DOMContentLoaded', () => {
    const workoutContainer = document.querySelector('.workout-container');
    workoutContainer.classList.add('layout-side-by-side');
});

//.........................................................................................//
// Connection between workout page data to subworkout page

class WorkoutManager {
    constructor() {
        // Initialize state
        this.initializeState();
        // Get DOM elements
        this.initializeDOMElements();
        // Setup rest overlay
        this.initializeRestOverlay();
        // Setup countdown overlay
        this.initializeCountdownOverlay();

        // Add these lines:
        this.setupPauseButton();
        this.setupCloseButton();
        this.setupSkipButton();
        // this.setupMoreOptions();
    }

    initializeState() {
        try {
            const workoutData = JSON.parse(localStorage.getItem('currentWorkout')) || [];
            this.workout = workoutData[0];
            this.exercises = this.workout?.exercises || [];
            this.currentSet = 1;
            this.totalSets = this.workout?.sets || 1;
            this.currentExerciseIndex = 0;
            this.isResting = false;
            this.timer = null;
            this.repCount = 0;
            this.repCounter = null;
            this.timeLeft = 0;
            this.endRestTimeout = null;
        } catch (error) {
            console.error('Error initializing state:', error);
            this.exercises = [];
        }
    }

    initializeDOMElements() {
        this.timerElement = document.querySelector('.timer-text');
        this.workoutNameElement = document.querySelector('.workout-name');
        this.roundElement = document.querySelector('.workout-round');
        this.workoutUser = document.querySelector('.workout-user');
        this.workoutGuide = document.querySelector('.workout-guide');

        if (!this.timerElement || !this.workoutNameElement || !this.roundElement) {
            console.error('Required DOM elements not found');
        }
    }

    init() {
        if (!this.workout || this.exercises.length === 0) {
            console.error('No workout data available');
            this.endWorkout();
            return;
        }

        this.startCountdown();
    }

    showCurrentExercise() {
        if (!this.exercises[this.currentExerciseIndex]) return;
    
        const currentExercise = this.exercises[this.currentExerciseIndex];
        this.workoutNameElement.textContent = currentExercise.exercise || currentExercise.pose;
        this.roundElement.textContent = `${this.currentSet}/${this.totalSets}`;
    
        if (currentExercise.reps) {
            this.timerElement.textContent = '0';
            this.timerElement.classList.add('rep-counter');
        } else if (currentExercise.duration) {
            // Parse the duration properly
            let durationInSeconds = this.parseDuration(currentExercise.duration);
            // Display in minutes:seconds format
            this.updateTimerDisplay(durationInSeconds);
            this.timerElement.classList.remove('rep-counter');
        }
    }
    
    // Add this helper function to parse duration strings
    parseDuration(duration) {
        if (typeof duration === 'number') return duration;
        
        if (typeof duration === 'string') {
            // Check if duration contains 'minutes' or 'min'
            if (duration.includes('minute') || duration.includes('min')) {
                // Extract number of minutes
                const match = duration.match(/(\d+)/);
                if (match) {
                    // Convert minutes to seconds
                    return parseInt(match[1]) * 60;
                }
            } else {
                // Handle seconds format
                const match = duration.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }
        }
        return 0;
    }

    startExercise() {
        const currentExercise = this.exercises[this.currentExerciseIndex];
        if (!currentExercise) return;
    
        if (currentExercise.reps) {
            this.setupRepCounter(currentExercise.reps);
        } else if (currentExercise.duration) {
            const durationInSeconds = this.parseDuration(currentExercise.duration);
            this.startTimer(durationInSeconds);
        }
    }

    setupRepCounter(targetReps) {
        if (!targetReps || targetReps <= 0) return;

        const currentExercise = this.exercises[this.currentExerciseIndex].exercise;
        this.repCounter = new RepCounter(currentExercise);
        this.repCount = 0;

        if (typeof detectPose === 'function' && typeof videoElement !== 'undefined') {
            const originalDetectPose = detectPose.bind(this);
            detectPose = async () => {
                try {
                    await originalDetectPose();

                    if (this.repCounter && detector) {
                        const poses = await detector.estimatePoses(videoElement);
                        if (poses.length > 0) {
                            const countedReps = this.repCounter.analyzePose(poses[0].keypoints);
                            if (countedReps > this.repCount) {
                                this.repCount = countedReps;
                                this.timerElement.textContent = this.repCount;

                                if (this.repCount >= targetReps) {
                                    this.nextExercise();
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error in pose detection:', error);
                }
            };

            if (typeof isRunning !== 'undefined' && !isRunning && typeof startDetection === 'function') {
                startDetection();
            }
        }
    }

    startTimer(seconds) {
        if (!seconds || seconds <= 0) return;
    
        this.clearAllTimers();
        let timeLeft = seconds;
    
        // Update timer display immediately
        this.updateTimerDisplay(timeLeft);
    
        this.timer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(timeLeft);
    
            if (timeLeft <= 0) {
                this.clearAllTimers();
                this.nextExercise();
            }
        }, 1000);
    }
    
    updateTimerDisplay(timeInSeconds) {
        if (this.timerElement) {
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = timeInSeconds % 60;
            this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    nextExercise() {
        this.repCounter = null;
        this.clearAllTimers();

        if (this.currentExerciseIndex >= this.exercises.length - 1) {
            if (this.currentSet >= this.totalSets) {
                this.endWorkout();
                return;
            }
            this.currentSet++;
            this.currentExerciseIndex = 0;
        } else {
            this.currentExerciseIndex++;
        }

        this.showRestScreen();
    }

    // Handle pause button click
    setupPauseButton() {
        const pauseBtn = document.querySelector('.pause');
        const pauseIcon = document.getElementById('pause-btn-icon');
        const pauseText = document.querySelector('.pause-text');

        if (!pauseBtn || !pauseIcon || !pauseText) {
            console.error('Pause button elements not found');
            return;
        }

        let isPaused = false;

        pauseBtn.addEventListener('click', () => {
            isPaused = !isPaused;

            if (isPaused) {
                // Pause workout
                pauseIcon.classList.remove('fa-pause');
                pauseIcon.classList.add('fa-play');
                pauseText.textContent = 'Resume';

                // Stop all active processes
                this.clearAllTimers();
                if (typeof stopDetection === 'function') {
                    stopDetection();
                }
                if (typeof isRunning !== 'undefined') {
                    isRunning = false;
                }

                // Show a pause overlay to make it clear the workout is paused
                this.showPauseOverlay();
            } else {
                // Resume workout
                pauseIcon.classList.remove('fa-play');
                pauseIcon.classList.add('fa-pause');
                pauseText.textContent = 'Pause';

                // Hide pause overlay
                this.hidePauseOverlay();

                // Resume appropriate timers based on state
                if (this.isResting) {
                    this.startRestTimer();
                } else {
                    // Resume exercise timer if it exists
                    const currentExercise = this.exercises[this.currentExerciseIndex];
                    if (currentExercise && currentExercise.duration) {
                        // Extract current time left from the timer display
                        let timeString = this.timerElement.textContent;
                        let timeLeft = 0;

                        if (timeString.includes(':')) {
                            timeLeft = parseInt(timeString.split(':')[1]);
                        } else {
                            timeLeft = parseInt(timeString);
                        }

                        if (!isNaN(timeLeft) && timeLeft > 0) {
                            this.startTimer(timeLeft);
                        }
                    }

                    // Resume pose detection
                    if (typeof startDetection === 'function') {
                        startDetection();
                    }
                    if (typeof isRunning !== 'undefined') {
                        isRunning = true;
                    }
                }
            }

            // Dispatch a custom event that can be listened for by other components
            const pauseEvent = new CustomEvent('workoutPauseStateChange', {
                detail: { isPaused: isPaused }
            });
            document.dispatchEvent(pauseEvent);
        });
    }

    // Add these new methods to show/hide a pause overlay
    showPauseOverlay() {
        // Create pause overlay if it doesn't exist
        let pauseOverlay = document.getElementById('pause-overlay');
        if (!pauseOverlay) {
            pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pause-overlay';
            pauseOverlay.className = 'pause-overlay';
            pauseOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 950;
                color: white;
            `;

            pauseOverlay.innerHTML = `
                <div class="pause-message" style="text-align: center; padding: 20px;">
                    <h2>Workout Paused</h2>
                    <p>Press the Resume button to continue your workout</p>
                </div>
            `;

            document.body.appendChild(pauseOverlay);
        }

        // Show the overlay
        pauseOverlay.style.display = 'flex';
    }

    hidePauseOverlay() {
        const pauseOverlay = document.getElementById('pause-overlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
        }
    }

    // Handle close button (cancel workout)
    setupCloseButton() {
        const closeBtn = document.getElementById('close-btn');
        if (!closeBtn) return;

        closeBtn.addEventListener('click', () => {
            // Always show confirmation popup when X button is clicked
            this.showConfirmationPopup(
                'Exit Workout',
                'Do you really want to exit the workout?',
                () => {
                    // Clear all timers and stop detection before exiting
                    this.clearAllTimers();
                    if (typeof stopDetection === 'function') stopDetection();
                    window.location.href = 'workout_page.html';
                }
            );
        });
    }

    // Handle skip button
    setupSkipButton() {
        const skipBtn = document.querySelector('.skip');
        if (!skipBtn) return;

        skipBtn.addEventListener('click', () => {
            this.skipCurrentExercise();
        });
    }

    skipCurrentExercise() {
        // Clear timers and rep counter
        this.repCounter = null;
        this.clearAllTimers();

        // If we're already resting, end the rest and go to next exercise
        if (this.isResting) {
            this.endRest();
            return;
        }

        // Move to the next exercise
        this.nextExercise();
    }

    showConfirmationPopup(title, message, onConfirm) {
        // Check if popup container exists, create it if not
        let popupContainer = document.getElementById('popup-container');
        if (!popupContainer) {
            popupContainer = document.createElement('div');
            popupContainer.id = 'popup-container';
            popupContainer.className = 'popup-container';
            popupContainer.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            document.body.appendChild(popupContainer);
        }

        // Create popup content
        popupContainer.innerHTML = `
            <div class="popup-content" style="background-color: white; padding: 20px; border-radius: 10px; max-width: 80%; text-align: center;">
                <h2>${title}</h2>
                <p>${message}</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
                    <button id="popup-yes" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background-color: #ff5757; color: white;">Yes</button>
                    <button id="popup-no" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background-color: #4caf50; color: white;">No</button>
                </div>
            </div>
        `;

        // Show popup
        popupContainer.style.display = 'flex';

        // Add event listeners
        document.getElementById('popup-yes').addEventListener('click', () => {
            popupContainer.style.display = 'none';
            if (typeof onConfirm === 'function') onConfirm();
        });

        document.getElementById('popup-no').addEventListener('click', () => {
            popupContainer.style.display = 'none';
        });
    }

    // Setup more options button
    // setupMoreOptions() {
    //     const moreBtn = document.getElementById('more');
    //     if (!moreBtn) return;

    //     moreBtn.addEventListener('click', () => {
    //         // Create or get popup container
    //         let morePopup = document.getElementById('popup-container-more');
    //         if (!morePopup) {
    //             morePopup = document.createElement('div');
    //             morePopup.id = 'popup-container-more';
    //             morePopup.className = 'popup-container-more';
    //             morePopup.style.cssText = `
    //                 display: none;
    //                 position: fixed;
    //                 bottom: 70px;
    //                 right: 20px;
    //                 z-index: 900;
    //             `;
    //             document.body.appendChild(morePopup);
    //         }

    //         // Create popup content
    //         morePopup.innerHTML = `
    //             <div style="background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
    //                 <div id="restart-workout" style="padding: 15px; cursor: pointer;">Restart Workout</div>
    //                 <div id="change-settings" style="padding: 15px; cursor: pointer;">Settings</div>
    //                 <div id="exit-workout" style="padding: 15px; cursor: pointer;">Exit Workout</div>
    //             </div>
    //         `;

    //         // Show popup
    //         morePopup.style.display = 'block';

    //         // Add event listeners
    //         document.getElementById('restart-workout').addEventListener('click', () => {
    //             this.restartWorkout();
    //             morePopup.style.display = 'none';
    //         });

    //         document.getElementById('change-settings').addEventListener('click', () => {
    //             // Show settings popup (to be implemented)
    //             morePopup.style.display = 'none';
    //         });

    //         document.getElementById('exit-workout').addEventListener('click', () => {
    //             morePopup.style.display = 'none';
    //             // Trigger cancel workout confirmation
    //             const closeBtn = document.getElementById('close-btn');
    //             if (closeBtn) closeBtn.click();
    //         });

    //         // Close more popup when clicking outside
    //         document.addEventListener('click', (event) => {
    //             if (!event.target.closest('#more') && !event.target.closest('#popup-container-more')) {
    //                 morePopup.style.display = 'none';
    //             }
    //         }, { once: true });
    //     });
    // }

    // Restart workout
    restartWorkout() {
        this.clearAllTimers();
        this.repCounter = null;
        this.currentExerciseIndex = 0;
        this.currentSet = 1;
        this.isResting = false;

        if (typeof stopDetection === 'function') stopDetection();

        // Restart countdown
        this.startCountdown();
    }

    initializeRestOverlay() {
        const existingOverlay = document.querySelector('.rest-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        this.restOverlay = document.createElement('div');
        this.restOverlay.className = 'rest-overlay';

        this.restOverlay.innerHTML = `
            <div class="rest-card">
                <img src="./assets/icons/pause_workout.svg" alt="Rest" style="max-width: 150px; margin-bottom: 1rem;" />
                <h3>Rest</h3>
                <p>Take a break and have a meow</p>
                <div class="rest-timer" style="font-size: 2rem; margin: 1rem 0;">20</div>
                <div class="rest-controls" style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="add-time" data-seconds="10">+ 10s</button>
                    <button class="add-time" data-seconds="20">+ 20s</button>
                    <button class="add-time" data-seconds="30">+ 30s</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.restOverlay);
        this.setupRestControls();
    }

    setupRestControls() {
        this.restOverlay.querySelectorAll('.add-time').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isResting) return;

                const seconds = parseInt(btn.dataset.seconds);
                this.updateRestTimer(this.timeLeft + seconds);

                this.startRestTimer();
            });
        });
    }

    showRestScreen() {
        this.clearAllTimers();
        this.isResting = true;

        const nextExercise = this.exercises[this.currentExerciseIndex];
        if (nextExercise) {
            this.workoutNameElement.textContent = `Next: ${nextExercise.exercise}`;
        }

        this.restOverlay.style.display = 'flex';
        if (this.workoutUser) {
            this.workoutUser.style.visibility = 'hidden';
        }

        this.updateRestTimer(20);
        this.startRestTimer();
    }

    startRestTimer() {
        this.clearAllTimers();

        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateRestTimer(this.timeLeft);
            } else {
                this.clearAllTimers();
                this.endRest();
            }
        }, 1000);
    }

    updateRestTimer(newTime) {
        this.timeLeft = Math.max(0, newTime);
        const timerDisplay = this.restOverlay.querySelector('.rest-timer');
        if (timerDisplay) {
            timerDisplay.textContent = this.timeLeft;
        }
    }

    endRest() {
        this.clearAllTimers();
        this.isResting = false;
        this.timeLeft = 0;

        if (this.restOverlay) {
            this.restOverlay.style.display = 'none';
        }
        if (this.workoutUser) {
            this.workoutUser.style.visibility = 'visible';
        }

        this.showCurrentExercise();
        this.startExercise();
    }

    initializeCountdownOverlay() {
        const existingOverlay = document.querySelector('.countdown-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        this.countdownOverlay = document.createElement('div');
        this.countdownOverlay.className = 'countdown-overlay';
        this.countdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
        `;

        this.countdownOverlay.innerHTML = `
            <div id="countdown-close" class="close-btn" style="position: absolute; top: 25px; right: 0px; cursor: pointer;">
                <i class="fa-solid fa-xmark"></i>
            </div>
            <div class="countdown-main" style="text-align: center;">
                <h1 class="ready-text">READY TO GO</h1>
                <div class="count-circle">3</div>
                <div class="warmup-text">Warm-up Exercise: ${this.getFirstExerciseName()}</div>
            </div>
        `;

        document.body.appendChild(this.countdownOverlay);

        // Add event listener for the close button
        const closeBtn = this.countdownOverlay.querySelector('#countdown-close');
        closeBtn.addEventListener('click', () => {
            // Show a confirmation dialog
            const userConfirmed = confirm('Are you sure you want to stop the exercise?');

            if (userConfirmed) {
                if (this.countdownTimer) {
                    clearInterval(this.countdownTimer);
                    this.countdownTimer = null;
                }
                this.countdownOverlay.style.display = 'none';
                this.endWorkout();
                window.location.href = 'workout_page.html';
            }
        });
    }

    getExerciseDuration() {
        if (!this.exercises[0]) return '00';

        if (this.exercises[0].duration) {
            let duration = this.exercises[0].duration;
            if (typeof duration === 'string') {
                const match = duration.match(/\d+/);
                duration = match ? parseInt(match[0]) : 0;
            }
            return duration.toString().padStart(2, '0');
        }
        return '00';
    }

    getFirstExerciseName() {
        return this.exercises[0]?.exercise || this.workout?.title || 'Workout';
    }

    startCountdown() {
        // Display the countdown overlay
        this.countdownOverlay.style.display = 'flex';

        // Set initial count
        let currentCount = 3;

        // Start countdown
        this.startCountdownTimer = () => {
            if (this.countdownTimer) {
                clearInterval(this.countdownTimer);
            }

            this.countdownTimer = setInterval(() => {
                currentCount--;
                const countCircle = this.countdownOverlay.querySelector('.count-circle');
                if (countCircle) {
                    countCircle.textContent = currentCount;
                }

                if (currentCount <= 0) {
                    // Clear timer and hide overlay
                    clearInterval(this.countdownTimer);
                    this.countdownTimer = null;
                    this.countdownOverlay.style.display = 'none';

                    // Start the actual workout
                    this.showCurrentExercise();
                    this.startExercise();
                }
            }, 1000);
        };

        // Start the countdown timer
        this.startCountdownTimer();
    }

    clearAllTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.endRestTimeout) {
            clearTimeout(this.endRestTimeout);
            this.endRestTimeout = null;
        }
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }

    endWorkout() {
        try {
            localStorage.removeItem('currentWorkout');
            window.location.href = 'subworkout_done_page.html';
        } catch (error) {
            console.error('Error ending workout:', error);
        }
    }
}

// Initialize workout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const workoutManager = new WorkoutManager();
    workoutManager.init();
});

//.........................................................................................//
// Pose detection algorithm
class RepCounter {
    constructor(exerciseType) {
        this.exerciseType = exerciseType;
        this.repCount = 0;
        this.lastState = null;
        this.keypointHistory = [];
        this.repThresholds = {
            'Squats': { min: 0.6, max: 0.9 },
            'Push Ups': { min: 0.4, max: 0.8 },
            'Jumping Jacks': { min: 0.3, max: 0.7 }
        };
    }

    analyzePose(keypoints) {
        switch (this.exerciseType) {
            case 'Squats':
                return this._analyzeSquats(keypoints);
            case 'Push Ups':
                return this._analyzePushUps(keypoints);
            case 'Jumping Jacks':
                return this._analyzeJumpingJacks(keypoints);
            default:
                return 0;
        }
    }

    _analyzeSquats(keypoints) {
        const leftHip = keypoints.find(k => k.name === 'left_hip');
        const rightHip = keypoints.find(k => k.name === 'right_hip');
        const hipsY = (leftHip.y + rightHip.y) / 2;

        this.keypointHistory.push(hipsY);
        if (this.keypointHistory.length > 10) this.keypointHistory.shift();

        const avgY = this.keypointHistory.reduce((a, b) => a + b, 0) / this.keypointHistory.length;
        const normalizedY = (avgY - this.repThresholds.Squats.min) /
            (this.repThresholds.Squats.max - this.repThresholds.Squats.min);

        if (normalizedY < 0.3 && this.lastState !== 'down') {
            this.repCount++;
            this.lastState = 'down';
            return this.repCount;
        }
        if (normalizedY > 0.7) this.lastState = 'up';
        return this.repCount;
    }

    _analyzePushUps(keypoints) {
        const leftElbow = keypoints.find(k => k.name === 'left_elbow');
        const rightElbow = keypoints.find(k => k.name === 'right_elbow');
        const shoulder = keypoints.find(k => k.name === 'left_shoulder');
        const wrist = keypoints.find(k => k.name === 'left_wrist');

        const angle = this._calculateAngle(shoulder, leftElbow, wrist);
        this.keypointHistory.push(angle);
        if (this.keypointHistory.length > 5) this.keypointHistory.shift();

        const avgAngle = this.keypointHistory.reduce((a, b) => a + b, 0) / this.keypointHistory.length;

        if (avgAngle < 90 && this.lastState !== 'down') {
            this.repCount++;
            this.lastState = 'down';
        }
        if (avgAngle > 160) this.lastState = 'up';
        return this.repCount;
    }

    _analyzeJumpingJacks(keypoints) {
        const leftWrist = keypoints.find(k => k.name === 'left_wrist');
        const rightWrist = keypoints.find(k => k.name === 'right_wrist');
        const shoulderWidth = Math.abs(
            keypoints.find(k => k.name === 'left_shoulder').x -
            keypoints.find(k => k.name === 'right_shoulder').x
        );

        const handSpread = Math.abs(leftWrist.x - rightWrist.x);
        const normalizedSpread = handSpread / shoulderWidth;

        if (normalizedSpread > 2.5 && this.lastState !== 'open') {
            this.repCount++;
            this.lastState = 'open';
        }
        if (normalizedSpread < 1.2) this.lastState = 'closed';
        return this.repCount;
    }

    _calculateAngle(a, b, c) {
        const radians = Math.atan2(c.y - b.y, c.x - b.x) -
            Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs(radians * (180 / Math.PI));
        return angle > 180 ? 360 - angle : angle;
    }
}

function getKeypointByName(keypoints, name) {
    return keypoints.find(kp => kp.name === name);
}

function calculateDistance(kp1, kp2) {
    return Math.sqrt(Math.pow(kp2.x - kp1.x, 2) + Math.pow(kp2.y - kp1.y, 2));
}

function calculateAngle(kp1, kp2, kp3) {
    const radians = Math.atan2(kp3.y - kp2.y, kp3.x - kp2.x) -
        Math.atan2(kp1.y - kp2.y, kp1.x - kp2.x);
    let angle = Math.abs(radians * (180 / Math.PI));
    return angle > 180 ? 360 - angle : angle;
}

//.........................................................................................//
// Music Function (pop up window)
document.addEventListener('DOMContentLoaded', function () {
    // Initialize required elements
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');
    const closeBtn = document.getElementById('close-btn');
    const musicBtn = document.querySelector('.music-btn');
    const musicLibrary = document.querySelector('.music-library');

    const musicTracks = [
        {
            title: "Pump It Up",
            artist: "Momot Music",
            duration: "1:49",
            url: "./assets/workout_music/workout-by-MomotMusic.mp3",
            cover: "https://images.unsplash.com/photo-1519501025264-65ba15a82390"
        },
        {
            title: "Energy Boost",
            artist: "HitsLab",
            duration: "2:31",
            url: "./assets/workout_music/workout-motivation.mp3",
            cover: "https://images.unsplash.com/photo-1574680096145-d05b474e2155"
        }
    ];

    class WorkoutMusicPlayer {
        constructor() {
            this.audio = new Audio();
            this.playlist = musicTracks;
            this.currentTrackIndex = 0;
            this.isPlaying = false;
            this.volume = 0.7;
            this.progressUpdateInterval = null;

            // Initialize audio properties
            this.audio.volume = this.volume;
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
            this.audio.addEventListener('ended', () => this.nextTrack());
            this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        }

        createMusicInterface() {
            const container = document.createElement('div');
            container.className = 'music-player-container';
            container.innerHTML = `
                <div class="player-card">
                    <div class="player-header">
                        <div class="track-info">
                            <div class="title">${this.playlist[this.currentTrackIndex].title}</div>
                            <div class="artist">${this.playlist[this.currentTrackIndex].artist}</div>
                        </div>
                        <div class="duration" id="time-display">0:00 / ${this.playlist[this.currentTrackIndex].duration}</div>
                    </div>
                    <div class="player-controls">
                        <button class="control-btn prev">
                            <i class="fas fa-backward"></i>
                        </button>
                        <button class="control-btn play">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="control-btn next">
                            <i class="fas fa-forward"></i>
                        </button>
                        <div class="volume-control">
                            <i class="fas fa-volume-up"></i>
                            <input type="range" class="volume-slider" min="0" max="100" value="${this.volume * 100}">
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                </div>
            `;
            return container;
        }

        initializeControls() {
            const playerCard = document.querySelector('.player-card');
            const playBtn = playerCard.querySelector('.play');
            const prevBtn = playerCard.querySelector('.prev');
            const nextBtn = playerCard.querySelector('.next');
            const volumeSlider = playerCard.querySelector('.volume-slider');
            const progressBar = playerCard.querySelector('.progress-bar');

            playBtn.addEventListener('click', () => this.togglePlay());
            prevBtn.addEventListener('click', () => this.previousTrack());
            nextBtn.addEventListener('click', () => this.nextTrack());
            volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
            progressBar.addEventListener('click', (e) => this.seekTo(e));
        }

        togglePlay() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }

        play() {
            this.audio.play();
            this.isPlaying = true;
            document.querySelector('.play i').className = 'fas fa-pause';
        }

        pause() {
            this.audio.pause();
            this.isPlaying = false;
            document.querySelector('.play i').className = 'fas fa-play';
        }

        updateProgress() {
            const progress = (this.audio.currentTime / this.audio.duration) * 100 || 0;
            document.querySelector('.progress').style.width = `${progress}%`;
            this.updateTimeDisplay();
        }

        updateTimeDisplay() {
            const timeDisplay = document.getElementById('time-display');
            const currentTime = this.formatTime(this.audio.currentTime);
            const duration = this.formatTime(this.audio.duration);
            timeDisplay.textContent = `${currentTime} / ${duration}`;
        }

        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        seekTo(e) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = pos * this.audio.duration;
        }

        setVolume(value) {
            this.volume = value;
            this.audio.volume = value;
            document.querySelector('.volume-slider').value = value * 100;
        }

        loadTrack() {
            const track = this.playlist[this.currentTrackIndex];
            this.audio.src = track.url;
            document.querySelector('.title').textContent = track.title;
            document.querySelector('.artist').textContent = track.artist;

            if (this.isPlaying) {
                this.play();
            }
        }

        nextTrack() {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            this.loadTrack();
        }

        previousTrack() {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadTrack();
        }

        updateDuration() {
            const duration = this.formatTime(this.audio.duration);
            document.getElementById('time-display').textContent = `0:00 / ${duration}`;
        }
    }

    // Initialize player
    const player = new WorkoutMusicPlayer();
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    // Setup player container
    const playerContainer = player.createMusicInterface();
    wrapper.appendChild(playerContainer);

    // Insert wrapper into DOM
    if (musicBtn) {
        musicBtn.parentNode.insertBefore(wrapper, musicBtn);
        wrapper.appendChild(musicBtn);
    }

    // Initialize controls
    player.initializeControls();
    player.loadTrack();

    // Setup hover behavior
    let hideTimeout;
    wrapper.addEventListener('mouseenter', () => {
        clearTimeout(hideTimeout);
        playerContainer.classList.add('show');
    });

    wrapper.addEventListener('mouseleave', () => {
        hideTimeout = setTimeout(() => {
            playerContainer.classList.remove('show');
        }, 2000);
    });

    // Music library popup functionality
    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            if (e.target.closest('.music-player-container')) return;

            playerContainer.classList.remove('show');
            showMusicLibrary();
        });
    }

    function showMusicLibrary() {
        showPopup('Music Library', `
            <div class="music-list">
                ${musicTracks.map((track, index) => `
                    <div class="music-item" data-index="${index}">
                        <div class="music-item-image">
                            <img src="${track.cover}" alt="${track.title}">
                        </div>
                        <div class="music-item-details">
                            <span class="music-item-title">${track.title}</span>
                            <span class="music-item-artist">${track.artist}</span>
                        </div>
                        <button class="play-btn">
                            ${index === player.currentTrackIndex && player.isPlaying ? 'Playing' : 'Play'}
                        </button>
                    </div>
                `).join('')}
            </div>
        `);

        // Add click handlers for playlist items
        document.querySelectorAll('.music-item').forEach(item => {
            item.querySelector('.play-btn').addEventListener('click', () => {
                player.currentTrackIndex = parseInt(item.dataset.index);
                player.loadTrack();
                player.play();
                popupContainer.style.display = 'none';
            });
        });
    }

    function showPopup(title, content) {
        popupTitle.textContent = title;
        popupBody.innerHTML = content;
        popupContainer.style.display = 'flex';
    }

    // Setup close handlers
    closeBtn.addEventListener('click', () => {
        popupContainer.style.display = 'none';
    });
});

//.........................................................................................//
// Close button Function (pop up window)

document.getElementById('close-btn').addEventListener('click', function (e) {
    e.preventDefault();

    // Get popup elements
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');

    // Show the confirmation popup
    popupTitle.textContent = 'Confirm Close';
    popupBody.innerHTML = `
        <p>Are you sure you want to close the workout?</p>
        <div class="popup-btn-container">
            <button id="confirm-yes" class="popup-btn yes">Yes</button>
            <button id="confirm-no" class="popup-btn no">No</button>
        </div>
    `;
    popupContainer.style.display = 'block';

    // Add click handlers for popup buttons
    document.getElementById('confirm-yes').addEventListener('click', () => {
        const workoutManager = new WorkoutManager();
        workoutManager.clearAllTimers();
        workoutManager.endWorkout();

        // Navigate to workout_page.html
        window.location.href = 'workout_page.html';
    });

    document.getElementById('confirm-no').addEventListener('click', () => {
        popupContainer.style.display = 'none';
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const workoutManager = new WorkoutManager();
    workoutManager.init();

    createSettingsPopup();
    if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined') {
        init();
    }
});