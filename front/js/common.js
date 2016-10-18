var tips_info = {
	"layer_title": "提示"
}

var status = window.localStorage.getItem("login");
if(status != 1) location.href = "login.html";

$(".exit").on("click", function(e){
	e.preventDefault();
	layer.confirm("确认退出?", {
			title: tips_info.layer_title,
			btn: ["确定", "取消"]
		}, function(){
			window.localStorage.removeItem("login");
			location.href = "login.html";
		}, function(){
			layer.closeAll();
		}
	);
});