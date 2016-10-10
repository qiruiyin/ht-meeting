var fs = require("fs");
var file = require("./server/file");
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./databases/video.db');

// http接口
var http = require('http');
var file = require('./server/file.js');
var url = require('./server/url.js');

function timeStamp(date, time){
	date = date.replace(/年|月/g, "-").replace(/日/g, " ");
	time = time.replace(/点|分/g, ":");
	time = date + time + "00";
	return Date.parse(new Date(time));
};

var server = http.createServer(function(request, response){
	response.writeHead(200,{"Content-Type":"application/json;charset=utf-8", "Access-Control-Allow-Origin":"*"});
	// 获取参数start 
	
	// 获取参数end，下面可以做鉴定
	var input_data = url.parseToJson(decodeURI(request.url));
		input_data = JSON.parse(input_data);

	if (input_data.operate == "select") {
		var nowTimeStamp = Date.parse(new Date());;
		db.all('select * from video where starttimestamp > "' + nowTimeStamp + '" order by starttimestamp', function(err, rows){
			if (!err) {
				response.write(JSON.stringify(rows));
				response.end();
				// var return_data = ;
			} else {
				console.log(err);
				response.write("数据库操作失败");
				response.end();
			}
		});
		// response.write(JSON.stringify(input_data));
		// response.end();
	} else if (input_data.operate == "delete") {
		db.run('delete from video where id = "' + input_data.id + '"', function(err){
			if (!err) {
				response.write(JSON.stringify({"Success": true, "Msg":"删除成功"}));
				response.end();
			} else {
				console.log(err);
				reponse.write(JSON.stringify({"Success": false, "Msg":"数据库操作失败"}));
				response.end();
			}
		});
	} else {
		var startTimeStamp = timeStamp(input_data.date, input_data.startTime),
			endTimeStamp = timeStamp(input_data.date, input_data.endTime),
			insertMsg = {}; // 返回信息

		db.run('create table if not exists video(id"  INTEGER NOT NULL, "date"  TEXT, "starttime"  TEXT, "endtime"  TEXT, "address"  TEXT,"username"  TEXT, "department"  TEXT, "content"  TEXT, "starttimestamp"  INTEGER, "endtimestamp"  INTEGER, PRIMARY KEY ("id"))',function(){
			var status = 1; // 数据是否合法
			db.all('select date, address, starttimestamp, endtimestamp from video where date = "' + input_data.date + '" and address = "' + input_data.address + '" order by startTimeStamp', function(err, rows){
				if(!err) {
					if(rows.length == 0) {
						db.run("insert into video values(null, '" + input_data.date + "', '" + input_data.startTime + "', '" + input_data.endTime + "', '" + input_data.address + "', '" + input_data.username + "', '" + input_data.department + "', '" + input_data.content + "', '" + startTimeStamp + "', '" + endTimeStamp + "')",function(err, res){
							if(!err) {
								insertMsg.msg = "数据更新成功";
							} else {
								insertMsg.msg = "数据库操作失败";
								console.log(err);
							}
							insertMsg.status = 1;
							response.write(JSON.stringify(insertMsg));
							response.end();
						});
						return;	
					} else {
						var time = rows;
						for (var i = time.length - 1; i >= 0; i--) {
							if(time[i].starttimestamp < startTimeStamp){
								// 开始时间在已有会议中的位置
								if (time[i].endtimestamp >=  startTimeStamp) {
									// 本次录入时间大于等于上一个会议结束时间
									if (i == time.length - 1 || time[i+1].starttimestamp >= endTimeStamp) {
										status = 1;
									} else {
										status = 0;
									}
								} else {
									status = 0;
								}
							} else if (i == 0){
								if (time[0].starttimestamp > endTimeStamp) {
									status = 1;
								} else {
									status = 0;
								}
							}
						}
					}
				} else {
					status = 2;
					insertMsg.msg = "数据库操作失败";
					console.log(err);
				}

				insertMsg.status = status;
				if (status != 1) {
					if (status != 2) {
						insertMsg.msg = "该时间段内的会议室已被占用";
					}
					response.write(JSON.stringify(insertMsg));
					response.end();
					return;
				} else {
					db.run("insert into video values(null, '" + input_data.date + "', '" + input_data.startTime + "', '" + input_data.endTime + "', '" + input_data.address + "', '" + input_data.username + "', '" + input_data.department + "', '" + input_data.content + "', '" + startTimeStamp + "', '" + endTimeStamp + "')",function(err, res){
						if(!err) {
							insertMsg.msg = "数据更新成功";
						} else {
							insertMsg.msg = "数据库操作失败";
							console.log(err);
						}
						response.write(JSON.stringify(insertMsg));
						response.end();
					});
				}
				
			});
		});	
	}
});

server.listen(9000, function(){
	console.log("开始监听");
});

console.log("服务启动");
