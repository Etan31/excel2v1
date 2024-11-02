// document.addEventListener("DOMContentLoaded", () => {
//     const elements = ["addColumnBtn", "columnModal", "saveColumnBtn", "addAnotherHeaderBtn", "addSubHeaderBtn", "headerInputs", "main-header-row", "sub-header-row"]
//         .reduce((acc, id) => {
//             const el = document.getElementById(id);
//             if (!el) console.error(`Element with id "${id}" not found`);
//             return { ...acc, [id]: el };
//         }, {});

//     let headings = [];
//     let currentHeadingIndex = 0;

//     // Load data from localStorage
//     const loadHeadings = () => {
//         const savedHeadings = localStorage.getItem('tableHeadings');
//         headings = savedHeadings ? JSON.parse(savedHeadings) : [];
//         renderTableHeaders();
//     };

//     // Save data to localStorage
//     const saveHeadings = () => {
//         localStorage.setItem('tableHeadings', JSON.stringify(headings));
//     };

//     // Show modal and initialize fields
//     const showModal = () => {
//         elements["columnModal"].style.display = "block";
//         elements["headerInputs"].innerHTML = '';
//         currentHeadingIndex = 0;
//         addHeaderInput();
//     };

//     // Add header or subheader input field
//     const addInput = (placeholder, onInput) => {
//         const input = document.createElement("input");
//         input.type = "text";
//         input.placeholder = placeholder;
//         input.classList.add("header-input");
//         input.addEventListener("input", onInput);
//         elements["headerInputs"].appendChild(input);
//     };

//     const addHeaderInput = () => {
//         currentHeadingIndex = headings.length;
//         const h1Header = { h1: "", subHeaders: [] };
//         headings.push(h1Header);
//         addInput(`Enter header ${currentHeadingIndex + 1}`, (e) => h1Header.h1 = e.target.value);
//     };

//     const addSubHeaderInput = () => {
//         const h1Heading = headings[currentHeadingIndex];
//         const subHeader = { text: "" };
//         h1Heading.subHeaders.push(subHeader);
//         const subHeaderIndex = h1Heading.subHeaders.length;
//         addInput(`Enter subheading ${currentHeadingIndex + 1}.${subHeaderIndex}`, (e) => subHeader.text = e.target.value);
//     };

//     // Render table headers
//     const renderTableHeaders = () => {
//         const mainHeaderRow = document.getElementById("main-header-row");
//         const subHeaderRow = document.getElementById("sub-header-row");

//         mainHeaderRow.innerHTML = "";
//         subHeaderRow.innerHTML = "";

//         headings.forEach(({ h1, subHeaders }) => {
//             const mainTh = document.createElement("th");
//             mainTh.textContent = h1 || "Untitled";
//             mainTh.colSpan = subHeaders.length || 1;
//             mainHeaderRow.appendChild(mainTh);

//             (subHeaders.length ? subHeaders : [{ text: "" }]).forEach(({ text }) => {
//                 const subTh = document.createElement("th");
//                 subTh.textContent = text || "";
//                 subHeaderRow.appendChild(subTh);
//             });
//         });
//     };

//     // Event listeners
//     elements["addColumnBtn"]?.addEventListener("click", showModal);
//     elements["addAnotherHeaderBtn"]?.addEventListener("click", addHeaderInput);
//     elements["addSubHeaderBtn"]?.addEventListener("click", addSubHeaderInput);
//     elements["saveColumnBtn"]?.addEventListener("click", () => {
//         renderTableHeaders();
//         saveHeadings();
//         elements["columnModal"].style.display = "none";
//     });

//     // Load headings on page load
//     loadHeadings();
// });
    

// const saveHeadingsToDatabase = async () => {
//     try {
//         const response = await fetch('/api/headers', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ headings })
//         });
//         if (response.ok) {
//             console.log("Headings saved to database");
//         } else {
//             console.error("Failed to save headings to database");
//         }
//     } catch (error) {
//         console.error("Error saving headings to database:", error);
//     }
// };

// // Update the "Save" button's event listener to save to the database
// elements["saveColumnBtn"]?.addEventListener("click", () => {
//     renderTableHeaders();
//     saveHeadings();
//     saveHeadingsToDatabase();
//     elements["columnModal"].style.display = "none";
// });

// //======================= This code above save the table into local storage only. ===============// //

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
        // Filter out headings with empty main headers
        const filteredHeadings = headings.filter(({ h1 }) => h1.trim() !== "");

        if (filteredHeadings.length === 0) {
            alert("Please enter at least one header.");
            return;
        }

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

        // Optionally clear the modal and close it
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
