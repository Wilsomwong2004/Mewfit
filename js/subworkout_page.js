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

    await requestCameraPermission();

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
// async function initPoseDetection() {
//     if (!isCameraEnabled) {
//         showCameraOffMessage('Camera is currently turned off');
//         return;
//     }

//     await requestCameraPermission();
// }

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

// Global variable to track visibility state
let isVisibilityFeedbackShown = false;
let lastFeedbackTime = 0;
let feedbackClearTimerId = null;
const FEEDBACK_DURATION = 3000;    // Show feedback for 5 seconds
const FEEDBACK_INTERVAL = 10000;   // Check every 10 seconds
let lastVisibilityState = true;

function handleVisibilityFeedback(poses) {
    const currentTime = Date.now();
    const minimalVisibility = checkMinimalVisibility(poses);
    const isResting = window.workoutManager ? window.workoutManager.isResting : false;

    // Only process when state changes or feedback interval has passed
    const visibilityChanged = (minimalVisibility !== lastVisibilityState);
    lastVisibilityState = minimalVisibility;

    // If user becomes fully visible and feedback is shown, don't clear immediately
    // Let the feedback message stay visible for the full duration
    if ((minimalVisibility || isResting) && isVisibilityFeedbackShown) {
        // Don't clear the message immediately - it will be cleared by the timer
        // Do nothing here to keep the message visible
    }
    // If keypoints are not visible and NOT resting, show appropriate feedback
    else if (!minimalVisibility && !isResting &&
        (visibilityChanged || (currentTime - lastFeedbackTime >= FEEDBACK_INTERVAL))) {

        // Clear any existing timer
        if (feedbackClearTimerId) {
            clearTimeout(feedbackClearTimerId);
        }

        // Check if any upper body is visible (partial visibility)
        const partialVisibility = checkPartialVisibility(poses);

        if (partialVisibility) {
            showFormFeedback(["Please position your full body within the camera view"], "warning");
        } else {
            showFormFeedback(["Please position yourself within the camera view"], "error");
        }

        isVisibilityFeedbackShown = true;
        lastFeedbackTime = currentTime;

        // Set timer to clear the feedback after FEEDBACK_DURATION
        feedbackClearTimerId = setTimeout(() => {
            showFormFeedback([]);
            isVisibilityFeedbackShown = false;
            feedbackClearTimerId = null;
        }, FEEDBACK_DURATION);
    }
}

// Check if at least some upper body parts are visible
function checkPartialVisibility(poses) {
    if (!poses || poses.length === 0) return false;

    const pose = poses[0];
    const keypoints = pose.keypoints;

    // Upper body keypoints
    const upperBodyKeypoints = [
        'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
        'left_shoulder', 'right_shoulder'
    ];

    // Check visibility of upper body
    const visibleUpperBodyKeypoints = upperBodyKeypoints.filter(name => {
        const keypoint = getKeypointByName(keypoints, name);
        return keypoint &&
            keypoint.score > 0.2 &&
            keypoint.x > 0 &&
            keypoint.x < videoElement.videoWidth &&
            keypoint.y > 0 &&
            keypoint.y < videoElement.videoHeight;
    });

    // If we can see at least 3 upper body keypoints, consider it partial visibility
    return visibleUpperBodyKeypoints.length >= 3;
}

// Modified minimal visibility check to be more specific about required keypoints
function checkMinimalVisibility(poses) {
    if (!poses || poses.length === 0) return false;

    const pose = poses[0];
    const keypoints = pose.keypoints;

    // Critical keypoints required for exercise tracking
    const criticalKeypoints = [
        'left_shoulder', 'right_shoulder',
        'left_hip', 'right_hip',
        'left_knee', 'right_knee'
    ];

    // Check visibility and confidence of critical keypoints
    const visibleKeypoints = criticalKeypoints.filter(name => {
        const keypoint = getKeypointByName(keypoints, name);
        return keypoint &&
            keypoint.score > 0.2 &&
            keypoint.x > 0 &&
            keypoint.x < videoElement.videoWidth &&
            keypoint.y > 0 &&
            keypoint.y < videoElement.videoHeight;
    });

    // Still require at least 4 out of 6 critical keypoints for full visibility
    return visibleKeypoints.length >= 4;
}

