// $(document).ready(function() {
//   $('#exam').DataTable(
//     {
//       pageLength: 10,
//       filter: true,
//       deferRender: true,
//       scrollY: 200,
//       scrollCollapse: true,
//       scroller: true
//   }
//   );
// } );

var table = $("#exam").DataTable({
  pagingType: "simple",
  ordering: false,
  // "dom": '<bottom ilp>'
  dom: '<"top"i>rt<"bottom"flp><"clear">',
});

// #myInput is a <input type="text"> element
$("#top-search").on("keyup", function () {
  table.search(this.value).draw();
});
