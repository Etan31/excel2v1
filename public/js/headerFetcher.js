// headerFetcher.js
async function fetchHeaders(headerRowId, subheaderRowId) {
    try {
        const response = await fetch('http://localhost:3000/home/display');
        const headers = await response.json();

        const headersRow = document.getElementById(headerRowId);
        const subheadersRow = document.getElementById(subheaderRowId);
        headersRow.innerHTML = '';
        subheadersRow.innerHTML = '';

        // Create main headers with colspan for each set of subheaders
        Object.keys(headers).forEach(header => {
            const subheaders = headers[header];

            // Create the main header cell with colspan
            const headerCell = document.createElement('th');
            headerCell.textContent = header;
            headerCell.colSpan = subheaders.length || 1; // Default to 1 if no subheaders
            headersRow.appendChild(headerCell);

            // Create each subheader cell
            subheaders.forEach(subheader => {
                const subheaderCell = document.createElement('td');
                subheaderCell.textContent = subheader;
                subheadersRow.appendChild(subheaderCell);
            });
        });
    } catch (error) {
        console.error("Error fetching headers:", error);
    }
}
