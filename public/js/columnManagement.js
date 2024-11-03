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
        let hasEmptyField = false;

        headings.forEach((heading, index) => {
            // Check if the main header (h1) is empty
            if (heading.h1.trim() === "") {
                alert(`Header ${index + 1} cannot be blank. Please enter a value.`);
                hasEmptyField = true;
                return;
            }

            // Check if any subheader is empty
            heading.subHeaders.forEach((subHeader, subIndex) => {
                if (subHeader.text.trim() === "") {
                    alert(`Subheading ${index + 1}.${subIndex + 1} cannot be blank. Please enter a value.`);
                    hasEmptyField = true;
                    return;
                }
            });
        });

        // If any field is empty, stop the save operation
        if (hasEmptyField) return;

        // Filter out headings with empty main headers (just in case)
        const filteredHeadings = headings.filter(({ h1 }) => h1.trim() !== "");

        const payload = filteredHeadings.map(({ h1, subHeaders }) => ({
            header: h1,
            subheaders: subHeaders.map(sub => ({ text: sub.text }))
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
            } else {
                console.error("Failed to save headers and subheaders to database.");
            }
        } catch (error) {
            console.error("Error saving headers and subheaders to database:", error);
        }

        // Clear modal and close it
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

function closeModal() {
    document.getElementById("columnModal").style.display = "none";
}
