		/*
		//圓餅圖主程式
		//r:半徑
		//item_names:各項目名稱，必須以"|"隔開，ex.  '項目一|項目二|項目三|項目四'
		//item_values:各項數據，必須以"|"隔開，ex.   '10.1|23.0|12|33'
		*/
		function Pie(r,item_names,item_values,argTitle){
			var item_t = toAry(item_names);
			var item_v = toAry(item_values);
			
			//將字串陣列轉成數字陣列

			for (i = 0;i<(item_v.length-1);i++){	
				if ( typeof(item_v[i]) == 'string' ) {
					item_v[i] = parseFloat(item_v[i]);	
				}
			}
			
			//r半徑，item_t項目的標題，item_v項目的值

			var i,s;
			var item_p=new Array(); //各個項目的比例
			var item_q=new Array(); //各個項目的百分比

			var sum=0; //項目總和
			var len=item_t.length; //項目個數
			
			var d=r*2; //直徑

			//定義顏色
			var color1=new Array("#458B00","#4876FF","#FF8247","#00ff00","#FF82E0","#FFFF00","#3333FF","#FFAA00","#90EE90","#8A2BE2","#ff0000","#00FFFF","#FFC0CB","#666699","#993300","#99cc00");
			var color2=new Array("Blue","BlueViolet","Crimson","Green","Chartreuse","Fuchsia","Cyan","Fuchsia","Gold","GreenYellow","Maroon","Violet");
			//算出合計
			for(i=0;i<len;i++) sum+=parseFloat(item_v[i]);

			//算出百分比

			for(i=0;i<len;i++){
				item_p[i]=item_v[i]/sum;
				if (sum != 0.0){
						item_q[i]=FormatNumber(item_p[i]*100,1)+"%";
				}else{
						item_q[i]='算術錯誤！';
				}

			}
			
			s="<v:group style='position:relative;width:"+(d+230)+"px;height:"+d+"px' coordsize='"+(d+230)+","+d+"'>";

			//Title
			if ((argTitle != undefined) && (argTitle.length > 0)){
			s+="<center><v:textbox inset='0,0,0,0'>" + 
			   "<table border='1' bordercolor='black' cellpadding='3' cellspacing='0'>" +
			   "<td style='font-size:20px;'>" + argTitle + "</td>" + 
			   "</table></v:textbox></center>";
			}

			//背景
			/*s+="<v:rect style='left:5;top:5;width:"+(d+235)+";height:"+(d+10)+"'>";
			s+="<v:shadow on='t' type='single' color='silver' offset='5px,5px' />";
			s+="</v:rect>";*/

			//扇形
			var angle1=0;
			var angle2;
			if (sum != 0) {
				for(i=0;i<len;i++){
					angle2=parseInt(360*item_p[i]);
					if(i==len-1)
						angle2=360-angle1;
					s+="<v:shape title='"+item_t[i]+"："+item_q[i]+"' style='position:relative;width:"+d+";height:"+d+"' coordsize='"+d+","+d+"' strokeweight='1' strokecolor='#fff' fillcolor='"+color1[i]+"' path='m "+r+","+r+" ae "+r+","+r+","+r+","+r+","+65536*angle1+","+65536*angle2+" x e'>";
					//s+="<v:fill color2='"+color2[i]+"' rotate='t' focus='100%' type='gradient' />";
					s+="</v:shape>"
					angle1+=angle2;
				}		
			}else{
				//當分母為零

					s+="<v:oval style='position:relative;width:" + d + ";height:" + d + "'/>";
					s+="<v:shape style='position:relative;top:"+(d*0.42)+";width:" + d + ";height:" + d + "'>";
					s+="<div style='text-align:center;'><v:textbox inset='0,0,0,0'><table><td style='font-size:20px;'>合計不可為零</td></table></v:textbox></div>";
					s+="</v:shape>";
			}

			
			//各個項目說明

			s+="<v:group style='position:relative;left:"+(d+25)+";top:"+(d-(22*len+12))+";width:200;height:"+(22*len+4)+"' coordsize='200,"+(22*len+4)+"'>";
			s+="<v:rect style='position:relative;width:250;height:"+(22*len+4)+"' strokecolor='#333' />";
			for(i=0;i<len;i++){
				s+="<v:rect style='position:relative;left:4;top:"+(i*22+4)+";width:25;height:18;' title='"+item_t[i]+"："+item_q[i]+"' fillcolor='"+color1[i]+"'></v:rect>";
				s+="<v:shape style='position:relative;left:30;top:"+(i*22+4)+";width:400;height:25'><div style='text-align:left;'><v:textbox inset='0,0,0,0'><table><td style='font-size:10px;'>"+item_t[i]+"："+item_v[i]+"("+item_q[i]+")</td></table></v:textbox></div></v:shape>";
			}
			s+="</v:group>";

			s+="</v:group>";
			
			document.write(s);
		}

		function FormatNumber(srcStr,nAfterDot){
			var srcStr,nAfterDot;
			var resultStr,nTen;
　		srcStr = ""+srcStr+"";
　		strLen = srcStr.length;
　		dotPos = srcStr.indexOf(".",0);
　		if (dotPos == -1){
　　		resultStr = srcStr+".";
　　		for (i=0;i<nAfterDot;i++)
　　　		resultStr = resultStr+"0";
　　		return resultStr;
　		}
　		else{
　			if ((strLen - dotPos - 1) >= nAfterDot){
　　			nAfter = dotPos + nAfterDot + 1;
　　　		nTen =1;
　　　		for(j=0;j<nAfterDot;j++)
　　　			nTen = nTen*10;
　　　		resultStr = Math.round(parseFloat(srcStr)*nTen)/nTen;
　　　		return resultStr;
　　		}
　　		else{
　　　		resultStr = srcStr;
　　　		for (i=0;i<(nAfterDot - strLen + dotPos + 1);i++)
　　　　		resultStr = resultStr+"0";
　　　		return resultStr;
　　		}
　		}
		} 

		//將用"|"隔開的字串轉陣列
		function toAry(strOri){
			var strAry = strOri.split('|');
			return strAry;
		}	
