/* ------------------------------------------------------------------------------
*
*  # Merchant home setup module
*
*  Specific JS codes for merchant dashboard setup module
*
*  Version: 1.0
*  Latest update: Oct 15, 2020
*
* ---------------------------------------------------------------------------- */


$(function() {

    // Jquery form validation for the merchant business data update form
    $("#ind-form").validate({
        highlight: function(element) {
            $(element).closest(".container-input").addClass("uk-form-danger");
        },
        unhighlight: function(element) {
            $(element).closest(".container-input").removeClass("uk-form-danger");
        },
        errorElement: "em",
        errorClass: "error invalid-feedback uk-text-danger uk-text-small",
        errorPlacement: function(element, e) {
            e.parent(".input-group").length ?
            element.insertAfter(e.parent()) :
            e.parent("label").length ?
            element.insertBefore(e.parent()) :
            element.insertAfter(e)
        },
        submitHandler: function(form, event) {
            // Prevent the form from submiting
            event.preventDefault();
            // Call method to handle the form submission
            updateInformation('#business_details_modal', 'ind-form');
        }
    });

    // Jquery form validation for the merchant business data update form
    $("#settlement_form").validate({
        highlight: function(element) {
            $(element).closest(".container-input").addClass("uk-form-danger");
        },
        unhighlight: function(element) {
            $(element).closest(".container-input").removeClass("uk-form-danger");
        },
        errorElement: "em",
        errorClass: "error invalid-feedback uk-text-danger uk-text-small",
        errorPlacement: function(element, e) {
            e.parent(".input-group").length ?
            element.insertAfter(e.parent()) :
            e.parent("label").length ?
            element.insertBefore(e.parent()) :
            element.insertAfter(e)
        },
        submitHandler: function(form, event) {
            // Prevent the form from submiting
            event.preventDefault();
            // Call method to handle the form submission
            updateInformation('#modal-center-three', 'settlement_form');
        }
    });
});


// Method to update the merchant's business information
function updateInformation(modalElementId, formElementId)
{
    loadingBlockUI(modalElementId);
    form = document.getElementById(formElementId);
    $.ajax({url: WEBSITE_URL + "merchants/update", type: "POST", data:  new FormData(form), contentType: false, cache: false, processData:false,
        success: function(response) {
            if(response.status == "success")
            {
                // Display a success message to the user
                swal({title: "Success!", text: response.message, icon: "success"});
            }
            else if(response.status == "failed")
            {
                // Call the sweet alert to display the error
                swal({title: "Error!", text: response.message, icon: "error"});
            }
            else{
                swal({title: "Error!", text: "An unexpected error has occured", icon: "error"});
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
            ajaxFailureResponse(jqXHR.status, modalElementId);
        }
    });
}

// Function is called to load edit of data
function loadEdit(id)
{
    UIkit.modal('#edit-user-modal').show();
    loadingBlockUI('#edit-user-modal');
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "users/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("#edit-id").val(data.id);
            $("#edit-firstname").val(data.firstname);
            $("#edit-lastname").val(data.lastname);
            $("#edit-email").val(data.email);
            $("#edit-phone_number").val(data.phone_number);
            $("#edit-user_role_id").val(data.user_role_id);
        }
        else
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
        finishedLoading();
    })
    .fail(function(xhr, statusText, errorThrown) {
        // Call function to release the UI
        finishedLoading();
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, '#edit-user-modal');
    });
}

// Method to fetch the merchant data
function fetchMerchantData()
{
    loadingBlockUI('#business_details_modal');
    $.get(WEBSITE_URL + "merchants/get_own_data", {}, function(response){
        if(response.status == "success")
        {
            if(response.data.length > 0)
            {
                var data = response.data[0]
                if(data.tradingname != undefined)
                    $("#trading_name").val(data.tradingname);
                if(data.businesstype != undefined)
                    $("#business_description").val(data.businesstype);
                if(data.businessindustrycategory != undefined)
                    $("#business_category").val(data.businessindustrycategory);
                if(data.address[0] != undefined && data.address[0].line1 != undefined)
                    $("#business_address").val(data.address[0].line1);

                if(data.meta != undefined){
                    meta = arrangeMeta(data.meta);
                    $("#website_url").val(meta.websiteurl);
                    $("#support_email").val(meta.supportemail);
                    $("#chargeback_email").val(meta.chargebackemail);
                }
            }
        }
        else
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
        finishedLoading();
    })
    .fail(function(xhr, statusText, errorThrown) {
        // Call function to release the UI
        finishedLoading();
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, '#edit-user-modal');
    });
}

function fetchSettlementData()
{
    loadingBlockUI('#modal-center-three');
    $.get(WEBSITE_URL + "merchants/get_own_data", {}, function(response){
        if(response.status == "success")
        {
            if(response.data.length > 0)
            {
                var data = response.data[0]
                if(data.settlement != undefined && data.settlement.account != undefined){
                    if(data.settlement.account.length > 0){
                        $("#bank_code").val(data.settlement.account[0].bankcode);
                        $("#account_number").val(data.settlement.account[0].accountnumber);
                        $("#account_name").val(data.settlement.account[0].accountnumber);
                        $("#settlement_type").val(data.settlement.account[0].type);
                    }
                }
            }
        }
        else
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
        finishedLoading();
    })
    .fail(function(xhr, statusText, errorThrown) {
        // Call function to release the UI
        finishedLoading();
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, '#edit-user-modal');
    });
}

function arrangeMeta(meta)
{
    var responseMeta = {chargebackemail: '', supportemail: '', websiteurl: ''};
    if(meta != undefined && meta.length > 0){
        for(i=0; i<meta.length; i++){
            if(meta[i].name == 'chargebackemail')
                responseMeta.chargebackemail = meta[i].value;
            else if(meta[i].name == 'supportemail')
                responseMeta.supportemail = meta[i].value;
            else if(meta[i].name == 'websiteurl')
                responseMeta.websiteurl = meta[i].value;
        }
    }
    return responseMeta;
}