/*
*
*
*  Specific JS utility functions to be used accross the app
*  Author: Oludele Oluwaseun
*  Version: 1.0
*  Latest update: October 5, 2018
*
*
*/

var lastFilteredCustomerID = null;
var lastFilteredRelationshipManagerID = null;

$("input[data-type='number']").keyup(function(event){
    // skip for arrow keys
    if(event.which >= 37 && event.which <= 40){
        event.preventDefault();
    }
    var $this = $(this);
    var num = $this.val().replace(/,/gi, "");
    var num2 = num.split(/(?=(?:\d{3})+$)/).join(",");
    // the following line has been simplified. Revision history contains original.
    $this.val(num2);
});

$('#search_customer_id').on("change", function(e) {
    console.log("Customer ID: " + $("#search_customer_id").val());
    lastFilteredCustomerID = $("#search_customer_id").val();
});

$('#search_relationship_manager_id').on("change", function(e) {
    lastFilteredRelationshipManagerID = $("#search_relationship_manager_id").val();
});

// When the search state is selected, load the LGAs
$('#search_state_id').on('change', function() {
    // Load the LGAs
    loadLGAs("#search_lga_id", "#search_state_id");
});

function getFilters()
{
    var filter = {};
    if($('#search_application_status').val() != undefined &&  $('#search_application_status').val() != ""){
        filter.application_status = $('#search_application_status').val();
        filter_url_params += '&application_status=' + filter.application_status;
    }
    if($('#search_gender').val() != undefined &&  $('#search_gender').val() != ""){
        filter.gender = $('#search_gender').val();
        filter_url_params += '&gender=' + filter.gender;
    }
    if($('#search_customer_status').val() != undefined &&  $('#search_customer_status').val() != ""){
        filter.customer_status = $('#search_customer_status').val();
        filter_url_params += '&customer_status=' + filter.customer_status;
    }
    if($('#search_transaction_status').val() != undefined &&  $('#search_transaction_status').val() != ""){
        filter.transaction_status = $('#search_transaction_status').val();
        filter_url_params += '&transaction_status=' + filter.transaction_status;
    }

    return filter;
}

// Method to reset the advanced filter form
function resetFilters()
{
    $('#advanced_filter_form').trigger("reset");
    // Reset the select2 elements
    $('#search_customer_id').select2().val("");
    // Re-initialize the page
    init();
}

function loadingBlockUI(selector)
{
    //$(selector).append('<div class="qt-block-ui"></div>');
    var html = '<div id="blockui-overlay" class="uk-overlay-default uk-position-cover blockui-overlay">';
    html += '<div class="uk-position-center"><span uk-spinner></span></div></div>';
    $(selector).append(html)
}

function finishedLoading()
{
    // Remove the blockui-overlay from teh DOM
    $( ".blockui-overlay" ).remove();
}

function blockUi(message)
{
	$.blockUI({ css: { 
		border: 'none', 
		padding: '15px', 
		backgroundColor: '#000', 
		'-webkit-border-radius': '10px', 
		'-moz-border-radius': '10px', 
		opacity: .5, 
		color: '#fff' 
	},message: "<i class='icon-spinner spinner position-left'></i><br><h6>" +message+"</h6>" });
}

function unblockUi()
{
    finishedLoading();
}


// This function would render a fushioncharts line series chart to any container specified
function renderTrendChart(container_id, chart_caption, trend_data, xaxisname, yaxisname)
{
	if(xaxisname == undefined) {
		xaxisname = "Date";
	}

	var fusioncharts = new FusionCharts({
		type: 'line',
		renderAt: container_id,
		width: '100%',
		height: '300',
		dataFormat: 'json',
		dataSource: {
		    "chart": {
		        "caption": chart_caption,
		        "xaxisname": xaxisname,
		        "yaxisname": yaxisname,
		        "yaxismaxvalue": "100",
		        "linecolor": "008ee4",
		        "anchorsides": "3",
		        "anchorradius": "5",
		        "plotgradientcolor": " ",
		        "bgcolor": "FFFFFF",
		        "showalternatehgridcolor": "0",
		        "showplotborder": "0",
		        "showvalues": "0",
		        "divlinecolor": "666666",
		        "showcanvasborder": "0",
		        "canvasborderalpha": "0",
		        "showborder": "0"
		    },
		    "data": trend_data
		}
	});
	fusioncharts.render();
}