// Modified detectPose function remains the same as previous solution
async function detectPose() {
    if (!isRunning || !detector || !isMewTrackEnabled) {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        return;
    }

    if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
        animationFrameId = requestAnimationFrame(() => detectPose());
        return;
    }

    try {
        // Get pose estimations first
        const poses = await detector.estimatePoses(videoElement);

        // Handle visibility feedback with improved detection
        handleVisibilityFeedback(poses);

        const minimalVisibility = checkMinimalVisibility(poses);

        // Always draw whatever keypoints we can see, even if not enough for tracking
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (poses.length > 0) {
            const keypoints = poses[0].keypoints;
            const scale = Math.min(canvasElement.scaleX, canvasElement.scaleY);
            const offsetX = (canvasElement.width - videoElement.videoWidth * scale) / 2;
            const offsetY = (canvasElement.height - videoElement.videoHeight * scale) / 2;

            drawSkeleton(keypoints, scale, offsetX, offsetY);
            drawKeypoints(keypoints, scale, offsetX, offsetY);
        }

        // Only run workout detection if we have minimal visibility
        if (minimalVisibility && window.workoutManager) {
            window.workoutManager.handlePoseDetection(poses);
        }

        animationFrameId = requestAnimationFrame(() => detectPose());
    } catch (error) {
        console.error('Detection error:', error);
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

function showFormFeedback(messages, type = 'info') {
    const feedbackElement = document.getElementById('form-feedback') ||
        document.createElement('div');

    feedbackElement.id = 'form-feedback';

    // Clear feedback if empty messages array is passed
    if (!messages || messages.length === 0) {
        feedbackElement.innerHTML = '';
        if (!document.getElementById('form-feedback')) {
            document.body.appendChild(feedbackElement);
        }
        return;
    }

    // Only update if there are new messages
    const lastUpdateTime = feedbackElement.dataset.lastUpdate || 0;
    const currentTime = Date.now();

    // Only update UI every 2 seconds to prevent flashing
    if (currentTime - lastUpdateTime > 2000) {
        feedbackElement.innerHTML = messages.map(msg => {
            if (!msg) return '';
            return `
                <div class="feedback-message ${type}">
                    <span class="feedback-icon">${getFeedbackIcon(type)}</span>
                    <span class="feedback-text">${msg}</span>
                </div>
            `;
        }).join('');

        feedbackElement.dataset.lastUpdate = currentTime;
    }

    if (!document.getElementById('form-feedback')) {
        document.body.appendChild(feedbackElement);
    }
}

// Helper function to get appropriate icon for each feedback type
function getFeedbackIcon(type) {
    switch (type) {
        case 'success':
            return '🎉';
        case 'warning':
            return '⚠️';
        case 'error':
            return '❌';
        case 'info':
        default:
            return '💡';
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
// Music Function (pop up window)
// Initialize required elements
// const popupContainer = document.getElementById('popup-container');
// const popupTitle = document.getElementById('popup-title');
// const popupBody = document.getElementById('popup-body');
// const closeBtn = document.getElementById('close-btn');
const musicBtn = document.querySelector('.music-btn');
const musicLibrary = document.querySelector('.music-library');

const musicTracks = [
    {
        title: "Nu Love",
        artist: "Momot Music",
        duration: "4:45",
        url: "./assets/workout_music/Nu Love.mp3",
        cover: "https://images.unsplash.com/photo-1519501025264-65ba15a82390"
    },
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
        this.volume = 0.4;
        this.progressUpdateInterval = null;
        this.isLoading = false;
        this.playAttempts = 0;
        this.isFirstPlay = true;

        // Initialize audio properties
        this.audio.volume = this.volume;
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
            this.isLoading = false;

            // Auto-play when loaded if we were supposed to be playing
            if (this.shouldBePlayingAfterLoad) {
                this.audio.play().catch(err => console.warn('Auto-play after load failed:', err));
                this.shouldBePlayingAfterLoad = false;
            }
        });

        // Add error handling
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.isLoading = false;

            // Try next track on error
            if (this.isPlaying) {
                this.nextTrack();
            }
        });
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

    updatePlayButton() {
        const playIcon = document.querySelector('.play i');
        playIcon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    play() {
        if (this.isPlaying) return Promise.resolve(); // Already playing

        // Reset loading attempts if playback is successful
        this.playAttempts = 0;

        this.isPlaying = true;
        this.updatePlayButton(); // Sync play button state

        // Attempt to play audio
        return this.audio.play()
            .then(() => {
                console.log('Playback started');
                this.isPlaying = true;
            })
            .catch(error => {
                console.warn('Playback failed:', error);

                // Retry logic: Load the track if not already loaded
                if (!this.audio.duration && !this.isLoading) {
                    this.isLoading = true;
                    this.loadTrack(true); // Load track and auto-play
                }

                // Skip to next track if the current one is problematic
                if (error.name === 'NotSupportedError' || error.name === 'AbortError') {
                    this.nextTrack();
                    return this.play();
                }

                return Promise.reject(error);
            });
    }

    pause() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.shouldBePlayingAfterLoad = false;
        this.audio.pause();
        this.updatePlayButton();
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

    loadTrack(autoPlay = true, countdownSeconds = 2) {
        const track = this.playlist[this.currentTrackIndex];
        this.isLoading = true;

        // Update UI elements for track info
        document.querySelector('.title').textContent = track.title;
        document.querySelector('.artist').textContent = track.artist;

        // Set audio source and load the track
        this.audio.src = track.url;
        this.audio.load();

        // Add countdown before playing
        if (autoPlay) {
            // Create countdown UI if it doesn't exist
            let countdownEl = document.querySelector('.music-countdown');
            if (!countdownEl) {
                countdownEl = document.createElement('div');
                countdownEl.className = 'music-countdown';
                document.querySelector('.player-card').appendChild(countdownEl);
            }

            // Determine countdown duration - 11 seconds for first track, 2 seconds for subsequent tracks
            const duration = this.isFirstPlay ? 11 : 2;
            this.isFirstPlay = false; // Mark that first play has happened

            // Start countdown
            let count = duration;
            countdownEl.textContent = `Music starts in ${count}...`;
            countdownEl.style.display = 'none';

            const countdownInterval = setInterval(() => {
                count--;
                if (count > 0) {
                    // countdownEl.textContent = `Music starts in ${count}...`;
                } else {
                    clearInterval(countdownInterval);
                    countdownEl.style.display = 'none';

                    // Play the audio after countdown
                    this.audio.play()
                        .then(() => {
                            this.isPlaying = true;
                            this.updatePlayButton(); // Sync play button state
                        })
                        .catch(err => {
                            console.warn('Auto-play after countdown failed:', err);
                        });
                }
            }, 1000);
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

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value)); // Ensure volume is between 0 and 1
        this.audio.volume = this.volume;

        // Update UI if available
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }
    }

    maintainCurrentTrack() {
        // This method ensures the current track continues playing
        // when a workout starts, without resetting or changing tracks
        if (this.isPlaying) {
            // If already playing, do nothing
            return;
        } else {
            // If not playing, start the current track without changing it
            this.play();
        }
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
            let top = buttonRect.top - popupRect.height - 20;
            let left = buttonRect.left - (popupRect.width - buttonRect.width) / 2;

            // Ensure popup stays within viewport
            if (left + popupRect.width > window.innerWidth) {
                left = window.innerWidth - popupRect.width - 40;
            }
            if (left < 10) {
                left = 10;
            }
            if (top < 10) {
                top = buttonRect.bottom + 10;
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

    // Define layouts
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
    let selectedLayout = localStorage.getItem('selectedLayout') || 'side-by-side'; // Load saved layout

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
    document.querySelector(`[data-layout="${selectedLayout}"]`).classList.add('active');

    // Handle apply button click
    const applyButton = popupBody.querySelector('.apply-layout');
    applyButton.addEventListener('click', () => {
        applyLayout(selectedLayout);
        popupContainer.style.display = 'none';
        // Save selected layout to local storage
        localStorage.setItem('selectedLayout', selectedLayout);
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

    // Apply animation
    workoutContainer.style.transition = 'all 0.5s ease-in-out';

    // Update canvas size after layout change
    if (canvasElement) {
        const rect = workoutUser.getBoundingClientRect();

        // Add animation for canvas resizing
        canvasElement.style.transition = 'all 0.5s ease-in-out';
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
    const savedLayout = localStorage.getItem('selectedLayout') || 'side-by-side';
    workoutContainer.classList.add(`layout-${savedLayout}`);
});


//.........................................................................................//
// Connection between workout page data to subworkout page

// At the beginning of your subworkout_page.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the workout manager
    const workoutManager = new WorkoutManager();
    window.workoutManager = workoutManager; // Make it globally accessible if needed

    // Check if we're restarting a workout
    const shouldRestart = localStorage.getItem('restartWorkout') === 'true';

    if (shouldRestart) {
        // Clear the restart flag
        localStorage.removeItem('restartWorkout');
        console.log('Restarting workout from done page...');
        // Call restart function
        workoutManager.restartWorkout();
    } else {
        // Regular initialization
        console.log('Starting new workout...');
        workoutManager.startCountdown();
    }
});
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
        // Initialize voice instructions
        this.initializeVoiceInstructions();

        // Initialize workout music player
        this.workoutMusicPlayer = new WorkoutMusicPlayer();
        // Initialize pose detector
        this.poseDetector = new WorkoutPoseDetector();
        this.fullBodyAlertActive = false;
        // Would store reference keypoints for each exercise
        this.referenceKeypointsLibrary = {};

        // Add these lines:
        this.setupPauseButton();
        this.setupCloseButton();
        this.setupSkipButton();

    }

    handlePoseDetection(poses) {
        if (!this.poseDetector || !poses || poses.length === 0) return;

        // Get the current exercise name from the workout
        const currentExercise = this.exercises[this.currentExerciseIndex].exercise;

        // Ensure the pose detector is set to the current exercise
        if (this.poseDetector.currentExercise !== currentExercise) {
            console.log(`Setting current exercise to: ${currentExercise}`);
            this.poseDetector.startExercise(currentExercise);
        }

        const keypoints = poses[0].keypoints;
        const result = this.poseDetector.analyzePose(keypoints);

        // Update rep counter display
        if (result.repCount > this.repCount) {
            this.repCount = result.repCount;
            this.timerElement.textContent = this.repCount;

            // Check if exercise is complete based on reps
            if (this.exercises[this.currentExerciseIndex].reps &&
                this.repCount >= this.exercises[this.currentExerciseIndex].reps) {
                this.nextExercise();
            }
        }

        // Show form feedback
        if (result.feedback && notificationsEnabled) {
            showFormFeedback([result.feedback]);
        }
    }

    // Add this method to initialize voice instructions
    initializeVoiceInstructions() {
        // Check if ResponsiveVoice is available
        if (typeof responsiveVoice === 'undefined') {
            console.error('ResponsiveVoice not found. Make sure to include the ResponsiveVoice library.');
            // Add fallback for voice functions
            this.speakText = (text) => console.log('Voice would say:', text);
            this.voiceEnabled = false;
            return;
        }

        this.voiceEnabled = true; ``
        this.voiceSettings = {
            pitch: 1,
            rate: 1,
            volume: 1,
            voice: 'UK English Female' // You can change the voice as needed
        };

        // Create a voice toggle button
        this.createVoiceToggleButton();
    }

    // Create a toggle button for voice instructions
    createVoiceToggleButton() {
        const controlsContainer = document.querySelector('.controls-workout');
        if (!controlsContainer) return;

        const voiceButton = document.createElement('button');
        voiceButton.className = 'voice-toggle';
        voiceButton.innerHTML = `
            <i id="voice-btn-icon" class="fas ${this.voiceEnabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
            <span class="voice-text">${this.voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
        `;
        voiceButton.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
        `;

        voiceButton.addEventListener('click', () => {
            this.voiceEnabled = !this.voiceEnabled;
            const voiceIcon = document.getElementById('voice-btn-icon');
            const voiceText = voiceButton.querySelector('.voice-text');

            if (voiceIcon && voiceText) {
                if (this.voiceEnabled) {
                    voiceIcon.classList.remove('fa-volume-mute');
                    voiceIcon.classList.add('fa-volume-up');
                    voiceText.textContent = 'Voice On';
                    this.speakText('Voice instructions enabled');
                } else {
                    voiceIcon.classList.remove('fa-volume-up');
                    voiceIcon.classList.add('fa-volume-mute');
                    voiceText.textContent = 'Voice Off';
                    // One last message before turning off
                    this.speakText('Voice instructions disabled');
                }
            }
        });

        // Add the button to the controls container
        controlsContainer.appendChild(voiceButton);
    }

    // Method to speak text using ResponsiveVoice
    speakText(text, onEndCallback = null) {
        if (!this.voiceEnabled || typeof responsiveVoice === 'undefined') return;

        responsiveVoice.speak(text, this.voiceSettings.voice, {
            pitch: this.voiceSettings.pitch,
            rate: this.voiceSettings.rate,
            volume: this.voiceSettings.volume,
            onend: onEndCallback
        });
    }

    // Cancel any ongoing speech
    cancelSpeech() {
        if (typeof responsiveVoice !== 'undefined') {
            responsiveVoice.cancel();
        }
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

        // Announce current exercise
        const exerciseName = currentExercise.exercise || currentExercise.pose;
        let announcement = `${exerciseName}`;

        if (currentExercise.reps) {
            announcement += `, ${currentExercise.reps} reps`;
            this.timerElement.textContent = '0';
            this.timerElement.classList.add('rep-counter');
        } else if (currentExercise.duration) {
            // Parse the duration properly
            let durationInSeconds = this.parseDuration(currentExercise.duration);
            // Display in minutes:seconds format
            this.updateTimerDisplay(durationInSeconds);
            this.timerElement.classList.remove('rep-counter');

            // Add duration to announcement
            if (durationInSeconds >= 60) {
                const minutes = Math.floor(durationInSeconds / 60);
                const seconds = durationInSeconds % 60;
                announcement += `, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                if (seconds > 0) {
                    announcement += ` and ${seconds} second${seconds !== 1 ? 's' : ''}`;
                }
            } else {
                announcement += `, ${durationInSeconds} second${durationInSeconds !== 1 ? 's' : ''}`;
            }
        }

        // Add set information
        announcement += `, set ${this.currentSet} of ${this.totalSets}`;

        // Speak the exercise information
        this.speakText(announcement);

        // Show current exercise video
        this.showExerciseVideo(currentExercise);
    }


    // Add this method to show exercise video
    showExerciseVideo(exercise) {
        if (!this.workoutGuide || !exercise.video) return;

        // Create or update video element
        let videoElement = this.workoutGuide.querySelector('video');

        if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.classList.add('exercise-video');
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.borderRadius = '16px';
            videoElement.style.objectFit = 'cover';
            videoElement.style.border = 'solid 2px #feaf88';
            videoElement.setAttribute('loop', 'true');
            videoElement.setAttribute('autoplay', 'true');
            videoElement.setAttribute('muted', 'true');
            videoElement.setAttribute('playsinline', 'true'); // Add this for iOS support
            this.workoutGuide.innerHTML = '';
            this.workoutGuide.appendChild(videoElement);
        }

        // First pause any existing playback to avoid conflicts
        videoElement.pause();

        // Set video source
        videoElement.src = exercise.video;

        // Wait for the video to be loaded before playing
        videoElement.onloadeddata = () => {
            videoElement.play().catch(error => {
                console.error('Error playing video after load:', error);
            });
        };

        // Start loading the video
        videoElement.load();
    }

    // Add this method to show next exercise video
    showNextExerciseVideo() {
        let nextIndex = this.currentExerciseIndex;
        let nextSet = this.currentSet;

        // Calculate the next exercise index
        if (nextIndex >= this.exercises.length - 1) {
            if (nextSet >= this.totalSets) {
                // No next exercise (workout complete)
                return;
            }
            nextIndex = 0;
            nextSet++;
        } else {
            nextIndex++;
        }

        const nextExercise = this.exercises[nextIndex];
        if (nextExercise && nextExercise.video) {
            this.showExerciseVideo(nextExercise);
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

        this.workoutMusicPlayer.play();

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
        // Initialize the pose detector for the current exercise
        this.poseDetector.startExercise(currentExercise, null);
        this.repCount = 0;

        // Announce rep target
        this.speakText(`Complete ${targetReps} reps`);

        if (typeof detectPose === 'function' && typeof videoElement !== 'undefined') {
            const originalDetectPose = detectPose.bind(this);
            detectPose = async () => {
                try {
                    await originalDetectPose();

                    if (this.poseDetector && detector) {
                        const poses = await detector.estimatePoses(videoElement);
                        if (poses.length > 0) {
                            const result = this.poseDetector.analyzePose(poses[0].keypoints);
                            if (result.repCount > this.repCount) {
                                this.repCount = result.repCount;
                                this.timerElement.textContent = this.repCount;

                                // Add feedback handling
                                if (result.feedback) {
                                    this.speakText(result.feedback);
                                    // Update UI feedback element if needed
                                    document.getElementById('feedback').textContent = result.feedback;
                                }

                                // Motivational messages
                                if (this.repCount === Math.floor(targetReps / 2)) {
                                    this.speakText('Halfway there!');
                                } else if (targetReps - this.repCount === 5) {
                                    this.speakText('Just 5 more reps!');
                                } else if (targetReps - this.repCount === 3) {
                                    this.speakText('Almost there! 3 more!');
                                } else if (targetReps - this.repCount === 1) {
                                    this.speakText('Last one, make it count!');
                                }

                                if (this.repCount >= targetReps) {
                                    this.speakText('Great job! Exercise complete!');
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
        let notifiedHalfway = false;
        let notifiedTenSeconds = false;
        let notifiedFiveSeconds = false;

        // Update timer display immediately
        this.updateTimerDisplay(timeLeft);

        this.timer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(timeLeft);

            // Halfway notification
            if (!notifiedHalfway && timeLeft <= Math.floor(seconds / 2)) {
                notifiedHalfway = true;
                this.speakText('Halfway there, keep going!');
            }

            // 10 seconds remaining notification
            if (!notifiedTenSeconds && timeLeft === 10) {
                notifiedTenSeconds = true;
                this.speakText('10 seconds remaining');
            }

            // 5 seconds countdown
            if (timeLeft <= 5 && timeLeft > 0 && !notifiedFiveSeconds) {
                notifiedFiveSeconds = true;
                this.speakText(`${timeLeft}`);
            }

            if (timeLeft <= 0) {
                this.clearAllTimers();
                // Exercise completed notification
                this.speakText('Exercise complete!');
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

        this.isPaused = false;

        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;

            if (this.isPaused) {
                // Pause workout and music
                pauseIcon.classList.remove('fa-pause');
                pauseIcon.classList.add('fa-play');
                pauseText.textContent = 'Resume';

                // Announce pause
                this.speakText('Workout paused');

                // Stop all active processes
                this.clearAllTimers();
                if (typeof stopDetection === 'function') {
                    stopDetection();
                }
                if (typeof isRunning !== 'undefined') {
                    isRunning = false;
                }

                this.pauseExerciseVideo();
                this.showPauseOverlay();
            } else {
                // Resume workout and music
                pauseIcon.classList.remove('fa-play');
                pauseIcon.classList.add('fa-pause');
                pauseText.textContent = 'Pause';

                // Announce resume
                this.speakText('Resuming workout');

                // Hide pause overlay
                this.hidePauseOverlay();
                this.resumeExerciseVideo();

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
                            // Split the time string into minutes and seconds
                            const timeParts = timeString.split(':');
                            const minutes = parseInt(timeParts[0]);
                            const seconds = parseInt(timeParts[1]);
                            // Convert to total seconds
                            timeLeft = (minutes * 60) + seconds;
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
                detail: { isPaused: this.isPaused }
            });
            document.dispatchEvent(pauseEvent);
        });
    }

    // Add these methods to pause/resume video
    pauseExerciseVideo() {
        const videoElement = this.workoutGuide.querySelector('video');
        if (videoElement) {
            videoElement.pause();
        }
        // Also pause any ongoing speech
        this.cancelSpeech();
    }

    resumeExerciseVideo() {
        const videoElement = this.workoutGuide.querySelector('video');
        if (videoElement) {
            videoElement.play().catch(error => {
                console.error('Error resuming video:', error);
            });
        }
    }

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
                z-index: 999;
            `;

            pauseOverlay.innerHTML = `
                <div class="pause-message" style="text-align: center; padding: 20px;">
                    <img src="./assets/icons/pause_workout.svg" alt="Pause" style="max-width: 150px; margin-bottom: 1rem;" />
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
            this.clearAllTimers();
            this.pauseExerciseVideo();
            if (typeof isRunning !== 'undefined') {
                isRunning = false;
            }
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
            // If the workout is paused, resume it first
            if (this.isPaused) {
                this.isPaused = false;

                // Update UI
                const pauseIcon = document.getElementById('pause-btn-icon');
                const pauseText = document.querySelector('.pause-text');
                if (pauseIcon && pauseText) {
                    pauseIcon.classList.remove('fa-play');
                    pauseIcon.classList.add('fa-pause');
                    pauseText.textContent = 'Pause';
                }

                // Hide overlay
                this.hidePauseOverlay();

                // Resume detection
                if (typeof startDetection === 'function') {
                    startDetection();
                }
                if (typeof isRunning !== 'undefined') {
                    isRunning = true;
                }
            }

            // Skip to next exercise and go to subworkout_done_page when last exercise is skipped
            if (this.currentExerciseIndex >= this.exercises.length - 1) {
                if (this.currentSet >= this.totalSets) {
                    this.showConfirmationPopup(
                        'End Workout',
                        'Do you want to end the workout?',
                        () => {
                            this.endWorkout();
                        }
                    );
                    return;
                }
            }
            this.skipCurrentExercise();
        });
    }

    skipCurrentExercise() {
        // Announce skipping exercise
        this.speakText('Skipping to next exercise');

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
            <div class="popup-content">
                <h2>${title}</h2>
                <p>${message}</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 35px; margin-bottom: 20px;">
                    <button id="popup-yes" style="padding: 15px 50px; border: none; border-radius: 18px; cursor: pointer; background-color: #ff5757; color: white;">Yes</button>
                    <button id="popup-no" style="padding: 15px 50px; border: none; border-radius: 18px; cursor: pointer; background-color: #ffb089; color: white;">No</button>
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
            if (!this.isPaused) {
                this.resumeExerciseVideo()
                this.startRestTimer()

                const currentExercise = this.exercises[this.currentExerciseIndex];
                if (currentExercise && currentExercise.duration) {
                    // Extract current time left from the timer display
                    let timeString = this.timerElement.textContent;
                    let timeLeft = 0;

                    if (timeString.includes(':')) {
                        // Split the time string into minutes and seconds
                        const timeParts = timeString.split(':');
                        const minutes = parseInt(timeParts[0]);
                        const seconds = parseInt(timeParts[1]);
                        // Convert to total seconds
                        timeLeft = (minutes * 60) + seconds;
                    } else {
                        timeLeft = parseInt(timeString);
                    }

                    if (!isNaN(timeLeft) && timeLeft > 0) {
                        this.startTimer(timeLeft);
                    }
                }

                if (typeof startDetection === 'function') {
                    startDetection();
                }

                if (typeof isRunning !== 'undefined') {
                    isRunning = true;
                }
            }
        });
    }

    // Restart workout
    restartWorkout() {
        this.clearAllTimers();
        this.repCounter = null;
        this.currentExerciseIndex = 0;
        this.currentSet = 1;
        this.isResting = false;

        if (typeof stopDetection === 'function') stopDetection();

        console.log("Restarting workout...");
        // Restart countdown
        this.startCountdown();
    }

    saveWorkoutData(workout) {
        localStorage.setItem('currentWorkout', JSON.stringify(workout));
    }

    saveWorkoutStats(duration, calories) {
        localStorage.setItem('workoutStats', JSON.stringify({
            duration: duration,
            calories: calories
        }));
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

        const nextExerciseIndex = (this.currentExerciseIndex >= this.exercises.length - 1) ?
            (this.currentSet >= this.totalSets ? -1 : 0) :
            this.currentExerciseIndex + 1;

        const nextExercise = (nextExerciseIndex >= 0) ? this.exercises[nextExerciseIndex] : null;

        // Announce rest period
        this.speakText('Rest time. Take a break.');

        if (nextExercise) {
            this.workoutNameElement.textContent = `Next: ${nextExercise.exercise}`;
            // Announce next exercise after a short delay
            setTimeout(() => {
                this.speakText(`Coming up next: ${nextExercise.exercise}`);
            }, 2000);

            // Show next exercise video during rest
            this.showNextExerciseVideo();
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
        let notifiedHalfway = false;
        let notifiedTenSeconds = false;
        let notifiedFiveSeconds = false;

        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateRestTimer(this.timeLeft);

                // Rest time notifications
                if (!notifiedHalfway && this.timeLeft === 10) {
                    notifiedHalfway = true;
                    this.speakText('10 seconds of rest remaining');
                } else if (!notifiedFiveSeconds && this.timeLeft === 5) {
                    notifiedFiveSeconds = true;
                    this.speakText('Get ready for the next exercise');
                } else if (this.timeLeft <= 3 && this.timeLeft > 0) {
                    this.speakText(`${this.timeLeft}`);
                }

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

        // Announce that rest is over
        this.speakText('Rest time is over. Let\'s continue!');

        if (isRunning && detector && isMewTrackEnabled) {
            animationFrameId = requestAnimationFrame(() => detectPose());
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
                <div class="count-circle">10</div>
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

        // Announce workout is about to begin
        this.speakText(`Get ready for ${this.workout?.title || 'your workout'}. Starting in 3 seconds.`);

        // Preload first exercise video
        if (this.exercises[0] && this.exercises[0].video) {
            const preloadVideo = document.createElement('video');
            preloadVideo.src = this.exercises[0].video;
            preloadVideo.style.display = 'none';
            preloadVideo.preload = 'auto';
            document.body.appendChild(preloadVideo);
            setTimeout(() => {
                document.body.removeChild(preloadVideo);
            }, 3000);
        }

        // Set initial count
        let currentCount = 10;

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

                // Announce the countdown number
                if (currentCount > 0) {
                    this.speakText(currentCount.toString());
                }

                if (currentCount <= 0) {
                    // Clear timer and hide overlay
                    clearInterval(this.countdownTimer);
                    this.countdownTimer = null;
                    this.countdownOverlay.style.display = 'none';

                    // Announce beginning of workout
                    this.speakText('Begin!');

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
            // Calculate actual duration and calories based on completed exercises
            const workoutDuration = this.totalDuration || 14; // Using total tracked duration or fallback
            const workoutCalories = this.totalCalories || 203; // Using total tracked calories or fallback

            // Save stats before navigating
            const workoutStats = {
                duration: `${workoutDuration} Minutes`,
                calories: `${workoutCalories} kcal`
            };
            localStorage.setItem('workoutStats', JSON.stringify(workoutStats));

            // Stop music when workout ends
            if (this.workoutMusicPlayer) {
                this.workoutMusicPlayer.pause();
            }

            // Announce workout completion
            this.speakText('Congratulations! Workout complete.', () => {
                if (typeof pause === 'function') {
                    pause();
                }
                localStorage.removeItem('currentWorkout');
                window.location.href = 'subworkout_done_page.html';
            });
        } catch (error) {
            console.error('Error ending workout:', error);
            localStorage.removeItem('currentWorkout');
            window.location.href = 'subworkout_done_page.html';
        }
    }
}

// Initialize workout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const workoutManager = new WorkoutManager();
    window.workoutManager = workoutManager;
    workoutManager.init();
});

