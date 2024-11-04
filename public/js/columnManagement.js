
function closeModal() {
    document.getElementById("columnModal").style.display = "none";
}



document.addEventListener("DOMContentLoaded", () => {
    updateTableDisplay(); // Fetch and display table data on page load

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
        elements["columnModal"].style.display = "block";
        elements["headerInputs"].innerHTML = '';
        currentHeadingIndex = 0;
        addHeaderInput();
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
        currentHeadingIndex = headings.length;
        const h1Header = { h1: "", subHeaders: [] };
        headings.push(h1Header);
        
        // Add header input
        addInput(`Enter header ${currentHeadingIndex + 1}`, (e) => h1Header.h1 = e.target.value);
    };

    const addSubHeaderInput = () => {
        const h1Heading = headings[currentHeadingIndex];
        const subHeader = { text: "" };
        h1Heading.subHeaders.push(subHeader);
        const subHeaderIndex = h1Heading.subHeaders.length;
        
        // Add subheader input
        addInput(`Enter subheading ${currentHeadingIndex + 1}.${subHeaderIndex}`, (e) => subHeader.text = e.target.value, true);
    };

    // Validate and send headers and subheaders to the server
    const saveHeadingsToDatabase = async () => {
        const filteredHeadings = headings
            .filter(({ h1 }) => h1.trim() !== "") 
            .map(({ h1, subHeaders }) => {
                // Create an array of subheaders that are valid
                const validSubheaders = subHeaders.filter(sub => sub.text.trim() !== "");
    
                // If there are no valid subheaders, add a new subheader with the same text as the header
                if (validSubheaders.length === 0) {
                    return {
                        header: h1,
                        subheaders: [{ text: h1 }] // Create a subheader with the same text as the header
                    };
                }
    
                return {
                    header: h1,
                    subheaders: validSubheaders 
                };
            });
    
        try {
            const response = await fetch('http://localhost:3000/columns/headers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filteredHeadings) // Use the filtered headings
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            await updateTableDisplay(); 
        } catch (error) {
            console.error('Error saving headings:', error);
        }

        headings = [];
        elements["columnModal"].style.display = "none";
    };
    
    
    
    


    // Event listeners
    elements["addColumnBtn"]?.addEventListener("click", showModal);
    elements["addAnotherHeaderBtn"]?.addEventListener("click", addHeaderInput);
    elements["addSubHeaderBtn"]?.addEventListener("click", addSubHeaderInput);
    elements["saveColumnBtn"]?.addEventListener("click", async () => {
        await saveHeadingsToDatabase();  // Save directly to the database
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


