// 读写文件
var fs=require('fs');

var file = {
	read: function(file){
		// 这个方法不需要封装
		var data = fs.readFileSync(file);
		return data;
	},
	write: function(file, input_data){
		// 按照json格式处理
		var msg = 1;
		var data = fs.readFileSync(file);
		var data1 = JSON.parse(data);
		data1.push(JSON.parse(input_data));
		fs.writeFile(file, JSON.stringify(data1),  function(err) {
			if (err) {
				msg = err;
				return err;
			}
			msg = true;
			return true;
		});
		return msg;
	}
};

module.exports = file;