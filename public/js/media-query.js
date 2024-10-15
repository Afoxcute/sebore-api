// Media query 
const mediaQuery = window.matchMedia("(min-width: 880px)");

mediaQuery.addListener(handleChange);
// mediaQuery.addListener(handleQuery);


handleChange(mediaQuery);
// handleQuery(mediaQuery);

function handleChange(e) {
  // Check if the media query is true
  if (e.matches) {
    var element = document.getElementById("switcher");
    var other = document.getElementById("switcher-nav");
    element.classList.remove("uk-switcher");
    element.classList.remove("switcher");
    element.classList.remove("uk-margin");
    other.classList.remove("uk-subnav");
    other.classList.remove("uk-subnav-pill");
    other.classList.remove("uk-switcher");
    console.log("Media Query Matched!");
  }
}

// function handle(e) {
//   // Check if the media query is true
//   if (e.matches) {
//     var element = document.getElementById("switcher");
//     element.classList.remove("uk-switcher");
//     element.classList.remove("switcher");
//     element.classList.remove("uk-margin");
//     console.log("Media Query Matched!");
//   }
// }