//.........................................................................................//
// Pose detection algorithm
class WorkoutPoseDetector {
    constructor() {
        this.repCounter = 0;
        this.lastState = null;
        this.keypointHistory = [];
        this.historySize = 10;
        this.exerciseDetectors = {};
        this.currentExercise = null;
        this.poseCorrection = {};
        this.referenceKeypoints = null;
        this.lastFeedback = null;
        this.lastFeedbackTime = 0;
        this.FEEDBACK_INTERVAL = 5000; // 5 seconds between feedback
        this.lastGeneratedFeedback = null;
        this.exerciseType = null; // 'reps' or 'time'

        this.registerExerciseDetectors();
    }

    // Initialize with the current exercise
    startExercise(exercise, exerciseType = 'reps', referenceKeypoints = null) {
        // Add extra logging
        console.log(`Attempting to start exercise: ${exercise}, type: ${exerciseType}`);

        this.currentExercise = exercise;
        this.exerciseType = exerciseType; // 'reps' or 'time'
        this.repCounter = 0;
        this.lastState = null;
        this.keypointHistory = [];
        this.poseCorrection = {};
        this.referenceKeypoints = referenceKeypoints;

        // Ensure detectors are registered
        if (Object.keys(this.exerciseDetectors).length === 0) {
            this.registerExerciseDetectors();
        }

        console.log("Registered detectors:", Object.keys(this.exerciseDetectors));
    }

