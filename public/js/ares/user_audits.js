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
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#audit_list')) {
        $('#audit_list').DataTable().destroy();
    }
	
    cols = ['firstname', 'lastname', 'username', 'actionType', 'actionPerformed', 'platform', 'browser', 'IPAddress', 'createdat'];
    
    var filters = [];
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    $('#audit_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
        ajax: {
            url : WEBSITE_URL + "user_audits/getaudits/" + userid,
            type: "get",
            data: {filters:filters},
            dataSrc: function ( response ) {
            	return processDataRender(response);
            }
        },
        stateSave: false
    });
}