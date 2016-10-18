var renderDom = renderDom = new Vue({
	el: ".table",
	data: {
		datas: []
	}
});
var locationurl = location.href,
	locationwrite = locationurl.substring(locationurl.length - 10, location.length);
	locationurl = locationurl.split("?")[0];
var	locationupdate = locationurl.substring(locationurl.length - 11, location.length);

if ( locationwrite == "write.html") {
	$(".meeting-date").val(date());	
}
refreshMeeting();

$("#startTime").on("click", function(){
	WdatePicker({dateFmt:'H点mm分', maxDate:'#F{$dp.$D(\'endTime\')}'});
});

$("#endTime").on("click", function(){
	WdatePicker({dateFmt:'H点mm分', minDate:'#F{$dp.$D(\'startTime\')}'});
});

function date(){
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate();

	return year + "年" + month + "月" + day + "日";
}
function refreshMeeting() {
	var meeting_room = $('.meeting-room').val(),
		meeting_date = $('.meeting-date').val(),
		meeting_data = {
			"meeting_room": meeting_room,
			"meeting_date": meeting_date
		};

	$.ajax({
		url: "http://192.168.104.47:9000/server.js?operate=select",
		type: "get",
		dataType: "json",
		data: meeting_data,
		success: function(result){
			if (locationupdate == "update.html") {
				var endData = [];
				for (var i = result.Data.length - 1; i >= 0; i--) {
					if(result.Data[i].id != data_id) {
						endData.push(result.Data[i]);
					}
				}
				renderDom.datas = endData;
			} else {
				renderDom.datas = result.Data;
			}
		}
	});
}

$(".meeting-room").change(function(event) {
	refreshMeeting();
});

$(".meeting-date").on("click", function(){
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate(),
		today = year + "-" + month + "-" + day;
	WdatePicker({onpicked: function(){
		refreshMeeting();	
	}, dateFmt:'yyyy年MM月dd日', minDate: today, maxDate:'#F{$dp.$D(\'endTime\')}'});
});