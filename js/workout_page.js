let detector;
let videoElement;
let canvasElement;
let canvasContext;
let isRunning = false;
let animationFrameId;
let isInitialized = false;

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
        return devices.filter(device => device.kind === 'videoinput');
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
        // const videoContainer = document.createElement('div');
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

            // Start detection
            startDetection();
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
}

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
            <i class="fa-solid fa-circle-exclamation" style="font-size: 48px; color: #ff6060; margin-bottom: 15px;"></i>
            <h3 style="margin-bottom: 15px;">Camera Error</h3>
            <p style="margin-bottom: 20px;">${errorMessage}</p>
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

    workoutUser.appendChild(modalContainer);
}

// Detect poses and draw them
async function detectPose() {
    if (!isRunning || !detector) return;

    try {
        const poses = await detector.estimatePoses(videoElement);

        // Clear previous frame
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw keypoints and skeleton if poses detected
        if (poses && poses.length > 0) {
            const displayWidth = canvasElement.width;
            const displayHeight = canvasElement.height;
            const videoWidth = videoElement.videoWidth;
            const videoHeight = videoElement.videoHeight;

            // Calculate scaling to maintain aspect ratio
            const scale = Math.min(displayWidth / videoWidth, displayHeight / videoHeight);
            const scaledWidth = videoWidth * scale;
            const scaledHeight = videoHeight * scale;

            // Calculate centering offsets
            const offsetX = (displayWidth - scaledWidth) / 2;
            const offsetY = (displayHeight - scaledHeight) / 2;

            drawKeypoints(poses[0].keypoints, scale, offsetX, offsetY);
            drawSkeleton(poses[0].keypoints, scale, offsetX, offsetY);
        }

        animationFrameId = requestAnimationFrame(detectPose);
    } catch (error) {
        console.error('Error during pose detection:', error);
        isRunning = false;
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

    document.getElementById('more').addEventListener('click', function (e) {
        e.preventDefault();
        showPopup('More Information', `
            <p>Here is some more information about the workout.</p>
            <p>This is a sample popup window with some content.</p>
        `);
    });
});
