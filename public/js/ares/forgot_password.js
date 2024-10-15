/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for forgot password module
*
*  Version: 1.0
*  Latest update: March 21, 2020
*
* ---------------------------------------------------------------------------- */


$(function() {

    // Action for when form submit button is clicked
    $("#forgot-password-form").on('submit',(function(e) {
        loadingBlockUI('.container-wrap');
        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "login/forgot_password", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                if(response.status == "success")
                {
                    // Reset the entire form
                    //$('#login-form').trigger("reset");
                    // Display the success message for 3 seconds and redirect the user
                    swal({title: "Done!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success", timer: 3000})
                    .then((result) => {
                        $('#forgot-password-form-div').slideUp('fast');
                        $('#code-verification-div').slideDown('fast');
                    });
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"})
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
                //ajaxFailureResponse(jqXHR.status, 'body');
            }
        });
    }));

    // Action for when confirm code form submit button is clicked
    $("#code-verification-form").on('submit',(function(e) {
        loadingBlockUI('.container-wrap-2');
        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "login/confirm_recovery", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                if(response.status == "success")
                {
                    // Reset the entire form
                    //$('#login-form').trigger("reset");
                    // Display the success message for 3 seconds and redirect the user
                    swal({title: "Code Verified!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success", timer: 3000})
                    .then((result) => {
                        $('#forgot-password-form-div').slideUp('fast');
                        $('#code-verification-div').slideDown('fast');
                    });
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"})
                    .then((result) => {
                        // Re-direct the user if a redirect url is set by the API
                        if(response.redirect_url != undefined){
                            setTimeout(function(){ window.location.href = response.redirect_url; }, 3000);
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


function resendCode()
{
    var postdata = {
        username: $("input[name='email']").val(),
        email: $("input[name='email']").val(),
        csrf_token: $("input[name='csrf_token']").val()
    };
    
    $.ajax({url: WEBSITE_URL + "login/forgot_password", type: "POST", data: postdata, contentType: false, cache: false, processData:false,
            
        success: function(response) {
                // Hide the upload form
                if(response.status == "success")
                {
                    // Display the success message for 3 seconds and redirect the user
                    swal({title: "Done!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success", timer: 3000});
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"})
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
                //ajaxFailureResponse(jqXHR.status, 'body');
        }
    });
}