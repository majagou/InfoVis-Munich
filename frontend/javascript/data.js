// Function to generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("moreInfoButton");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
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