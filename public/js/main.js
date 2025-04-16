document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".menu a");
    const currentPath = window.location.pathname; // Get current URL path

    // Regex pattern to match MongoDB ObjectId (24 hex characters)
    const mongoIdPattern = /^\/[a-f0-9]{24}$/;

    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");

        // Keep "Recommendation" highlighted for /recommendation and any MongoDB ObjectId URLs
        if (currentPath === "/recommendation" || mongoIdPattern.test(currentPath)) {
            document.querySelector('.menu a[href="/recommendation"]').classList.add("active");
        } 
        // For all other pages, highlight the matching menu item
        else if (linkPath === currentPath) {
            link.classList.add("active");
        }
    });
});



function toggleMenu() {
    const menu = document.querySelector('.menu');
    menu.classList.toggle('active');
}


