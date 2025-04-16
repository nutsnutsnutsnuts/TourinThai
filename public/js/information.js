let slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
  }

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n){
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");

    // loop click slides
    if (n > slides.length) {
        slideIndex = 1;
    }

    if (n < 1) {
        slideIndex = slides.length
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }

    //replace all dot to be unactive
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace("active", "")
    }

    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    setTimeout(showSlides, 3000); // Change image every 2 seconds

    // slideIndex - 1 = 0, first img
    // slideIndex + 1 = 1, second img
    // slideIndex + 1 = 2, third img
    // slideIndex + 2 = 3, fourth img
    slides[slideIndex-1].style.display = "block";

    dots[slideIndex-1].className += " active"; //determine First index to be active
}

showSlides(slideIndex);