// This container would render a donut chart using Fusion chart to specified parameters
function render2dDonutChart(container_id, chart_caption, trend_data)
{
	var fusioncharts = new FusionCharts({
		type: 'doughnut2d',
        renderAt: container_id,
        width: '100%',
        height: '450',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "caption": chart_caption,
                "bgColor": "#ffffff",
                "showBorder": "0",
                "use3DLighting": "0",
                "showShadow": "0",
                "enableSmartLabels": "0",
                "startingAngle": "310",
                "showLabels": "0",
                "showPercentValues": "1",
                "showLegend": "1",
                "legendShadow": "0",
                "legendBorderAlpha": "0",
                "defaultcenterlabel": "Product Requests Distribution",
                "centerLabel": "$label Quantity Requested: $value",
                //"plottooltext": "<b>$percentValue</b> of requested products are <b>$label</b>",
                "centerLabelBold": "1",
                "showTooltip": "0",
                "decimals": "0",
                "captionFontSize": "14",
                "subcaptionFontSize": "14",
                "subcaptionFontBold": "0"
            },
	        "data": trend_data
	    }
  	});
	fusioncharts.render();
}


// This function would render a simple bar chart to any container specified
function renderBarChart(container_id, chart_caption, trend_data, xaxisname, yaxisname)
{

    var curr = "₦";
    if(xaxisname == undefined) {
        xaxisname = "Date";
    }

    var fusioncharts = new FusionCharts({
        type: 'column2d',
        renderAt: container_id,
        width: '100%',
        height: '300',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "caption": chart_caption,
                "xaxisname": xaxisname,
                "yaxisname": yaxisname,
                "linecolor": "008ee4",
                "anchorsides": "3",
                "anchorradius": "5",
                "plotgradientcolor": " ",
                "bgcolor": "FFFFFF",
                "showalternatehgridcolor": "0",
                "showplotborder": "0",
                "showvalues": "1",
                "divlinecolor": "666666",
                "showcanvasborder": "0",
                "canvasborderalpha": "0",
                "showborder": "0",
                //"showTooltip": "1",
                //"plottooltext": "<b>$value</b> of requested products are <b>$label</b>",
                "numberPrefix": curr,
                "theme": "fusion"
            },
            "data": trend_data
        }
    });
    fusioncharts.render();
}


function currencyFormat(amount, abbrev=false, dp=3) {

	if(amount == null || isNaN(amount))
		return 0;

	if(amount < 0) {
		amount = 0 - amount;

		if(abbrev===true) {
			return "-₦" + abbreviateNumber(amount, dp);
		} else {
			return "-₦" + new Intl.NumberFormat().format(amount);
		}
		
	}

    if(abbrev===true) {
		return "₦" + abbreviateNumber(amount, dp);
	} else {
		return "₦" + new Intl.NumberFormat().format(amount);
	}
}

function numberFormat(num) {

	if(num == null || isNaN(num))
		return 0;

	return new Intl.NumberFormat().format(num);
}

function abbreviateNumber(value) {

    
    /*if(value == 0 || value == null)
        return 0.0;
    if(value < 1000)
        return value;*/
    if(value == "null" || value == null || value == '' || value == 0 || value == "0"){
        console.log("Passing through: *" + value + "*");
        return "0";
    }
    else if(value < 1000 && value > 0)
        return value;
    else if(value < 0){
        value *= -1;
        return "-" + numeral(value).format('0.00a');
    }

    var string = numeral(value).format('0.00a');
    return string;
}

