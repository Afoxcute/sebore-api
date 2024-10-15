var dataSet = [
    [ "NGN 45,000.52", "Successful", "debra.holt@example.com", "Card", "Aug 13 2020 2:21 PM" ],
    [ "NGN 45,000.52", "Pending", "debra.holt@example.com", "Card", "Aug 13 2020 2:21 PM" ],
    [ "NGN 45,000.52", "Successful", "debra.holt@example.com", "Card", "Aug 13 2020 2:21 PM" ],
];
 
$(document).ready(function() {
    $('#example').DataTable( {
        data: dataSet,
        columns: [
            { title: "Amount" },
            { title: "Status" },
            { title: "Customer ID" },
            { title: "Payment type" },
            { title: "Date" },
        ]
    } );
} );