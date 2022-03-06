window.onload = function() {
    // item object contains all key:value combinations
    var item = {        },
        // references to the two drop-downs
        item_select = document.querySelector('#item'),
        report_select = document.querySelector('#report');

    // attach a change event listener to the item drop-down
    item_select.addEventListener('change', function() {
        // get the common names in the selected item
        setOptions(report_select, item[item_select.value]);
    });
}

$(document).ready(function(){
    var date_submission=$('input[name="date"]'); //input with name=date in submission form
    var start_date=$('input[name="start_date"]');
    var end_date=$('input[name="end_date"]');
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    var options={
        format: 'mm/dd/yyyy',
        container: container,
        todayHighlight: true,
        autoclose: true,
        orientation: "top",
    };
    date_submission.datepicker(options);
    start_date.datepicker(options);
    end_date.datepicker(options);
})