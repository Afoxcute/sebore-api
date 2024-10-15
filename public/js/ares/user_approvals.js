/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for agent users module
*
*  Version: 1.0
*  Latest update: Feb 2, 2020
*
* ---------------------------------------------------------------------------- */


$(function() {
    renderData();
    $('input[name="check_all"]').bind('click', function(){
        var status = $(this).is(':checked');
        $('input[type="checkbox"]').prop('checked', status);
    });
});

// This function would process the ajax call for the datatable
function processDataRender(response)
{
    var data = response.data;
    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";
        row.chboxes = '';

        row.actions += " <a href='#' uk-tooltip='title: View User; pos: top' ";
        row.actions += "onclick='loadData(" + row.id + ")'><i class='fa fa-search'></i></a>  ";
        
        if(can_delete == true && row.user_status == 0)
        {
            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' uk-tooltip='title: Delete User; pos: top'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }

        if(row.user_status == -1 && can_approve == true)
        {
            row.chboxes = '<input type="checkbox" name="record_ids[]" value="'+row.id+'">';
            row.user_status = "<span class='badge badge-danger'>Pending Approval</span>";
        }
        else if(row.user_status == -1)
        {
            row.user_status = "<span class='badge badge-secondary'>Pending Approval</span>";
        }
        else if(row.user_status == 1)
        {
            row.user_status = "<span class='badge badge-success'>Active</span>";
        }

        row.created_at = dateToReadableTime(row.created_at);
        row.created_by = row.created_by_firstname + " " + row.created_by_lastname;
        row.full_name = row.firstname + " " + row.lastname;
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['chboxes', 'full_name', 'username', 'created_by', 'user_status', 'created_at', 'actions'];
    
    var filters = getFilters();
    filters.user_status = 'pending';
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    $('#records_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
        ajax: {
            url : WEBSITE_URL + "users/getusers",
            type: "get",
            data: filters,
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

// Function is called to load edit of data
function loadData(id)
{
    UIkit.modal('#view-user-approval-modal').show();
    loadingBlockUI('#view-user-approval-modal');
    $("input[name='approve-id']").val("");
    // Set the expected record id
    var postdata = {};
    $.get(WEBSITE_URL + "users/get/" + id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Set the approval id
            $("input[name='approve-id']").val(data.id);
            // Process the status text
            user_status = "<span class='badge badge-secondary'>Unknown</span>";
            if(data.user_status == 0){
                user_status = "<span class='badge badge-danger'>Inactive</span>";
            }
            else if(data.user_status == -1){
                user_status = "<span class='badge badge-secondary'>Pending Approval</span>";
            }
            else if(data.user_status == 1){
                user_status = "<span class='badge badge-success'>Approved</span>";
            }
            // Load the data into the form
            $("#td-firstname").html(data.firstname);
            $("#td-lastname").html(data.lastname);
            $("#td-username-2").html(data.username);
            $("#td-userroleid").html(data.userrolename);
            $("#td-access_type").html(data.accesstype);
            $("#td-email").html(data.email);
            $("#td-phone_number").html(data.phone_number);
            $("#td-user_image_path").html('<img src="' + WEBSITE_URL + data.user_image_path+'" width="100" height="100">');
            $("#td_initiated_by").html(data.created_by_lastname + ' ' + data.created_by_firstname);
            $("#td_approval_status").html(user_status);
            $("#td_createdat").html(dateToReadableTime(data.created_at));
        }
        else
        {
            $('#view-user-approval-modal').modal('hide');
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
        ajaxFailureResponse(xhr.status, '#view-user-approval-modal');
    });
}

// Method to delete a record
function deleteRecord(id)
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        dangerMode: true,
        buttons: ["Cancel", "Yes, delete it!"],
    }).then((result) => {
        if (result.value) {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {id: id, csrf_token: $("input[name='csrf_token']").val()};
            $.post(WEBSITE_URL + "users/delete", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData();
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

// Method to activate an agent
function approveRecords()
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        dangerMode: true,
        buttons: ["Cancel", "Yes, approve it!"],
    }).then((result) => {
        if (result)
        {
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {};
            // Get the selected readings to approve
            var record_ids = new Array();
            $("input[name='record_ids[]']:checked").each(function() {
                record_ids.push($(this).val());
                postdata.record_ids = record_ids;
            });
            postdata.csrf_token = $("input[name='csrf_token']").val();
            $.post(WEBSITE_URL + "users/approve", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData();
                    // Display a success message to the meter_type
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

// Method to approve a single user selection
function approve()
{
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this action!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, aprove it!'
    }).then((result) => {
        if (result.value)
        {
            $('#view-user-approval-modal').modal('hide');
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {};
            postdata.record_ids = [$("input[name='approve-id']").val()];
            postdata.csrf_token = $("input[name='csrf_token']").val();
            $.post(WEBSITE_URL + "users/approve", postdata, function(response){
                if(response.status == "success")
                {
                    // Refresh the list
                    renderData();
                    // Display a success message to the meter_type
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