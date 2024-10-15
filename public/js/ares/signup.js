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

var registeredEmail = null;

$(function() {
    // Action for when meter reading form upload is submitted
    $("#merchant-signup").on('submit',(function(e) {

        // add a loading overlay on the page
        loadingBlockUI('body');

        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "signup/merchant", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                if(response.status == "success")
                {
                    // Assigne the current email to the variable
                    registeredEmail = $('#email').val();
                    // Reset the entire form
                    $('#merchant-signup').trigger("reset");
                    // Show the message container
                    $('#main-container').slideUp('fast');
                    $('#success-message-container').slideDown('fast');
                    // Display the success message
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, buttonColor: "#2196F3", icon: "error"});   
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
});

function selectMerchantType()
{
    var merchantType = $("input:radio[name='reg']:checked").val();
    if(merchantType == 'Individual')
        window.location.href = WEBSITE_URL + "signup/individual";
    else if(merchantType == 'Business')
        window.location.href = WEBSITE_URL + "signup/business";
    else if(merchantType == 'NGO')
        window.location.href = WEBSITE_URL + "signup/ngo";
    else
        swal({title: "Error!", text: "Please select an account type", confirmButtonColor: "#2196F3", icon: "error"});
}

function resendActivation()
{
    if(registeredEmail != null)
    {
        loadingBlockUI('#new-user-modal');
        data = {email: registeredEmail, csrf_token: $("input[name='csrf_token']").val()};
        $.ajax({url: WEBSITE_URL + "signup/resend_activation", type: "POST", data: data, contentType: false, cache: false, processData: false,
            success: function(response) {
                if(response.status == "success"){
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, type: "success"});
                }
                else if(response.status == "failed"){
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
                }
                else{
                    swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", type: "error"});
                }
                // Update the page with the new CSRF
                $("input[name='csrf_token']").val(response.csrf_token);
            },
            complete: function(jqXHR, exception) {
                // Call function to release the UI
                finishedLoading();
            },
            error: function(jqXHR, exception) {
                // Call function to release the UI
                finishedLoading();
                // Now call function that would process the cause of the failure
                ajaxFailureResponse(jqXHR.status, '#new-user-modal');
            }
        });
    }
    else{
        swal({title: "Error!", text: "This action is not allowed", confirmButtonColor: "#2196F3", type: "error"});
    }
}