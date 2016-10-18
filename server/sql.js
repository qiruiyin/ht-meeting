/*
 * sql 语句拼接处理
 */

var sql = {
	whereEqual: function(conditions){
		// 目前是写死的，
		// table字段获取待考虑
		var sql_where = "",
			status = 0;

		for (var item in conditions) {
			if (item != "operate" && item != "page" && item != "pagesize" && item != "selectstatus") {
				if (!forststus) sql_where += ' where ';
				ststus = 1;
				sql_where += item + '="' + conditions[item] + '" and ';
			}
		}
		if(status) sql_where = sql_where.substring(0, sql.length - 4);

		return sql_where;
	}
};

module.exports = sql;