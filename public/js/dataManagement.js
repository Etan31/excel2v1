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

        // Select the container for dynamic inputs
        const headerInputsContainer = document.getElementById(headerInputsContainerId);
        
        // Clear any existing content
        headerInputsContainer.innerHTML = "";

        // Loop through headers and create input elements
        data.forEach((headerData, index) => {
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
                subInput.value = subheader.text;
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

    // Gather header and subheader data
    const headersData = Array.from(headerInputsContainer.querySelectorAll(".header-input")).map(headerInput => {
        const subheaderInputs = headerInputsContainer.querySelectorAll(`[data-heading^="${headerInput.dataset.heading}-sub"]`);
        return {
            header: headerInput.value,
            subheaders: Array.from(subheaderInputs).map(subInput => ({ text: subInput.value }))
        };
    });

    // Extract headers and subheaders to send to the server
    const details = headersData.flatMap(header => header.subheaders.map(subheader => subheader.text));
    const headers_id = 20;
    try {
        const response = await fetch('http://localhost:3000/data/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ headers_id, details }) // Send headers_id and details array
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
