/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for branches module
*
*  Version: 1.0
*  Latest update: Feb 3, 2020
*
* ---------------------------------------------------------------------------- */


$(function() {

    // Action for when meter reading form upload is submitted
    $("#login-form").on('submit',(function(e) {

        // add a loading overlay on the page
        loadingBlockUI('.container-wrap');

        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "login/authenticate", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                if(response.status == "success")
                {
                    // Reset the entire form
                    $('#login-form').trigger("reset");
                    // Display the success message for 3 seconds and redirect the user
                    swal({title: "Login Verified!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success", timer: 3000})
                    .then((result) => {
                        // Now redirect the user to the required module
                        window.location.href = response.redirect_url                        
                    });
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, buttonColor: "#2196F3", icon: "error"})
                    .then((result) => {
                        // Re-direct the user if a redirect url is set by the API
                        if(response.redirect_url != undefined){
                            //setTimeout(function(){ window.location.href = response.redirect_url; }, 3000);
                        }
                    });   
                }
                else{
                    swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", icon: "error"});
                }
                // Update the page with the new CSRF
                $("input[name='csrf_token']").val(response.csrf_token);
                // Call function to release the UI
                finishedLoading();
            },
            error: function(jqXHR, exception) {
                // Call function to release the UI
                finishedLoading();
                // Now call function that would process the cause of the failure
                ajaxFailureResponse(jqXHR.status, 'body');
            }
        });
    }));

});