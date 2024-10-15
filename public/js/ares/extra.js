/* ------------------------------------------------------------------------------
*
*
*  Specific JS code for customer pages
*  Author: Oludele Oluwaseun
*  Version: 1.0
*  Latest update: July 21, 2019
*
* ---------------------------------------------------------------------------- */

var max_quantity = 0;
var min_quantity = 5000;
var moq = 5000;
var max_order_q = 60000;
var stock = null;

var selected_unit = "";
var resources = 1;
var total_done = 0;
var sel_sap_material_id = null;
var postdata = {};

var material_business_id = null;
var sap_plant_id = null;
var plant_description = "";
var material_description = "";
var sap_material_id;
var major_marketer = false;

var truck_destination_options = "";

/*$(function() {

    // Set the onchange event handler for product selection
    $('input[type=radio][name=material_business_id]').change(function() {
        alert("product changed!");
        fetchPlants()
    });

    // Set the onchange event handler for plant selection selection
    $('input[type=radio][name=sap_plant_id]').change(function() {
        alert("Another plant selected");
    });
});*/

// function call to get the list of materials based on the line of business that the customer has selected
function fetchMaterials(lob_description)
{
    var customer_business_id = $('input[name=customer_business_id_init]').val();

    if(customer_business_id == ""){
        alert("Your account does not have a line of business setup. Please contact the administrator.");
        return;
    }

    // Call this method so that destinations can be prepared.
    fetchDestinations(customer_business_id);

    // Set the value of the customer business id for the pop up form to current
    $('input[name=customer_business_id]').val(customer_business_id);
    $('#selected_lob').val(lob_description);


    $('#product-selection-ul').html('Fetching products list...');
    $.post(WEBSITE_URL + "material_businesses/getmaterialbusinesses", {customer_business_id: customer_business_id}, function(response){
        if(response.status == 200)
        {
            // Set if the LOB is a major marketer or not
            major_marketer = response.major_marketer;

            html_str = '';
            var data = response.data;
            if(data.length > 0){
                for (var i = 0; i < data.length; i++) {

                    html_str += '<li><input type="radio" name="material_business_id_init"';
                    html_str += ' onClick="fetchPlants(\''+data[i].material_description+'\')" ';
                    html_str += 'id="product-select-' + data[i].id + '" value="' + data[i].id + '">';
                    html_str += '<label for="product-select-' + data[i].id + '">' + data[i].material_description;
                    html_str += '</label></li>';
                }
            }

            $('#product-selection-ul').html(html_str);
        }
        else
        {
            alert("There are currently no available product for your selected line of business");
        }
    })
    .done(function(){
        //$('#visit_loading').slideUp("fast");
    })
    .fail(function() {
        $('#product-selection-ul').html('');
        alert("There was a network error while trying to fetch your products. Please try again and also ensure your network connection is working.");
    });
}

// Function call to get list of plants that have stock based on the material
function fetchPlants(material_desc)
{
    material_description = material_desc;
    var material_business_id = $("input[name='material_business_id_init']:checked").val();

    // set the current selected material business into the pop-up form
    $("input[name='material_business_id']").val(material_business_id);
    $("#selected_material").val(material_desc);

    // Ensure a valid value is selected
    if(material_business_id == ""){
        alert("Please select a product");
        return;
    }

    // Get the plants that can supply the material
    $('#plant-selection-ul').html('Fetching available depots...');
    $.post(WEBSITE_URL + "stocks/getavailablestock", {material_business_id: material_business_id}, function(response){
        if(response.status == 200)
        {
            html_str = '';
            var data = response.data;
            stock = data;
            if(data.length > 0)
            {
                for (var i = 0; i < data.length; i++) {

                    // check if there is stock available
                    onclick_action = '';
                    avail_class = "item-is-not-ok";
                    icon = 'product-grey.png';
                    if(data[i].total_stock > 0){
                        icon = 'product.png';
                        avail_class = "item-is-ok";
                        onclick_action = 'onClick="loadModalForm(\'' + data[i].plant_description + '\')" ';
                    }
                    
                    html_str += '<li class="depot-select__item ' + avail_class + '">';
                    html_str += '<input type="radio" name="sap_plant_id_init" ';
                    //html_str += 'onClick="loadModalForm(\'' + data[i].plant_description + '\')" '
                    html_str += onclick_action;
                    html_str += 'id="sap_plant_id_' + data[i].sap_plant_id + '" '
                    html_str += 'value="' + data[i].sap_plant_id + '">'
                    html_str += '<label for="sap_plant_id_' + data[i].sap_plant_id + '">'
                    html_str += '<img src="'+WEBSITE_URL+'assets/images/icons/'+icon+'" alt="">'
                    html_str += '<span>' + data[i].plant_description + '</span></label></li>'
                }

                sel_sap_material_id = data[0].sap_material_id;
                // Now call the function to retrieve units of measure for the selected product
                fetchUnits(data[0].sap_material_id);
            }
            else{
                alert("There is currently no available stock for your selected product");
            }

            $('#plant-selection-ul').html(html_str);
        }
        else
        {
            alert("There is currently no stock for your selected product");
        }
    })
    .done(function(){
        //$('#visit_loading').slideUp("fast");
    })
    .fail(function() {
        $('#sap_plant_id').html('<option value="">Select a depot</option>');
        alert("There was a network error while trying to fetch your products. Please try again and also ensure your network connection is working.");
    });

    // Also get the unit of measure
}