    // Register all exercise detectors
    registerExerciseDetectors() {
        console.log("Registering exercise detectors...");

        // ==================== CARDIO EXERCISES ====================
        // Time-based Cardio
        this.registerDetector('March On The Spot', this.detectMarchOnSpot); // Time
        this.registerDetector('Low Impact High Knee', this.detectLowImpactHighKnee); // Time
        this.registerDetector('Side to Side Step', this.detectSideToSideStep); // Time
        this.registerDetector('Twist & Reach', this.detectTwistReach); // Time
        this.registerDetector('Shuffle Forward and Backward', this.detectShuffle); // Time
        this.registerDetector('Ice Ski', this.detectIceSki); // Time
        this.registerDetector('Side Step Shuffle', this.detectSideStepShuffle); // Time
        this.registerDetector('Sprint', this.detectSprint); // Time
        this.registerDetector('Jog On The Spot', this.detectJogOnSpot); // Time
        this.registerDetector('Butt Kicks', this.detectButtKicks); // Time
        this.registerDetector('High Punches', this.detectHighPunches); // Time
        this.registerDetector('Lateral Shuttle Steps', this.detectLateralShuttle); // Time
        this.registerDetector('Bob Weave Circle', this.detectBobWeave); // Time

        // Rep-based Cardio/HIIT
        this.registerDetector('Burpee', this.detectBurpee); // Reps
        this.registerDetector('Jump Squat With Punches', this.detectJumpSquatPunches); // Reps
        this.registerDetector('Step-Ups', this.detectStepUps); // Reps
        this.registerDetector('Plank Jacks', this.detectPlankJacks); // Reps
        this.registerDetector('Kangaroo Hops', this.detectKangarooHops); // Reps
        this.registerDetector('Ice Skater', this.detectIceSkater); // Reps
        this.registerDetector('Step Hop Overs', this.detectStepHopOvers); // Reps
        this.registerDetector('Wide to Narrow Step Jump', this.detectWideNarrowJump); // Reps
        this.registerDetector('Squat With Punches', this.detectSquatPunches); // Reps
        this.registerDetector('Cross High Punches', this.detectCrossPunches); // Reps
        this.registerDetector('Straight Punches', this.detectStraightPunches); // Reps
        this.registerDetector('Burpee Step-Up', this.detectBurpeeStepUp); // Reps
        this.registerDetector('Decline Mountain Climbers', this.detectDeclineClimbers); // Reps
        this.registerDetector('Frogger To Squat', this.detectFroggerSquat); // Reps
        this.registerDetector('Step-Ups With Knee To Elbow', this.detectStepUpsKneeElbow); // Reps

        // ================== WEIGHT TRAINING EXERCISES ================
        // Rep-based Weighted
        this.registerDetector('Dumbbell Squat', this.detectDumbbellSquat); // Reps
        this.registerDetector('Shoulder Press', this.detectShoulderPress); // Reps
        this.registerDetector('Reverse Lunge to Shoulder Press', this.detectLungePress); // Reps
        this.registerDetector('Bicep Curls', this.detectBicepCurls); // Reps
        this.registerDetector('Tricep Kickback', this.detectTricepKickback); // Reps
        this.registerDetector('Front Raise', this.detectFrontRaise); // Reps
        this.registerDetector('Single Arm Dumbbell Row', this.detectSingleArmRow); // Reps
        this.registerDetector('Upright Dumbbell Row', this.detectUprightRow); // Reps
        this.registerDetector('Dumbbell Sumo Squat', this.detectSumoSquat); // Reps
        this.registerDetector('Walking Lunges', this.detectWalkingLunges); // Reps
        this.registerDetector('Deadlift', this.detectDeadlift); // Reps
        this.registerDetector('Goblet Squat', this.detectGobletSquat); // Reps
        this.registerDetector('Woodchop', this.detectWoodchop); // Reps
        this.registerDetector('Snatch to Shoulder Press', this.detectSnatchPress); // Reps
        this.registerDetector('Dumbbell Swing', this.detectDumbbellSwing); // Reps
        this.registerDetector('Overhead Squat', this.detectOverheadSquat); // Reps
        this.registerDetector('Single Leg Deadlift', this.detectSingleLegDeadlift); // Reps
        this.registerDetector('Reverse Fly', this.detectReverseFly); // Reps
        this.registerDetector('Plank Row', this.detectPlankRow); // Reps
        this.registerDetector('Y to T Raises', this.detectYTWings); // Reps
        this.registerDetector('Alternate Elevated Lunge', this.detectElevatedLunge); // Reps
        this.registerDetector('Tricep Dips', this.detectTricepDips); // Reps
        this.registerDetector('Burpees with Dumbbell Press', this.detectBurpeeDBPress); // Reps
        this.registerDetector('Dumbbells High Pulls', this.detectHighPulls); // Reps
        this.registerDetector('Alternate Lunge & Twist', this.detectLungeTwist); // Reps
        this.registerDetector('Head Crusher', this.detectHeadCrusher); // Reps
        this.registerDetector('Russian Twist (Dumbbell)', this.detectRussianTwist); // Reps
        this.registerDetector('Tricep Extension', this.detectTricepExtension); // Reps
        this.registerDetector('Bicep Curls to Outward Abductor', this.detectCurlAbductor); // Reps
        this.registerDetector('Squat to Shoulder Press', this.detectSquatPress); // Reps
        this.registerDetector('Single Arm Snatch to Shoulder Press', this.detectSingleSnatch); // Reps
        this.registerDetector('Pull Over', this.detectPullOver); // Reps
        this.registerDetector('Fly Hip Bridge', this.detectFlyBridge); // Reps
        this.registerDetector('Overhead Arm Circle', this.detectOverheadCircles); // Reps
        this.registerDetector('L Rotation', this.detectLRotation); // Reps
        this.registerDetector('Side to Front Raise', this.detectSideFrontRaise); // Reps

        // ============= BODYWEIGHT/WEIGHT-FREE EXERCISES ============
        // Time-based Bodyweight
        this.registerDetector('Plank', this.detectPlank); // Time
        this.registerDetector('Hip Bridge Hold', this.detectHipBridgeHold); // Time
        this.registerDetector('Superman', this.detectSuperman); // Time
        this.registerDetector('Flutter Kicks', this.detectFlutterKicks); // Time
        this.registerDetector('Windshield Wiper with Leg Extension', this.detectWindshieldWipers); // Time
        this.registerDetector('Side Plank Hip Dips', this.detectSidePlankDips); // Time

        // Rep-based Bodyweight
        this.registerDetector('Push-Up', this.detectPushUp); // Reps
        this.registerDetector('Russian Twist', this.detectRussianTwistBodyweight); // Reps
        this.registerDetector('Leg Raise with Hip Thrust', this.detectLegRaiseThrust); // Reps
        this.registerDetector('Chair Squat', this.detectChairSquat); // Reps
        this.registerDetector('Reverse Lunge', this.detectReverseLunge); // Reps
        this.registerDetector('Fire Hydrants', this.detectFireHydrants); // Reps
        this.registerDetector('Lunge Pulse', this.detectLungePulse); // Reps
        this.registerDetector('Sumo Squat', this.detectSumoSquatBodyweight); // Reps
        this.registerDetector('Curtsy Lunge', this.detectCurtsyLunge); // Reps
        this.registerDetector('Squat Pulse', this.detectSquatPulse); // Reps
        this.registerDetector('Standing Side Leg Raise', this.detectStandingLegRaise); // Reps
        this.registerDetector('Calf Raises', this.detectCalfRaises); // Reps
        this.registerDetector('Assisted Standing Kickbacks', this.detectAssistedKickbacks); // Reps
        this.registerDetector('Clock Lunge', this.detectClockLunge); // Reps
        this.registerDetector('Hip Bridge Circle', this.detectHipBridgeCircle); // Reps
        this.registerDetector('Knee Push-Up', this.detectKneePushUp); // Reps
        this.registerDetector('Wide To Narrow Push-Up', this.detectWideNarrowPushUp); // Reps
        this.registerDetector('Spiderman Push-Up', this.detectSpidermanPushUp); // Reps
        this.registerDetector('Forward To Back Lunge', this.detectForwardBackLunge); // Reps
        this.registerDetector('The Bird', this.detectBird); // Reps
        this.registerDetector('Burpee to Push-Up', this.detectBurpeePushUp); // Reps
        this.registerDetector('Split Jack Knife', this.detectSplitJackKnife); // Reps
        this.registerDetector('Sprinter Alternate Knee Tucks', this.detectSprinterTucks); // Reps
        this.registerDetector('Single Leg Hip Bridge', this.detectSingleLegBridge); // Reps
        this.registerDetector('Assisted Lunge', this.detectAssistedLunge); // Reps
        this.registerDetector('Standing Side Crunch', this.detectStandingCrunch); // Reps

        // ====================== YOGA/STRETCHING ======================
        // Time-based Yoga
        this.registerDetector('Child Pose', this.detectChildPose); // Time
        this.registerDetector('Downward Facing Dog', this.detectDownwardDog); // Time
        this.registerDetector('Butterfly Stretch', this.detectButterfly); // Time
        this.registerDetector('Cat and Camel', this.detectCatCamel); // Time
        this.registerDetector('Lying Spinal Twist', this.detectSpinalTwist); // Time
        this.registerDetector('Standing Hamstring Stretch', this.detectHamstringStretch); // Time
        this.registerDetector('Cobra', this.detectCobra); // Time
        this.registerDetector('Bridge Stretch', this.detectBridgeStretch); // Time
        this.registerDetector('Neck Stretches', this.detectNeckStretch); // Time
        this.registerDetector('Shoulder Stretch', this.detectShoulderStretch); // Time
        this.registerDetector('Chest Stretch', this.detectChestStretch); // Time
        this.registerDetector('Arm Circle', this.detectArmCircle); // Time
        this.registerDetector('Alternate Cross Stretch', this.detectCrossStretch); // Time
        this.registerDetector('Hug Knees to Chest', this.detectHugKnees); // Time
        this.registerDetector('Hip Flexor Reach', this.detectHipFlexor); // Time
        this.registerDetector('Lying Hamstring Stretch', this.detectLyingHamstring); // Time
        this.registerDetector('Wrist Stretch', this.detectWristStretch); // Time

        console.log(`Total registered exercises: ${Object.keys(this.exerciseDetectors).length}`);
    }

    // Register a specific detector function for an exercise
    registerDetector(exerciseName, detectorFunction) {
        this.exerciseDetectors[exerciseName] = detectorFunction.bind(this);
    }

    // Analyze the current pose based on the current exercise
    analyzePose(keypoints) {
        if (!this.currentExercise) {
            console.warn('No exercise selected. Current exercises:',
                Object.keys(this.exerciseDetectors));
            return {
                repCount: 0,
                feedback: "Waiting for exercise selection. Available exercises: " +
                    Object.keys(this.exerciseDetectors).join(', '),
                isCorrect: false
            };
        }

        // Add null check for exercise detectors
        if (!this.exerciseDetectors[this.currentExercise]) {
            console.warn(`Exercise configuration pending: ${this.currentExercise}`);
            return { repCount: 0, feedback: "Exercise configuration in progress...", isCorrect: false };
        }

        // Update keypoint history for smoothing
        this.updateKeypointHistory(keypoints);

        // Check if pose is correct compared to reference (if available)
        const correctnessScore = this.checkPoseCorrectness(keypoints);

        // Run the specific detector for this exercise
        const result = this.exerciseDetectors[this.currentExercise](keypoints);

        // For time-based exercises, don't show rep count
        if (this.exerciseType === 'time') {
            result.repCount = null; // Don't display rep count for time-based exercises
        }

        // Add correctness information to the result
        result.isCorrect = correctnessScore > 0.7; // 70% similarity threshold

        // Manage feedback generation
        const currentTime = Date.now();
        const timeSinceLastFeedback = currentTime - this.lastFeedbackTime;

        // Only check if we need pose correction feedback when:
        // 1. The exercise detector didn't provide specific feedback already
        // 2. The pose is not correct
        if (!result.isCorrect && (!result.feedback || result.feedback === "No data" || result.feedback === "")) {
            // Only generate new feedback if enough time has passed
            if (timeSinceLastFeedback >= this.FEEDBACK_INTERVAL) {
                const correctionFeedback = this.generatePoseCorrectionFeedback();
                // Only update if we have actual correction feedback
                if (correctionFeedback && correctionFeedback !== "Good form!") {
                    result.feedback = correctionFeedback;
                    this.lastFeedbackTime = currentTime;
                    this.lastGeneratedFeedback = result.feedback;
                }
            }
        }

        return result;
    }

