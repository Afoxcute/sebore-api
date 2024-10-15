/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for customers module
*
*  Version: 1.0
*  Latest update: Mar 23, 2020
*
* ---------------------------------------------------------------------------- */


$(function() {

    init();
    // Initialize the select 2 for employee selection
    $("#edit-relationship_manager_id").select2({ 
        dropdownParent: $("#edit-customer-modal"),
        ajax: {url: WEBSITE_URL + "users/find?employee_user=true", dataType: 'json'},
        width: '100%',
        minimumInputLength: 3,
        placeholder: "Please select a relationship manager",
        theme: "bootstrap4",
    });

    // JQuery form validation setup for the customer edit form
    $("#customer_edit_form").validate({
        highlight: function(element) {
            $(element).closest(".form-group").addClass("has-error")
        },
        unhighlight: function(element) {
            $(element).closest(".form-group").removeClass("has-error")
        },
        errorElement: "em",
        errorClass: "error invalid-feedback",
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
            edit();
        }
    });

    // Action for when customer form upload is submitted
    $("#customer_upload_form").on('submit',(function(e) {
        loadingBlockUI('#customer-upload-modal');
        e.preventDefault();
        $.ajax({url: WEBSITE_URL + "customers/upload", type: "POST", data:  new FormData(this), contentType: false, cache: false, processData:false,
            success: function(response) {
                
                // Hide the upload form
                $('#customer-upload-modal').modal('hide');
                if(response.status == "success")
                {
                    // Reset the entire form
                    $('#customer_upload_form').trigger("reset");
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
                ajaxFailureResponse(jqXHR.status, '#customer-upload-modal');
            }
        });
    }));
});

function init()
{
    renderData();
}

// This function would process the ajax call for the datatable
function processDataRender(response)
{
	var content = "";
    var data = response.data;

    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";

        if(can_edit == true && row.pending_edit == 0)
        {
            row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
            row.actions += "data-original-title='Edit Customer' onclick='loadEdit(" + row.id + ")'><i class='fa fa-edit'></i></a>  ";
        }
        
        if(row.customer_status == 1){

            row.customer_status = "<span class='badge badge-success'>Active</span>";
            if(can_deactivate==true)
            {
                row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
                row.actions += "data-original-title='De-activate Customer' onclick='deactivateRecord(" + row.id + ")'><i class='fa fa-unlock'></i></a>  ";
            }
        }

        else if(row.customer_status == -1){
            row.customer_status = "<span class='badge badge-danger'>Unapproved</span>";
        }

        else if(row.customer_status == 0){

            row.customer_status = "<span class='badge badge-warning'>Inactive</span>";
            if(can_activate==true){
                row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
                row.actions += "data-original-title='Activate Customer' onclick='activateRecord(" + row.id + ")'><i class='fa fa-check-square'></i></a>  ";
            }
        }

        row.actions += " <a href='"+ WEBSITE_URL + "customers/profile/" + row.id + "' data-toggle='tooltip' data-original-title='View Customer'>";
        row.actions += " <i class='fa fa-search'></i></a>";

        if(can_delete == true)
        {
            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' data-toggle='tooltip' data-original-title='Delete Customer'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }

        row.createdat = dateToReadableTime(row.createdat);
        row.customer_description = "";
        if(row.lastname != null)
            row.customer_description += row.lastname + " ";
        if(row.firstname != null)
            row.customer_description += row.firstname + " ";
        if(row.middlename != null)
            row.customer_description += row.middlename + " ";

        if(row.user_lastname != null)
            row.relationship_manager_id = row.user_lastname + " " + row.user_firstname;
        else
            row.relationship_manager_id = "";
        
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['id', 'customer_description', 'account_number', 'account_name', 'phone_number', 'customer_status', 'relationship_manager_id', 'createdat', 'actions'];
    
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
            url : WEBSITE_URL + "customers/get_all",
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

// Function is called to load edit of data
function loadEdit(id)
{
    initSelectField();
    $('#edit-customer-modal').modal('show');
    //loadingBlockUI('#edit-customer-modal');
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "customers/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("#edit-id").val(data.id);
            $("#edit-title").val(data.title);
            $("#edit-account_purpose").val(data.account_purpose);
            $("#edit-firstname").val(data.firstname);
            $("#edit-middlename").val(data.middlename);
            $("#edit-lastname").val(data.lastname);
            $("#edit-maiden_name").val(data.maiden_name);
            $("#edit-phone_number").val(data.phone_number);
            $("#edit-alternate_phone_number").val(data.alternate_phone_number);
            $("#edit-email").val(data.email);
            $("#edit-gender").val(data.gender);
            $("#edit-marital_status").val(data.marital_status);
            $("#edit-branch_id").val(data.branch_id);

            $("#edit-relationship_manager_id").val(data.relationship_manager_id);
            // To set the selected customer item
            if(data.rm_list != undefined){
                // create the option and append to Select2
                var option = new Option(data.rm_list.text, data.rm_list.id, true, true);
                $('#edit-relationship_manager_id').append(option).trigger('change');
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
        ajaxFailureResponse(xhr.status, '#edit-customer-modal');
    });
}

// function to update selected record
function edit()
{
    loadingBlockUI('#edit-customer-modal');
    // Set the AJAX data from the form object
    var postdata = $("#customer_edit_form").serialize();
    $.post(WEBSITE_URL + "customers/edit", postdata, function(response){
        if(response.status == "success")
        {
            // Reset the entire form
            $('#customer_edit_form').trigger("reset");
            // Reset the selections
            $('#edit-relationship_manager_id').select2().val("");
            // Call method to re-init select2
            initSelectField();
            // Refresh the list
            renderData('records_list');
            // Display a success message to the user
            swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
            $('#edit-customer-modal').modal('hide');
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
        ajaxFailureResponse(xhr.status, '#edit-customer-modal');
    });
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
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "customers/delete", postdata, function(response){
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

// Method to activate a customer
function activateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "This would activate the selected customer!",
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
            $.post(WEBSITE_URL + "customers/activate", postdata, function(response){
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

// Method to deactivate a customer
function deactivateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "This would de-activate the selected customer!",
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
            $.post(WEBSITE_URL + "customers/deactivate", postdata, function(response){
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

function initSelectField()
{
    // Initialize the select 2 for employee selection
    $("#edit-relationship_manager_id").select2({ 
        dropdownParent: $("#edit-customer-modal"),
        ajax: {url: WEBSITE_URL + "users/find?employee_user=true", dataType: 'json'},
        width: '100%',
        minimumInputLength: 3,
        placeholder: "Please select a relationship manager",
        theme: "bootstrap4",
    });
}