/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for currencies module
*
*  Version: 1.0
*  Latest update: Feb 3, 2020
*
* ---------------------------------------------------------------------------- */


$(function() {

    renderData();
    // Action for when meter reading form upload is submitted
    $("#currency-upload-form").on('submit',(function(e) {
        loadingBlockUI('#currency-upload-modal');
        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "currencies/upload", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                $('#currency-upload-modal').modal('hide');
                if(response.status == "success")
                {
                    // Reset the entire form
                    $('#currency-upload-form').trigger("reset");
                    // Refresh the list
                    renderData();
                    // Display a success message to the meter_brand
                    swal({title: "Done!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                    // if there are errors from the upload activity
                    if(response.extra_message != undefined && response.extra_message != ""){
                        console.log(response.extra_message);
                        $('#ajax-message-box').html(response.extra_message);
                        $('#extra-message-modal').modal('show');
                    }
                }
                else if(response.status == "failed")
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
                }
                else{
                    swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", type: "error"});
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
                ajaxFailureResponse(jqXHR.status, '#currency-upload-modal');
            }
        });
    }));

});

// This function would process the ajax call for the datatable
function processDataRender(response)
{
	var content = "";
    var data = response.data;

    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";

        if(can_edit == true && row.pending_edit == 0){
            row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
            row.actions += "data-original-title='Edit Currency' onclick='loadEdit(" + row.id + ")'><i class='fa fa-edit'></i></a>  ";
        }
        
        if(row.currency_status == 1){

            row.currency_status = "<span class='badge badge-success'>Active</span>";
            if(can_deactivate==true)
            {
                row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
                row.actions += "data-original-title='De-activate Currency' onclick='deactivateRecord(" + row.id + ")'><i class='fa fa-unlock'></i></a>  ";
            }
        }

        else if(row.currency_status == -1){
            row.currency_status = "<span class='badge badge-danger'>Pending Approval</span>";
        }

        else if(row.currency_status == 0){

            row.currency_status = "<span class='badge badge-warning'>Deactivated</span>";
            if(can_activate==true){
                row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
                row.actions += "data-original-title='Activate Currency' onclick='activateRecord(" + row.id + ")'><i class='fa fa-check-square'></i></a>  ";
            }
        }

        if(can_delete == true)
        {
            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' data-toggle='tooltip' data-original-title='Delete Currency'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }

        row.createdat = dateToReadableTime(row.createdat);
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['id', 'currency_description', 'currency_code', 'currency_iso', 'country_iso', 'currency_status', 'createdat', 'actions'];
    
    var filters = getFilters();
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    $('#records_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
        ajax: {
            url : WEBSITE_URL + "currencies/get_all",
            type: "get",
            data: filters,
            dataSrc: function ( response ) {
            	return processDataRender(response);
            }
        },
        stateSave: true,
        "initComplete": function(settings, json) {
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
        },
        "drawCallback": function( settings ) {
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-toggle="popover"]').popover();
        }
    });
}

// function to create a new record
function create()
{
    // first perform the form validation
    var validation = validateFormData();
    if(validation == true)
    {
        // Call the block UI loader, to block the modal
        loadingBlockUI('#new-currency-modal');

        // Gather the form data to be passed over AJAX
        var postdata = {};
        postdata.currency_description = $("input[name='currency_description']").val();
        postdata.currency_code = $("input[name='currency_code']").val();
        postdata.currency_iso = $("input[name='currency_iso']").val();
        postdata.country_iso = $("#country_iso").val();
        // Get the CSRF token
        postdata.csrf_token = $("input[name='csrf_token']").val();
        $.post(WEBSITE_URL + "currencies/create", postdata, function(response){
            if(response.status == "success")
            {
                // Reset the entire form
                $('#new_currency_form').trigger("reset");
                // Refresh the list
                renderData('records_list');
                // Display a success message to the user
                swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
            }
            else if(response.status == "failed")
            {
                // Call the sweet alert to display the error
                swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
            }
            else{
                swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", type: "error"});
            }
            // Update the page with the new CSRF
            $("input[name='csrf_token']").val(response.csrf_token);
        })
        .done(function(){
            // Call function to release the UI
            finishedLoading();
        })
        .fail(function(xhr, statusText, errorThrown) {
            // Call function to release the UI
            finishedLoading();
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(xhr.status, '#new-currency-modal');
        });
    }
}

