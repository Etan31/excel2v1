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



// Toggle checkboxes based on selection
const allCheckbox = document.getElementById('allCheckbox');
const filterOptions = document.querySelectorAll('.filter-option');

// this will uncheck the selected filter headins.
allCheckbox.addEventListener('change', () => {
    if (allCheckbox.checked) filterOptions.forEach(checkbox => checkbox.checked = false);
});

// filter the displayed inputs to insert, and will uncheck the 'all' checkbox.
filterOptions.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        allCheckbox.checked = ![...filterOptions].some(option => option.checked);
    });
});



// Displaying all columns from the table and create input for each.
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

            // // Create header label to display header text only
            const headerLabel = document.createElement("label");
            headerLabel.innerText = `${headerData.header}`;
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



// async function loadFilterOptions() {
//     try {
//         // Fetch headers data from the server
//         const response = await fetch('http://localhost:3000/columns');
//         const data = await response.json();

//         // Get the filter options container
//         const filterOptionsContainer = document.getElementById("filterOptionsContainer");

//         // Loop through the data and create checkboxes for each header
//         data.forEach(headerData => {
//             // Create a label for each header option
//             const label = document.createElement("label");

//             // Create a checkbox input for the header
//             const checkbox = document.createElement("input");
//             checkbox.type = "checkbox";
//             checkbox.classList.add("filter-option");
//             checkbox.name = "filterOptions";
//             checkbox.value = headerData.headers_id; // Use headers_id as the value
//             checkbox.id = `header_${headerData.headers_id}`; // Unique ID

//             // Set the label text to the header name
//             label.appendChild(checkbox);
//             label.appendChild(document.createTextNode(headerData.header));

//             // Append the label to the filter options container
//             filterOptionsContainer.appendChild(label);
//         });
//     } catch (error) {
//         console.error("Error loading filter options:", error);
//     }
// }

// Call the function to load filter options when the page loads
// document.addEventListener("DOMContentLoaded", loadFilterOptions);
