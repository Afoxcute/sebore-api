/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for datatable_data_sources.html page
*
*  Version: 1.0
*  Latest update: Aug 1, 2015
*
* ---------------------------------------------------------------------------- */


$(function() {

    // Call the method to render the data
    renderData();

    $('input[name="check_all"]').bind('click', function(){
        var status = $(this).is(':checked');
        $('.new-user-role-boxes').prop('checked', status);
    });

    $('input[name="edit_check_all"]').bind('click', function(){
        var status = $(this).is(':checked');
        $('.edit-user-role-boxes').prop('checked', status);
    });

    // Jquery form validation for the user creation form
    $("#user_role_form").validate({
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
            create();
        }
    });

    // Jquery form validation for the user edit form
    $("#user_role_edit_form").validate({
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
});

//This function would process the ajax call for the datatable
function processDataRender(response)
{
    var data = response.data;

    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";

        if(can_edit == true && row.pending_edit == 0){
            row.actions += " <a href='#' uk-tooltip='title: Edit Role; pos: top' ";
            row.actions += "onclick='loadEdit(" + row.id + ")'><i class='fa fa-edit'></i></a>  ";
        }
        if(can_delete == true){
            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' uk-tooltip='title: Delete Role; pos: top'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }
        if(row.status == 1){

            row.status = "<span class='uk-badge green'>Active</span>";
            if(can_deactivate==true){
                row.actions += " <a href='#' onclick='deactivateRecord(" + row.id  + ")' uk-tooltip='title: Deactivate Role; pos: top'>";
                row.actions += "<i class='fa fa-unlock'></i></a>  ";
            }
        }
        else if(row.status == -1){
            row.status = "<span class='uk-badge blue'>Unapproved</span>";
        }
        else{
            row.status = "<span class='uk-badge red'>Deactivated</span>";
            if(can_activate==true){
                row.actions += " <a href='#' onclick='activateRecord(" + row.id  + ")' uk-tooltip='title: Activate Role; pos: top'>";
                row.actions += "<i class='fa fa-check-square'></i></a>  ";
            }
        }

        if(row.role_type == 1)
            row.role_type = "Admin Role";
        else if(row.role_type == 2)
            row.role_type = "Merchant Role";
        
        row.created_at = dateToReadableTime(row.created_at);
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['id', 'user_role_name', 'role_description', 'role_type', 'status', 'created_at', 'actions'];
    
    var filters = [];
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    $('#records_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
        dom: "<bottom ilp>",
        ajax: {
            url : WEBSITE_URL + "user_roles/getroles",
            type: "get",
            data: {filters:filters},
            dataSrc: function ( response ) {
            	return processDataRender(response);
            }
        },
        stateSave: false,
        "initComplete": function(settings, json) {
        },
        "drawCallback": function( settings ) {
        }
    });
}

// function to create a new record
function create()
{
    loadingBlockUI('#new-user-role-modal');
    form = document.getElementById('user_role_form');
    $.ajax({url: WEBSITE_URL + "user_roles/create", type: "POST", data:  new FormData(form), contentType: false, cache: false, processData:false,
        success: function(response) {
            if(response.status == "success")
            {
                // Reset the entire form
                $('#user_role_form').trigger("reset");
                // Refresh the list
                renderData();
                // Display a success message to the user
                swal({title: "Success!", text: response.message, type: "success"});
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
        },
        complete: function(jqXHR, exception) {
            // Call function to release the UI
            finishedLoading();
        },
        error: function(jqXHR, exception) {
            // Call function to release the UI
            finishedLoading();
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(jqXHR.status, '#new-user-role-modal');
        }
    });
}

// Function is called to load edit of data
function loadEdit(id)
{
    UIkit.modal('#edit-user-role-modal').show();
    loadingBlockUI('#edit-user-role-modal');
    // Reset the edit form
    $('#user_role_edit_form').trigger("reset");
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "user_roles/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("#edit-id").val(data.id);
            $("#edit-user_role_name").val(data.user_role_name);
            $("#edit-role_description").val(data.role_description);
            $("#edit-status").val(data.status);
            $("#edit-role_type").val(data.role_type);
            if(response.app_modules.length > 0){
                for(i=0; i<response.app_modules.length; i++){
                    $("#edit-mod-"+response.app_modules[i].module_id).prop('checked', true);
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
        ajaxFailureResponse(xhr.status, '#edit-user-role-modal');
    });
}

// function to update selected record
function edit()
{
    loadingBlockUI('#edit-user-role-modal');
    form = document.getElementById('user_role_edit_form');
    $.ajax({url: WEBSITE_URL + "user_roles/edit", type: "POST", data:  new FormData(form), contentType: false, cache: false, processData:false,
        success: function(response) {
            if(response.status == "success")
            {
                // Reset the entire form
                $('#user_role_edit_form').trigger("reset");
                // Close the modal dialog
                UIkit.modal('#edit-user-role-modal').hide();
                // Refresh the list
                renderData();
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
        },
        complete: function(jqXHR, exception) {
            // Call function to release the UI
            finishedLoading();
        },
        error: function(jqXHR, exception) {
            // Call function to release the UI
            finishedLoading();
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(jqXHR.status, '#edit-user-role-modal');
        }
    });
}

// Method to set the record as active
function activateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        dangerMode: true,
        buttons: ["Cancel", "Yes, activate it!"],
    }).then((result) => {
        if (result) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "user_roles/activate", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData();
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
                }
                else
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
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
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}

// Method to set the record as deactived
function deactivateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        dangerMode: true,
        buttons: ["Cancel", "Yes, de-activate it!"],
    }).then((result) => {
        if (result) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "user_roles/deactivate", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData();
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
                }
                else
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
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
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}

// Method to delete a record from the database
function deleteRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        dangerMode: true,
        buttons: ["Cancel", "Yes, delete it!"],
    }).then((result) => {
        if (result) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "user_roles/delete", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData();
                    // Display a success message to the user
                    swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
                }
                else
                {
                    // Call the sweet alert to display the error
                    swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
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
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}