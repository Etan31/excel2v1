document.addEventListener('DOMContentLoaded', () => {
    fetchHeaders('headersRow', 'subheadersRow'); // For Data Management Table
    fetchHeaders('columnHeadersRow', 'columnSubheadersRow'); // For Column Management Table
});


function openModal() {
    document.getElementById('dataModal').style.display = "block";
}

function closeModal() {
    document.getElementById("dataModal").style.display = "none";
}
