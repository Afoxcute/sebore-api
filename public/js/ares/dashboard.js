var postdata = {};
var filterparams = {};

// Function called to filter the current module
function initFilter()
{
    /*postdata = getFilters();
    loadDashboardTotals();
    getRecentLoans();
    getRecentlyApproved();
    loanTrendChart();
    $('#advanced-filter-modal').modal('hide');*/
}

$(function() {
    init();
});

function init()
{
    filterparams = getFilters();
    getCustomerCounts();
    getLoanCounts();
    getInvestmentCounts();
    getLoanPaymentCounts();
    getInvestmentTransactionCounts();
    displayInvestmentChart();
    getRecentCustomers();
    getRecentLoans();
    displayLoanProductShareChart();
}

// Method to get customer data counts
function getCustomerCounts()
{
    // Set the item displays to loading
    $('#dash-customer-count').html('...');
    $('#dash-active-customer-percent').html('...');
    // Now make the call to the API
    $.get(WEBSITE_URL + "customers/get_summaries", filterparams, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Calculate the percentage of approved customers
            active_percentage = Math.floor((data.customer_approved_count / data.customer_count)*100)
            // Set the records to display
            $('#dash-customer-count').html(abbreviateNumber(data.customer_count));
            $('#dash-active-customer-percent').html(active_percentage + "%");
        }
        else
        {
            $('#dash-customer-count').html('0');
            $('#dash-active-customer-percent').html('0');
            // Call the sweet alert to display the error
            swal({title: "Error!", text: data.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
    })
    .fail(function() {
        $('#dash-customer-count').html('0');
        $('#dash-active-customer-percent').html('0');
        // Call function to release the UI
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}

// Method to get customer data counts
function getLoanCounts()
{
    // Set the item displays to loading
    $('#dash-loan-count').html('...');
    $('#dash-loan-percent').html('...');
    $('#dash-total-loan-count').html('...');
    $('#dash-avg-loan-rate').html('...');
    $('#dash-total-loan-balance').html('...');
    // Now make the call to the API
    $.get(WEBSITE_URL + "loan_applications/get_summaries", filterparams, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Calculate the percentage of approved customers
            active_percentage = Math.floor((data.disbursed_loans.total_approved_amount / data.loans.total_request_amount)*100)
            // Set the records to display
            $('#dash-loan-count').html(abbreviateNumber(data.disbursed_loans.total_approved_amount));
            $('#dash-loan-percent').html(active_percentage + "%");
            $('#dash-total-loan-count').html(numberFormat(data.disbursed_loans.total_loans));
            $('#dash-avg-loan-rate').html(numberFormat(data.disbursed_loans.avg_interest_rate)+ "%");
            $('#dash-total-loan-balance').html(abbreviateNumber(data.disbursed_loans.total_loan_balance));
            
        }
        else
        {
            $('#dash-loan-count').html('0');
            $('#dash-loan-percent').html('0');
            // Call the sweet alert to display the error
            swal({title: "Error!", text: data.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
    })
    .fail(function() {
        $('#dash-loan-count').html('0');
        $('#dash-loan-percent').html('0');
        // Call function to release the UI
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}

// Method to get investments data counts
function getInvestmentCounts()
{
    // Set the item displays to loading
    $('#dash-investment-count').html('...');
    $('#dash-investment-percent').html('...');
    // Now make the call to the API
    $.get(WEBSITE_URL + "investments/get_summaries", filterparams, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Calculate the percentage of approved customers
            active_percentage = Math.floor((data.active_investments.total_amount / data.investments.total_amount)*100)
            // Set the records to display
            $('#dash-investment-count').html(abbreviateNumber(data.investments.total_amount));
            $('#dash-investment-percent').html(active_percentage + "%");
            $('#dash-active-investment-count').html(numberFormat(data.active_investments.count));
        }
        else
        {
            $('#dash-investment-count').html('0');
            $('#dash-investment-percent').html('0');
            // Call the sweet alert to display the error
            swal({title: "Error!", text: data.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
    })
    .fail(function() {
        $('#dash-investment-count').html('0');
        $('#dash-investment-percent').html('0');
        // Call function to release the UI
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}


// Method to get loan payments data counts
function getLoanPaymentCounts()
{
    // Set the item displays to loading
    $('#dash-total-loan-payments').html('...');
    // Now make the call to the API
    $.get(WEBSITE_URL + "loan_payments/get_summaries", filterparams, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Calculate the percentage of approved customers
            //active_percentage = Math.floor((data.active_investments.total_amount / data.investments.total_amount)*100);
            // Set the records to display
            $('#dash-total-loan-payments').html(abbreviateNumber(data.total_amount_paid));
        }
        else
        {
            $('#dash-total-loan-payments').html('0');
            // Call the sweet alert to display the error
            swal({title: "Error!", text: data.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
    })
    .fail(function() {
        $('#dash-total-loan-payments').html('0');
        // Call function to release the UI
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}


// Method to get investment payments data counts
function getInvestmentTransactionCounts()
{
    // Set the item displays to loading
    $('#dash-withdrawals').html('...');
    // Now make the call to the API
    $.get(WEBSITE_URL + "investment_transactions/get_summaries", filterparams, function(response){
        if(response.status == "success")
        {
            var data = response.data
            // Calculate the percentage of approved customers
            //active_percentage = Math.floor((data.active_investments.total_amount / data.investments.total_amount)*100);
            // Set the records to display
            $('#dash-withdrawals').html(abbreviateNumber(data.total_amount_paid));
        }
        else
        {
            $('#dash-withdrawals').html('0');
            // Call the sweet alert to display the error
            swal({title: "Error!", text: data.message, confirmButtonColor: "#2196F3", type: "error"});
        }
    })
    .done(function(){
        // Call function to release the UI
    })
    .fail(function() {
        $('#dash-withdrawals').html('0');
        // Call function to release the UI
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}

// Method to render investment trend in a bar chart
function displayInvestmentChart()
{
    trendData = [];
    var postdata = filterparams;
    $.get(WEBSITE_URL + "investments/get_trend_data", postdata, function(response){
        if(response.data != undefined && response.data.length > 0){
            x = 0;
            for(i=response.data.length - 1; i >= 0; i--){
                trendData[x] = {label: response.data[i].period, value: response.data[i].total_value};
                x++;
            }
        }
        
        renderBarChart("loans_trend_chart", "Investments", trendData, "Period/Date", "Customer Investments");
    })
    .done(function(){
    })
    .fail(function() {
    });
}


// Method to get the most recent loan applications
function getRecentLoans()
{
    $("#recent-loans-table").html("Loading...");
    $.get(WEBSITE_URL + "loan_applications/get_all", filterparams, function(response){
        if(response.recordsFiltered > 0)
        {
            html_str = "";
            for(i=0; i < response.data.length; i++){

                row_class = '';
                fname = response.data[i].firstname + ' ' + response.data[i].lastname;
                html_str += '<tr><td scope="row">' + response.data[i].id + '</td><td>' + fname + '</td><td>'+currencyFormat(response.data[i].amount_requested)+'</td><td>' + dateToReadable(response.data[i].createdat) + '</td>';
                html_str += '</tr>';
            }
            $("#recent-loans-table").html(html_str);
        }
        else{
            $("#recent-approved-loans-table").html("<br />No data to display");
        }
    })
    .done(function(){
    })
    .fail(function() {
        $("#recent-loans-table").html("");
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}

// Load the break down by locations table data
function getRecentCustomers()
{
    $("#recent-customers-table").html("Loading...");
    $.get(WEBSITE_URL + "customers/get_recent", filterparams, function(response){
        if(response.status == "success")
        {
            html_str = "";
            for(i=0; i < response.data.length; i++){

                fname = response.data[i].firstname + ' ' + response.data[i].lastname;
                html_str += '<tr><td scope="row">' + response.data[i].account_number + '</td><td>' + fname + '</td><td>'+response.data[i].phone_number+'</td><td>' + dateToReadable(response.data[i].createdat) + '</td>';
                html_str += '</tr>';
            }
            $("#recent-customers-table").html(html_str);
        }
        else{
            $("#recent-customers-table").html("<br />No data to display");
        }
    })
    .done(function(){
    })
    .fail(function() {
        $("#recent-customers-table").html("");
        // Call function to release the UI
        message = "Connection error has occured, check your network settings";
        // Call the sweet alert to display the error
        swal({title: "Network Error!", text: message, confirmButtonColor: "#2196F3", type: "error"});
    });
}


// Render total loans applied for in a bar chart
function loanTrendChart()
{
    var postdata = filterparams;
    $.get(WEBSITE_URL + "reports/get_loans_trend", postdata, function(response){
        renderBarChart("loans_trend_chart", "Loan Applications", response, "Date", "Loan Applications");
    })
    .done(function(){
    })
    .fail(function() {
    });
}

// Product share charts
function displayLoanProductShareChart()
{
    var postdata = filterparams;
    chartData = [];
    chartDataCount = [];
    $.get(WEBSITE_URL + "loan_applications/get_product_stats", postdata, function(response){
        //render2dDonutChart("product_share_chart", "Vessels by Product", response)

        if(response.data != undefined && response.data.length > 0){
            x = 0;
            for(i=response.data.length - 1; i >= 0; i--){
                chartData[x] = {label: response.data[i].product_description, value: response.data[i].total_value};
                chartDataCount[x] = {label: response.data[i].product_description, value: response.data[i].data_count};
                x++;
            }
            render2dDonutChart("product_share_chart", "Loan Product Share", chartData)
            render2dDonutChart("product_share_chart_counts", "Loan Product Share (Count)", chartDataCount)
        }
    })
    .done(function(){
    })
    .fail(function() {
    });
}