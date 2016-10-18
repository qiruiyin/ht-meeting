/*
 * 公共方法的集合  
 */ 

var common = {
	getTimeStamp: function(date, time){
		// 将日期和时间合并生成时间戳
		date = date.replace(/年|月/g, "-").replace(/日/g, " ");
		time = time.replace(/点|分/g, ":");
		time = date + time + "00";
		return Date.parse(new Date(time));
	},
	timeIntervalOk: function(startTimeStamp, endTimeStamp, arr){
		// 插入的时间段是否和已有数据冲突
		// startTimeStamp 开始时间戳
		// endTimeStamp 结束时间戳
		// arr已有数据的集合,该数据已按时间从小到大排序
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i].starttimestamp < startTimeStamp) {
				if (i == arr.length - 1) {
					if (arr[i].endtimestamp <= startTimeStamp) {
						return 1;
					} else {
						return 0;
					}
				} else {
					if (arr[i].endtimestamp <= startTimeStamp && time[i+1].starttimestamp >= endTimeStamp) {
						return 1;
					} else {
						return 0;
					}
				}
			} else if (i == 0) {
				if (time[i].starttimestamp >= endTimeStamp) {
					return 1;
				} else {
					return 0;
				}
			}
		}
	}
};

module.exports = common;