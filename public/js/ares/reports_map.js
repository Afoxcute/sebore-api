/* ------------------------------------------------------------------------------
*
*  # Datatables data sources
*
*  Specific JS code additions for the main dashboard page
*
*  Version: 1.0
*  Latest update: March 06, 2020
*
* ---------------------------------------------------------------------------- */
var filters = {};
var resource_expected = 9;
var resource_loaded = 0;
var export_excel_str = "";
var export_file_name = "export.xls";
$(function() {
    init();
});

function init()
{
    filters = getFilters();
    renderFusionReportMap();
}

function resetFilter()
{
    $('#report_filter').trigger("reset");
    // Now re-initialise the page
    init();
}

// Function to render a map of Nigeria on the dashboard
function renderFusionReportMap()
{
    loadingBlockUI('body');
    export_file_name = "export_country.xls";
    export_excel_str = "Date\tRegion\tTotal Volume Sold\tTotal Value Sold\tTotal Lodgement\tOpening Stock Balance\tClosing Stock Balance\n";
	$.get(WEBSITE_URL + "reports/get_reports_by_regions", filters, function(data){
		var countryMap = new FusionCharts({
			"type": "maps/nigeria",
			"renderAt": "reportMap",
			"width": "100%",
			"height": "650",
			"dataFormat": "json",
			"dataSource": data
		});
        countryMap.render();
        html_str = '';
        // Process the tabular data
        if(data.region_stats.length > 0){

            data_date = $('#search_createdat').val();
            for(i=0;i < data.region_stats.length;i++)
            {
                html_str += '<tr><td>' + data_date + '</td>'
                html_str += '<td><a href="#report-map-row" onclick="drillIntoZone(' + data.region_stats[i].zone_id +')">' + data.region_stats[i].zone_name + '</a></td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_agents) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_data) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_approved_data) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_data_value) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_approved_data_value) + '</td></tr>'
            }
        }
        $("#location_type_name").html('Region');
        $('#loc_drill_down_tbody').html(html_str);
	})
	.done(function(){
        finishedLoading();
    })
    .fail(function(xhr, statusText, errorThrown) {
        finishedLoading();
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, 'body');
    });
}

// Function to execute when a region is selected
function drillIntoZone(zone_id)
{
    loadingBlockUI('body');
    export_file_name = "export_region.xls";
    export_excel_str = "Date\tStates\tTotal Volume Sold\tTotal Value Sold\tTotal Lodgement\tOpening Stock Balance\tClosing Stock Balance\n";
	$.get(WEBSITE_URL + "reports/get_region_report/" + zone_id, filters, function(data){
		var countryMap = new FusionCharts({
			"type": "maps/nigeria",
			"renderAt": "reportMap",
			"width": "100%",
			"height": "650",
			"dataFormat": "json",
			"dataSource": data
		});
        countryMap.render();
        html_str = '';
        // Process the tabular data
        if(data.region_stats.length > 0){
            for(i=0;i < data.region_stats.length;i++)
            {
                html_str += '<tr><td>' + data.sales_date + '</td>'
                html_str += '<td><a href="#report-map-row" onclick="drillIntoState(' + data.region_stats[i].state_id +')">' + data.region_stats[i].statename + '</a></td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].sales_figures.total_volume) + '</td>';
                html_str += '<td>' + currencyFormat(data.region_stats[i].sales_figures.total_sales) + '</td>';
                html_str += '<td>' + currencyFormat(data.region_stats[i].cash_logments.total_sales) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_opening_stock) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_closing_stock) + '</td></tr>';

                export_excel_str += data.sales_date + "\t" + data.region_stats[i].statename + "\t" + numberFormat(data.region_stats[i].sales_figures.total_volume) + "\t" + numberFormat(data.region_stats[i].sales_figures.total_sales) + "\t" + numberFormat(data.region_stats[i].cash_logments.total_sales) + "\t" + numberFormat(data.region_stats[i].total_opening_stock) + "\t" + numberFormat(data.region_stats[i].total_closing_stock) + "\n";
            }
        }
        $("#location_type_name").html('State');
        $('#loc_drill_down_tbody').html(html_str);
	})
	.done(function(){
        finishedLoading();
    })
    .fail(function(xhr, statusText, errorThrown) {
        finishedLoading();
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, 'body');
    });
}

// Function to execute when a state is selected
function drillIntoState(state_id)
{
    loadingBlockUI('body');
    export_file_name = "export_state.xls";
    export_excel_str = "Date\tStations\tTotal Volume Sold\tTotal Value Sold\tTotal Lodgement\tOpening Stock Balance\tClosing Stock Balance\n";
	$.get(WEBSITE_URL + "reports/get_state_report/" + state_id, filters, function(data){
		var countryMap = new FusionCharts({
			"type": "maps/nigeria",
			"renderAt": "reportMap",
			"width": "100%",
			"height": "650",
			"dataFormat": "json",
			"dataSource": data
		});
        countryMap.render();
        html_str = '';
        // Process the tabular data
        if(data.region_stats.length > 0){
            for(i=0;i < data.region_stats.length;i++)
            {
                html_str += '<tr><td>' + data.sales_date + '</td>'
                html_str += '<td>' + data.region_stats[i].plant_description + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].sales_figures.total_volume) + '</td>';
                html_str += '<td>' + currencyFormat(data.region_stats[i].sales_figures.total_sales) + '</td>';
                html_str += '<td>' + currencyFormat(data.region_stats[i].cash_logments.total_sales) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_opening_stock) + '</td>';
                html_str += '<td>' + numberFormat(data.region_stats[i].total_closing_stock) + '</td></tr>';

                export_excel_str += data.sales_date + "\t" + data.region_stats[i].plant_description + "\t" + numberFormat(data.region_stats[i].sales_figures.total_volume) + "\t" + numberFormat(data.region_stats[i].sales_figures.total_sales) + "\t" + numberFormat(data.region_stats[i].cash_logments.total_sales) + "\t" + numberFormat(data.region_stats[i].total_opening_stock) + "\t" + numberFormat(data.region_stats[i].total_closing_stock) + "\n";
            }
        }
        $("#location_type_name").html('Station');
        $('#loc_drill_down_tbody').html(html_str);
	})
	.done(function(){
        finishedLoading();
    })
    .fail(function(xhr, statusText, errorThrown) {
        finishedLoading();
        // Now call function that would process the cause of the failure
        ajaxFailureResponse(xhr.status, 'body');
    });
}

// Method to export the last data available on the screen
function exportReport()
{
    g_excel_string = $('#exportdata').val();
	var data, link;
	var csv = 'data:application/vnd.ms-excel,' + export_excel_str;
	data = encodeURI(csv);
	link = document.createElement('a');
	link.setAttribute('href', data);
	link.setAttribute('download', export_file_name);
	link.click();
}