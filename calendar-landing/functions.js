//Lindsey Bell made this
const hamburger = document.querySelector(".hamburgerbox"); //defines the hamburger box as the "hamburger"
const dropdown = document.querySelector(".dropdown"); // defines the dropdown menu as "dropdown"

function change(x) {                    //This covers the animation in the hamburger function.
    x.classList.toggle("change")
};

hamburger.addEventListener("click", function() { //This toggles the drop-down menu
    dropdown.classList.toggle("open");
});