jQuery.noConflict();
(function($, PLUGIN_ID) {
	
    "use strict";
	
    // To HTML escape

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
	var APPID = kintone.app.getId();
	var config = kintone.plugin.app.getConfig(PLUGIN_ID);
	if (!config) {return false;}
	var rowCount = Number(config["rowCount"]);
	var year = {};
	var age = {};
	var pluginDate = {};
	var yearBase = {};
	for (var i = 0; i < rowCount; i++) {
		year[i] = config["year" + i];
		age[i] = config["age" + i];
		pluginDate[i] = config["pluginDate" + i];
		yearBase[i] = config["yearBase" + i];	
	}
	var flg = false;
	kintone.events.on('app.record.index.show', function(event) {
			loopGet(0);
    });

	function loopGet(offset){
		
		var today = moment().format('YYYY-MM-DD');
		var condition = '';
	    var param = {
			app: kintone.app.getId(),
			query: pluginDate[0] + ' <= "' + moment().format('YYYY-MM-DD') + '" or ' + pluginDate[1] + ' <= "' + moment().format('YYYY-MM-DD') + '" limit 100 offset ' + offset
		};		
		for (var j = 0; j < rowCount; j++){
			if (j == rowCount - 1) {
				condition = condition + pluginDate[j] + ' <= "' + today + '"';
			} else {
				condition = condition + pluginDate[j] + ' <= "' + today + '" or ';
			}
		}
		var param = {
			app:kintone.app.getId(),
			query: condition + '" limit 100 offset ' + offset
		};
		kintone.api(kintone.api.url('/k/v1/records', true), 'GET', param,
		function(resp) {
			var records = resp.records;
			if(records.length != 0){
				var json = {};
				json['app'] = kintone.app.getId();
				json['records']  = new Array();
				for(var i = 0;i < records.length; i++){
					var subRec = {};
					subRec['id'] = records[i]['$id']['value'];
					subRec['record'] = {};
					for (var j = 0; j < rowCount; j++){
						var startYear = records[i][year[j]]['value'];
						var a = moment();
						var b = moment(startYear);
						subRec['record'][age[j]] = {};
						subRec['record'][age[j]]['value'] = Number(a.diff(b,'years')) + Number(yearBase[j]);
						subRec['record'][pluginDate[j]] = {};
						subRec['record'][pluginDate[j]]['value'] = moment(records[i][year[j]]['value']).add(Number(subRec['record'][age[j]]['value'])+1-Number(yearBase[j]),'years').format('YYYY-MM-DD');
					}	
					json['records'].push(subRec);
				}	
				kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', json, function(resp){
					flg = true;
					offset = offset + 100;
					loopGet(offset);
					return;
				}, function(resp) {
					alert(JSON.stringify(resp) + "不对了啊");
					return;
				});
			} else {
				if(flg){
					alert("处理完成");
					location.reload();
				}
			}
		},function(resp){
			alert(JSON.stringify(resp) + "不对了啊啊啊啊啊");
			return;
		});
	}	
	/*
	kintone.events.on(['app.record.create.show', 'app.record.edit.show', 
    	'app.record.index.edit.show'], function(event) {
		var record = event.record;
		for(var j =0; j < rowCount; j++){
			record[age[j]]['disabled'] = true;
		    record[pluginDate[j]]['disabled'] = true;
			
		}
		return event;
    });	
	
	kintone.events.on(['app.record.create.submit', 'app.record.edit.show', 'app.record.edit.submit', 
    'app.record.index.edit.show', 'app.record.index.edit.submit'], 
    function(event) {
        if(event) {
            var record = event.record;
            //计算年龄
            //获取现在时间，日期型
            var nowDate = new Date();
            //获取出生日期，字符串型
			for (var j = 0; j < rowCount; j++){	
				var startYearString = record[year[j]]['value'];
                //把字符串型的出生日期转化为日期型
                var startYear = new Date(Date.parse(startYearString.replace(/-/g,   "/")));
                //计算年龄天数
                var days = nowDate.getTime() - startYear.getTime();
                //计算年龄
                var ageBase = Math.floor(days/(24*3600*1000*365)) + Number(yearBase[j]);
                //输出年龄
                record[age[j]]['value'] = ageBase;
                //计算下次生日
                //获取出生日期的月份和日期
                var pluginDateBase = moment(startYear).add(Number(ageBase) + 1 - Number(yearBase[j]), 'years').format('YYYY-MM-DD');
                record[pluginDate[j]]['value'] = pluginDateBase;
                
			} 
			return event;
		} else {
            alert('没有数据');
        }
    });	
	*/
})(jQuery, kintone.$PLUGIN_ID);

