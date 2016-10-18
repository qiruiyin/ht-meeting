// http接口
var http = require('http');
var url = require('./server/url.js');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./databases/JhtShow1.sqlite');

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
	if (input_data.operate == "selectAll") {
		db.all('select * from meeting order by starttimestamp DESC', function(err, rows){
			if (!err) {
				var nowTimeStamp = Date.parse(new Date());
				for (var i = rows.length - 1; i >= 0; i--) {
					if (rows[i].starttimestamp > nowTimeStamp) {
						rows[i].meeting_status = 0;
					} else if(rows[i].endtimestamp > nowTimeStamp) {
						rows[i].meeting_status = 1;
					} else {
						rows[i].meeting_status = 2;
					}
				}
				response.write(JSON.stringify({"Success": true, "Data": rows}));
				response.end();
			} else {
				console.log(err);
				response.write(JSON.stringify({"Success": true, "Msg": "数据库操作失败"}));
				response.end();
			}
		});
	} else if (input_data.operate == "select") {
		if (input_data._ == undefined) {
			// 所有会议分页展示start
			var nowtimestamp = Date.parse(new Date()),
				str = [],
				sql = ' from meeting ',
				countsql,
				count,
				forststus = 0;
			// 判断条件拼接
			for (var item in input_data) {
				if (item != "operate" && item != "page" && item != "pagesize" && item != "selectstatus") {
					if (!forststus) sql += ' where ';
					forststus = 1;
					sql += item + '="' + input_data[item] + '" and ';
				}
			}
			if(forststus) sql = sql.substring(0, sql.length - 4);
			
			if (input_data.selectstatus == 0) {
				// 未召开的会议
				if (forststus) {
					sql += ' and starttimestamp > ' + nowtimestamp;
				} else {
					sql += ' where starttimestamp > ' + nowtimestamp;
				}
			} else if (input_data.selectstatus == 1) {
				// 正在召开的会议
				if (forststus) {
					sql += ' and endtimestamp > ' + nowtimestamp + ' and starttimestamp < ' + nowtimestamp;
				} else {
					sql += ' where endtimestamp > ' + nowtimestamp + ' and starttimestamp < ' + nowtimestamp;
				}
			} else if (input_data.selectstatus == 2) {
				// 已召开的会议
				if (forststus) {
					sql += ' and endtimestamp < ' + nowtimestamp;
				} else {
					sql += ' where endtimestamp < ' + nowtimestamp;
				}
			}
			countsql = 'select count(*) as count ' + sql;
			db.all(countsql, function(err, rows){
				if(!err) {
					count = rows[0].count;
					pagesql = 'select * ' + sql + ' order by starttimestamp desc';
					if (input_data.pagesize != undefined && input_data.page != undefined) {
						pagesql += ' limit "' + input_data.pagesize + '" offset ' + (input_data.page - 1)*input_data.pagesize;
					}

					db.all(pagesql, function(err, rows){
						if (!err) {
 							var nowTimeStamp = Date.parse(new Date());
							for (var i = rows.length - 1; i >= 0; i--) {
								if (rows[i].starttimestamp > nowTimeStamp) {
									rows[i].meeting_status = 0;
								} else if(rows[i].endtimestamp > nowTimeStamp) {
									rows[i].meeting_status = 1;
								} else {
									rows[i].meeting_status = 2;
								}
							}
							response.write(JSON.stringify({"Success": true, "Data": rows, "Count": count}));
							response.end();
						} else {
							console.log(err);
							response.write(JSON.stringify({"Success": true, "Msg": "数据库操作失败", "Data": []}));
							response.end();
						}
					});
				} else {
					console.log(err);
					response.write(JSON.stringify({"Success": true, "Msg": "数据库操作失败", "Data": []}));
					response.end();
				}
			});
			// 所有会议分页展示end
		} else {
			var nowtimestamp = Date.parse(new Date());
			db.all('select * from setting', function(err, rows){
				if (!err) {
					var refreshtime = rows[0].refreshtime;
					db.all('select * from meeting where endtimestamp >"' + nowtimestamp + '"' , function(err, rows){
						if (!err) {
							response.write(JSON.stringify({"Success": true, "Data": rows, "RefreshTime": refreshtime }));
							response.end();
						} else {
							console.log(err);
							response.write(JSON.stringify({"Success": true, "Msg": "数据库操作失败", "Data": []}));
							response.end();
						}
					});
				} else {
					console.log(err);
					response.write(JSON.stringify({"Success": true, "Msg": "数据库操作失败", "Data": []}));
					response.end();
				}
			});
		}
		
	} else if (input_data.operate == "delete") {
		db.run('delete from meeting where id = "' + input_data.id + '"', function(err){
			if (!err) {
				response.write(JSON.stringify({"Success": true, "Msg":"删除成功"}));
				response.end();
			} else {
				console.log(err);
				response.write(JSON.stringify({"Success": false, "Msg":"数据库操作失败"}));
				response.end();
			}
		});
	} else if (input_data.operate == "update") {
		var startTimeStamp = timeStamp(input_data.meeting_date, input_data.starttime),
			endTimeStamp = timeStamp(input_data.meeting_date, input_data.endtime),
			nowTimeStamp = Date.parse(new Date()),
			sql = 'update meeting set ';

		if (nowTimeStamp >= startTimeStamp) {
			response.write(JSON.stringify({"Success": false, "Msg":"该时间已过去，不能添加"}));
			response.end();
		} else {
			for (var item in input_data) {
				if (item != "operate" && item != "id") {
					sql += item + '="' + input_data[item] + '", ';
				}
			}
			sql += 'starttimestamp ="' + startTimeStamp + '", endtimestamp ="' + endTimeStamp + '" where id ="' + input_data.id + '"';
			db.run(sql, function(err){
				if (!err) {
					response.write(JSON.stringify({"Success": true, "Msg":"数据修改成功"}));
					response.end();
				} else {
					console.log(err);
					response.write(JSON.stringify({"Success": false, "Msg":"数据库操作失败"}));
					response.end();
				}
			});
		}
	} else if (input_data.operate == 'add') {
		var startTimeStamp = timeStamp(input_data.meeting_date, input_data.starttime),
			endTimeStamp = timeStamp(input_data.meeting_date, input_data.endtime),
			nowTimeStamp = Date.parse(new Date()),
			insertMsg = {}; // 返回信息

		if (nowTimeStamp >= startTimeStamp) {
			response.write(JSON.stringify({"Success": false, "Msg":"该时间已过去，不能添加"}));
			response.end();
		} else {
			db.run('create table if not exists meeting("id"  INTEGER NOT NULL, "meeting_date"  TEXT, "starttime"  TEXT, "endtime"  TEXT, "meeting_room"  TEXT,"proposer"  TEXT, "department"  TEXT, "meeting_intro"  TEXT, "starttimestamp"  INTEGER, "endtimestamp"  INTEGER, PRIMARY KEY ("id"))',function(){
				var status = 1,
					sql; // 数据是否合法
				db.all('select meeting_date, meeting_room, starttimestamp, endtimestamp from meeting where meeting_date = "' + input_data.meeting_date + '" and meeting_room = "' + input_data.meeting_room + '" order by starttimestamp', function(err, rows){
					if(!err) {
						if(rows.length == 0) {
							sql = 'insert into meeting ( "id",';
							for (var item in input_data) {
								if (item != "operate") {
									sql += '"' + item + '", ';
								}
							}
							sql += '"starttimestamp", "endtimestamp") values(null, ';

							for (var item in input_data) {
								if (item != "operate") {
									sql += '"' + input_data[item] + '", ';
								}
							}
							sql += '"' + startTimeStamp + '", "' + endTimeStamp + '")';

							db.run(sql,function(err, res){
								if(!err) {
									insertMsg.Msg = "数据更新成功";
								} else {
									insertMsg.Msg = "数据库操作失败";
									console.log(err);
								}
								insertMsg.Success = 1;
								response.write(JSON.stringify(insertMsg));
								response.end();
							});
							return;	
						} else {
							var time = rows;
							for (var i = time.length - 1; i >= 0; i--) {
								if (time[i].starttimestamp < startTimeStamp) {
									if (i == time.length - 1) {
										if (time[i].endtimestamp <= startTimeStamp) {
											status = 1;
										} else {
											status = 0;
										}
									} else {
										if (time[i].endtimestamp <= startTimeStamp && time[i+1].starttimestamp >= endTimeStamp) {
											status = 1;
										} else {
											status = 0;
										}
									}
									break;
								} else if (i == 0) {
									if (time[0].starttimestamp >= endTimeStamp) {
										status = 1;
									} else {
										status = 0;
									}
								}
							}
						}
					} else {
						status = 2;
						insertMsg.Msg = "数据库操作失败";
						console.log(err);
					}
					insertMsg.Success = status;
					if (status != 1) {
						if (status != 2) {
							insertMsg.Msg = "该时间段内的会议室已被占用";
						}
						response.write(JSON.stringify(insertMsg));
						response.end();
						return;
					} else {
						sql = 'insert into meeting ("id", ';
						for (var item in input_data) {
							if (item != "operate") {
								sql += '"' + item + '", ';
							}
						}
						sql += '"starttimestamp", "endtimestamp") values(null, ';

						for (var item in input_data) {
							if (item != "operate") {
								sql += '"' + input_data[item] + '", ';
							}
						}
						sql += '"' + startTimeStamp + '", "' + endTimeStamp + '")';

						db.run(sql,function(err, res){
							if(!err) {
								insertMsg.Msg = "数据更新成功";
							} else {
								insertMsg.Msg = "数据库操作失败";
								console.log(err);
							}
							response.write(JSON.stringify(insertMsg));
							response.end();
						});
					}
					
				});
			});	
		}
	} else if (input_data.operate == 'setting') {
		db.all('select * from setting', function(err, rows){
			if (!err) {
				response.write(JSON.stringify({"Success": true, "Data": rows, 'Msg': "数据库操作成功"}));
				response.end();
			} else {
				console.log(err);
				response.write(JSON.stringify({"Success": false, "Data": [], "Msg":"数据库操作失败"}));
				response.end();
			}
		});
	} else if (input_data.operate == 'settingData') {
		db.run('update setting set refreshtime ="' + input_data.refreshtime + '" where id = 1', function(err){
			if (!err) {
				response.write(JSON.stringify({"Success": true, "Msg":"数据修改成功"}));
				response.end();
			} else {
				console.log(err);
				response.write(JSON.stringify({"Success": false, "Msg":"数据库操作失败"}));
				response.end();
			}
		});
	} else if (input_data.operate == "login"){
		var sql = 'select * from user where username ="' + input_data.username + '" and password ="' + input_data.password + '"';
		db.all(sql, function(err, rows){
			if (!err) {
				if (rows != undefined && rows.length == 1) {
					response.write(JSON.stringify({"Success": true, "Msg":"登录成功"}));
					response.end();
				} else {
					response.write(JSON.stringify({"Success": false, "Msg":"用户名或密码不正确"}));
					response.end();
				}
				
			} else {
				console.log(err);
				response.write(JSON.stringify({"Success": false, "Msg":"用户名或密码不正确"}));
				response.end();
			}
		});
	}
});

server.listen(9000, function(){
	console.log("开始监听");
});

console.log("服务启动");