function getDateArray(startDate, endDate, interval, total) {
    
    var dateArray = [startDate];

    currentdate = new Date(startDate);
    enddate = new Date(endDate);

    while(currentdate < enddate) {

    	currentdate.setDate(currentdate.getDate() + 1);

    	var dd = currentdate.getDate();
	    var mm = currentdate.getMonth() + 1;
	    var y = currentdate.getFullYear();

	    var formattedDate = y + '-' + pad(mm, 2) + '-' + pad(dd, 2);

	    dateArray.push(formattedDate);

    }

    dateArray.push(endDate);

    return dateArray;
};


function dateToReadable(date_str) 
{
    if(date_str == null || date_str == 'null' || date_str == '')
        return '';

    moment.locale('en');
    return moment(date_str).format('LL');
	var date = new Date(date_str);
	return date.toDateString();
	//return date.toDateString() + " " + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

function dateToReadableFigures(date_str) 
{
    if(date_str == null || date_str == 'null' || date_str == '')
        return '';

    moment.locale('en');
    return moment(date_str).format('L');
}

function dateToReadableTime(date_str) 
{
    if(date_str == null || date_str == 'null' || date_str == '')
        return '';

    //moment.locale('en');
    //return moment(date_str).format('LLL');
	var date = new Date(date_str);
	return date.toDateString() + " " + date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

	//return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
}

function dateToTime(date_str)
{
    if(date_str == null || date_str == 'null' || date_str == '')
        return '';
	var date = new Date(date_str);
	return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
}

function TimeFromTimestamp(unix_timestamp) {
	//get the date
	var date = new Date(unix_timestamp*1000);
	// Hours part from the timestamp
	var hours = date.getHours();
	// Minutes part from the timestamp
	var minutes = "0" + date.getMinutes();
	// Seconds part from the timestamp
	var seconds = "0" + date.getSeconds();

	var formattedTime = hours + ':' + minutes.substr(-2) + "am";

	if(hours > 12) {
		hours = hours - 12;

		formattedTime = hours + ':' + minutes.substr(-2) + "pm";
	}
	return formattedTime;
}

function timeDifference(stoptimestamp, starttimestamp) {

    var difference = stoptimestamp*1000 - starttimestamp*1000;

    var days = Math.floor(difference/1000/60/60/24);
    difference -= days*1000*60*60*24

   var hrs = Math.floor(difference/1000/60/60);
    difference -= hrs*1000*60*60

    var mins = Math.floor(difference/1000/60);
    difference -= mins*1000*60

    var secs = Math.floor(difference/1000);

    return pad(hrs, 2) + ":" + pad(mins, 2) + ":" + pad(secs, 2);
}

function renderScrollChart(element_id, dataSource)
{
    FusionCharts.ready(function() {
        var myChart = new FusionCharts({
            type: "scrollline2d",
            renderAt: element_id,
            width: "100%",
            height: "100%",
            dataFormat: "json",
            dataSource
        }).render();
    });
}


function multiLineChart()
{
    const dataSource = {
  chart: {
    caption: "Support Tickets : Received vs Resolved",
    yaxisname: "# of Tickets",
    subcaption: "Last week",
    numdivlines: "3",
    showvalues: "0",
    legenditemfontsize: "15",
    legenditemfontbold: "1",
    plottooltext: "<b>$dataValue</b> Tickets $seriesName on $label",
    theme: "fusion"
  },
  dataset: [
    {
      seriesname: "Received",
      data: [
        {
          value: "55",
          label: "Jan 1"
        },
        {
          value: "45",
          label: "Jan 2"
        },
        {
          value: "52",
          label: "Jan 3"
        }
      ]
    },
    {
      seriesname: "Resolved",
      data: [
        {
          value: "50",
          label: "Jan 1"
        },
        {
          value: "30",
          label: "Jan 2"
        },
        {
          value: "49",
          label: "Jan 3"
        }
      ]
    }
  ]
};

FusionCharts.ready(function() {
  var myChart = new FusionCharts({
    type: "msspline",
    renderAt: "prod_multi_chart",
    width: "100%",
    height: "100%",
    dataFormat: "json",
    dataSource
  }).render();
});

}

// function to create a new record
function updateUserPassword()
{
    // Gather the form data to be passed over AJAX
    var postdata = {};
    postdata.oldpassword = $("input[name='profile-current-password']").val();
    postdata.newpassword = $("input[name='profile-new-password']").val();
    postdata.repassword = $("input[name='profile-re-newpassword']").val();

    if(postdata.oldpassword == ""){
        error = "Please enter current password";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }
    else if(postdata.newpassword == ""){
        error = "Please enter new password";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }
    else if(postdata.repassword != postdata.newpassword){
        error = "The passwords entered do not match";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }

    // Call the block UI loader, to block the modal
    loadingBlockUI('#user-profile-password-modal');

    $.post(WEBSITE_URL + "dashboard/changepassword", postdata, function(response){
        if(response.status == "success")
        {
            // Reset the entire form
            $('#profile_password_form').trigger("reset");
            // Display a success message to the user
            swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
        }
        else if(response.status == "failed")
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
        }
        else{
            swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", icon: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
        finishedLoading();
    })
    .fail(function() {
        // Call function to release the UI
        finishedLoading();
        message = "A connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
    });
}

// function to update the current user's profile data
function updateUserProfile()
{
    // Gather the form data to be passed over AJAX
    var postdata = {};
    postdata.lastname = $("input[name='profile-lastname']").val();
    postdata.firstname = $("input[name='profile-firstname']").val();
    postdata.email = $("input[name='profile-email']").val();
    postdata.phonenumber = $("input[name='profile-phonenumber']").val();

    if(postdata.lastname == ""){
        error = "Please enter current password";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }
    else if(postdata.firstname == ""){
        error = "Please enter new password";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }
    else if(postdata.email == ""){
        error = "Please enter email address";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }
    else if(postdata.phonenumber == ""){
        error = "Please enter your phone number";
        swal({title: "Validation Error!", text: error, confirmButtonColor: "#2196F3", icon: "error"});
        return false;
    }

    // Call the block UI loader, to block the modal
    loadingBlockUI('#user-profile-password-modal');
    $.post(WEBSITE_URL + "dashboard/updateprofile", postdata, function(response){
        if(response.status == "success")
        {
            // Update the UI
            $('#profile-name-display').html(postdata.firstname + " " + postdata.lastname);
            $('#profile-email-display').html(postdata.email);

            // Display a success message to the user
            swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
        }
        else if(response.status == "failed")
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
        }
        else{
            swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", icon: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
        finishedLoading();
    })
    .fail(function() {
        // Call function to release the UI
        finishedLoading();
        message = "A connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
    });
}

// Method to refresh the user's toke
function refreshToken(html_element='body')
{
    loadingBlockUI(html_element);
    $.get(WEBSITE_URL + "dashboard/ajax_refresh_token", {}, function(response){
        if(response.status == "success")
        {
            // Set the new CSRF
            $("input[name='csrf_token']").val(response.csrf_token);
        }
        else
        {
            // Reload the page
            location.reload();
        }
    })
    .done(function(){
        // Call function to release the UI
        finishedLoading();
    })
    .fail(function() {
        // Call function to release the UI
        finishedLoading();
        message = "An error occured while trying to refresh your form.";
        // Call the sweet alert to display the error
        swal({title: "Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        // Now reload the current page
        location.reload();
    });
}


// Method to handle ajax request failure 
function ajaxFailureResponse(statuscode, html_element = 'body')
{
    //console.log("Error handler JS function called.");
    if(statuscode == 403) {    
        message = "Your form submission failed due to time out, you have left the form for too long. Please re-submit the form.";
        // Call the sweet alert to display the error
        swal({title: "Forbidden Action!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        // Call method to refresh the token
        refreshToken(html_element);
    }
    else if(statuscode == 401) {
        message = "Your session has expired. You will be re-directed to the login page.";
        // Call the sweet alert to display the error
        swal({title: "Authentication Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        // Redirect the user to the login page
        window.location.href = WEBSITE_URL + "login/index/sessiontimeout";
    }
    else if(statuscode == 500) {
        message = "An unknown error has occured while trying to process your request. Please contact administrator";
        // Call the sweet alert to display the error
        swal({title: "Internal Server Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        // Call method to refresh the token
        refreshToken(html_element);
    }
    else {
        message = "A connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
    }
}

// function to load LGAs based on selected State
function loadLGAs(element_id, state_id_field)
{
    // Set the element as loading
    $(element_id).val('<option value="">Fetching LGAs...</option>');
    state_id = $(state_id_field).val();
    var postdata = {state_id: state_id, start: 0, length: 1000};
    $.get(WEBSITE_URL + "lgas/get_all", postdata, function(response){
        
        var options = '<option value="">Please select an LGA</option>';
        if(response.recordsTotal > 0)
        {
            for(i=0; i<response.data.length; i++){
                options += '<option value="' + response.data[i].id + '">' + response.data[i].lga_name + '</option>';
            }
        }
        else
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: "There are no LGAs created for specified state", confirmButtonColor: "#2196F3", icon: "error"});
        }
        // Load the options into the element
        $(element_id).html(options);
    })
    .done(function(){
    })
    .fail(function() {
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        $(element_id).html('<option value="">Please select an LGA</option>');
    });
}

// function to load States based on selected Region
function loadStates(element_id, region_id_field)
{
    // Set the element as loading
    $(element_id).val('<option value="">Fetching States...</option>');
    region_id = $(region_id_field).val();
    var postdata = {region_id: region_id, start: 0, length: 1000};
    $.get(WEBSITE_URL + "states/get_all", postdata, function(response){
        
        var options = '<option value="">...</option>';
        if(response.recordsTotal > 0)
        {
            for(i=0; i<response.data.length; i++){
                options += '<option value="' + response.data[i].id + '">' + response.data[i].state_name + '</option>';
            }
        }
        else
        {
            // Call the sweet alert to display the error
            swal({title: "Error!", text: "There are no states available for selected region", confirmButtonColor: "#2196F3", icon: "error"});
        }
        // Load the options into the element
        $(element_id).html(options);
    })
    .done(function(){
    })
    .fail(function() {
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        $(element_id).html('<option value="">Please select an LGA</option>');
    });
}


// function to load bank branches based on selected State
function loadBranches(element_id, state_id_field)
{
    // Set the element as loading
    $(element_id).val('<option value="">Fetching Availabe Branches...</option>');
    state_id = $(state_id_field).val();
    var postdata = {state_id: state_id, start: 0, length: 1000};
    $.get(WEBSITE_URL + "branches/get_all", postdata, function(response){
        
        var options = '<option value="">...</option>';
        if(response.recordsTotal > 0)
        {
            for(i=0; i<response.data.length; i++){
                options += '<option value="' + response.data[i].id + '">' + response.data[i].branch_description + '</option>';
            }
        }
        // Load the options into the element
        $(element_id).html(options);
    })
    .done(function(){
    })
    .fail(function() {
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", icon: "error"});
        $(element_id).html('<option value="">Please select an LGA</option>');
    });
}

// Generic save function 
function submitModalForm(modalElementSelector, formElementId, endpoint, resetForm = false)
{
    loadingBlockUI(modalElementSelector);
    form = document.getElementById(formElementId);
    $.ajax({url: WEBSITE_URL + endpoint, type: "POST", data:  new FormData(form), contentType: false, cache: false, processData:false,
        success: function(response) {
            if(response.status == "success")
            {
                if(resetForm == true)
                    $('#' + formElementId).trigger("reset");
                // Refresh the list
                renderData('records_list');
                // Display a success message to the employee
                swal({title: "Success!", text: response.message, confirmButtonColor: "#66BB6A", icon: "success"});
            }
            else if(response.status == "failed")
            {
                // Call the sweet alert to display the error
                swal({title: "Error!", text: response.message, confirmButtonColor: "#2196F3", icon: "error"});
            }
            else{
                swal({title: "Error!", text: "An unexpected error has occured", confirmButtonColor: "#2196F3", icon: "error"});
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
            ajaxFailureResponse(jqXHR.status, modalElementSelector);
        }
    });
}

// Method to convert null to zero
function parseNumberVal(str){
    if(str == null || str == 'null')
        return 0;
    else
        return parseFloat(str);
}