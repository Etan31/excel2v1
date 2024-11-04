document.addEventListener('DOMContentLoaded', () => {
    // displayHeaderInputs('headersRow', 'subheadersRow');
    // displayHeaderInputs('columnHeadersRow', 'columnSubheadersRow');
    displayHeaderInputs('headerInputs');
});

function openModal() {
    document.getElementById('dataModal').style.display = "flex";
}

function closeModal() {
    document.getElementById("dataModal").style.display = "none";
}
async function displayHeaderInputs(headerInputsContainerId) {
    try {
        // Fetch headers and subheaders data from the server
        const response = await fetch('http://localhost:3000/columns');
        const data = await response.json();

        // Check the fetched data
        console.log("Fetched data:", data);

        // Select the container for dynamic inputs
        const headerInputsContainer = document.getElementById(headerInputsContainerId);
        
        // Clear any existing content
        headerInputsContainer.innerHTML = "";

        // Store the fetched data in a data attribute for later use
        headerInputsContainer.dataset.headersData = JSON.stringify(data); // Ensure this line is added

        // Loop through headers and create input elements
        data.forEach((headerData, index) => {
            console.log(`Header data at index ${index}:`, headerData); // Log header data

            // Create header label to display header text only
            const headerLabel = document.createElement("label");
            headerLabel.innerText = `Header ${index + 1}: ${headerData.header}`;
            headerInputsContainer.appendChild(headerLabel);

            // Create a div to hold subheader inputs
            const subheaderContainer = document.createElement("div");
            subheaderContainer.classList.add("subheader-container");

            // Loop through subheaders and create inputs
            headerData.subheaders.forEach((subheader, subIndex) => {
                const subLabel = document.createElement("label");
                subLabel.innerText = `Subheader ${index + 1}.${subIndex + 1}: `;

                const subInput = document.createElement("input");
                subInput.type = "text";
                subInput.placeholder = "Enter subheader name";
                subInput.value = subheader.text; // Set the subheader text from the fetched data
                subInput.classList.add("subheader-input");
                subInput.dataset.heading = `h1-${index + 1}-sub-${subIndex + 1}`;

                subLabel.appendChild(subInput);
                subheaderContainer.appendChild(subLabel);
            });

            // Append subheader container to the main header container
            headerInputsContainer.appendChild(subheaderContainer);
        });
    } catch (error) {
        console.error("Error fetching headers and subheaders:", error);
    }
}

// Save headers and subheaders data
async function saveHeaderInputs() {
    const headerInputsContainer = document.getElementById("headerInputs");

    // Attempt to parse the stored headers data
    let headersData;
    try {
        headersData = JSON.parse(headerInputsContainer.dataset.headersData); // Attempt to parse the headers data
        console.log("Parsed headers data:", headersData); // Log parsed headers data
        if (!headersData) throw new Error("No headers data found."); // Throw error if it's null or undefined
    } catch (error) {
        console.error("Error parsing headers data:", error);
        return; // Exit if there's an error parsing
    }

    // Gather header and subheader data
    const headersToSend = headersData.map((headerData, index) => {
        console.log(`Processing headerData at index ${index}:`, headerData); // Log headerData being processed

        // Select input elements for the current header's subheaders
        const details = Array.from(headerInputsContainer.querySelectorAll(`.subheader-container:nth-child(${index + 1}) input`))
            .map(input => input.value)
            .filter(detail => detail.trim() !== ""); // Filter out empty inputs

        // Log details captured for the current header
        console.log(`Details for headers_id ${headerData.headers_id}:`, details);

        // Ensure we capture the headers_id from headersData
        return {
            headers_id: headerData.headers_id, // Correctly mapping headers_id
            details
        };
    }).filter(header => header.details.length > 0); // Only include headers that have details

    // Prepare payload for sending to the server
    const payload = { data: headersToSend };

    // Log the payload for debugging
    console.log("Data to be sent to the server:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('http://localhost:3000/data/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // Send the payload with the specified format
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const result = await response.json();
        console.log("Data inserted successfully:", result);
    } catch (error) {
        console.error("Error saving data:", error);
    }
}




// Event listener for the Save button
document.getElementById("saveColumnBtn").addEventListener("click", async () => {
    await saveHeaderInputs();
    closeModal();  // Close modal after saving
});
