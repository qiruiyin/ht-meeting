var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./databases/video.db');


// db.run('create table if not exists video(id"  INTEGER NOT NULL, "date"  TEXT, "starttime"  TEXT, "endtime"  TEXT, "address"  TEXT,"username"  TEXT, "department"  TEXT, "content"  TEXT, "starttimestamp"  INTEGER, "endstartstamp"  INTEGER, PRIMARY KEY ("id"))',function(){
// 	db.run("insert into video values(null, '2016年09月1111日', '14时00分', '14时00分', '大会议室', '戚瑞印', 'IT部', '例会', '11111111111', '11111111119')",function(){  
// 		db.all("select * from video",function(err,res){  
// 			if(!err) console.log(JSON.stringify(res));  
// 			else console.log(err);  
// 		});
// 	});
// });

var sql = {
	timeStamp: function(date, time){
		date = date.replace(/年|月/g, "-").replace(/日/g, " ");
		time = time.replace(/点|分/g, ":");
		time = date + time + "00";
		return Date.parse(new Date(time));
	},
	timeOk: function(time, startTimeStamp, endTimeStamp){
		console.log(22222, time);
		// 时间区间是否合法
		for (var i = time.length - 1; i >= 0; i--) {
			if(time[i].starttimestamp < startTimeStamp){
				// 开始时间在已有会议中的位置
				if (time[i].endtimestamp >=  starttimestamp) {
					// 本次录入时间大于等于上一个会议结束时间
					if (i == time.length - 1 || time[i+1].starttimestamp >= endtimestamp) {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else if (i == 0){
				if (time[0].starttimestamp > endTimeStamp) {
					return true;
				} else {
					return false;
				}
			}
		}	
	},
	insert: function(data){
		data = JSON.parse(data);
		var _this = this,
			startTimeStamp = this.timeStamp(data.date, data.startTime),
			endTimeStamp = this.timeStamp(data.date, data.endTime),
			insertMsg = {}; // 返回信息

		db.run('create table if not exists video(id"  INTEGER NOT NULL, "date"  TEXT, "starttime"  TEXT, "endtime"  TEXT, "address"  TEXT,"username"  TEXT, "department"  TEXT, "content"  TEXT, "starttimestamp"  INTEGER, "endtimestamp"  INTEGER, PRIMARY KEY ("id"))',function(){
			var status = 1; // 数据是否合法
			db.all('select date, address, starttimestamp, endtimestamp from video where date = "' + data.date + '" and address = "' + data.address + '" order by startTimeStamp', function(err, rows){
				if(!err) {
					if(rows.length == 0) {
						return 1;	
					} else {
						status = _this.timeOk(rows, startTimeStamp, endTimeStamp);
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
					return 1;
				}

				db.run("insert into video values(null, '" + data.date + "', '" + data.startTime + "', '" + data.endTime + "', '" + data.address + "', '" + data.username + "', '" + data.department + "', '" + data.content + "', '" + startTimeStamp + "', '" + endTimeStamp + "')",function(err, res){
					if(!err) {
						insertMsg.msg = "数据更新成功";
					} else {
						insertMsg.msg = "数据库操作失败";
						console.log(err);
					}
				});

				
			});
		});

		return JSON.stringify(insertMsg);
	}
};

module.exports = sql;