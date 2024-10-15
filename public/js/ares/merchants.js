/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for datatable_data_sources.html page
*
*  Version: 1.0
*  Latest update: Jul 22, 2020
*
* ---------------------------------------------------------------------------- */

var table;

$(function() {
    renderData();

    $('.dataTable').on('click', 'tbody tr', function() {
        //get textContent of the TD
        console.log('TD cell textContent : ', this.textContent)
      
        //get the value of the TD using the API 
        console.log('value by API : ', table.cell({ row: this.parentNode.rowIndex, column : this.cellIndex }).data());
    })
});

//This function would process the ajax call for the datatable
function processDataRender(response)
{
    var data = response.data;
    for(var i=0; i<data.length; i++) 
    {
        var row = data[i];
        row.actions = "";

        row.actions += " <a href='#' onClick='loadData("+ row.merchantcode +")' uk-tooltip='title: View Transaction; pos: top'>";
        row.actions += " <i class='fa fa-search'></i></a>";

        // Process the transaction amount
        row.trandingname = '<a href="'+ WEBSITE_URL + 'merchants/details/' + row.merchantcode + '">'+ row.tradingname + '</a>';
        // process the transaction date
        row.added = dateToReadable(row.added) + ' <span id="lighter">' + dateToTime(row.added) + '</span>';
        
        
    }
    return data;
}

// this function is responsible for loading all the data into the dataTable
function renderData() 
{
    if ($.fn.dataTable.isDataTable('#records_list')) {
        $('#records_list').DataTable().destroy();
    }
	
    cols = ['tradingname', 'email', 'merchantcode', 'businessindustrycategory', 'added'];
    
    var filters = [];
    var columns = [];

    for(var i in cols) {
        columns.push({"data":cols[i]});
    }
    
    loadingBlockUI('.tran-container');
    table = $('#records_list').DataTable( {
        serverSide: true,
        ordering: false,
        columns: columns,
        ajax: {
            url : WEBSITE_URL + "merchants/get_all",
            type: "get",
            data: {filters:filters},
            dataSrc: function ( response ) {
            	return processDataRender(response);
            }
        },
        stateSave: true,
        "initComplete": function(settings, json) {
            finishedLoading();
        },
        "drawCallback": function( settings ) {
            finishedLoading();
        }
    });
}