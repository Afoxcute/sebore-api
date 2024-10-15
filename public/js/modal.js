function switchColor(id){
    console.log(id)
    if(id = "RC"){
        console.log(id)
var modal = document.getElementById("modal-center-bus-two");
var btn = document.getElementById("form-acc-button");
// When the user clicks on the button, open the modal
btn.onclick = function() {
    event.preventDefault();
  modal.style.display = "block";
}

    } else if(id === "BN"){

        console.log(id)
        var modal = document.getElementById("modal-center-two");
var btn = document.getElementById("form-acc-button");
// When the user clicks on the button, open the modal
btn.onclick = function() {
    event.preventDefault();
  modal.style.display = "block";
}
    }
}