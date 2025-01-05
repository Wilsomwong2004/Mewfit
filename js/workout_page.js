let detector;
let videoElement;
let canvasElement;
let canvasContext;
let isRunning = false;
let animationFrameId;

// Initialize the pose detection system
async function initPoseDetection() {
    // Create video and canvas elements
    const workoutUser = document.querySelector('.workout-user');
    workoutUser.innerHTML = ''; // Clear the "User Camera" text

    // Create and style video element
    videoElement = document.createElement('video');
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    videoElement.style.borderRadius = '16px';
    videoElement.autoplay = true;
    videoElement.playsinline = true;

    // Create and style canvas element
    canvasElement = document.createElement('canvas');
    canvasElement.style.position = 'absolute';
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvasElement.style.borderRadius = '16px';

    // Set actual canvas dimensions
    canvasElement.width = workoutUser.offsetWidth;
    canvasElement.height = workoutUser.offsetHeight;

    // Add elements to container
    workoutUser.style.position = 'relative';
    workoutUser.appendChild(videoElement);
    workoutUser.appendChild(canvasElement);

    canvasContext = canvasElement.getContext('2d');

    try {
        // Access webcam
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: workoutUser.offsetWidth,
                height: workoutUser.offsetHeight
            },
            audio: false
        });
        videoElement.srcObject = stream;

        // Load pose detection model
        const model = poseDetection.SupportedModels.MoveNet;
        detector = await poseDetection.createDetector(model, {
            modelType: 'lightning'
        });

        // Start detection when video is ready
        videoElement.onloadedmetadata = () => {
            startDetection();
        };

    } catch (error) {
        console.error('Error initializing pose detection:', error);
        workoutUser.innerHTML = 'Error: Could not access camera. Please check your camera permissions and refresh the page.';
    }
}

// Detect poses and draw them
async function detectPose() {
    if (!isRunning) return;

    try {
        const poses = await detector.estimatePoses(videoElement);

        // Clear previous frame
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw keypoints and skeleton if poses detected
        if (poses.length > 0) {
            drawKeypoints(poses[0].keypoints);
            drawSkeleton(poses[0].keypoints);
        }

        animationFrameId = requestAnimationFrame(detectPose);
    } catch (error) {
        console.error('Error during pose detection:', error);
    }
}

// Draw detected keypoints
function drawKeypoints(keypoints) {
    for (const keypoint of keypoints) {
        if (keypoint.score > 0.3) {
            canvasContext.beginPath();
            canvasContext.arc(
                keypoint.x * (canvasElement.width / videoElement.videoWidth),
                keypoint.y * (canvasElement.height / videoElement.videoHeight),
                5, 0, 2 * Math.PI
            );
            canvasContext.fillStyle = '#FF6060'; // Matching your color scheme
            canvasContext.fill();
        }
    }
}

// Draw skeleton connecting keypoints
function drawSkeleton(keypoints) {
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

    canvasContext.strokeStyle = '#FFA476'; // Matching your color scheme
    canvasContext.lineWidth = 2;

    for (const [p1Name, p2Name] of connections) {
        const p1 = keypoints.find(kp => kp.name === p1Name);
        const p2 = keypoints.find(kp => kp.name === p2Name);

        if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
            canvasContext.beginPath();
            canvasContext.moveTo(
                p1.x * (canvasElement.width / videoElement.videoWidth),
                p1.y * (canvasElement.height / videoElement.videoHeight)
            );
            canvasContext.lineTo(
                p2.x * (canvasElement.width / videoElement.videoWidth),
                p2.y * (canvasElement.height / videoElement.videoHeight)
            );
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

// Initialize TensorFlow backend
async function initializeTF() {
    try {
        await tf.setBackend('webgl');
        await tf.ready();
        return true;
    } catch (error) {
        console.error('Error initializing TensorFlow:', error);
        return false;
    }
}

// Modified initialization
async function init() {
    const workoutUser = document.querySelector('.workout-user');

    try {
        // Check if libraries are loaded
        if (!areLibrariesLoaded()) {
            workoutUser.innerHTML = 'Error: Required libraries not loaded. Please check your internet connection and refresh the page.';
            return;
        }

        // Initialize TensorFlow
        const tfInitialized = await initializeTF();
        if (!tfInitialized) {
            workoutUser.innerHTML = 'Error: Could not initialize TensorFlow. Please check if your browser supports WebGL.';
            return;
        }

        // If everything is loaded, start pose detection
        await initPoseDetection();
    } catch (error) {
        console.error('Initialization error:', error);
        workoutUser.innerHTML = `Error: ${error.message}. Please refresh the page or try a different browser.`;
    }
}

// Update the window load event handler
window.addEventListener('load', async () => {
    // Wait a short moment to ensure scripts are loaded
    setTimeout(async () => {
        await init();
    }, 1000);
});
