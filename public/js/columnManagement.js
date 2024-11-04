
function closeModal() {
    document.getElementById("columnModal").style.display = "none";
}



document.addEventListener("DOMContentLoaded", () => {
    const elements = ["addColumnBtn", "columnModal", "saveColumnBtn", "addAnotherHeaderBtn", "addSubHeaderBtn", "headerInputs"]
        .reduce((acc, id) => {
            const el = document.getElementById(id);
            if (!el) console.error(`Element with id "${id}" not found`);
            return { ...acc, [id]: el };
        }, {});

    let headings = [];
    let currentHeadingIndex = 0;

    // Show modal and initialize fields
    const showModal = () => {
        elements["columnModal"].style.display = "flex";
        elements["headerInputs"].innerHTML = '';
        headings = []; // Reset headings
        currentHeadingIndex = 0; // Reset index
        addHeaderInput(); // Add first header input
    };

    // Add header or subheader input field
    const addInput = (placeholder, onInput, isSubHeader = false) => {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = placeholder;
        input.classList.add("header-input");

        if (isSubHeader) {
            input.classList.add("subheader-input");
        }

        input.addEventListener("input", onInput);
        elements["headerInputs"].appendChild(input);
    };

    const addHeaderInput = () => {
        const h1Header = { h1: "", subHeaders: [] };
        headings.push(h1Header);
        
        // Add header input
        addInput(`Enter header ${headings.length}`, (e) => h1Header.h1 = e.target.value);
        currentHeadingIndex = headings.length - 1; // Set the current index to the new header
    };

    const addSubHeaderInput = () => {
        if (currentHeadingIndex >= headings.length) return; // Check if valid index

        const h1Heading = headings[currentHeadingIndex];
        const subHeader = { text: "" };
        h1Heading.subHeaders.push(subHeader);
        
        // Add subheader input
        addInput(`Enter subheading ${currentHeadingIndex + 1}.${h1Heading.subHeaders.length}`, (e) => subHeader.text = e.target.value, true);
    };

    // Validate and send headers and subheaders to the server
    const saveHeadingsToDatabase = async () => {
        let hasEmptyField = false;
    
        // Validation logic
        headings.forEach((heading, index) => {
            if (heading.h1.trim() === "") {
                alert(`Header ${index + 1} cannot be blank. Please enter a value.`);
                hasEmptyField = true;
                return;
            }
    
            // Check if any subheader is empty
            (heading.subHeaders || []).forEach((subHeader, subIndex) => {
                if (subHeader.text.trim() === "") {
                    alert(`Subheading ${index + 1}.${subIndex + 1} cannot be blank. Please enter a value.`);
                    hasEmptyField = true;
                    return;
                }
            });
        });
    
        // If any field is empty, stop the save operation
        if (hasEmptyField) return;
    
        // Payload creation
        const filteredHeadings = headings
            .filter(({ h1 }) => h1.trim() !== "")
            .map(({ h1, subHeaders = [] }) => {  // Provide default value for subHeaders
                const validSubheaders = subHeaders.filter(sub => sub.text.trim() !== "");
    
                // If there are no valid subheaders, add a new subheader with the same text as the header
                if (validSubheaders.length === 0) {
                    return {
                        header: h1,
                        subheaders: [{ text: h1 }]
                    };
                }
    
                return {
                    header: h1,
                    subheaders: validSubheaders
                };
            });
    
        const payload = filteredHeadings.map(({ header, subheaders }) => ({
            header,
            subheaders: (subheaders || []).map(sub => ({ text: sub.text })) // Safely map subheaders
        }));
    
        try {
            const response = await fetch('http://localhost:3000/columns/headers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (response.ok) {
                console.log("Headers and subheaders saved to database.");
                await updateTableDisplay(); // Refresh table display
            } else {
                console.error("Failed to save headers and subheaders to database.");
            }
        } catch (error) {
            console.error("Error saving headers and subheaders to database:", error);
        }
    
        // Clear headings and close the modal
        headings = [];
        elements["columnModal"].style.display = "none"; // Hide the modal
    };
    
    

    // Event listeners
    elements["addColumnBtn"]?.addEventListener("click", showModal);
    elements["addAnotherHeaderBtn"]?.addEventListener("click", addHeaderInput);
    elements["addSubHeaderBtn"]?.addEventListener("click", addSubHeaderInput);
    elements["saveColumnBtn"]?.addEventListener("click", async () => {
        await saveHeadingsToDatabase();
    });
});

// To get the table data for updating the display of the table, 
// To be able to update the table without refreshing the page. 
const updateTableDisplay = async () => {
    try {
        const response = await fetch('http://localhost:3000/columns');
        const data = await response.json();

        const headersRow = document.getElementById("columnHeadersRow");
        const subheadersRow = document.getElementById("columnSubheadersRow");

        headersRow.innerHTML = ''; 
        subheadersRow.innerHTML = '';

        data.forEach((column) => {
            // Create header cell for each heading
            const headerCell = document.createElement("th");
            headerCell.innerText = column.header;
            headerCell.colSpan = column.subheaders.length || 1; 
            headersRow.appendChild(headerCell);

            // Create a separate cell for each subheader under the header
            if (column.subheaders.length > 0) {
                column.subheaders.forEach((sub) => {
                    const subheaderCell = document.createElement("td");
                    subheaderCell.innerText = sub.text;
                    subheadersRow.appendChild(subheaderCell);
                });
            } else {
                // If no subheaders, add a cell displaying the header as a subheader
                const subheaderCell = document.createElement("td");
                subheaderCell.innerText = column.header;
                subheadersRow.appendChild(subheaderCell);
            }
        });
    } catch (error) {
        console.error("Error updating table display:", error);
    }
};


