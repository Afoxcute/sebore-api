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
    renderData();

    $('input[name="check_all"]').bind('click', function(){
        var status = $(this).is(':checked');
        $('.new-user-role-boxes').prop('checked', status);
    });

    $('input[name="edit_check_all"]').bind('click', function(){
        var status = $(this).is(':checked');
        $('.edit-user-role-boxes').prop('checked', status);
    });

    $("[data-scroll='dark-3']").mCustomScrollbar({
        theme: "dark-3",
        scrollInertia: 100,
        mouseWheel: {
            preventDefault: true
        }
    });

});



// This function would call the delete URL
function godelete(agent_id)
{
}

//This function would process the ajax call for the datatable
function processDataRender(response)
{
	var content = "";
    var data = response.data;

    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";

        if(can_edit == true){
            row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
            row.actions += "data-original-title='Edit Role' onclick='loadEdit(" + row.id + ")'><i class='fa fa-edit'></i></a>  ";
        }

        if(can_delete == true){

            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' data-toggle='tooltip' data-original-title='Delete User Role'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }

        if(row.status == 1){
            row.status = "<span class='label label-success'>Active</span>";
        }
        else{
            row.status = "<span class='label label-warning'>Inactive</span>";
        }

    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['id', 'userrolename', 'roledescription', 'status', 'createdat', 'actions'];
    
    var filters = [];
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    $('#records_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
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
        loadingBlockUI('#new-user_role-modal');

        // Gather the form data to be passed over AJAX
        var postdata = {};
        postdata.userrolename = $("input[name='userrolename']").val();
        postdata.roledescription = $("input[name='roledescription']").val();
        postdata.status = $("#status").val();
        postdata.app_modules = [];
        var app_modules = new Array();
        $("input[name='app-modules[]']:checked").each(function() {
            app_modules.push($(this).val());
            postdata.app_modules = app_modules;
        });

        // Get the CSRF token
        postdata.csrf_token = $("input[name='csrf_token']").val();

        $.post(WEBSITE_URL + "user_roles/create", postdata, function(response){
            if(response.status == "success")
            {
                // Reset the entire form
                $('#user_role_form').trigger("reset");
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
            ajaxFailureResponse(xhr.status, '#new-user_role-modal');
        });
    }
}

// Function is called to load edit of data
function loadEdit(id)
{
    // Reset the entire form
    $('#user_role_edit_form').trigger("reset");

    $('#edit-user_role-modal').modal('show');
    loadingBlockUI('#edit-user_role-modal');
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "user_roles/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("input[name='edit-id']").val(data.id);
            $("input[name='edit-userrolename']").val(data.userrolename);
            $("input[name='edit-roledescription']").val(data.roledescription);
            $("#edit-status").val(data.status);
            if(response.app_modules.length > 0){
                for(i=0; i<response.app_modules.length; i++){
                    $("#edit-mod-"+response.app_modules[i].moduleID).prop('checked', true);
                }
            }
        }
        else
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: data.message, confirmButtonColor: "#2196F3", type: "error"});
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
        ajaxFailureResponse(xhr.status, '#edit-user_role-modal');
    });
}

// function to update selected record
function edit()
{
    var validation = validateFormDataEdit();
    if(validation == true)
    {
        loadingBlockUI('#edit-user_role-modal');
        var postdata = {};
        postdata.id = $("input[name='edit-id']").val();
        postdata.userrolename = $("input[name='edit-userrolename']").val();
        postdata.roledescription = $("input[name='edit-roledescription']").val();
        postdata.status = $("#edit-status").val();
        postdata.app_modules = [];
        var app_modules = new Array();
        $("input[name='edit-app-modules[]']:checked").each(function() {
            app_modules.push($(this).val());
            postdata.app_modules = app_modules;
        });
        // Get the CSRF token
        postdata.csrf_token = $("input[name='csrf_token']").val();
        $.post(WEBSITE_URL + "user_roles/edit", postdata, function(response){
            if(response.status == "success")
            {
                // Reset the entire form
                $('#user_role_edit_form').trigger("reset");
                // Refresh the list
                renderData('records_list');
                // Display a success message to the user
                swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                $('#edit-user_role-modal').modal('hide');
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
            ajaxFailureResponse(xhr.status, '#edit-user_role-modal');
        });
    }
}

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
            $.post(WEBSITE_URL + "user_roles/delete", postdata, function(response){
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
    if($("input[name='userrolename']").val() == ""){
        error = "Please enter role name";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='roledescription']").val() == ""){
        error = "Please enter a description";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("#status").val() == ""){
        error = "Please select a status";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    return true;
}

// This function is called to ensure all inputs are entered correctly
function validateFormDataEdit()
{
    if($("input[name='edit-userrolename']").val() == "" || $("input[name='edit-userrolename']").val() == null){
        error = "Please enter role name";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='edit-roledescription']").val() == ""){
        error = "Please enter role description";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("#edit-status").val() == ""){
        error = "Please select a status";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    return true;
}