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

// Settings option handlers
async function handleCameraSettings() {
    const popupContainer = document.getElementById('popup-container');
    const popupTitle = document.getElementById('popup-title');
    const popupBody = document.getElementById('popup-body');

    try {
        // Get list of available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        popupTitle.textContent = 'Camera Settings';

        // Create camera selection interface
        let cameraOptionsHTML = `
            <div style="padding: 10px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 10px; font-weight: 500;">Select Camera:</label>
                    <select id="cameraSelect" style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 15px;">
                        ${videoDevices.map((device, index) => `
                            <option value="${device.deviceId}">
                                ${device.label || `Camera ${index + 1}`}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button id="toggleCamera" style="
                        background-color: #ff6060;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                    ">
                        ${isRunning ? 'Turn Off Camera' : 'Turn On Camera'}
                    </button>
                    <button id="applyCameraSettings" style="
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        padding: 10px 20px;
                        cursor: pointer;
                    ">
                        Apply
                    </button>
                </div>
            </div>
        `;

        popupBody.innerHTML = cameraOptionsHTML;
        popupContainer.style.display = 'flex';

        // Set current camera as selected in dropdown
        if (videoElement && videoElement.srcObject) {
            const currentTrack = videoElement.srcObject.getVideoTracks()[0];
            if (currentTrack) {
                const select = document.getElementById('cameraSelect');
                const options = Array.from(select.options);
                const currentOption = options.find(option => {
                    const device = videoDevices.find(d => d.deviceId === option.value);
                    return device && device.label === currentTrack.label;
                });
                if (currentOption) {
                    select.value = currentOption.value;
                }
            }
        }

        // Handle toggle camera button
        const toggleButton = document.getElementById('toggleCamera');
        toggleButton.addEventListener('click', async () => {
            if (isRunning) {
                // Stop camera
                stopDetection();
                if (videoElement.srcObject) {
                    videoElement.srcObject.getTracks().forEach(track => track.stop());
                    videoElement.srcObject = null;
                }
                toggleButton.textContent = 'Turn On Camera';
                toggleButton.style.backgroundColor = '#4CAF50';
            } else {
                // Restart camera
                const selectedDeviceId = document.getElementById('cameraSelect').value;
                try {
                    await initializeCamera(selectedDeviceId);
                    startDetection();
                    toggleButton.textContent = 'Turn Off Camera';
                    toggleButton.style.backgroundColor = '#ff6060';
                } catch (error) {
                    console.error('Error restarting camera:', error);
                    showErrorModal('Failed to start camera. Please try again.');
                }
            }
        });

        // Handle apply button
        document.getElementById('applyCameraSettings').addEventListener('click', async () => {
            const selectedDeviceId = document.getElementById('cameraSelect').value;
            try {
                // Stop current camera
                if (videoElement.srcObject) {
                    videoElement.srcObject.getTracks().forEach(track => track.stop());
                }

                // Start new camera
                await initializeCamera(selectedDeviceId);
                if (!isRunning) {
                    startDetection();
                }
                popupContainer.style.display = 'none';
            } catch (error) {
                console.error('Error switching camera:', error);
                showErrorModal('Failed to switch camera. Please try again.');
            }
        });

    } catch (error) {
        console.error('Error accessing camera settings:', error);
        showErrorModal('Failed to access camera settings. Please check your browser permissions.');
    }
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


function handleInstructorChange() {
    // Add instructor change logic here
    console.log('Change instructor clicked');
}

function handleMewTrack() {
    // Add MewTrack logic here
    console.log('MewTrack clicked');
}

function handleLayout() {
    // Add layout change logic here
    console.log('Layout clicked');
}

// Initialize settings popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createSettingsPopup();
});

//.........................................................................................//
// Music & Close button Function (pop up window)

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

    document.getElementById('music').addEventListener('click', function (e) {
        e.preventDefault();
        showPopup('Music', `
            <div>
                <p>Here is some more information about the workout.</p>
                <p>This is a sample popup window with some content.</p>
            </div>
        `);
    });

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
});

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