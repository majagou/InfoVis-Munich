// Function to generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

window.addEventListener('scroll', () => {
  let descriptionHeight = document.querySelector('.description-page').offsetHeight;
  if (window.scrollY > descriptionHeight) {
      // Actions to perform after scrolling past the description page
  }
});

window.addEventListener('scroll', () => {
  const descriptionText = document.querySelector('.description-page p');
  if (window.scrollY > 100) { // Trigger when scrolled 100px down
      descriptionText.style.opacity = 1;
      descriptionText.style.transform = 'translateX(0)';
  }
});


function changeImage(imageSrc) {
    // Get the image element by its ID
    var displayedImage = document.getElementById('displayedImage');
    
    // Change the image source
    displayedImage.src = imageSrc;
}

var acc = document.getElementsByClassName("accordion-btn");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}