// Function to finally load the pop-up form after the user has selected a depot
function loadModalForm(plant_description)
{
    sap_plant_id = $("input[name='sap_plant_id_init']:checked").val();
    // set the current selected plant id into the pop-up form
    $("input[name='sap_plant_id']").val(sap_plant_id);
    $("#selected_plant").val(plant_description);

    $('#new-request').modal('show');
}

// Function to get the unit of measure for the product
function fetchUnits(sap_material_id)
{
    // Get the plants that can supply the material
    $('#uom-ul').html('Fetching units of measures...');
    $.post(WEBSITE_URL + "material_units/get_material_units", {sap_material_id: sap_material_id}, function(response){
        if(response.recordsTotal > 0)
        {
            html_str = '';
            var data = response.data;
            stock = data;
            if(data.length > 0){
                for (var i = 0; i < data.length; i++) {
                    
                    mn = data[i].min_order_quantity;
                    mx = data[i].max_order_quantity;
                    mnl = data[i].min_lifting;
                    mxl = data[i].max_lifting;
                    ts = data[i].vehicle_type;
                    
                    html_str += '<li><input type="radio" name="unit_of_measure" ';
                    html_str += 'value="' + data[i].unit_of_measure + '" '
                    html_str += 'id="uom_' + i + '" ';
                    html_str += 'onClick="setQuantityOptions(\''+data[i].quantity_options+'\','+mn+','+mx+','+mnl+','+mxl+', \''+ts+'\')" >'
                    html_str += '<label for="uom_' + i + '">' + data[i].unit_of_measure + '</label></li>'
                }
            }
            else{
                alert("There are currently no unit of measure for your selected product");
            }

            $('#uom-ul').html(html_str);
        }
        else
        {
            alert("There are currently no unit of measure for your selected product");
            $('#uom-ul').html('There are currently no unit of measure for your selected product');
        }
    })
    .done(function(){
        //$('#visit_loading').slideUp("fast");
    })
    .fail(function() {
        $('#unit_of_measure').html('<option value="">Select a unit of measure</option>');
        alert("There was a network error while trying to fetch your measurement units. Please try again and also ensure your network connection is working.");
    });
}

// This function responds the to selection of a unit of measure item, by setting the options for that UOM
function setQuantityOptions(qty_options, min_order, max_order, min_lifting, max_lifting, transport)
{
    // Set all the product minimum and maximums
    min_quantity = min_order;
    moq = min_order;
    max_order_q = max_order;

    var html_str = "";
    var html_str_lift = "";
    if(qty_options != "" && qty_options != null){
        var opts = qty_options.split(",");
        for (var i = 0; i < opts.length; i++) {
            
            html_str += '<li><input type="radio" name="product_quantity" value="' + opts[i] + '" '
            html_str += 'id="product_quantity_' + i + '" onClick="confirmRequiredLiftings()" >'
            html_str += '<label for="product_quantity_' + i + '">' + numberFormat(opts[i]) + '</label></li>'
        }

        for (i = min_lifting; i <= max_lifting; i++) {
            ts = transport + "s";
            if(i==1)
                ts = transport;
            html_str_lift += '<li><input type="radio" name="lifting_count" value="' + i + '" '
            html_str_lift += 'id="lifting_count_' + i + '" onClick="confirmRequiredLiftings()" >'
            html_str_lift += '<label for="lifting_count_' + i + '">' + numberFormat(i) + ' '+ts+'</label></li>'
        }
    }

    console.log("HTML: " + html_str);
    $("#product-quantity-ul").html(html_str);
    $("#liftings-ul").html(html_str_lift);
}

