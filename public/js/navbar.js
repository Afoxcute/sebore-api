// Side Bar Nav
function openNav() {
  document.getElementById("mySidebar").style.width = "215px";
  // document.getElementById("navbar-test").style.display = "none";
  document.getElementById("exam_filter").style.display = "none";

  document.getElementById("icon").style.display = "none";
  document.getElementById("close").style.display = "block";
  document.getElementById("close").style.marginLeft = "205px";
  document.getElementById("navbar-end").style.width = "70px";
}
function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("exam_filter").style.display = "flex";
  document.getElementById("icon").style.display = "block";
  document.getElementById("close").style.display = "none";
  document.getElementById("close").style.marginLeft = "0px";
  document.getElementById("navbar-end").style.width = "70px";
}

var border = document.getElementById("nav-change");
var links = border.getElementsByClassName("nav-list");
for (var i = 0; i < links.length; i++) {
  links[i].addEventListener("click", function () {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}