// Function is called to load edit of data
function loadEdit(id)
{
    $('#edit-currency-modal').modal('show');
    loadingBlockUI('#edit-currency-modal');
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "currencies/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("input[name='edit-id']").val(data.id);
            $("input[name='edit-currency_description']").val(data.currency_description);
            $("input[name='edit-currency_code']").val(data.currency_code);
            $("input[name='edit-currency_iso']").val(data.currency_iso);
            $("#edit-country_iso").val(data.country_iso);
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
        ajaxFailureResponse(xhr.status, '#edit-currency-modal');
    });
}

// function to update selected record
function edit()
{
    var validation = validateFormDataEdit();
    if(validation == true)
    {
        loadingBlockUI('#edit-currency-modal');
        var postdata = {};
        postdata.id = $("input[name='edit-id']").val();
        postdata.currency_description = $("input[name='edit-currency_description']").val();
        postdata.currency_code = $("input[name='edit-currency_code']").val();
        postdata.currency_iso = $("input[name='edit-currency_iso']").val();
        postdata.country_iso = $("#edit-country_iso").val();
        postdata.csrf_token = $("input[name='csrf_token']").val();
        $.post(WEBSITE_URL + "currencies/edit", postdata, function(response){
            if(response.status == "success")
            {
                // Reset the entire form
                $('#currency_edit_form').trigger("reset");
                // Refresh the list
                renderData('records_list');
                // Display a success message to the user
                swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                $('#edit-currency-modal').modal('hide');
            }
            else
            {
                // Call the sweet alert to display the error
                swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
            }
            // Update the page with the new CSRF
            $("input[name='csrf_token']").val(response.csrf_token);
        })
        .done(function(){
            // Call function to release the UI
            finishedLoading();
        })
        .fail(function(xhr, statusText, errorThrown) {
            // Call function to release the UI
            finishedLoading();
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(xhr.status, '#edit-currency-modal');
        });
    }
}

// Method to delete a record
function deleteRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.value) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id};
            $.post(WEBSITE_URL + "currencies/delete", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData('records_list');
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                }
                else
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
                }
                // Update the page with the new CSRF
                $("input[name='csrf_token']").val(response.csrf_token);
            })
            .done(function(){
                // Call function to release the UI
                finishedLoading();
            })
            .fail(function(xhr, statusText, errorThrown) {
                // Call function to release the UI
                finishedLoading();
                // Now call function that would process the cause of the failure
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}

// Method to activate a currency
function activateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "This would activate the selected currency!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, activate it!'
    }).then((result) => {
        if (result.value) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "currencies/activate", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData('records_list');
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                }
                else
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
                }

                // Update the page with the new CSRF
                $("input[name='csrf_token']").val(response.csrf_token);
            })
            .done(function(){
                // Call function to release the UI
                finishedLoading();
            })
            .fail(function(xhr, statusText, errorThrown) {
                // Call function to release the UI
                finishedLoading();
                // Now call function that would process the cause of the failure
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}

// Method to deactivate a currency
function deactivateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "This would de-activate the selected currency!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, deactivate it!'
    }).then((result) => {
        if (result.value) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "currencies/deactivate", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData('records_list');
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                }
                else
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
                }

                // Update the page with the new CSRF
                $("input[name='csrf_token']").val(response.csrf_token);
            })
            .done(function(){
                // Call function to release the UI
                finishedLoading();
            })
            .fail(function(xhr, statusText, errorThrown) {
                // Call function to release the UI
                finishedLoading();
                // Now call function that would process the cause of the failure
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}


// This function is called to ensure all inputs are entered correctly
function validateFormData()
{
    if($("input[name='currency_description']").val() == ""){
        error = "Please enter currency name";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='currency_code']").val() == ""){
        error = "Please enter currency code";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='currency_iso']").val() == ""){
        error = "Please enter currency address";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("#country_iso").val() == ""){
        error = "Please select a state";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    return true;
}

// This function is called to ensure all inputs are entered correctly
function validateFormDataEdit()
{
    if($("input[name='edit-currency_description']").val() == ""){
        error = "Please enter currency name";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='edit-currency_code']").val() == ""){
        error = "Please enter currency code";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='edit-currency_iso']").val() == ""){
        error = "Please enter currency address";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("#edit-country_iso").val() == ""){
        error = "Please select a state";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    return true;
}