    // Update keypoint history for smoothing
    updateKeypointHistory(keypoints) {
        this.keypointHistory.push(keypoints);
        if (this.keypointHistory.length > this.historySize) {
            this.keypointHistory.shift();
        }
    }

    // Get smoothed keypoints by averaging history
    getSmoothedKeypoints() {
        if (this.keypointHistory.length === 0) return null;

        // Initialize result with structure from the most recent keypoints
        const smoothed = JSON.parse(JSON.stringify(this.keypointHistory[this.keypointHistory.length - 1]));

        // For each keypoint, average x and y over history
        for (let i = 0; i < smoothed.length; i++) {
            let sumX = 0, sumY = 0, sumConfidence = 0;
            let count = 0;

            // Sum up values from history
            for (const historicalKeypoints of this.keypointHistory) {
                if (historicalKeypoints[i]) {
                    sumX += historicalKeypoints[i].x;
                    sumY += historicalKeypoints[i].y;
                    sumConfidence += historicalKeypoints[i].confidence || 0;
                    count++;
                }
            }

            // Calculate average if we have data
            if (count > 0) {
                smoothed[i].x = sumX / count;
                smoothed[i].y = sumY / count;
                smoothed[i].confidence = sumConfidence / count;
            }
        }

        return smoothed;
    }

    // Check if current pose matches reference pose
    checkPoseCorrectness(keypoints) {
        if (!this.referenceKeypoints) return 1.0; // No reference, assume correct

        let totalSimilarity = 0;
        let keypointCount = 0;

        // Get relevant keypoints for the current exercise
        const relevantKeypoints = this.getRelevantKeypointsForExercise();

        for (const keypointName of relevantKeypoints) {
            const userKeypoint = getKeypointByName(keypoints, keypointName);
            const refKeypoint = getKeypointByName(this.referenceKeypoints, keypointName);

            if (userKeypoint && refKeypoint) {
                // Calculate normalized position difference
                const similarity = this.calculateKeypointSimilarity(userKeypoint, refKeypoint);
                totalSimilarity += similarity;
                keypointCount++;

                // Record specific feedback for this keypoint
                if (similarity < 0.6) {
                    this.poseCorrection[keypointName] = {
                        current: userKeypoint,
                        reference: refKeypoint,
                        similarity: similarity
                    };
                } else {
                    // Remove from corrections if it's now good
                    delete this.poseCorrection[keypointName];
                }
            }
        }

        return keypointCount > 0 ? totalSimilarity / keypointCount : 1.0;
    }

    // Calculate similarity between two keypoints (0-1)
    calculateKeypointSimilarity(kp1, kp2) {
        // Simple Euclidean distance, normalized by some expected range
        // This could be improved with more sophisticated comparison
        const distance = calculateDistance(kp1, kp2);
        return Math.max(0, 1 - distance / 100); // Normalize, closer = higher similarity
    }

    // Generate feedback based on pose corrections
    generatePoseCorrectionFeedback() {
        // Existing implementation
        if (Object.keys(this.poseCorrection).length === 0) {
            return "Good form!";
        }

        // Find the worst keypoint to focus feedback on one thing at a time
        let worstKeypoint = null;
        let worstSimilarity = 1.0;

        for (const [keypoint, correction] of Object.entries(this.poseCorrection)) {
            if (correction.similarity < worstSimilarity) {
                worstSimilarity = correction.similarity;
                worstKeypoint = keypoint;
            }
        }

        if (!worstKeypoint) return "Good form!";

        // Generate specific feedback
        const correction = this.poseCorrection[worstKeypoint];
        const keypointDisplayName = worstKeypoint.replace('_', ' ');

        // Determine direction
        const xDiff = correction.reference.x - correction.current.x;
        const yDiff = correction.reference.y - correction.current.y;

        let direction = "";
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            direction = xDiff > 0 ? "more to the right" : "more to the left";
        } else {
            direction = yDiff > 0 ? "higher" : "lower";
        }

