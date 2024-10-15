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
    // Jquery form validation for the document creation form
    $("#new_document_form").validate({
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
            create();
        }
    });

    // Jquery form validation for the document edit form
    $("#edit_document_form").validate({
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
	var content = "";
    var data = response.data;

    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";

        if(can_edit == true && row.pending_edit == 0){
            row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
            row.actions += "data-original-title='Edit Document' onclick='loadEdit(" + row.id + ")'><i class='fa fa-edit'></i></a>  ";
        }

        if(row.document_status == 1){
            row.document_status = "<span class='badge badge-success'>Approved</span>";
        }
        else
        {
            if(can_delete == true){
                row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' data-toggle='tooltip' data-original-title='Delete Document'>";
                row.actions += " <i class='fa fa-trash'></i></a>";
            }
            
            if(row.document_status == -1){
                row.document_status = "<span class='badge badge-secondary'>Pending Approval</span>";
            }
            else if(row.document_status == 0)
            {
                row.document_status = "<span class='badge badge-warning'>Deactivated</span>";
            }
        }
        row.createdat = dateToReadableTime(row.createdat);

        if(row.document_size >= 1000)
            row.document_size = numberFormat(row.document_size / 1000) + " MB";
        else
            row.document_size = numberFormat(row.document_size) + " KB";
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['id', 'document_description', 'document_size', 'document_status', 'createdat', 'actions'];
    
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
            url : WEBSITE_URL + "documents/get_all",
            type: "get",
            data: {filters:filters},
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
    loadingBlockUI('#new-document-modal');
    form = document.getElementById('new_document_form');
    $.ajax({url: WEBSITE_URL + "documents/create", type: "POST", data:  new FormData(form), contentType: false, cache: false, processData:false,
        success: function(response) {
            if(response.status == "success")
            {
                // Reset the entire form
                $('#new_document_form').trigger("reset");
                // Refresh the list
                renderData('records_list');
                // Display a success message to the document
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
            ajaxFailureResponse(jqXHR.status, '#new-document-modal');
        }
    });
}

// Function is called to load edit of data
function loadEdit(id)
{
    $('#edit-document-modal').modal('show');

    loadingBlockUI('#edit-document-modal');
    // Reset the hidden field
    $("#edit-id").val("");
    var postdata = {id: id};
    $.get(WEBSITE_URL + "documents/get/"+id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Load the data into the form
            $("#edit-id").val(data.id);
            $("#edit-firstname").val(data.firstname);
            $("#edit-lastname").val(data.lastname);
            $("#edit-othernames").val(data.othernames);
            $("#edit-email").val(data.email);
            $("#edit-phone_number").val(data.phone_number);
            $("#edit-position_id").val(data.position_id);
            $("#edit-gender").val(data.gender);
            $("#edit-date_of_birth").val(data.date_of_birth);
            $("#edit-region_id").val(data.region_id);
            $("#edit-state_id").val(data.state_id);
            $("#edit-branch_id").val(data.branch_id);
            $("#edit-hire_date").val(data.hire_date);

            var options = '<option value="">...</option>';
            if(data.states_list.length > 0)
            {
                for(i=0; i<data.states_list.length; i++){
                    options += '<option value="' + data.states_list[i].id + '">' + data.states_list[i].state_name + '</option>';
                }
            }
            $("#edit-state_id").html(options);
            $("#edit-state_id").val(data.state_id);

            options = '<option value="">...</option>';
            if(data.branch_list != undefined && data.branch_list.length > 0)
            {
                for(i=0; i<data.branch_list.length; i++){
                    options += '<option value="' + data.branch_list[i].id + '">' + data.branch_list[i].branch_description + '</option>';
                }
            }
            $("#edit-branch_id").html(options);
            $("#edit-branch_id").val(data.branch_id);
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
        ajaxFailureResponse(xhr.status, '#edit-document-modal');
    });
}

// function to update selected record
function edit()
{
    loadingBlockUI('#edit-document-modal');
    form = document.getElementById('edit_document_form');
    $.ajax({url: WEBSITE_URL + "documents/edit", type: "POST", data:  new FormData(form), contentType: false, cache: false, processData:false,
        success: function(response) {
            if(response.status == "success")
            {
                // Reset the entire form
                $('#edit_document_form').trigger("reset");
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
        },
        complete: function(jqXHR, exception) {
            // Call function to release the UI
            finishedLoading();
        },
        error: function(jqXHR, exception) {
            // Call function to release the UI
            finishedLoading();
            // Now call function that would process the cause of the failure
            ajaxFailureResponse(jqXHR.status, '#edit-document-modal');
        }
    });
}

// Method to activate a bank
function activateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "This would activate the selected bank!",
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
            $.post(WEBSITE_URL + "documents/activate", postdata, function(response){
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

// Method to deactivate a bank
function deactivateRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "This would de-activate the selected bank!",
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
            $.post(WEBSITE_URL + "documents/deactivate", postdata, function(response){
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
            $.post(WEBSITE_URL + "documents/delete", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData('records_list');
                    // Display a success message to the document
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