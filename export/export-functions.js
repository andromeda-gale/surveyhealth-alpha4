// SurveyHealth export page interactions.
// The hamburger uses the same change() and dropdown classes as the supplied functions.js.

const hamburger = document.querySelector(".hamburgerbox");
const dropdown = document.querySelector(".dropdown");

function change(element) {
    element.classList.toggle("change");
    dropdown.classList.toggle("open");
    const isOpen = dropdown.classList.contains("open");
    element.setAttribute("aria-expanded", String(isOpen));
    element.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

function hamburgerKey(event, element) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        change(element);
    }
}

function goBack() {
    // The supplied landing.html is the profile/landing page.
    window.location.href = "landing.html";
}

// Create a small valid PDF for the live preview and blank export.
function createPdf(lines) {
    function escapeText(text) {
        return String(text).replace(/[^\x20-\x7E]/g, " ")
            .replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    }

    let commands = "BT\n/F1 20 Tf\n72 735 Td\n";
    lines.forEach((line, index) => {
        if (index > 0) commands += "0 -30 Td\n";
        commands += "(" + escapeText(line) + ") Tj\n";
    });
    commands += "ET";

    const objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        "<< /Length " + commands.length + " >>\nstream\n" + commands + "\nendstream"
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(pdf.length);
        pdf += (index + 1) + " 0 obj\n" + object + "\nendobj\n";
    });

    const xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    for (let i = 1; i < offsets.length; i++) {
        pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
    }
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\n";
    pdf += "startxref\n" + xref + "\n%%EOF";
    return new Blob([pdf], { type: "application/pdf" });
}

function getPreviewText() {
    const start = document.getElementById("startDate").value.trim() || "mm/dd/yyyy";
    const end = document.getElementById("endDate").value.trim() || "mm/dd/yyyy";
    const selected = Array.from(document.querySelectorAll(".include-check:checked"))
        .map(function (checkbox) { return checkbox.value; });

    // Preview shows the report cover and the sections currently selected.
    const lines = [
        "SurveyHealth",
        "Summary Report for:",
        "Sam Pel",
        start + " - " + end,
        "",
        "Selected report sections:"
    ];
    if (selected.length === 0) lines.push("No sections selected");
    selected.forEach(function (section) { lines.push(section); });
    return lines;
}

let currentPreviewUrl = null;

function updatePreview() {
    const preview = document.getElementById("pdfPreview");
    const pdfBlob = createPdf(getPreviewText());
    const newUrl = URL.createObjectURL(pdfBlob);
    preview.src = newUrl;

    if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = newUrl;
}

function exportBlankPDF() {
    // Requested behavior: export downloads a blank PDF placeholder.
    const blankPdf = createPdf([]);
    const downloadUrl = URL.createObjectURL(blankPdf);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "SurveyHealth-blank-export.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 1000);
}

document.querySelectorAll(".include-check").forEach(function (checkbox) {
    checkbox.addEventListener("change", updatePreview);
});
document.getElementById("startDate").addEventListener("input", updatePreview);
document.getElementById("endDate").addEventListener("input", updatePreview);

document.getElementById("consent").addEventListener("change", function (event) {
    document.getElementById("recipient").hidden = !event.target.checked;
});

document.getElementById("addRecipient").addEventListener("click", function () {
    alert("Recipient management can be connected here in a future version.");
});

updatePreview();