        return `Position your ${keypointDisplayName} ${direction}`;
    }

    // Get relevant keypoints for the current exercise
    getRelevantKeypointsForExercise() {
        switch (this.currentExercise) {
            case 'Squats':
                return ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
            case 'Push Ups':
                return ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'];
            case 'Jumping Jacks':
                return ['left_shoulder', 'right_shoulder', 'left_wrist', 'right_wrist', 'left_ankle', 'right_ankle'];
            case 'March On The Spot':
                return ['left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
            // Add more exercise-specific keypoints as needed
            default:
                return ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
        }
    }

    /* Exercise-specific detection methods */

    detectSquat(keypoints) {
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        const leftHip = getKeypointByName(smoothedKeypoints, 'left_hip');
        const rightHip = getKeypointByName(smoothedKeypoints, 'right_hip');

        if (!leftHip || !rightHip) return { repCount: this.repCounter, feedback: "Cannot track hips" };

        const hipsY = (leftHip.y + rightHip.y) / 2;

        // Normalize based on hip position range
        const min = 0.6, max = 0.9;
        const normalizedY = (hipsY - min) / (max - min);

        let feedback = "";

        if (normalizedY < 0.3 && this.lastState !== 'down') {
            this.repCounter++;
            this.lastState = 'down';
            feedback = "Great squat!";
        } else if (normalizedY > 0.7 && this.lastState === 'down') {
            this.lastState = 'up';
            feedback = "Ready for next rep";
        } else if (this.lastState === 'down') {
            feedback = "Push up to standing";
        } else if (normalizedY > 0.4 && normalizedY < 0.6) {
            feedback = "Lower into squat";
        }

        return { repCount: this.repCounter, feedback };
    }

    detectPushUp(keypoints) {
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        const leftElbow = getKeypointByName(smoothedKeypoints, 'left_elbow');
        const rightElbow = getKeypointByName(smoothedKeypoints, 'right_elbow');
        const leftShoulder = getKeypointByName(smoothedKeypoints, 'left_shoulder');
        const leftWrist = getKeypointByName(smoothedKeypoints, 'left_wrist');

        if (!leftElbow || !rightElbow || !leftShoulder || !leftWrist) {
            return { repCount: this.repCounter, feedback: "Cannot track arms" };
        }

        const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);

        let feedback = "";

        if (angle < 90 && this.lastState !== 'down') {
            this.repCounter++;
            this.lastState = 'down';
            feedback = "Good push-up!";
        } else if (angle > 160 && this.lastState === 'down') {
            this.lastState = 'up';
            feedback = "Ready for next rep";
        } else if (this.lastState === 'down') {
            feedback = "Push back up";
        } else if (angle > 120) {
            feedback = "Lower your body";
        }

        return { repCount: this.repCounter, feedback };
    }

    detectJumpingJack(keypoints) {
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        const leftWrist = getKeypointByName(smoothedKeypoints, 'left_wrist');
        const rightWrist = getKeypointByName(smoothedKeypoints, 'right_wrist');
        const leftShoulder = getKeypointByName(smoothedKeypoints, 'left_shoulder');
        const rightShoulder = getKeypointByName(smoothedKeypoints, 'right_shoulder');

        if (!leftWrist || !rightWrist || !leftShoulder || !rightShoulder) {
            return { repCount: this.repCounter, feedback: "Cannot track arms" };
        }

        const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
        const handSpread = Math.abs(leftWrist.x - rightWrist.x);
        const normalizedSpread = handSpread / shoulderWidth;

        let feedback = "";

        if (normalizedSpread > 2.5 && this.lastState !== 'open') {
            this.repCounter++;
            this.lastState = 'open';
            feedback = "Good jumping jack!";
        } else if (normalizedSpread < 1.2 && this.lastState === 'open') {
            this.lastState = 'closed';
            feedback = "Ready for next rep";
        } else if (this.lastState === 'open') {
            feedback = "Bring arms down";
        } else if (normalizedSpread < 1.5) {
            feedback = "Raise arms overhead";
        }

        return { repCount: this.repCounter, feedback };
    }

    detectMarchOnSpot(keypoints) {
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data", feedbackType: "error" };

        const leftKnee = getKeypointByName(smoothedKeypoints, 'left_knee');
        const rightKnee = getKeypointByName(smoothedKeypoints, 'right_knee');
        const leftHip = getKeypointByName(smoothedKeypoints, 'left_hip');
        const rightHip = getKeypointByName(smoothedKeypoints, 'right_hip');

        // Error case: missing critical keypoints
        if (!leftKnee || !rightKnee || !leftHip || !rightHip) {
            console.log("March error: Missing keypoints");
            return { repCount: this.repCounter, feedback: "Cannot track legs", feedbackType: "error" };
        }

        // Calculate the height of knees relative to hips
        const leftKneeHeight = leftHip.y - leftKnee.y;
        const rightKneeHeight = rightHip.y - rightKnee.y;

        // Track the highest knee
        const highestKneeHeight = Math.max(leftKneeHeight, rightKneeHeight);

        // Normalize based on hip position (higher value means knee is higher)
        const hipWidth = Math.abs(leftHip.x - rightHip.x);
        const normalizedHeight = highestKneeHeight / hipWidth;

        // Log the calculations for debugging
        console.log("March calculations:", {
            leftKneeHeight,
            rightKneeHeight,
            hipWidth,
            normalizedHeight,
            currentState: this.lastState,
            threshold: {
                high: 0.5,
                low: 0.2
            }
        });

        let feedback = "";
        let feedbackType = "info";

        // Track which knee is active
        if (!this.lastActiveKnee) {
            this.lastActiveKnee = null;
        }

        // Tracking variables
        if (!this.feedbackCooldown) {
            this.feedbackCooldown = 0;
        }

        // Reduce feedback frequency - only show feedback every few frames
        if (this.feedbackCooldown > 0) {
            this.feedbackCooldown--;
            return { repCount: this.repCounter, feedback: "", feedbackType: "info" };
        }

        // A high knee followed by a low knee counts as one rep
        if (normalizedHeight > 0.5 && this.lastState !== 'high') {
            this.lastState = 'high';
            // Only count rep when a different knee goes up
            const activeKnee = leftKneeHeight > rightKneeHeight ? 'left' : 'right';

            if ((activeKnee === 'left' && this.lastActiveKnee === 'right') ||
                (activeKnee === 'right' && this.lastActiveKnee === 'left') ||
                this.lastActiveKnee === null) {
                this.repCounter++;
                feedback = "Good march!";
                feedbackType = "success";
                this.lastActiveKnee = activeKnee;

                // Log successful rep
                console.log("March rep counted:", {
                    newCount: this.repCounter,
                    activeKnee,
                    normalizedHeight
                });
            }
        } else if (normalizedHeight < 0.2 && this.lastState === 'high') {
            this.lastState = 'low';
            // Don't show any feedback when returning to low position
            feedback = "";
            feedbackType = "info";
        } else if (this.lastState === 'high' && this.feedbackCooldown === 0) {
            // Only show this feedback occasionally
            feedback = "Lower your foot";
            feedbackType = "info";
            this.feedbackCooldown = 30; // Skip feedback for next 30 frames
        } else if (normalizedHeight < 0.3 && this.lastState === 'low' && this.feedbackCooldown === 0) {
            // Only show this feedback if the user has been in the low state for a while
            if (!this.lowStateCounter) this.lowStateCounter = 0;
            this.lowStateCounter++;

            // Only give "lift higher" feedback after being low for a while
            if (this.lowStateCounter > 60) { // About 2 seconds at 30fps
                feedback = "Lift your knee higher";
                feedbackType = "info";
                this.feedbackCooldown = 45; // Show this feedback less frequently
                this.lowStateCounter = 0;
            } else {
                feedback = "";
            }
        } else {
            // Default - no feedback when form is good
            feedback = "";
        }

        // Only show feedback in UI if there's actual feedback
        if (feedback) {
            showFormFeedback([feedback], feedbackType);

            // Log when feedback is shown
            console.log("March feedback shown:", {
                feedback,
                feedbackType,
                normalizedHeight,
                state: this.lastState
            });
        }

        return { repCount: this.repCounter, feedback, feedbackType };
    }

    detectSideToSideStep(keypoints) {
        // Implementation similar to March On The Spot but tracking lateral movement
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        const leftAnkle = getKeypointByName(smoothedKeypoints, 'left_ankle');
        const rightAnkle = getKeypointByName(smoothedKeypoints, 'right_ankle');
        const leftHip = getKeypointByName(smoothedKeypoints, 'left_hip');
        const rightHip = getKeypointByName(smoothedKeypoints, 'right_hip');

        if (!leftAnkle || !rightAnkle || !leftHip || !rightHip) {
            return { repCount: this.repCounter, feedback: "Cannot track feet" };
        }

        // Calculate hip center
        const hipCenterX = (leftHip.x + rightHip.x) / 2;

        // Calculate average ankle position
        const ankleAvgX = (leftAnkle.x + rightAnkle.x) / 2;

        // Calculate distance from hip center to ankle average
        const lateralDistance = Math.abs(hipCenterX - ankleAvgX);

        // Normalize by hip width
        const hipWidth = Math.abs(leftHip.x - rightHip.x);
        const normalizedDistance = lateralDistance / hipWidth;

        let feedback = "";

        // State machine for side to side movement
        if (normalizedDistance > 0.4 && this.lastState !== 'side') {
            // Check if we've switched sides from the last rep
            const currentSide = ankleAvgX < hipCenterX ? 'left' : 'right';

            if (currentSide !== this.lastSide) {
                this.repCounter++;
                feedback = "Good side step!";
                this.lastSide = currentSide;
            }

            this.lastState = 'side';
        } else if (normalizedDistance < 0.1 && this.lastState === 'side') {
            this.lastState = 'center';
            feedback = "Ready for next step";
        } else if (this.lastState === 'side') {
            feedback = "Return to center";
        } else if (normalizedDistance < 0.2) {
            feedback = "Step wider to the side";
        }

        return { repCount: this.repCounter, feedback };
    }

    detectHighKnees(keypoints) {
        // Get smoothed keypoint data for better detection
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        // Extract knee and hip positions
        const leftHip = smoothedKeypoints.find(kp => kp.name === "leftHip");
        const rightHip = smoothedKeypoints.find(kp => kp.name === "rightHip");
        const leftKnee = smoothedKeypoints.find(kp => kp.name === "leftKnee");
        const rightKnee = smoothedKeypoints.find(kp => kp.name === "rightKnee");

        if (!leftHip || !rightHip || !leftKnee || !rightKnee) {
            return { repCount: this.repCounter, feedback: "Can't track knees and hips" };
        }

        // Calculate midpoint between the hips
        const hipMidpointY = (leftHip.y + rightHip.y) / 2;

        // Check knee height relative to hips
        const leftKneeHeightRatio = (hipMidpointY - leftKnee.y) / this.torsoLength;
        const rightKneeHeightRatio = (hipMidpointY - rightKnee.y) / this.torsoLength;

        // Track knee positions for movement detection
        this.updateKneePositionsHistory(leftKnee, rightKnee);

        // Detect alternating knee movement
        const isAlternating = this.detectAlternatingKneeMovement();

        // Define high knee threshold (knees should rise to at least 50% of torso length)
        const HIGH_KNEE_THRESHOLD = 0.5;

        // Check if either knee is raised high enough
        const leftKneeHigh = leftKneeHeightRatio > HIGH_KNEE_THRESHOLD;
        const rightKneeHigh = rightKneeHeightRatio > HIGH_KNEE_THRESHOLD;

        // Detect motion and increment rep count if appropriate
        if (this.detectKneeRepCompletion(leftKneeHigh, rightKneeHigh)) {
            this.repCounter++;
        }

        // Generate appropriate feedback
        let feedback = "Good form";

        if (!leftKneeHigh && !rightKneeHigh) {
            feedback = "Lift your knees much higher, aim for waist level";
        } else if (!isAlternating) {
            feedback = "Alternate legs for proper high knees";
        } else if (this.detectSlowPace()) {
            feedback = "Increase your pace for effective high knees";
        }

        return {
            repCount: this.repCounter,
            feedback: feedback,
            metrics: {
                leftKneeHeight: leftKneeHeightRatio.toFixed(2),
                rightKneeHeight: rightKneeHeightRatio.toFixed(2),
                pace: this.currentPace,
                isAlternating: isAlternating
            }
        };
    }

    // Additional exercise detectors would follow the same pattern
    detectTwistReach(keypoints) {
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        // Implementation would track shoulder and hip rotation plus arm extension
        // For simplicity, reporting basic placeholder
        return { repCount: this.repCounter, feedback: "Twist and extend arms fully" };
    }

    detectBurpee(keypoints) {
        // Get smoothed keypoint data for better detection
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        // Extract relevant keypoints
        const nose = smoothedKeypoints.find(kp => kp.name === "nose");
        const leftShoulder = smoothedKeypoints.find(kp => kp.name === "leftShoulder");
        const rightShoulder = smoothedKeypoints.find(kp => kp.name === "rightShoulder");
        const leftHip = smoothedKeypoints.find(kp => kp.name === "leftHip");
        const rightHip = smoothedKeypoints.find(kp => kp.name === "rightHip");
        const leftAnkle = smoothedKeypoints.find(kp => kp.name === "leftAnkle");
        const rightAnkle = smoothedKeypoints.find(kp => kp.name === "rightAnkle");
        const leftWrist = smoothedKeypoints.find(kp => kp.name === "leftWrist");
        const rightWrist = smoothedKeypoints.find(kp => kp.name === "rightWrist");

        if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle || !rightAnkle || !leftWrist || !rightWrist) {
            return { repCount: this.repCounter, feedback: "Can't track full body" };
        }

        // Initialize burpee state tracking
        if (!this.burpeeState) {
            this.burpeeState = {
                currentPhase: "standing", // standing, squat, plank, pushUp, jump
                phaseStartTime: Date.now(),
                completedPhases: [],
                phaseTransitions: []
            };
        }

        // Calculate key metrics
        const shoulderMidpointY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipMidpointY = (leftHip.y + rightHip.y) / 2;
        const ankleMidpointY = (leftAnkle.y + rightAnkle.y) / 2;
        const wristMidpointY = (leftWrist.y + rightWrist.y) / 2;

        // Normalize by height to make detection size-independent
        const bodyHeight = ankleMidpointY - nose.y;

        // Detect body orientation and position
        const isStanding = (hipMidpointY - shoulderMidpointY) < (0.2 * bodyHeight) &&
            (shoulderMidpointY - nose.y) < (0.1 * bodyHeight);

        const isSquatting = (hipMidpointY - shoulderMidpointY) > (0.25 * bodyHeight) &&
            (ankleMidpointY - hipMidpointY) < (0.3 * bodyHeight);

        const isInPlank = Math.abs(shoulderMidpointY - hipMidpointY) < (0.3 * bodyHeight) &&
            Math.abs(shoulderMidpointY - hipMidpointY) > (0.1 * bodyHeight) &&
            (wristMidpointY - shoulderMidpointY) > (0.1 * bodyHeight);

        const isInPushUp = isInPlank &&
            Math.abs(shoulderMidpointY - wristMidpointY) < (0.15 * bodyHeight);

        const isJumping = nose.y < (ankleMidpointY - 1.1 * bodyHeight);

        // Track phase changes
        let currentPhase = this.burpeeState.currentPhase;
        let newPhase = currentPhase;

        // Determine current phase
        if (isJumping) {
            newPhase = "jump";
        } else if (isInPushUp) {
            newPhase = "pushUp";
        } else if (isInPlank) {
            newPhase = "plank";
        } else if (isSquatting) {
            newPhase = "squat";
        } else if (isStanding) {
            newPhase = "standing";
        }

        // If phase changed, record it
        if (newPhase !== currentPhase) {
            this.burpeeState.phaseTransitions.push({
                from: currentPhase,
                to: newPhase,
                time: Date.now()
            });

            this.burpeeState.completedPhases.push(currentPhase);
            this.burpeeState.currentPhase = newPhase;
            this.burpeeState.phaseStartTime = Date.now();
        }

        // Check if we've completed the burpee sequence
        const lastTransitions = this.burpeeState.phaseTransitions.slice(-6);
        const correctSequence = this.checkBurpeeSequence(lastTransitions);

        if (correctSequence) {
            this.repCounter++;
            // Reset for next rep
            this.burpeeState.phaseTransitions = [];
            this.burpeeState.completedPhases = [];
        }

        // Generate feedback
        let feedback = "Good form";
        if (currentPhase === "standing" && this.burpeeState.phaseTransitions.length === 0) {
            feedback = "Begin by moving into a squat position";
        } else if (currentPhase === "squat" && !this.burpeeState.completedPhases.includes("plank")) {
            feedback = "Place hands on ground and kick back to plank position";
        } else if (currentPhase === "plank" && !this.burpeeState.completedPhases.includes("pushUp")) {
            feedback = "Lower chest to ground for push-up";
        } else if (currentPhase === "pushUp") {
            feedback = "Push back up and return to squat position";
        } else if (currentPhase === "squat" && this.burpeeState.completedPhases.includes("pushUp")) {
            feedback = "Jump explosively from squat position";
        } else if (!correctSequence && this.burpeeState.phaseTransitions.length > 3) {
            feedback = "Complete full sequence: squat, plank, push-up, squat, jump";
        }

        return {
            repCount: this.repCounter,
            feedback: feedback,
            metrics: {
                currentPhase: currentPhase,
                completedPhases: this.burpeeState.completedPhases.join(" → "),
                isCorrectSequence: correctSequence
            }
        };
    }

    checkBurpeeSequence(transitions) {
        if (transitions.length < 5) return false;

        // Extract just the phase names in order
        const phases = ["standing", ...transitions.map(t => t.to)];

        // Check for the correct sequence (may start at different points)
        const correctSequence = ["standing", "squat", "plank", "pushUp", "squat", "jump", "standing"];

        // Check if the phases match any part of the correct sequence
        for (let i = 0; i <= correctSequence.length - phases.length; i++) {
            let match = true;
            for (let j = 0; j < phases.length; j++) {
                if (phases[j] !== correctSequence[i + j]) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }

        return false;
    }

    detectMountainClimbers(keypoints) {
        // Get smoothed keypoint data for better detection
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        // Extract relevant keypoints
        const leftShoulder = smoothedKeypoints.find(kp => kp.name === "leftShoulder");
        const rightShoulder = smoothedKeypoints.find(kp => kp.name === "rightShoulder");
        const leftHip = smoothedKeypoints.find(kp => kp.name === "leftHip");
        const rightHip = smoothedKeypoints.find(kp => kp.name === "rightHip");
        const leftKnee = smoothedKeypoints.find(kp => kp.name === "leftKnee");
        const rightKnee = smoothedKeypoints.find(kp => kp.name === "rightKnee");
        const leftAnkle = smoothedKeypoints.find(kp => kp.name === "leftAnkle");
        const rightAnkle = smoothedKeypoints.find(kp => kp.name === "rightAnkle");
        const leftWrist = smoothedKeypoints.find(kp => kp.name === "leftWrist");
        const rightWrist = smoothedKeypoints.find(kp => kp.name === "rightWrist");

        if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee ||
            !leftAnkle || !rightAnkle || !leftWrist || !rightWrist) {
            return { repCount: this.repCounter, feedback: "Can't track full body" };
        }

        // Initialize state tracking if needed
        if (!this.mountainClimberState) {
            this.mountainClimberState = {
                kneePositions: [],
                lastRepTime: Date.now(),
                isInPlank: false,
                leftKneeForward: false,
                rightKneeForward: false
            };
        }

        // Calculate key metrics
        const shoulderMidpoint = {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2
        };

        const hipMidpoint = {
            x: (leftHip.x + rightHip.x) / 2,
            y: (leftHip.y + rightHip.y) / 2
        };

        const wristMidpoint = {
            x: (leftWrist.x + rightWrist.x) / 2,
            y: (leftWrist.y + rightWrist.y) / 2
        };

        // Check if in plank position
        const torsoAngle = Math.atan2(
            hipMidpoint.y - shoulderMidpoint.y,
            hipMidpoint.x - shoulderMidpoint.x
        ) * 180 / Math.PI;

        const isInPlank = Math.abs(torsoAngle) < 30 &&
            Math.abs(shoulderMidpoint.y - wristMidpoint.y) < 50;

        this.mountainClimberState.isInPlank = isInPlank;

        if (!isInPlank) {
            return {
                repCount: this.repCounter,
                feedback: "Get into proper plank position"
            };
        }

        // Track knee positions
        this.mountainClimberState.kneePositions.push({
            leftKnee: { x: leftKnee.x, y: leftKnee.y },
            rightKnee: { x: rightKnee.x, y: rightKnee.y },
            timestamp: Date.now()
        });

        // Keep history limited to last 30 frames
        if (this.mountainClimberState.kneePositions.length > 30) {
            this.mountainClimberState.kneePositions.shift();
        }

        // Check knee positions relative to shoulders
        const leftKneeForward = leftKnee.x > shoulderMidpoint.x;
        const rightKneeForward = rightKnee.x > shoulderMidpoint.x;

        // Detect rep completion (when knee moves from behind shoulder to forward and back)
        if (leftKneeForward && !this.mountainClimberState.leftKneeForward) {
            this.repCounter++;
            this.mountainClimberState.lastRepTime = Date.now();
        } else if (rightKneeForward && !this.mountainClimberState.rightKneeForward) {
            this.repCounter++;
            this.mountainClimberState.lastRepTime = Date.now();
        }

        // Update knee position state
        this.mountainClimberState.leftKneeForward = leftKneeForward;
        this.mountainClimberState.rightKneeForward = rightKneeForward;

        // Calculate pace
        const repTimeElapsed = Date.now() - this.mountainClimberState.lastRepTime;
        const pace = 1000 / repTimeElapsed; // reps per second

        // Generate feedback
        let feedback = "Good form";

        if (!this.detectAlternatingKnees()) {
            feedback = "Alternate knees for proper mountain climbers";
        } else if (pace < 1.0) { // slower than 1 rep per second
            feedback = "Increase your pace, drive knees faster";
        } else if (!this.isProperPlankAlignment(shoulderMidpoint, hipMidpoint, wristMidpoint)) {
            feedback = "Maintain straight line from shoulders to heels";
        }

        return {
            repCount: this.repCounter,
            feedback: feedback,
            metrics: {
                pace: pace.toFixed(2),
                isInPlank: isInPlank,
                plankAngle: torsoAngle.toFixed(2)
            }
        };
    }

    detectAlternatingKnees() {
        if (!this.mountainClimberState ||
            !this.mountainClimberState.kneePositions ||
            this.mountainClimberState.kneePositions.length < 10) {
            return false;
        }

        // Check if knees are moving in alternating pattern
        let leftForward = false;
        let rightForward = false;
        let hasAlternated = false;

        for (let i = 1; i < this.mountainClimberState.kneePositions.length; i++) {
            const prev = this.mountainClimberState.kneePositions[i - 1];
            const curr = this.mountainClimberState.kneePositions[i];

            // Detect forward movement
            const leftMovingForward = curr.leftKnee.x > prev.leftKnee.x;
            const rightMovingForward = curr.rightKnee.x > prev.rightKnee.x;

            // Check for alternating pattern
            if (leftMovingForward && !rightMovingForward) {
                leftForward = true;
            } else if (!leftMovingForward && rightMovingForward) {
                rightForward = true;
            }

            if (leftForward && rightForward) {
                hasAlternated = true;
                break;
            }
        }

        return hasAlternated;
    }

    isProperPlankAlignment(shoulder, hip, wrist) {
        // Check if shoulders, hips, and heels form a straight line
        const shoulderToHipAngle = Math.atan2(
            hip.y - shoulder.y,
            hip.x - shoulder.x
        ) * 180 / Math.PI;

        // Proper plank should have angle close to horizontal
        return Math.abs(shoulderToHipAngle) < 15;
    }

    detectJumpSquatPunches(keypoints) {
        // Get smoothed keypoint data for better detection
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        // Extract relevant keypoints
        const nose = smoothedKeypoints.find(kp => kp.name === "nose");
        const leftShoulder = smoothedKeypoints.find(kp => kp.name === "leftShoulder");
        const rightShoulder = smoothedKeypoints.find(kp => kp.name === "rightShoulder");
        const leftElbow = smoothedKeypoints.find(kp => kp.name === "leftElbow");
        const rightElbow = smoothedKeypoints.find(kp => kp.name === "rightElbow");
        const leftWrist = smoothedKeypoints.find(kp => kp.name === "leftWrist");
        const rightWrist = smoothedKeypoints.find(kp => kp.name === "rightWrist");
        const leftHip = smoothedKeypoints.find(kp => kp.name === "leftHip");
        const rightHip = smoothedKeypoints.find(kp => kp.name === "rightHip");
        const leftKnee = smoothedKeypoints.find(kp => kp.name === "leftKnee");
        const rightKnee = smoothedKeypoints.find(kp => kp.name === "rightKnee");
        const leftAnkle = smoothedKeypoints.find(kp => kp.name === "leftAnkle");
        const rightAnkle = smoothedKeypoints.find(kp => kp.name === "rightAnkle");

        if (!nose || !leftShoulder || !rightShoulder || !leftElbow || !rightElbow ||
            !leftWrist || !rightWrist || !leftHip || !rightHip || !leftKnee || !rightKnee ||
            !leftAnkle || !rightAnkle) {
            return { repCount: this.repCounter, feedback: "Can't track full body" };
        }

        // Initialize state tracking if needed
        if (!this.jumpSquatPunchState) {
            this.jumpSquatPunchState = {
                phase: "standing", // standing, squatting, jumping, punching
                prevNoseY: nose.y,
                hipPositions: [],
                armExtension: {
                    left: false,
                    right: false
                },
                lastFullRepTime: Date.now()
            };
        }

        // Track vertical movement
        const verticalVelocity = this.jumpSquatPunchState.prevNoseY - nose.y;
        this.jumpSquatPunchState.prevNoseY = nose.y;

        // Track hip position for squat detection
        const hipMidpointY = (leftHip.y + rightHip.y) / 2;
        const ankleMidpointY = (leftAnkle.y + rightAnkle.y) / 2;

        this.jumpSquatPunchState.hipPositions.push({
            y: hipMidpointY,
            timestamp: Date.now()
        });

        // Keep history limited
        if (this.jumpSquatPunchState.hipPositions.length > 30) {
            this.jumpSquatPunchState.hipPositions.shift();
        }

        // Calculate key metrics
        const bodyHeight = ankleMidpointY - nose.y;
        const squatDepth = (hipMidpointY - ankleMidpointY) / bodyHeight;
        const isSquatting = squatDepth < 0.3; // Lower value means deeper squat

        // Detect jumping
        const isJumping = verticalVelocity > 15; // Upward velocity threshold

        // Detect arm extension for punches
        const leftArmExtension = this.calculateArmExtension(leftShoulder, leftElbow, leftWrist);
        const rightArmExtension = this.calculateArmExtension(rightShoulder, rightElbow, rightWrist);

        const leftPunching = leftArmExtension > 0.8 && !this.jumpSquatPunchState.armExtension.left;
        const rightPunching = rightArmExtension > 0.8 && !this.jumpSquatPunchState.armExtension.right;

        this.jumpSquatPunchState.armExtension.left = leftArmExtension > 0.8;
        this.jumpSquatPunchState.armExtension.right = rightArmExtension > 0.8;

        // Update phase
        let currentPhase = this.jumpSquatPunchState.phase;

        if (isJumping) {
            currentPhase = "jumping";
        } else if (isSquatting) {
            currentPhase = "squatting";
        } else if (leftPunching || rightPunching) {
            currentPhase = "punching";
        } else {
            currentPhase = "standing";
        }

        // Track phase changes for rep counting
        if (currentPhase !== this.jumpSquatPunchState.phase) {
            // Count a rep when completing the sequence: squat -> jump -> punch
            if (this.jumpSquatPunchState.phase === "punching" && currentPhase === "standing") {
                const timeElapsed = Date.now() - this.jumpSquatPunchState.lastFullRepTime;
                if (timeElapsed > 500) { // Prevent double counting
                    this.repCounter++;
                    this.jumpSquatPunchState.lastFullRepTime = Date.now();
                }
            }

            this.jumpSquatPunchState.phase = currentPhase;
        }

        // Generate feedback
        let feedback = "Good form";

        if (currentPhase === "standing" && this.jumpSquatPunchState.lastFullRepTime === 0) {
            feedback = "Begin with a deep squat";
        } else if (currentPhase === "squatting" && squatDepth > 0.25) {
            feedback = "Squat deeper, at least to parallel";
        } else if (currentPhase === "jumping" && verticalVelocity < 20) {
            feedback = "Jump more explosively from squat";
        } else if (currentPhase === "punching" && leftArmExtension < 0.7 && rightArmExtension < 0.7) {
            feedback = "Extend punches fully";
        }

        return {
            repCount: this.repCounter,
            feedback: feedback,
            metrics: {
                currentPhase: currentPhase,
                squatDepth: (1 - squatDepth).toFixed(2),
                jumpHeight: verticalVelocity.toFixed(2),
                leftPunchExtension: leftArmExtension.toFixed(2),
                rightPunchExtension: rightArmExtension.toFixed(2)
            }
        };
    }

    calculateArmExtension(shoulder, elbow, wrist) {
        // Calculate the actual arm length
        const upperArmLength = Math.sqrt(
            Math.pow(elbow.x - shoulder.x, 2) +
            Math.pow(elbow.y - shoulder.y, 2)
        );

        const forearmLength = Math.sqrt(
            Math.pow(wrist.x - elbow.x, 2) +
            Math.pow(wrist.y - elbow.y, 2)
        );

        const totalArmLength = upperArmLength + forearmLength;

        // Calculate the direct distance from shoulder to wrist
        const shoulderToWristDistance = Math.sqrt(
            Math.pow(wrist.x - shoulder.x, 2) +
            Math.pow(wrist.y - shoulder.y, 2)
        );

        // Extension ratio: 1.0 means fully extended, lower values mean more bent
        return shoulderToWristDistance / totalArmLength;
    }

    detectStepUps(keypoints) {
        // Get smoothed keypoint data for better detection
        const smoothedKeypoints = this.getSmoothedKeypoints();
        if (!smoothedKeypoints) return { repCount: this.repCounter, feedback: "No data" };

        // Extract relevant keypoints
        const leftHip = smoothedKeypoints.find(kp => kp.name === "leftHip");
        const rightHip = smoothedKeypoints.find(kp => kp.name === "rightHip");
        const leftKnee = smoothedKeypoints.find(kp => kp.name === "leftKnee");
        const rightKnee = smoothedKeypoints.find(kp => kp.name === "rightKnee");
        const leftAnkle = smoothedKeypoints.find(kp => kp.name === "leftAnkle");
        const rightAnkle = smoothedKeypoints.find(kp => kp.name === "rightAnkle");

        if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
            return { repCount: this.repCounter, feedback: "Can't track lower body" };
        }

        // Initialize state tracking if needed
        if (!this.stepUpState) {
            this.stepUpState = {
                hipPositionHistory: [],
                lastStepLeadLeg: null, // 'left' or 'right'
                isOnPlatform: false,
                lastRepTime: Date.now(),
                stepHeight: 0
            };
        }

        // Calculate hip midpoint
        const hipMidpointY = (leftHip.y + rightHip.y) / 2;

        // Track hip vertical position
        this.stepUpState.hipPositionHistory.push({
            y: hipMidpointY,
            leftKneeY: leftKnee.y,
            rightKneeY: rightKnee.y,
            leftAnkleY: leftAnkle.y,
            rightAnkleY: rightAnkle.y,
            timestamp: Date.now()
        });

        // Keep history limited
        if (this.stepUpState.hipPositionHistory.length > 60) { // About 2 seconds at 30fps
            this.stepUpState.hipPositionHistory.shift();
        }

        // Detect step height
        const ankleYDifference = Math.abs(leftAnkle.y - rightAnkle.y);
        if (ankleYDifference > this.stepUpState.stepHeight) {
            this.stepUpState.stepHeight = ankleYDifference;
        }

        // Detect which leg is leading the step
        const leftLeading = leftAnkle.y < rightAnkle.y - 20; // Left foot higher
        const rightLeading = rightAnkle.y < leftAnkle.y - 20; // Right foot higher

        let leadLeg = null;
        if (leftLeading) leadLeg = 'left';
        else if (rightLeading) leadLeg = 'right';

        // Detect if on platform (both legs at same height)
        const isOnPlatform = ankleYDifference < 20;

        // Detect step-up completion
        if (!this.stepUpState.isOnPlatform && isOnPlatform) {
            // Successfully stepped onto platform
            const minHipY = Math.min(...this.stepUpState.hipPositionHistory.map(pos => pos.y));
            const maxHipY = Math.max(...this.stepUpState.hipPositionHistory.map(pos => pos.y));
            const verticalDisplacement = maxHipY - minHipY;

            // Ensure sufficient vertical movement
            if (verticalDisplacement > 30 && leadLeg !== this.stepUpState.lastStepLeadLeg) {
                this.repCounter++;
                this.stepUpState.lastRepTime = Date.now();
                this.stepUpState.lastStepLeadLeg = leadLeg;
            }
        }

        // Update platform state
        this.stepUpState.isOnPlatform = isOnPlatform;

        // Generate feedback
        let feedback = "Good form";

        if (!leftLeading && !rightLeading && !isOnPlatform) {
            feedback = "Step fully onto platform";
        } else if (isOnPlatform && this.detectPoorKneeAlignment()) {
            feedback = "Keep knee aligned with ankle";
        } else if (this.detectTooFastPace()) {
            feedback = "Control your movement, avoid rushing";
        } else if (this.detectInsufficientExtension(leftHip, rightHip, leftKnee, rightKnee)) {
            feedback = "Fully extend hips and knees on platform";
        }

        return {
            repCount: this.repCounter,
            feedback: feedback,
            metrics: {
                leadLeg: leadLeg || "none",
                stepHeight: this.stepUpState.stepHeight.toFixed(2)
            }
        };
    }

    detectStepHopOvers(keypoints) {
        // Similar to step-ups but with lateral movement
        // For simplicity, reporting basic placeholder
        return { repCount: this.repCounter, feedback: "Hop completely over step" };
    }

    detectWideToNarrowStepJump(keypoints) {
        // Would track foot position changes
        // For simplicity, reporting basic placeholder
        return { repCount: this.repCounter, feedback: "Jump wider, then narrow" };
    }
}

