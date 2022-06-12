/*
Create by:Willy
Date:2009/02/17 created
     2009/02/18 modified
Example:
<HTML xmlns:v><!--※-->
	<HEAD>
		<STYLE type="text/css">v\:*{behavior:url(#default#VML);}</STYLE> <!--※-->
		<script src="barChart.js"></script><!--※-->
	</HEAD>
	<body >
		<v:group ID="g1" style='position:relative;left:0;top:0;z-index:10;width:1200px;height:600px' coordsize="-200,-200"/>
		<script lang="JavaScript">barChart('90|80|70','Banana|Apple|Eggplant','g1');</script>
	</body>
</HTML>
*/
			function barChart(nums,til,groupID){
				var barColor='blue';//bar的顏色
				var bSeq=false;//要不要用序號取代下標籤文字
				var bFrame=true;//要不要框線
				var xOrigin=10;//原點x
				var yOrigin=8;//原點y
				var topDistance=10;//頂點和y軸的距離
				var leftDistance=10;//左側和x軸的距離
				var rSignSize="WIDTH:15px;HEIGHT:15px";//右標籤大小
				var bSignSize="WIDTH:80px;HEIGHT:15px";//下標籤大小
				//以下不用改
				var group1 = document.getElementById(groupID);//Group
				var linesDistance=(100-yOrigin-topDistance)/9;//實線、虛線的距離(-3是箭頭的長度)
				var items = nums.split('|');
				var titles = til.split('|');				
				var iNum = items.length;//統計項目數目
				var yScale=[];
				var barWidth=0;
				var zTextBox;
				
				if(group1 != undefined){
					structur();//外框、X軸、Y軸
					dashAndSolid();//實線、虛線
					
					//輸入的統計項目過大就不能畫長條圖
					if (iNum<=Math.round((100-leftDistance-xOrigin)/4)){
						var max=0;
						maxAndMid();//最大值、中間值
						drawBars();//畫出長條圖
					}else{
						//輸入的項目如果過多就不畫
						alert("統計項目過多!");
						//顯示error in TextBox				
					}
				}else{alert('Group ID [ ' + groupID + ' ] 不存在');}

				
				//---------------------------------------------------------------------
				
				//外框、X軸、Y軸
				function structur(){
					//x軸(需保留箭頭長度+3)
					var xAxis = document.createElement("<v:line from='" + xOrigin + "," + yOrigin + "' to='" + (100-leftDistance+3) + "," + yOrigin + "' style='POSITION:relative' strokeweight='1pt'>"); 
					//箭頭
					var arrow = document.createElement("<v:stroke EndArrow='classic'/>");		
					//y軸(需保留箭頭長度+3)
					var yAxis = document.createElement("<v:line from='" + xOrigin + "," + yOrigin + "' to='" + xOrigin + "," + (100-topDistance+3) + "' style='POSITION:relative' strokeweight='1pt'>"); 
					//外框
					var outFrame = document.createElement("<v:rect style='position:relative;WIDTH:100px;HEIGHT:100px' fillcolor='white' strokecolor='black'/>"); 
					//外框陰影
					var outShadow = document.createElement("<v:shadow on='t' type='single' color='silver' offset='4pt,3pt'/>"); 
					//原點
					var oPoint = document.createElement("<v:rect style='position:relative;left:" + xOrigin + ";top:" + yOrigin + "'/>"); 
					zTextBox = document.createElement("<v:textbox id='text1' inset='3pt,0pt,3pt,0pt' align='left' style='text-align:left;v-text-anchor:bottom-left-baseline'/>");
					if(bFrame){
						outFrame.insertBefore(outShadow);
						group1.insertBefore(outFrame); 					
					}

					xAxis.insertBefore(arrow);
					group1.insertBefore(xAxis); 
					arrow = document.createElement("<v:stroke EndArrow='classic'/>");
					yAxis.insertBefore(arrow);
					group1.insertBefore(yAxis); 
					oPoint.insertBefore(zTextBox);
					zTextBox.innerHTML='0';
					group1.insertBefore(oPoint); 
				}
				
				//最大值、中間值
				function maxAndMid(){
					var pFrom,pTo;
					//算出最大值
					for(i=0;i<iNum;i++){
						if(!(/^[-]?\d*\.?\d*$/.test(items[i])))items[i]=0.0;//不是一個數字，就將該變數轉成float 0.0
						items[i]=parseFloat(items[i]);
						if(items[i]>max)max=items[i];
					}				
					//畫出中間值刻度、中間值標籤
					var x=parseFloat(yScale[4].split(',')[0]);
					var y=parseFloat(yScale[4].split(',')[1]);
					pFrom="" + x + "," + y;
					pTo="" + (x-1) + "," + y;
					var dash = document.createElement("<v:line from='" + pFrom + "' to='" + pTo + "' style='position:relative'/>");
					group1.insertBefore(dash);
					var newShape= document.createElement("<v:rect style='position:relative;left:" + x + ";top:" + y + ";WIDTH:0px;HEIGHT:0px'/>"); 
					zTextBox = document.createElement("<v:textbox id='midvalue' inset='3pt,0pt,3pt,0pt' align='left' style='position:relative;left:" + x + ";top:" + y + ";" + rSignSize + ";v-text-anchor:bottom-left-baseline' />");
					zTextBox.innerHTML = parseInt(max/2);//填入中間值
					newShape.insertBefore(zTextBox);
					group1.insertBefore(newShape);
					//畫出最大值刻度、最大值標籤
					x=parseFloat(yScale[8].split(',')[0]);
					y=parseFloat(yScale[8].split(',')[1]);
					pFrom="" + x + "," + y;
					pTo="" + (x-1) + "," + y;
					dash = document.createElement("<v:line from='" + pFrom + "' to='" + pTo + "' style='position:relative'/>");
					group1.insertBefore(dash);
					newShape= document.createElement("<v:rect style='position:relative;left:" + x + ";top:" + y + ";WIDTH:0px;HEIGHT:0px'/>"); 
					zTextBox = document.createElement("<v:textbox id='midvalue' inset='3pt,0pt,3pt,0pt' align='left' style='position:relative;left:" + x + ";top:" + y + ";" + rSignSize + ";v-text-anchor:bottom-left-baseline' />");
					zTextBox.innerHTML = max;//填入最大值
					newShape.insertBefore(zTextBox);
					group1.insertBefore(newShape);				
				}
				
				//實線、虛線
				function dashAndSolid(){
					for(i=1;i<10;i++){
						var newLine = document.createElement("<v:line from='" + xOrigin + "," + ((i*linesDistance)+yOrigin) + "' to='" + (100-leftDistance) + "," + ((i*linesDistance)+yOrigin) + "' style='position:relative;'/>");
						yScale[i-1]="" + xOrigin + "," + ((i*linesDistance)+yOrigin) + "" ;
						if(i%2!=0){
							var newDotLine = document.createElement("<v:stroke dashstyle='dot' color='black'/>"); 
							newLine.insertBefore(newDotLine);
						}
						group1.insertBefore(newLine);
					}				
				}
				
				//畫出長條圖
				function drawBars(){
					//計算長條圖距離、寬度
					barWidth=parseInt((100-leftDistance-xOrigin)/(iNum*2));//alert(barWidth);
					//畫出x刻度、x標籤、長條圖
					for(i=0;i<iNum;i++){
						x=(xOrigin+barWidth*2*(i+1));
						y=yOrigin;
						var barHeight=(items[i]*(100-yOrigin-topDistance))/max;//算出每個統計項目在圖裡的比例
						//x刻度
						pFrom="" + x + "," + y;
						pTo  ="" + x + "," + (y-2);
						dash = document.createElement("<v:line from='" + pFrom + "' to='" + pTo + "'/>");
						group1.insertBefore(dash);
						
						//x標籤
						newShape = document.createElement("<v:rect style='position:relative;left:" + x + ";top:" + y + ";WIDTH:0px;HEIGHT:0px'/>");
						zTextBox = document.createElement("<v:textbox id='midvalue' inset='5pt,3pt,5pt,0pt' align='left' style='position:relative;left:" + x + ";top:" + y + ";" + bSignSize + ";v-text-anchor:bottom-left-baseline' />");
						zTextBox.innerHTML=((bSeq)?(i+1):titles[i]);
						newShape.insertBefore(zTextBox);
						group1.insertBefore(newShape);
						
						//長條圖
						newShape = document.createElement("<v:rect stroked='false' fillcolor='" + barColor + "' style='position:relative;left:" + (x-barWidth) + "px;top:" + y + "px;width:" + barWidth + "px;height:" + barHeight + "px'>");
						group1.insertBefore(newShape);
					}				
				}
			}