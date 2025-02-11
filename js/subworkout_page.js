let detector;
let videoElement;
let canvasElement;
let canvasContext;
let isRunning = false;
let cameras = []; // Store available cameras
let animationFrameId;
let isInitialized = false;
let isMewTrackEnabled = localStorage.getItem('mewtrackEnabled') === 'true';
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
let skeletonStyle = localStorage.getItem('skeletonStyle') || 'both';
let isCameraEnabled = localStorage.getItem('cameraEnabled') !== 'false';

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
    const workoutUser = document.querySelector('.workout-user');

    try {
        // Initialize TensorFlow first
        const tfInitialized = await initializeTF();
        if (!tfInitialized) {
            throw new Error('Could not initialize TensorFlow. Please check if your browser supports WebGL.');
        }

        // Initialize pose detector
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            }
        );

        // Proceed with camera initialization
        await requestCameraPermission();
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorModal(error.message);
    }
}


// Update the window load event handler
window.addEventListener('load', async () => {
    // Wait a moment to ensure all scripts are loaded
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
                continue; // Try next camera
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
            };

            // Initial size update
            updateCanvasSize();

            // Update size on window resize
            window.addEventListener('resize', updateCanvasSize);

            // Start detection only if MewTrack is enabled
            if (isMewTrackEnabled) {
                startDetection();
            }
        };

        // Load pose detection model
        detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
                modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
            }
        );

    } catch (error) {
        console.error('Error in video initialization:', error);
        showErrorModal(error.message);
    }
}