// Helper functions (same as in original code)
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

// class RepCounter {
//     constructor(exerciseType) {
//         this.exerciseType = exerciseType;
//         this.repCount = 0;
//         this.lastState = null;
//         this.keypointHistory = [];
//         this.repThresholds = {
//             'Squats': { min: 0.6, max: 0.9 },
//             'Push Ups': { min: 0.4, max: 0.8 },
//             'Jumping Jacks': { min: 0.3, max: 0.7 }
//         };
//     }

//     analyzePose(keypoints) {
//         switch (this.exerciseType) {
//             case 'Squats':
//                 return this._analyzeSquats(keypoints);
//             case 'Push Ups':
//                 return this._analyzePushUps(keypoints);
//             case 'Jumping Jacks':
//                 return this._analyzeJumpingJacks(keypoints);
//             default:
//                 return 0;
//         }
//     }

//     _analyzeSquats(keypoints) {
//         const leftHip = keypoints.find(k => k.name === 'left_hip');
//         const rightHip = keypoints.find(k => k.name === 'right_hip');
//         const hipsY = (leftHip.y + rightHip.y) / 2;

//         this.keypointHistory.push(hipsY);
//         if (this.keypointHistory.length > 10) this.keypointHistory.shift();

//         const avgY = this.keypointHistory.reduce((a, b) => a + b, 0) / this.keypointHistory.length;
//         const normalizedY = (avgY - this.repThresholds.Squats.min) /
//             (this.repThresholds.Squats.max - this.repThresholds.Squats.min);

