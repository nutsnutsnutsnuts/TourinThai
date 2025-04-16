// Sample data for attractions
const attractions = [
    { id: 1, name: "Attraction A", image: "image1.jpg", price: "$50", location: "New York", rating: "4.5/5" },
    { id: 2, name: "Attraction B", image: "image2.jpg", price: "$70", location: "Los Angeles", rating: "4.7/5" },
    { id: 3, name: "Attraction C", image: "image3.jpg", price: "$30", location: "Chicago", rating: "4.2/5" }
];

let selectedAttraction1 = null;
let selectedAttraction2 = null;

// Function to open a selection modal
function openSelectionModal(buttonId) {
    // Simulate a modal or dropdown to select an attraction
    const selectedAttraction = attractions[buttonId - 1]; // Replace with actual selection logic
    if (buttonId === 1) {
        selectedAttraction1 = selectedAttraction;
        updateButton(1, selectedAttraction);
    } else {
        selectedAttraction2 = selectedAttraction;
        updateButton(2, selectedAttraction);
    }
    checkComparisonReady();
}

// Function to update the button with selected attraction details
function updateButton(buttonId, attraction) {
    const buttonText = document.getElementById(`attraction${buttonId}-text`);
    const buttonImage = document.getElementById(`attraction${buttonId}-image`);
    const buttonDetails = document.getElementById(`attraction${buttonId}-details`);

    buttonText.textContent = attraction.name;
    buttonImage.src = attraction.image;
    buttonImage.style.display = "block";
    buttonDetails.textContent = `${attraction.price} | ${attraction.location}`;
    buttonDetails.style.display = "block";
}

// Function to check if both attractions are selected
function checkComparisonReady() {
    if (selectedAttraction1 && selectedAttraction2) {
        displayComparisonResults();
    }
}

// Function to display comparison results
function displayComparisonResults() {
    const resultsDiv = document.getElementById("comparison-results");
    resultsDiv.style.display = "block";

    document.getElementById("attraction1-name").textContent = selectedAttraction1.name;
    document.getElementById("attraction1-price").textContent = selectedAttraction1.price;
    document.getElementById("attraction1-location").textContent = selectedAttraction1.location;
    document.getElementById("attraction1-rating").textContent = selectedAttraction1.rating;

    document.getElementById("attraction2-name").textContent = selectedAttraction2.name;
    document.getElementById("attraction2-price").textContent = selectedAttraction2.price;
    document.getElementById("attraction2-location").textContent = selectedAttraction2.location;
    document.getElementById("attraction2-rating").textContent = selectedAttraction2.rating;
}

// Function to reset the comparison
function resetComparison() {
    selectedAttraction1 = null;
    selectedAttraction2 = null;
    document.getElementById("comparison-results").style.display = "none";
    document.querySelectorAll(".main-button h2").forEach(el => el.textContent = "Select an interested attraction");
    document.querySelectorAll(".attraction-image, .attraction-details").forEach(el => el.style.display = "none");
}