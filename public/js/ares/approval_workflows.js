var roleSuggestions = [];
var userSuggestions = [];

$(function() {
    renderData();
    // Get the options for roles
    getRoleSuggestionList();
});

$('#new-approval_workflow-modal').on('shown.bs.modal', function() {
    $('input[name="user_role_ids"]').amsifySuggestags({
        type: 'bootstrap',
        whiteList: true,
        suggestions: roleSuggestions
    });
})

$('#edit-approval_workflow-modal').on('shown.bs.modal', function() {
    $('input[name="edit-user_role_ids"]').amsifySuggestags({
        type: 'bootstrap',
        whiteList: true,
        suggestions: roleSuggestions
    });
})


// Method to get available plants
function getRoleSuggestionList(post_data = {})
{
    $.get(WEBSITE_URL + "user_roles/auto_suggest", post_data, function(response){
        roleSuggestions = response.suggestions;
    })
    .done(function(){
    })
    .fail(function() {
    });
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
            row.actions += "data-original-title='Edit Station Type' onclick='loadEdit(" + row.id + ")'><i class='fa fa-edit'></i></a>  ";
        }
        
        if(can_delete == true){
            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' data-toggle='tooltip' data-original-title='Delete Station Type'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }
        row.createdat = dateToReadableTime(row.createdat);

        row.applies_to = "";
        if(row.plant_description != "" && row.plant_description != null)
            row.applies_to += row.plant_description + ", ";

        if(row.plant_type_description != "" && row.plant_type_description != null)
            row.applies_to += row.plant_type_description + ", ";

        if(row.plant_brand_description != "" && row.plant_brand_description != null)
            row.applies_to += row.plant_brand_description + ", ";

        row.unit_price = currencyFormat(row.unit_price);
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }

    cols = ['module_description', 'status_description', 'work_flow_order', 'user_role_ids', 'createdat', 'actions'];
    
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
            url : WEBSITE_URL + "approval_workflows/get_all",
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
    // Call the block UI loader, to block the modal
    blockUi('#new-approval_workflow-modal');
    // first perform the form validation
    var validation = validateFormData();
    if(validation == true)
    {
        // Gather the form data to be passed over AJAX
        var postdata = {};
        postdata.module_description = $("#module_description").val();
        postdata.status_description = $("input[name='status_description']").val();
        postdata.user_role_ids = $("input[name='user_role_ids']").val();
        postdata.user_ids = $("#user_ids").val();
        postdata.work_flow_order = $("input[name='work_flow_order']").val();
        // fetch the csrf token to send to the server
        postdata.csrf_token = $("input[name='csrf_token']").val();

        $.post(WEBSITE_URL + "approval_workflows/create", postdata, function(response){
            if(response.status == "success")
            {
                // Reset the entire form
                $('#approval_workflow_form').trigger("reset");
                // Refresh the list
                renderData();
                // Display a success message to the approval_workflow
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
            unblockUi('#new-approval_workflow-modal');
        })
        .fail(function(xhr, statusText, errorThrown) {
            // Call function to release the UI
            unblockUi('#new-approval_workflow-modal');
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(xhr.status, '#new-approval_workflow-modal');
        });
    }
    else{
        unblockUi('#new-approval_workflow-modal');
    }
}

// Function is called to load edit of data
function loadEdit(id)
{
    $('#edit-approval_workflow-modal').modal('show');
    loadingBlockUI('#edit-approval_workflow-modal');
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "approval_workflows/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("input[name='edit-id']").val(data.id);
            $("#edit-module_description").val(data.module_description);
            $("input[name='edit-status_description']").val(data.status_description);
            $("input[name='edit-user_role_ids']").val(data.user_role_ids);
            $("#edit-user_ids").val(data.user_ids);
            $("input[name='edit-work_flow_order']").val(data.work_flow_order);
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
        unblockUi('#edit-approval_workflow-modal');
    })
    .fail(function(xhr, statusText, errorThrown) {
        // Call function to release the UI
        unblockUi('#edit-approval_workflow-modal');
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, '#edit-approval_workflow-modal');
    });
}

// function to update selected record
function edit()
{
    var validation = validateFormDataEdit();
    if(validation == true)
    {
        loadingBlockUI('#edit-approval_workflow-modal');
        var postdata = {};
        postdata.id = $("input[name='edit-id']").val();
        postdata.module_description = $("#edit-module_description").val();
        postdata.status_description = $("input[name='edit-status_description']").val();
        postdata.user_role_ids = $("input[name='edit-user_role_ids']").val();
        postdata.user_ids = $("#edit-user_ids").val();
        postdata.work_flow_order = $("input[name='edit-work_flow_order']").val();
        postdata.csrf_token = $("input[name='csrf_token']").val();
        $.post(WEBSITE_URL + "approval_workflows/edit", postdata, function(response){
            if(response.status == "success")
            {
                // Reset the entire form
                $('#approval_workflow_edit_form').trigger("reset");
                // Refresh the list
                renderData('records_list');
                // Display a success message to the approval_workflow
                swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", type: "success"});
                $('#edit-approval_workflow-modal').modal('hide');
            }
            else
            {
                // Call the sweet alert to display the error
                swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", type: "error"});
            }
            // Set the new CSRF
            $("input[name='csrf_token']").val(response.csrf_token);
        })
        .done(function(){
            // Call function to release the UI
            unblockUi('#edit-approval_workflow-modal');
        })
        .fail(function(xhr, statusText, errorThrown) {
            // Call function to release the UI
            unblockUi('#edit-approval_workflow-modal');
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(xhr.status, '#edit-approval_workflow-modal');
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
        //if (result.value)
        if (result)
        {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id};
            postdata.csrf_token = $("input[name='csrf_token']").val();
            $.post(WEBSITE_URL + "approval_workflows/delete", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData('records_list');
                    // Display a success message to the approval_workflow
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
                unblockUi('body');
            })
            .fail(function(xhr, statusText, errorThrown) {
                // Call function to release the UI
                unblockUi('body');
                // Now call function that would process the cause of the failure
                ajaxFailureResponse(xhr.status, 'body');
            });
        }
    })
}

// This function is called to ensure all inputs are entered correctly
function validateFormData()
{
    if($("#module_description").val() == ""){
        error = "Please select a module";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='status_description']").val() == ""){
        error = "Please enter workflow status description";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='user_role_ids']").val() == ""){
        error = "Please enter roles permitted to approve work flow";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='work_flow_order']").val() == ""){
        error = "Please enter work flow order";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    return true;
}

// This function is called to ensure all inputs are entered correctly
function validateFormDataEdit()
{
    if($("#edit-module_description").val() == ""){
        error = "Please select a module";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='edit-status_description']").val() == ""){
        error = "Please enter workflow status description";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='edit-user_role_ids']").val() == ""){
        error = "Please enter roles permitted to approve work flow";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    else if($("input[name='edit-work_flow_order']").val() == ""){
        error = "Please enter work flow order";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", type: "error"});
        return false;
    }
    return true;
}