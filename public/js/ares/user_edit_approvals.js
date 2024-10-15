/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for agent users module
*
*  Version: 1.0
*  Latest update: Mar 18, 2020
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
	var content = "";
    var data = response.data;

    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";
        row.chboxes = '<input type="checkbox" name="record_ids[]" value="'+row.id+'">';

        row.actions += " <a href='#' data-toggle='tooltip' data-placement='top' title='' ";
        row.actions += "data-original-title='View Agent' onclick='loadData(" + row.id + ")'><i class='fa fa-search'></i></a>  ";
        
        if(can_delete == true)
        {
            row.actions += " <a href='#' onClick='deleteRecord("+ row.id +")' data-toggle='tooltip' data-original-title='Delete Request'>";
            row.actions += " <i class='fa fa-trash'></i></a>";
        }

        var _data = JSON.parse(row.old_data_json);
        row.full_name = _data.firstname + ' ' + _data.lastname;
        row.email = _data.email;
        row.approval_status = "<span class='badge badge-danger'>Pending Approval</span>";
        row.createdat = dateToReadableTime(row.createdat);
        row.created_by = row.firstname + ' ' + row.lastname;
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['chboxes', 'record_id', 'full_name', 'email', 'created_by', 'approval_status', 'createdat', 'actions'];
    
    var filters = getFilters();
    filters.module = 'USERS';
    filters.approval_status = 'pending';
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    $('#records_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
        ajax: {
            url : WEBSITE_URL + "data_edits/get_all",
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
    $('#view-edits-approval-modal').modal('show');
    loadingBlockUI('#view-edits-approval-modal');
    $("input[name='approve-id']").val("");
    // Set the expected record id
    var postdata = {id: id};
    $.get(WEBSITE_URL + "data_edits/get/" + id, postdata, function(response){
        if(response.status == "success")
        {
            var data = response.data

            var data_new = JSON.parse(data.new_data_json)
            var data_old = JSON.parse(data.old_data_json)

            // Set the approval id
            $("input[name='approve-id']").val(data.id);
            // Process the status text
            approval_status = "";
            if(data.approval_status == 0){
                approval_status = "<span class='badge badge-danger'>Pending Approval</span>";
            }
            else if(data.approval_status == -1){
                approval_status = "<span class='badge badge-secondary'>Disapproved</span>";
            }
            else if(data.approval_status == 1){
                approval_status = "<span class='badge badge-success'>Approved</span>";
            }

            // Load the data into the form

            color = '';
            if(data_new.firstname != data_old.firstname)
                color = 'text-danger';

            $("#td-firstname-new").html('<span class="'+color+'">' + data_new.firstname + '</span>');
            $("#td-firstname-old").html('<span class="'+color+'">' + data_old.firstname + '</span>');

            color = '';
            if(data_new.lastname != data_old.lastname)
                color = 'text-danger';

            $("#td-lastname-new").html('<span class="'+color+'">' + data_new.lastname + '</span>');
            $("#td-lastname-old").html('<span class="'+color+'">' + data_old.lastname + '</span>');


            color = '';
            if(data_new.phonenumber != data_old.phonenumber)
                color = 'text-danger';

            $("#td-phonenumber-new").html('<span class="'+color+'">' + data_new.phonenumber + '</span>');
            $("#td-phonenumber-old").html('<span class="'+color+'">' + data_old.phonenumber + '</span>');

            color = '';
            if(data_new.branch_id != data_old.branch_id)
                color = 'text-danger';

            $("#td-branch_id-new").html('<span class="'+color+'">' + data_new.branch_id + '</span>');
            $("#td-branch_id-old").html('<span class="'+color+'">' + data_old.branch_id + '</span>');

            color = '';
            if(data_new.region_id != data_old.region_id)
                color = 'text-danger';

            $("#td-region_id-new").html('<span class="'+color+'">' + data_new.region_id + '</span>');
            $("#td-region_id-old").html('<span class="'+color+'">' + data_old.region_id + '</span>');

            color = '';
            if(data_new.state_id != data_old.state_id)
                color = 'text-danger';

            $("#td-state_id-new").html('<span class="'+color+'">' + data_new.state_id + '</span>');
            $("#td-state_id-old").html('<span class="'+color+'">' + data_old.state_id + '</span>');

            color = '';
            if(data_new.email != data_old.email)
                color = 'text-danger';

            $("#td-email-new").html('<span class="'+color+'">' + data_new.email + '</span>');
            $("#td-email-old").html('<span class="'+color+'">' + data_old.email + '</span>');

            color = '';
            if(data_new.accesstype != data_old.accesstype)
                color = 'text-danger';

            if(data_new.accesstype == 1)
                data_new.accesstype = 'Can access all available customers';
            else if(data_new.accesstype == 2)
                data_new.accesstype = 'Access only attached customers';

            if(data_old.accesstype == 1)
                data_old.accesstype = 'Can access all available customers';
            else if(data_old.accesstype == 2)
                data_old.accesstype = 'Access only attached customers';

            $("#td-accesstype-new").html('<span class="'+color+'">' + data_new.accesstype + '</span>');
            $("#td-accesstype-old").html('<span class="'+color+'">' + data_old.accesstype + '</span>');

            $("#td-approval_status").html('<span class="'+color+'">' + approval_status + '</span>');
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
        ajaxFailureResponse(xhr.status, '#view-edits-approval-modal');
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
            var postdata = {id: id};
            $.post(WEBSITE_URL + "data_edits/delete", postdata, function(response){
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
        text: "You won't be able to revert this action!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, aprove it!'
    }).then((result) => {
        if (result.value)
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
            $.post(WEBSITE_URL + "data_edits/approve", postdata, function(response){
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

// Method to activate an agent
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
            $('#view-edits-approval-modal').modal('hide');
            // block the UI with a loading icon
            loadingBlockUI('body');
            var postdata = {};
            postdata.record_ids = [$("input[name='approve-id']").val()];
            postdata.csrf_token = $("input[name='csrf_token']").val();
            $.post(WEBSITE_URL + "data_edits/approve", postdata, function(response){
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