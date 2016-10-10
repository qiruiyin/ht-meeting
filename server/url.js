// 获取url传递值并转为json格式

var url = {
	parseToJson: function(url){
		var	url_json = {};
		url = url.split("?"),
		url = url[1].split('&');
		for(var i = 0;i<url.length;i++){
		    var str = url[i].split('=');
		    url_json[str[0]]=str[1];
		}
		url_json = JSON.stringify(url_json);
		return url_json;
	}
}

module.exports = url;