var tableData = (function(){
	// 初始值
	var group =1;
	return {
		// 点击添加
		clickAdd:function(obj){
			var group = $(obj).parent('.add-group').data('group');
			var addBtn = $(obj).parents('td').next().find('.add-btn');
			$(obj).parents('td').next().find('.add-part').addClass('add-part2').removeClass('cur');
			if($(obj).parent('.add-group').children().length>2){
				addBtn.show();
			};
			var slotId=$(obj).data('slotid');
			if($(obj).hasClass('selected')) return false;	 
			var addPart = $(obj).parents('td').next().find('.add-part[data-group='+group+']');
			var spanHtml = '<span data-slotid="'+slotId+'" class="code-slot close">'+$(obj).html()+'</span>';
			addPart.append(spanHtml);
			$(obj).addClass("selected");
		},
		// 移出函数
		removeAdd:function(obj){
			var addPart = $(obj).parent('.add-part');
			var slotId=$(obj).data('slotid');
			var pGroup = addPart.data('group');
			$(obj).parents('.add-all').children('.add-part').removeClass('cur');
			// 隐藏添加分组按钮
			if(addPart.children('.code-slot').length==1){		
				addPart.removeClass('add-part2');
			}
			$(obj).remove();
			$(".add-group[data-group="+pGroup+"]").find(".code-slot[data-slotid='"+slotId+"']").removeClass("selected");
		},
		// 添加分组
		groupAdd:function(obj){
			var addParent = $(obj).parents('tr').find('.add-group').parent();
			group++;
			var addHtml=$(obj).parents('tr').find('.add-group').eq(0).html();
			addHtml=addHtml.replace(/selected/ig,'');
			var groupHtml = '<div class="add-group" data-group="'+group+'">'+addHtml+'</div>';
			addParent.append(groupHtml);
			var addPartHtml = '<div class="add-part" data-group="'+group+'"></div>';
			$(obj).parent().append(addPartHtml);
			$(obj).hide();
		},
		// 判断数组中重复出现的元素索引
		arrIndex:function(arr){
			var obj = {};
			for(i in arr){
				if(!obj[arr[i]]){
					obj[arr[i]]=[i];
				}else{
					obj[arr[i]][i]=i;
				}
			}
			for(i in obj){
				if(obj[i].length==1){delete(obj[i])}
			}
			return obj;
		},
		// 查找重复出现的元素,并且放入同一个数组中
		findIndex:function(obj){
			// 得到.add-part2中close的id拼接好的字符串  如：[200,200]
			var allarr=[];
			obj.find('.add-part2').each(function(k){
				var child = $(this).children('.close');
				if(child.length<2){
					$(this).addClass('cur');
				};
				var arr= [];
				if(child.length>0){
					child.each(function(j){
						var slotid = $(this).attr('data-slotid');
						arr.push(slotid);
					})
					allarr.push(arr.sort(tableData.sortFn).join(''))
				}
			});
			if(allarr.length>0) return tableData.arrIndex(allarr);
			
		},
		// 按照从小到大排序
		sortFn:function(a,b){
			return a-b;
		},
		check:function(){
			$('.add-part').removeClass('cur');
			$('.table-main tr').each(function(i){
				var _tr = $(this);
				var cfIndex=tableData.findIndex(_tr);
				// 再次循环，找到重复的索引，并且添加cur
				_tr.find('.add-part2').each(function(j){
					var child = $(this).children('.close');
					var arr= [];
					if(child.length>0){
						child.each(function(j){
							var slotid = $(this).attr('data-slotid');
							arr.push(slotid);
						})
						var val=arr.sort(tableData.sortFn).join('')
					}
					if(typeof cfIndex[val]!='undefined'){
						for(var cc=0;cc<cfIndex[val].length;cc++){
							_tr.find('.add-part2:eq('+cfIndex[val][cc]+')').addClass('cur')
						}
					}
				})
			})
		},
		submitFn:function(){
			var codeSlot=$('.add-all').find('.code-slot');
			if(!codeSlot.hasClass('close')){ 
				alert('请选择词组！')
				return false;
			};
			if($('.close').parent().hasClass('cur')) return false;
			var nohand=[];
			var hand=[];
			var trHave=$('.table-main tbody tr');
			// 遍历tr中的id 有选择的放在hand中，没选择的放在nohand
			trHave.each(function(i){
				if(!$(this).find('.add-all .code-slot').hasClass('close')){
					var noArr=$(this).attr('data-id');
					nohand.push(noArr);
				}else{
					var obj={};	
					obj.slots=[];
					var arr=$(this).attr('data-id');
					var addAll = $(this).find('.add-all');
					addAll.each(function(m){
						var addP=$(this).children('.add-part');
						addP.each(function(k){
							var child = $(this).children('.close');
							var childArr = [];
							child.each(function(j){
								var childObj={}
								var slotid=$(this).attr('data-slotid');
								var slotName=$(this).html();
								childObj.slotid = slotid;
								childObj.slot_name = slotName;
								childArr.push(childObj)
							})
		                    obj.slots.push(childArr);
						})
					})
					obj.id=arr;
					hand.push(obj);
				}
			})
			console.log(nohand)
			console.log(hand)
			// $.ajax({
			// 		url: '/index/ai/AiCodeSlotgroup/save',
			// 		data: {
			// 				hand: hand,
			// 				nohand: nohand,
			// 				intentid:intentid
			// 				requestmode: 'async'
			// 		},
			// 		dataType: 'json',
			// 		type: 'get',
			// 		success: function (response) {
						
			// 		}
			// });
		},
		// 重置点击添加事件
		init:function(){
			// 点击添加
			$('.table-main').on('click','.add-group .code-slot',function(){
				if($(this).parent().children('.selected').length<3){
					tableData.clickAdd(this);
				}
			});
			// 移除标签
			$('.add-all').on('click','.add-part .close',function(){
				tableData.removeAdd(this)
			});
			// 添加分组
			$('.add-all').on('click','.add-btn',function(){
				tableData.groupAdd(this);
			});	
			// 点击提交保存
			$('#saveBtn').on('click',function(){
				tableData.check();
				tableData.submitFn();
			})
		}
	}
})();
// 调用
tableData.init();