// Initialize the pose detection system
async function initPoseDetection() {
    // Start with permission request
    await requestCameraPermission();
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

        // Load pose detection model with correct configuration
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

    await requestCameraPermission();
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

        try {
            if (newCameraEnabled) {
                await initializeCamera(selectedDeviceId);
                isCameraEnabled = true;
                localStorage.setItem('cameraEnabled', 'true');

                if (isMewTrackEnabled) {
                    startDetection();
                }
            } else {
                stopCamera();
                isCameraEnabled = false;
                localStorage.setItem('cameraEnabled', 'false');
                showCameraOffMessage('Camera is currently turned off');
            }
        } catch (error) {
            console.error('Failed to apply camera settings:', error);
            showErrorModal('Failed to apply camera settings. Please try again.');
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

    // Rest of the existing initPoseDetection code...
    await requestCameraPermission();
}

// Update window load event to respect camera state
window.addEventListener('load', async () => {
    // Wait a moment to ensure all scripts are loaded
    setTimeout(async () => {
        if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined') {
            // Check the saved camera state
            const savedCameraState = localStorage.getItem('cameraEnabled');
            isCameraEnabled = savedCameraState !== 'false'; // Default to true if not set

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
    if (!isRunning || !detector || !isMewTrackEnabled) return;

    try {
        const poses = await detector.estimatePoses(videoElement);
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (poses.length > 0) {
            const keypoints = poses[0].keypoints;

            // Draw skeleton
            drawSkeleton(keypoints);

            // Add form validation warnings
            if (this.repCounter) {
                const formFeedback = validateForm(keypoints, this.repCounter.exerciseType);
                showFormFeedback(formFeedback);
            }
        }

        animationFrameId = requestAnimationFrame(detectPose);
    } catch (error) {
        console.error('Detection error:', error);
        animationFrameId = requestAnimationFrame(detectPose);
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

function startWorkoutCountdown(workoutName, onCompleteCallback) {
    // Set initial count
    let currentCount = 3;
    let countdownInterval;

    // Create countdown content
    const countdownContent = `
        <div class="header">
            <div class="timer">
                <div class="timer-text">0:20</div>
            </div>
            <div class="workout-details">
                <div class="workout-name">${workoutName}</div>
                <div class="workout-round">1/13</div>
            </div>
            <div id="countdown-close" class="close-btn">
                <i class="fa-solid fa-xmark"></i>
            </div>
        </div>
        <div class="countdown-main">
            <h1 class="ready-text">READY TO GO</h1>
            <div class="count-circle">${currentCount}</div>
            <div class="warmup-text">Warm-up Exercise: ${workoutName}</div>
        </div>
        <div class="bottom">
            <div class="control-panel">
                <div class="pause" id="countdown-pause">
                    <i class="fa-solid fa-pause"></i>
                    <p class="pause-text">Pause</p>
                </div>
            </div>
        </div>
    `;

    // Create overlay div
    const overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    overlay.innerHTML = countdownContent;
    document.body.appendChild(overlay);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Start countdown
    let isPaused = false;
    countdownInterval = setInterval(() => {
        if (!isPaused) {
            currentCount--;
            const countCircle = overlay.querySelector('.count-circle');
            if (countCircle) {
                countCircle.textContent = currentCount;
            }

            if (currentCount <= 0) {
                clearInterval(countdownInterval);
                overlay.remove();
                styleSheet.remove();
                if (onCompleteCallback) {
                    onCompleteCallback();
                }
            }
        }
    }, 1000);

    // Add event listeners
    const pauseBtn = overlay.querySelector('#countdown-pause');
    const closeBtn = overlay.querySelector('#countdown-close');

    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        const pauseIcon = pauseBtn.querySelector('i');
        const pauseText = pauseBtn.querySelector('.pause-text');

        if (isPaused) {
            pauseIcon.className = 'fa-solid fa-play';
            pauseText.textContent = 'Resume';
        } else {
            pauseIcon.className = 'fa-solid fa-pause';
            pauseText.textContent = 'Pause';
        }
    });

    closeBtn.addEventListener('click', () => {
        clearInterval(countdownInterval);
        overlay.remove();
        styleSheet.remove();
    });
}

// Start detection
function startDetection() {
    if (!isRunning) {
        isRunning = true;
        detectPose();
    }
}

// Stop detection
function stopDetection() {
    isRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

// Handle pause button
const pauseBtn = document.querySelector('.pause');
pauseBtn.addEventListener('click', () => {
    const pauseIcon = document.getElementById('pause-btn-icon');
    const pauseText = document.querySelector('.pause-text');

    if (isRunning) {
        stopDetection();
        pauseIcon.classList.remove('fa-pause');
        pauseIcon.classList.add('fa-play');
        pauseText.textContent = 'Resume';
    } else {
        startDetection();
        pauseIcon.classList.remove('fa-play');
        pauseIcon.classList.add('fa-pause');
        pauseText.textContent = 'Pause';
    }
});

// Handle close button
const closeBtn = document.querySelector('.close-btn');
closeBtn.addEventListener('click', () => {
    stopDetection();
    // Add your close/exit logic here
});

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

function createSettingsPopup() {
    const popupContainer = document.getElementById('popup-container-more');
    const moreButton = document.getElementById('more');
    let popup = null;

    function createPopup() {
        const popupElement = document.createElement('div');
        popupElement.className = 'popup-settings';

        const options = [
            { icon: 'fa-camera', label: 'Camera Settings' },
            { icon: 'fa-users', label: 'Change Instructor' },
            { icon: 'fa-chart-line', label: 'MewTrack' },
            { icon: 'fa-table-cells-large', label: 'Layout' }
        ];

        const optionsHTML = options.map(option => `
            <button class="settings-option">
                <i class="fa-solid ${option.icon}"></i>
                <span>${option.label}</span>
                <span class="icon-right"><i class="fa-solid fa-chevron-right"></i></span>
            </button>
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
        if (left < 20) {
            left = 20;
        }
        if (top < 20) {
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
                    case 0: // Camera Settings
                        handleCameraSettings();
                        break;
                    case 1: // Change Instructor
                        handleInstructorChange();
                        break;
                    case 2: // MewTrack
                        handleMewTrack();
                        break;
                    case 3: // Layout
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
            !popup.contains(e.target) &&
            e.target !== moreButton) {
            hidePopup();
        }
    });
}

function handleCameraSettings() {
    console.log('Camera Settings clicked');
}

function handleInstructorChange() {
    console.log('Change instructor clicked');
}

function handleMewTrack() {
    console.log('MewTrack clicked');
}

function handleLayout() {
    console.log('Layout clicked');
}

// Initialize settings popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
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
            videoElement.onloadedmetadata = () => resolve();
        });

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
                        <input type="checkbox" id="enable-mewtrack" ${isRunning ? 'checked' : ''}>
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
                        <input type="checkbox" id="enable-notifications" checked>
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

    // Update detection state based on MewTrack setting
    if (enableMewTrack && !isRunning) {
        startDetection();
    } else if (!enableMewTrack && isRunning) {
        stopDetection();
    }

    // Clear canvas if MewTrack is disabled
    if (!enableMewTrack) {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize MewTrack settings from localStorage or defaults
    isMewTrackEnabled = localStorage.getItem('mewtrackEnabled') === 'true';
    notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
    skeletonStyle = localStorage.getItem('skeletonStyle') || 'both';
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
        this.workouts = JSON.parse(localStorage.getItem('currentWorkout')) || [];
        this.currentIndex = 0;
        this.isResting = false;
        this.timer = null;
        this.repCount = 0;
        this.repCounter = null;

        // DOM Elements
        this.timerElement = document.querySelector('.timer-text');
        this.workoutNameElement = document.querySelector('.workout-name');
        this.roundElement = document.querySelector('.workout-round');
        this.workoutUser = document.querySelector('.workout-user');
        this.workoutGuide = document.querySelector('.workout-guide');
    }

    init() {
        if (this.workouts.length === 0) return;

        this.showCurrentWorkout();
        this.startWorkout();
    }

    showCurrentWorkout() {
        const current = this.workouts[this.currentIndex];
        const [duration] = current.duration.split(' ');
        const isReps = current.duration.includes('reps');

        // Update UI
        this.workoutNameElement.textContent = current.title;
        this.roundElement.textContent = `${this.currentIndex + 1}/${this.workouts.length}`;

        // Show/hide rep counter
        if (isReps) {
            this.timerElement.textContent = duration;
            this.timerElement.classList.add('rep-counter');
        } else {
            this.timerElement.textContent = `0:${duration.padStart(2, '0')}`;
            this.timerElement.classList.remove('rep-counter');
        }
    }

    startWorkout() {
        const current = this.workouts[this.currentIndex];
        const [duration] = current.duration.split(' ');
        const isReps = current.duration.includes('reps');

        if (isReps) {
            this.setupRepCounter(parseInt(duration));
        } else {
            this.startTimer(parseInt(duration));
        }
    }

    startTimer(seconds) {
        let timeLeft = seconds;

        this.timer = setInterval(() => {
            timeLeft--;
            this.timerElement.textContent = `0:${timeLeft.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.nextWorkout();
            }
        }, 1000);
    }

    setupRepCounter(targetReps) {
        const currentExercise = this.workouts[this.currentIndex].title;
        this.repCounter = new RepCounter(currentExercise);

        // Connect to pose detection
        const originalDetectPose = detectPose.bind(this);
        detectPose = async () => {
            await originalDetectPose();

            if (this.repCounter && detector) {
                const poses = await detector.estimatePoses(videoElement);
                if (poses.length > 0) {
                    const countedReps = this.repCounter.analyzePose(poses[0].keypoints);
                    this.timerElement.textContent = countedReps;

                    if (countedReps >= targetReps) {
                        this.nextWorkout();
                    }
                }
            }
        };

        if (!isRunning) startDetection();
    }

    nextWorkout() {
        this.repCounter = null;
        clearInterval(this.timer);
        this.currentIndex++;

        if (this.currentIndex >= this.workouts.length) {
            this.endWorkout();
            return;
        }

        this.showRestScreen();
    }

    showRestScreen() {
        this.isResting = true;
        const nextWorkout = this.workouts[this.currentIndex];

        // Hide camera view
        this.workoutUser.style.display = 'none';

        // Show rest screen
        this.workoutGuide.innerHTML = `
            <div class="rest-screen">
                <h2>Next: ${nextWorkout.title}</h2>
                <video src="${nextWorkout.video}" autoplay muted loop></video>
                <div class="rest-timer">10</div>
                <div class="rest-controls">
                    <button class="add-time" data-seconds="10">+10s</button>
                    <button class="add-time" data-seconds="20">+20s</button>
                    <button class="add-time" data-seconds="30">+30s</button>
                </div>
            </div>
        `;

        this.startRestTimer(10);
    }

    startRestTimer(seconds) {
        let timeLeft = seconds;
        const timerElement = this.workoutGuide.querySelector('.rest-timer');

        this.timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.endRest();
            }
        }, 1000);

        // Add time buttons
        this.workoutGuide.querySelectorAll('.add-time').forEach(btn => {
            btn.addEventListener('click', () => {
                timeLeft += parseInt(btn.dataset.seconds);
                timerElement.textContent = timeLeft;
            });
        });
    }

    endRest() {
        this.isResting = false;
        this.workoutUser.style.display = 'block';
        this.workoutGuide.innerHTML = 'Demo';
        this.showCurrentWorkout();
        this.startWorkout();
    }

    endWorkout() {
        // Show completion screen
        this.workoutGuide.innerHTML = `
            <div class="workout-complete">
                <h2>Workout Complete!</h2>
                <p>Great job completing all exercises!</p>
                <button onclick="window.location.href='workout_page.html'">Return Home</button>
            </div>
        `;
        localStorage.removeItem('currentWorkout');
    }
}

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
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');
    const closeBtn = document.getElementById('close-btn');

    function showPopup(title, content) {
        popupTitle.textContent = title;
        popupBody.innerHTML = content;
        popupContainer.style.display = 'flex';
    }

    function closePopup() {
        popupContainer.style.display = 'none';
    }

    class WorkoutMusicPlayer {
        constructor() {
            this.audio = new Audio();
            this.playlist = [];
            this.currentTrackIndex = 0;
            this.isPlaying = false;
            this.volume = 0.7;
        }

        async initializeMusicPlayer() {
            // Sample playlist - Replace with your actual music files
            this.playlist = [
                {
                    title: "Workout Energy",
                    artist: "Fitness Beats",
                    duration: "3:45",
                    url: "/path/to/music1.mp3"
                },
                {
                    title: "Power Up",
                    artist: "Gym Tracks",
                    duration: "4:20",
                    url: "/path/to/music2.mp3"
                }
            ];

            this.createMusicInterface();
            this.setupEventListeners();
        }

        createMusicInterface() {
            const musicContainer = document.createElement('div');
            musicContainer.className = 'music-player';
            musicContainer.innerHTML = `
                <div class="music-player-container">
                    <div class="music-info">
                        <div class="track-details">
                            <span class="track-title">${this.playlist[this.currentTrackIndex].title}</span>
                            <span class="track-artist">${this.playlist[this.currentTrackIndex].artist}</span>
                        </div>
                        <div class="track-duration">${this.playlist[this.currentTrackIndex].duration}</div>
                    </div>
                    
                    <div class="music-controls">
                        <button class="previous-track">
                            <i class="fas fa-backward"></i>
                        </button>
                        <button class="play-pause">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="next-track">
                            <i class="fas fa-forward"></i>
                        </button>
                        <div class="volume-control">
                            <i class="fas fa-volume-up"></i>
                            <input type="range" min="0" max="100" value="70" class="volume-slider">
                        </div>
                    </div>
                    
                    <div class="progress-container">
                        <div class="progress-bar"></div>
                        <div class="progress-current"></div>
                    </div>
                </div>
            `;

            // Add the music player to your workout interface
            const workoutContainer = document.querySelector('.workout-container');
            workoutContainer.appendChild(musicContainer);
        }

        setupEventListeners() {
            const playPauseBtn = document.querySelector('.play-pause');
            const nextBtn = document.querySelector('.next-track');
            const prevBtn = document.querySelector('.previous-track');
            const volumeSlider = document.querySelector('.volume-slider');
            const progressBar = document.querySelector('.progress-container');

            playPauseBtn.addEventListener('click', () => this.togglePlay());
            nextBtn.addEventListener('click', () => this.nextTrack());
            prevBtn.addEventListener('click', () => this.previousTrack());
            volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
            progressBar.addEventListener('click', (e) => this.seekTo(e));

            // Update progress bar
            this.audio.addEventListener('timeupdate', () => this.updateProgress());
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
            document.querySelector('.play-pause i').className = 'fas fa-pause';
        }

        pause() {
            this.audio.pause();
            this.isPlaying = false;
            document.querySelector('.play-pause i').className = 'fas fa-play';
        }

        nextTrack() {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            this.loadTrack();
        }

        previousTrack() {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
            this.loadTrack();
        }

        loadTrack() {
            const track = this.playlist[this.currentTrackIndex];
            this.audio.src = track.url;
            document.querySelector('.track-title').textContent = track.title;
            document.querySelector('.track-artist').textContent = track.artist;
            if (this.isPlaying) {
                this.play();
            }
        }

        setVolume(value) {
            this.volume = value;
            this.audio.volume = value;
        }

        updateProgress() {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.querySelector('.progress-current').style.width = `${progress}%`;
        }

        seekTo(event) {
            const progressBar = document.querySelector('.progress-container');
            const percent = event.offsetX / progressBar.offsetWidth;
            this.audio.currentTime = percent * this.audio.duration;
        }
    }

    // Initialize music player
    document.addEventListener('DOMContentLoaded', () => {
        const musicPlayer = new WorkoutMusicPlayer();
        musicPlayer.initializeMusicPlayer();
    });

    // Show music player popup
    document.getElementById('music').addEventListener('click', function (e) {
        e.preventDefault();
        showPopup('Music', `
            <div>
                <p>Select a music track to play:</p>
                <div class="music-list">
                    <div class="music-item">
                        <div class="music-item-image">
                            <img src="/path/to/music1.jpg" alt="Workout Energy">
                        </div>
                        <div class="music-item-details">
                            <span class="music-item-title">Workout Energy</span>
                            <span class="music-item-artist">Fitness Beats</span>
                        </div>
                        <button class="play-btn">Play</button>
                    </div>
                    <div class="music-item">
                        <div class="music-item-image">
                            <img src="/path/to/music2.jpg" alt="Power Up">
                        </div>
                        <div class="music-item-details">
                            <span class="music-item-title">Power Up</span>
                            <span class="music-item-artist">Gym Tracks</span>
                        </div>
                        <button class="play-btn">Play</button>
                    </div>
                </div>
            </div>
        `);
    });

    //.........................................................................................//
    // Close button Function (pop up window)

    document.getElementById('close-btn').addEventListener('click', function (e) {
        e.preventDefault();
        showPopup('Music', `
            <div>
                <p>Do you really want to end the workout?</p>
                <p>The progress of workout will not be saved.</p>
                <button onclick="closePopup()">Yes</button>
                <button onclick="closePopup()">No</button>
            </div>
        `);
    });

    document.addEventListener('DOMContentLoaded', () => {
        const workoutManager = new WorkoutManager();
        workoutManager.init();

        // Existing initialization code...
        createSettingsPopup();
        if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined') {
            init();
        }
    });
});