function confirmRequiredLiftings()
{
    var liftings = parseInt($("input[name='lifting_count']:checked").val());
    if(liftings > 1)
    {
        alert("Liftings greater than 1 would require you to specify the lifting details.");
        var form_buttons = '<button type="button" class="btn btn-default waves-effect" data-dismiss="modal">Close</button>';
        form_buttons += '<a class="btn btn-primary waves-effect waves-light" onClick="renderLiftingForm()">Proceed to lifting details >> </a>';
        $("#request_modal_footer").html(form_buttons);
    }
    else if(liftings == 1 && major_marketer == true){
        // This condition means just 1 lifting is required, but the LOB is a major marketer
        var form_buttons = '<button type="button" class="btn btn-default waves-effect" data-dismiss="modal">Close</button>';
        form_buttons += '<a class="btn btn-primary waves-effect waves-light" onClick="renderLiftingForm()">Proceed to lifting details >> </a>';
        $("#request_modal_footer").html(form_buttons);
    }
    else
    {
        var form_buttons = '<button type="button" class="btn btn-default waves-effect" data-dismiss="modal">Close</button>';
        form_buttons += '<button type="submit" class="btn btn-success waves-effect waves-light">Create Request</button>';
        $("#request_modal_footer").html(form_buttons);
        $("#customer_request_form_div_2").html("");
    }
}

function validateFormCompletion()
{
    var prod_q = $("input[name='product_quantity']:checked").val()
    var lift_count = $("input[name='lifting_count']:checked").val();
    if(prod_q == "" || prod_q == null || prod_q == undefined)
        return false;
    else if(lift_count == "" || lift_count == null || lift_count == undefined)
        return false;
}

function renderLiftingForm()
{
    form_completed = validateFormCompletion();
    if(form_completed == false){
        alert("Please complete all form fields before proceeding.");
        return;
    }

    var product_q = parseFloat($("input[name='product_quantity']:checked").val());

    $("#customer_request_form_div_1").slideUp("fast");
    liftings = $("input[name='lifting_count']:checked").val();
    console.log("Lifting: " + liftings)
    lifting_html = "";
    if(liftings == 1){
        lifting_html += '<input type="hidden" value="'+product_q+'" name="lifting_quantity[]" id="product_quantity_1"/><div>';
        lifting_html += '<div class="form-group" id="shipment_count_space"><label for="truck_plate_number_1">Proposed Truck Plate Number<font color="red">*</font></label>';
        lifting_html += '<input type="text" class="form-control" name="lifting_plate_number[]" id="truck_plate_number_1" required="required"/></div></div><div>';
        lifting_html += '<div class="form-group" id="shipment_count_space"><label for="truck_driver_name1">Proposed Truck Driver Name<font color="red">*</font></label>';
        lifting_html += '<input type="text" class="form-control" name="lifting_driver_name[]" id="driver_name_1" required="required"/></div></div>';
        lifting_html += '<div><div class="form-group" id="shipment_count_space"><label for="truck_destination_1">Proposed Truck Destination<font color="red">*</font></label>';
        //lifting_html += '<input type="text" class="form-control" name="lifting_truck_destination[]" id="truck_destination_1" required="required"/></div></div>';
        lifting_html += '<select class="form-control select" name="lifting_truck_destination[]" id="truck_destination_1" required="required">'+truck_destination_options+'</select></div></div>';
    }
    else{

        for(i=1; i<= liftings; i++){
            lifting_html += '<div class="form-group"><label for="product_quantity_'+i+'">Lifting Quantity '+i+'<font color="red">*</font></label>';
            lifting_html += '<input type="hidden" value="'+product_q+'" name="lifting_quantity[]" id="product_quantity_'+i+'"/>';
            lifting_html += '<input type="text" class="form-control" value="' + numberFormat(product_q) + '" disabled="disabled"></div><div>';
            lifting_html += '<div class="form-group" id="shipment_count_space"><label for="truck_plate_number_'+i+'">Proposed Truck Plate Number '+i+'<font color="red">*</font></label>';
            lifting_html += '<input type="text" class="form-control" name="lifting_plate_number[]" id="truck_plate_number_'+i+'" required="required"/></div></div><div>';
            lifting_html += '<div class="form-group" id="shipment_count_space"><label for="truck_driver_name'+i+'">Proposed Truck Driver Name '+i+'<font color="red">*</font></label>';
            lifting_html += '<input type="text" class="form-control" name="lifting_driver_name[]" id="driver_name_'+i+'" required="required"/></div></div>';
            
            lifting_html += '<div><div class="form-group" id="shipment_count_space"><label for="truck_destination_'+i+'">Proposed Truck Destination '+i+'<font color="red">*</font></label>';
            
            lifting_html += '<select class="form-control select" name="lifting_truck_destination[]" id="truck_destination_'+i+'" required="required">'+truck_destination_options+'</select></div></div>';
        }
    }

    $("#customer_request_form_div_2").html(lifting_html);
    $("#request_form_title").html("Lifting Details");
    $("#customer_request_form_div_2").slideDown("fast");

    var form_buttons = '<button type="button" class="btn btn-default waves-effect" data-dismiss="modal">Close</button>';
    form_buttons += '<button type="submit" class="btn btn-success waves-effect waves-light">Create Request</button>';
    $("#request_modal_footer").html(form_buttons);
}

