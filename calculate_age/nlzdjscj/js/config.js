jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";
	//打开接口
    var config = kintone.plugin.app.getConfig(PLUGIN_ID);
	//获取行数
    var rowCount = Number(config["rowCount"]);    
    $(document).ready(function() {
                var terms = {
            'ja': {
                'cf_text_title': '自動計算プラグイン',
                'cf_text_column1': '開始日期のフィールド名称',
                'cf_text_column2': '自動計算年のフィールド名称',
                'cf_text_column3': '次回期限になるカラムの名称',
                'cf_text_column4': '年度の基数',
                'cf_plugin_submit': '     保存   ',
                'cf_plugin_cancel': '  キャンセル   ',
                'cf_error_message1': 'オプションフィールドの名称を頼みます。',
				'cf_error_message2': '同じカラムの名称を選ぶことができないでください。'
            },
            'en': {
                'cf_text_title': 'Automatic Computing Plug-in',
                'cf_text_column1': 'Start Date',
                'cf_text_column2': 'Age',
                'cf_text_column3': 'Next Date',
                'cf_text_column4': 'Year Base',
                'cf_plugin_submit': '     Save   ',
                'cf_plugin_cancel': '  Cancel   ',
                'cf_error_message1': 'Please select the field name.',
				'cf_error_message2': 'Please do not select the same field name.'
            },
            'zh': {
                'cf_text_title': '自动计算插件',
                'cf_text_column1': '初始日期字段名称',
                'cf_text_column2': '需要自动计算年份字段名称',
                'cf_text_column3': '下次到期字段名称',
                'cf_text_column4': '年份基数',
                'cf_plugin_submit': '     保存   ',
                'cf_plugin_cancel': '  取消   ',
                'cf_error_message1': '请选择字段名称。',
				'cf_error_message2': '请不要选择相同的字段名称。'
            }
        };

        // To switch the display by the login user's language (English display in the case of Chinese)
        var lang = kintone.getLoginUser().language;
        var i18n = (lang in terms) ? terms[lang] : terms['en'];

        var configHtml = $('#cf-plugin').html();
        var tmpl = $.templates(configHtml);
        $('div#cf-plugin').html(tmpl.render({'terms': i18n}));

		// escape fields vale
        function escapeHtml(htmlstr) {
            return htmlstr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        }
	    //set default	
        //显示前一次的设置
	    function setDefault(){
		    //如果已经设置过
		    if (rowCount > 0) {
			    for (var i = 0; i < rowCount; i++) {
				    var year = config["year" + i];
				    var age = config["age" + i];
			    	var pluginDate = config["pluginDate" + i];
			    	var yearBase = config["yearBase" + i];
			    	$('#year-' + i).find("option[value=" + year + "]").prop("selected",true);
			    	$('#age-' + i).find("option[value=" + age + "]").prop("selected",true);
			    	$('#pluginDate-' + i).find("option[value=" + pluginDate + "]").prop("selected",true);
			    	$('#yearBase-' + i).find("option[value=" + yearBase + "]").prop("selected",true);
				    //如果只有一行，隐藏删除按钮
				    if (rowCount <= 1) {
					$(".kintoneplugin-button-remove-row-image").hide();
				    }
			        else {
				    	if(i <= 0) {
						    $(".kintoneplugin-button-remove-row-image").hide();
					    }
					    else {
						    $(".kintoneplugin-button-remove-row-image").show();
					    }
			            var newTrNum = i + 1;
						//复制一行
					    $("#trId-0").clone(true).insertAfter($("tbody > tr").eq(newTrNum));
						//给新一行增加ID
					    $("tbody > tr").eq(newTrNum + 1).attr('id','trId-' + newTrNum);
					    var newRow = $('#trId-' + newTrNum);
			            //给各个选择框加ID	
			            newRow.find("select:eq(0)").attr('id','year-' + newTrNum);
			            newRow.find("select:eq(1)").attr('id','age-' + newTrNum);
			            newRow.find("select:eq(2)").attr('id','pluginDate-' + newTrNum);
		            	newRow.find("select:eq(3)").attr('id','yearBase-' + newTrNum);
						//清空新一行内容
		            	newRow.find('select').val('0');
						newRow.find("span").css('display','none');
		            }				
			    }
		    } else {//如果没有设置过，隐藏删除按钮
                $(".kintoneplugin-button-remove-row-image").hide();
		    }
			//如果超过一行删除最后增加的空白行
			if (rowCount > 1){
				$("tbody > tr").last().remove();
			}
	    }
        //set fields to selects
        function setThisfields(resp) {
            //console.log(resp.properties);
            for (var key in resp.properties) {
                if (!resp.properties.hasOwnProperty(key)) {
				    continue;
		        }
                var prop = resp.properties[key];
                var $option = $("<option>");
                $option.attr("value", escapeHtml(prop.code));
                $option.attr("name", escapeHtml(prop.type));
                $option.text(escapeHtml(prop.label));
                switch (prop.type) {
                    case "NUMBER":
                        $('select:eq(1)').append($option.clone());
                        break;
                    //case "CREATED_TIME":
                    case "DATE":
                        $('select:eq(0)').append($option.clone());
                        $('select:eq(2)').append($option.clone());
                        break;
                    default:
                        break;
                }
            }
		    	setDefault();
	    }	
        
        //GET fields From this APP
        var url = kintone.api.url('/k/v1/preview/app/form/fields', true);
        var body = {
            app: kintone.app.getId()
        };
        kintone.api(url, 'GET', body, function(resp) {
            // success:
            setThisfields(resp);


        }, function(error) {
            //error:出错的场合显示错误信息
            var errmsg = '取得记录时出错。';
            // 当response里包含错误信息的时候，显示错误信息
            if (resp.message !== undefined) {
                errmsg += '\n' + resp.message;
            }
        });
        //计算行数
         
		//下一行的行号（ID）
		//点击加号图标（增加行）
   		$("#tableId").on("click", ".kintoneplugin-button-add-row-image", function(){
			var rowCount = $("#tableId").find("tr").length-1;
			var maxTrNum = 0;
	    	$('tr[id^="trId-"]').each(function() {
	    		var newTrId = $(this).attr('id');
	    		var newTrNum = parseInt(newTrId.replace(/[^0-9]/ig,""));
	    		maxTrNum = newTrNum > maxTrNum ? newTrNum : maxTrNum; 
            });
			//新建一行的行号
			var newTrNum = maxTrNum + 1;
    		//找到点击的行
        	var TrId = this;
        	//查找这行的行ID
        	var thisTrId = $(TrId).parents("tr").attr("id");
        	var rowCount = $("#tableId").find("tr").length-1;
			//克隆并追加一行
			var newRow = $('#' + thisTrId).clone();
			//var newTrNum = rowCount + 1;
        	//增加新一行的ID
			newRow.attr('id','trId-' + newTrNum);
			//各个选择框加ID	
			newRow.find("select:eq(0)").attr('id','year-' + newTrNum);
			newRow.find("select:eq(1)").attr('id','age-' + newTrNum);
			newRow.find("select:eq(2)").attr('id','pluginDate-' + newTrNum);
			newRow.find("select:eq(3)").attr('id','yearBase-' + newTrNum);
			//清空选择数据
			newRow.find("select").val('0');
			//清空报错信息
			newRow.find("span").css('display','none');
		    //在点击的行下面插入新的一行
		    $("#" + thisTrId).after(newRow);
            //行数+1
            rowCount ++;
            //行数1行以上显示减号图标
            if(rowCount >1) {
                $(".kintoneplugin-button-remove-row-image").show();
            }
        });
        //点击减号图标（删除行）
        $("#tableId").on("click", ".kintoneplugin-button-remove-row-image", function(){
    	    //找到点击的行
            var TrId = this;
            //查找这行的行ID
            var thisTrId = $(TrId).parents("tr").attr("id");
            //删除这行
            $("#"+thisTrId).remove();
            //计算行数
            var rowCount = $("#tableId").find("tr").length-1;
            //only one line,hide delete button 如果只有一行数据，隐藏减号图标
            if(rowCount <= 1) {
            $(".kintoneplugin-button-remove-row-image").hide();
            }
        });
	
        //点击“确定”后传入设置值
        $('#setting_submit').click(function() {
            //设置行数
		    var config = {};
            var rowCount = $("#tableId").find("tr").length-1;
            config['rowCount'] = String(rowCount);
	    	//查找最大ID数
	    	var maxTrNum = 0;
	    	$('tr[id^="trId-"]').each(function() {
	    		var newTrId = $(this).attr('id');
	    		var newTrNum = parseInt(newTrId.replace(/[^0-9]/ig,""));
	    		maxTrNum = newTrNum > maxTrNum ? newTrNum : maxTrNum; 
            });
	    	//查找设置的内容
            var i = 0;
			
            for(var j = 0; j <= maxTrNum; j++) {
				
                if ($('#trId-' + j).length == 0) { continue;}
                else {
                    config['year' + i] = $('#year-' + j).find('option:selected').val();
                    config['age' + i] = $('#age-' + j).find('option:selected').val();
                    config['pluginDate' + i] = $('#pluginDate-' + j).find('option:selected').val();
                    config['yearBase' + i] = $('#yearBase-' + j).find('option:selected').val();
                    i++;
                }
				
            }

            var user_lang = kintone.getLoginUser().language;
		    var errorEmpty = 0;
			var errorRepeat = 0;
            $(".kintoneplugin-table-td-control").each(function(){
				var thisTd = $(this);
				var thisSelected = $(this).find('select option:selected').text();
				var num = 0;
				$(".kintoneplugin-table-td-control").each(function(){
					var repeatSelected = $(this).find('select option:selected').text();
					var yearBaseSelected = $(this).find('select[id^="yearBase-"]  option:selected').text();
					
					//页面校验1:前3列如若选择了任一下拉框内容，其他两列为必选项。
					if (thisSelected == '-----') {
						thisTd.find('.cf-plugin-errormessage1').css('display','inline-block');
						errorEmpty++;
					}
					//页面校验2/3:前三列的每一个值唯一。
					else if(thisSelected == repeatSelected && thisSelected !=yearBaseSelected ) {
						num++;
						if (num > 1) {
							thisTd.find('.cf-plugin-errormessage2').css('display','inline-block');
							errorRepeat++;
						}
						else {
							thisTd.find('span').css('display','none');
						}	
				    }    
				});
            });
	        if (errorEmpty > 0 || errorRepeat > 1){
				return;
			}
			
			
			
			
            //向应用传递设置的内容
		    kintone.plugin.app.setConfig(config);
        });
        //点击“取消”后返回页面
        $('#setting_cancel').click(function() {
			if(window.confirm('确定要取消本次设置吗？')){
                history.back();
              }else{
                return;
             }
            
        });
    });
})(jQuery, kintone.$PLUGIN_ID);