const containerData = [
    {
        image: "./assets/icons/cat-logo-tabs.png",
        content: "This is the first container."
    },
    {
        content: "Container 2: This is the second container.",
        image: "https://via.placeholder.com/300x150?text=Image+2"
    },
    {
        content: "Container 3: This is the third container.",
        image: "https://via.placeholder.com/300x150?text=Image+3"
    },
    {
        content: "Container 4: This is the fourth container.",
        image: "https://via.placeholder.com/300x150?text=Image+4"
    }
];

// Function to create containers
function createContainers() {
    const containerDiv = document.getElementById('dynamicContainers');

    // Loop through the containerData array and create a container for each item
    containerData.forEach(data => {
        const newContainer = document.createElement('div');
        newContainer.className = 'dynamic-container';

        // Create an image element
        const img = document.createElement('img');
        img.src = data.image; // Set the image source
        img.alt = `Image for ${data.content}`; 

        // Append the image and text to the new container
        newContainer.appendChild(img);
        newContainer.appendChild(document.createElement('br')); // Add a line break
        newContainer.appendChild(document.createTextNode(data.content)); // Add text content

        // Append the new container to the dynamicContainers div
        containerDiv.appendChild(newContainer);
    });
}

// Call the function to create containers
createContainers();