// Set the minimum and maximum order values
function setOrderLimits()
{
    var sap_material_id = sel_sap_material_id;
    var _unit_of_measure = $("input[name='unit_of_measure']:checked").val();
    selected_unit = _unit_of_measure;

    $.post(WEBSITE_URL + "material_units/get_material_units", {sap_material_id: sap_material_id, unit_of_measure: _unit_of_measure}, function(response){
        if(response.recordsTotal > 0)
        {
            var data = response.data;
            if(data.length > 0){

                max_order_q = parseFloat(data[0].max_order_quantity);
                min_quantity = parseFloat(data[0].min_order_quantity);
                moq = parseFloat(data[0].min_order_quantity);

                var qty_options = data[0].quantity_options;
                console.log("Function called with: " + qty_options);
                var html_str = "";
                if(qty_options != "" && qty_options != null){
                    var opts = qty_options.split(",");
                    for (var i = 0; i < opts.length; i++) {

                        html_str += '<li><input type="radio" name="product_quantity" value="' + opts[i] + '" '
                        html_str += 'id="product_quantity_' + i + '" onClick="confirmRequiredLiftings()" >'
                        html_str += '<label for="product_quantity_1">' + numberFormat(opts[i]) + '</label></li>'
                    }
                }
                $("#product-quantity-ul").html(html_str);
            }
            else{
                alert("There was a problem getting the minimum and maximum order quantity.");
            }
        }
        else
        {
            alert("There are currently no unit of measure for selected product");
        }
    })
    .done(function(){
    })
    .fail(function() {
        alert("There was a network error while trying to fetch your measurement units. Please try again and also ensure your network connection is working.");
    });
}

function fetchDestinations(lob_id)
{
    truck_destination_options = '<option value="">Loading destinations...</option>';
    $.post(WEBSITE_URL + "customer_destinations/load_destinations", {customer_business_id: lob_id}, function(response){
        if(response.status == 200)
        {
            if(response.data.length > 0)
            {
                opts = '<option value="">Select a destination</option>';
                for(i=0; i<response.data.length; i++){
                    opts += '<option value="' + response.data[i].destination + '">' + response.data[i].destination + '</option>'
                }
                truck_destination_options = opts;
            }
        }
        else
        {
            truck_destination_options = '<option value="">You have no destinations set. Contact PPMC.</option>';
        }
    })
    .done(function(){
    })
    .fail(function() {
        alert("There was a network error while trying to fetch your destinations. Please try again and also ensure your network connection is working.");
    });
}