//         if (normalizedY < 0.3 && this.lastState !== 'down') {
//             this.repCount++;
//             this.lastState = 'down';
//             return this.repCount;
//         }
//         if (normalizedY > 0.7) this.lastState = 'up';
//         return this.repCount;
//     }

//     _analyzePushUps(keypoints) {
//         const leftElbow = keypoints.find(k => k.name === 'left_elbow');
//         const rightElbow = keypoints.find(k => k.name === 'right_elbow');
//         const shoulder = keypoints.find(k => k.name === 'left_shoulder');
//         const wrist = keypoints.find(k => k.name === 'left_wrist');

//         const angle = this._calculateAngle(shoulder, leftElbow, wrist);
//         this.keypointHistory.push(angle);
//         if (this.keypointHistory.length > 5) this.keypointHistory.shift();

//         const avgAngle = this.keypointHistory.reduce((a, b) => a + b, 0) / this.keypointHistory.length;

//         if (avgAngle < 90 && this.lastState !== 'down') {
//             this.repCount++;
//             this.lastState = 'down';
//         }
//         if (avgAngle > 160) this.lastState = 'up';
//         return this.repCount;
//     }

//     _analyzeJumpingJacks(keypoints) {
//         const leftWrist = keypoints.find(k => k.name === 'left_wrist');
//         const rightWrist = keypoints.find(k => k.name === 'right_wrist');
//         const shoulderWidth = Math.abs(
//             keypoints.find(k => k.name === 'left_shoulder').x -
//             keypoints.find(k => k.name === 'right_shoulder').x
//         );

//         const handSpread = Math.abs(leftWrist.x - rightWrist.x);
//         const normalizedSpread = handSpread / shoulderWidth;

//         if (normalizedSpread > 2.5 && this.lastState !== 'open') {
//             this.repCount++;
//             this.lastState = 'open';
//         }
//         if (normalizedSpread < 1.2) this.lastState = 'closed';
//         return this.repCount;
//     }

//     _calculateAngle(a, b, c) {
//         const radians = Math.atan2(c.y - b.y, c.x - b.x) -
//             Math.atan2(a.y - b.y, a.x - b.x);
//         let angle = Math.abs(radians * (180 / Math.PI));
//         return angle > 180 ? 360 - angle : angle;
//     }
// }

// function getKeypointByName(keypoints, name) {
//     return keypoints.find(kp => kp.name === name);
// }

// function calculateDistance(kp1, kp2) {
//     return Math.sqrt(Math.pow(kp2.x - kp1.x, 2) + Math.pow(kp2.y - kp1.y, 2));
// }

// function calculateAngle(kp1, kp2, kp3) {
//     const radians = Math.atan2(kp3.y - kp2.y, kp3.x - kp2.x) -
//         Math.atan2(kp1.y - kp2.y, kp1.x - kp2.x);
//     let angle = Math.abs(radians * (180 / Math.PI));
//     return angle > 180 ? 360 - angle : angle;
// }

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


//.........................................................................................//
// Switch camera Function

let isCameraView = false;

function toggleCameraView() {
    const guide = document.querySelector('.workout-guide');
    const userCam = document.querySelector('.workout-user');
    const btn = document.querySelector('.switch-view-btn');

    isCameraView = !isCameraView;

    if (isCameraView) {
        guide.classList.add('inactive');
        userCam.classList.add('active');
        btn.textContent = 'Switch to Guide';
        // Update canvas size when switching to camera view
        updateCanvasSize();
    } else {
        guide.classList.remove('inactive');
        userCam.classList.remove('active');
        btn.textContent = 'Switch to Camera';
    }
}

// Add this helper function (reuse your existing canvas update logic)
function updateCanvasSize() {
    if (videoElement && videoElement.parentElement) {
        const videoContainer = videoElement.parentElement;
        const rect = videoContainer.getBoundingClientRect();
        canvasElement.width = rect.width;
        canvasElement.height = rect.height;
    }
}