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
    $("#ga-bind-form").on('submit',(function(e) {
        loadingBlockUI('.container-wrap');
        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "login/bind_google_authenticator", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                if(response.status == "success")
                {
                    // Display a success message to the meter_brand
                    swal({title: "Token Verified!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
                    // Redirect the user to the next module required
                    setTimeout(function(){ window.location.href = response.redirect_url; }, 3000);
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
                    // Re-direct the user if a redirect url is set by the API
                    if(response.redirect_url != undefined){
                        setTimeout(function(){ window.location.href = response.redirect_url; }, 3000);
                    }
                }
                else{
                    swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", icon: "error"});
                }
                // Reset the entire form
                $('#ga-bind-form').trigger("reset");
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

function resendOTP()
{
}