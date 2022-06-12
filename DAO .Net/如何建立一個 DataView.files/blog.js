	function clickCommend(relateID,commendType,path)
	{
		var form=document.Commend;
		var commendMessage="";
		var cmd_type="";
		if( document.cookie.indexOf("otpw") == -1){
			if(confirm("請先登入Xuite會員")){
				document.location.href='/_members/login.php?furl='+path;
				return;
			}else{
				return;
			}
		}
		else
		{
			if (commendType=="blog")
			{
				cmd_type="日誌";
			}else{
				cmd_type="文章";
			}
			if(confirm("是否推薦此"+cmd_type+"?"))
			{	
				commendMessage=prompt("請輸入推薦理由", "")
				if ((commendMessage!=null) && (commendMessage!=''))
				{
					form.commendType.value=commendType;
					form.relateID.value=relateID;
					form.content.value=commendMessage;
					form.submit();
				}else{
					alert ("推薦的理由必須填寫。");
				}
			}
			else
			{
				alert ("放棄推薦");
			}

		}
	}	
	
	
	
	
	
	function clickReport(relateID,reportType,path)
	{
		var form=document.Report;
		var reportMessage="";
		if( document.cookie.indexOf("otpw") == -1){
			if(confirm("請先登入Xuite會員")){
				document.location.href='/_members/login.php?furl='+path;
				return;
			}else{
				return;
			}
		}
		else
		{
			if(confirm('是否要檢舉日誌或文章有違反善良風俗或不符用條約之情事?'))
			{	
				reportMessage=prompt("請輸入檢舉理由", "")
				if ((reportMessage!=null) && (reportMessage!=''))
				{
					form.reportType.value=reportType;
					form.relateID.value=relateID;
					form.content.value=reportMessage;
					form.submit();
				}else{
					alert ("檢舉的理由必須填寫。");
				}
			}
			else
			{
				alert ("放棄檢舉");
			}
		}
	}



function LoadPage() 
{
 if (document.getElementById) document.getElementById('LoadMessage').style.visibility = 'hidden'; // ie5/ns6
 else if (document.layers ) document.hidepage.visibility = 'hidden'; // ns4
 else document.all.hidepage.style.visibility = 'hidden'; // ie4
}


function GoUrl(loc,s)
{
  var s_index = s.selectedIndex;
  var opts = s.options[s_index].value;
  if(opts)
  {
    var url = loc + opts;
    window.open(url, "_blank");
  }
}


function AddFriend(loginID){
	var url = "http://my.xuite.net/myFriendList/addFriend.jsp?fuid=" + loginID;
  var reorderWin = window.open( url , "新增好友", "width=450, height=450, status=no, scrollbars=no, resizable=no");
  if (reorderWin.opener == null) {
    reorderWin.opener = window;
  }
}

function ChangeLang(lang){

   var goURL;
   
    var curURL = window.top.location.href;
    var idx = curURL.indexOf("http%3A%2F%2F");
    if (idx < 0) {
            idx = curURL.indexOf("http://", "http://".length);
            if (idx < 0) {
                    idx = curURL.indexOf("/", "http://".length);
                    if (idx < 0) {
                            goURL = "/";
                    }
                    else {
                            goURL = curURL.substring(idx, curURL.length);
                    }
            }
            else {
                    idx += "http://".length;
                    var idx2 = curURL.indexOf("/", idx);
                    if (idx2 < 0) {
                            goURL = "/";
                    }
                    else {
                            goURL = curURL.substring(idx2, curURL.length);
                    }
            }
    }
    else {
            idx += "http%3A%2F%2F".length;
            var idx2 = curURL.indexOf("/", idx);
            if (idx2 < 0) {
                    goURL = "/";
            }
            else {
                    goURL = curURL.substring(idx2, curURL.length);
            }
    }
   
  if('TraditionalChinese' == lang)
   {
    goURL = 'http://b5.blog.xuite.net/http%3A%2F%2Fblog.xuite.net'+goURL;
   }
  else
   {
    goURL = 'http://gb.blog.xuite.net/http%3A%2F%2Fblog.xuite.net'+goURL;
   }
   window.location.href = goURL;
   
}

function AddRss(blogID){
			window.open('http://my.xuite.net/rssReader/quickSub.jsp?feedURL='+blogID,'_blank','height=615,width=520,status=no,toolbar=no,menubar=no,location=no','true');
}

function AddLoveBlog(){
	    window.open('http://my.xuite.net/bookmark/check.jsp?system=blog&favorite_address='+escape(document.URL)+'&favorite_title='+escape(document.title),'favorite','width=500,height=400,left=75,top=20,resizable=yes,scrollbars=yes,status=yes');
}

function mbr_init() {
		if(getCookie("otpw")==null)
		{
			mbrStr='<a href="http://blog.xuite.net/_members/login.php">登入</a>';
			document.write (mbrStr);
		}
		else
		{
			mbrStr='<a href="http://blog.xuite.net/_members/logout.php">登出</a>';
			document.write (mbrStr);
		}
}

function getCookie(name)
{
	var begin;
	var end;
	var cname=name+"=";
	var dc=document.cookie;
	if(dc.length>0)
	{
		begin=dc.indexOf(cname);
		if(begin!=-1)
		{
				begin+=cname.length;
				end=dc.indexOf(";",begin);
				if(end==-1)
				end=dc.length;
				return unescape(dc.substring(begin,end));
		}
	}
	return null;
}

<!-- 插入Head選單程式:Begin -->
// Detect if the browser is IE or not.
// If it is not IE, we assume that the browser is NS.
var IE = document.all?true:false

// If NS -- that is, !IE -- then set up for mouse capture
if (!IE) document.captureEvents(Event.MOUSEMOVE)

// Set-up to use getMouseXY function onMouseMove
document.onmousemove = getMouseXY;

// Main function to retrieve mouse x-y pos.s

function Point(x,y) {  this.x = x; this.y = y; }

var mLoc = new Point(-500,-500);

function getMouseXY(e) {
  if (IE) { // grab the x-y pos.s if browser is IE
    mLoc.x = event.clientX + document.body.scrollLeft
    mLoc.y = event.clientY + document.body.scrollTop
  } else {  // grab the x-y pos.s if browser is NS
    mLoc.x = e.pageX
    mLoc.y = e.pageY
  }  
  // catch possible negative values in NS4
  if (mLoc.x < 0){mLoc.x = 0}
  if (mLoc.y < 0){mLoc.y = 0}  
  // show the position values in the form named Show
  // in the text fields named MouseX and MouseY
  //document.Show.MouseX.value = mLoc.x;
  //document.Show.MouseY.value = mLoc.y;
  return true;
}

// Example: obj = findObj("image1");
function findObj(theObj, theDoc)
{
  var p, i, foundObj;
  
  if(!theDoc) theDoc = document;
  if( (p = theObj.indexOf("?")) > 0 && parent.frames.length)
  {
    theDoc = parent.frames[theObj.substring(p+1)].document;
    theObj = theObj.substring(0,p);
  }
  if(!(foundObj = theDoc[theObj]) && theDoc.all) foundObj = theDoc.all[theObj];
  for (i=0; !foundObj && i < theDoc.forms.length; i++) 
    foundObj = theDoc.forms[i][theObj];
  for(i=0; !foundObj && theDoc.layers && i < theDoc.layers.length; i++) 
    foundObj = findObj(theObj,theDoc.layers[i].document);
  if(!foundObj && document.getElementById) foundObj = document.getElementById(theObj);
  
  return foundObj;
}

// * Dependencies * 
// this function requires the following snippets:
// JavaScript/readable_MM_functions/findObj
//
// Accepts a variable number of arguments, in triplets as follows:
// arg 1: simple name of a layer object, such as "Layer1"
// arg 2: ignored (for backward compatibility)
// arg 3: 'hide' or 'show'
// repeat...
//
// Example: showHideLayers(Layer1,'','show',Layer2,'','hide');
var hitItem = null;
function showHideLayers()
{ 
  var i, visStr, obj, args = showHideLayers.arguments;
  for (i=0; i<(args.length-2); i+=3)
  {
    if ((obj = findObj(args[i])) != null)
    {
      visStr = args[i+2];
      if (obj.style)
      {
        obj = obj.style;
        if(visStr == 'show') {
          visStr = 'visible';
        } else if(visStr == 'hide') {
          visStr = 'hidden';
          hitItem = null;
        }
      }
      obj.visibility = visStr;
    }
  }
}

// * Dependencies * 
// this function requires the following snippets:
// JavaScript/readable_MM_functions/findObj
// JavaScript/readable_MM_functions/showHideLayers
// getMouseXY
function moveLayerToMouseLoc(theLayer, offsetH, offsetV)
{
  var obj;
  if ((findObj(theLayer))!=null)
  {
    //if (document.layers)  //NS
    if (!IE)  //NS
    {    	
      document.onMouseMove = getMouseXY;
      if (document.getElementById) 
      {
      	obj = document.getElementById(theLayer);
      	//var str = "";
				//for(var i in obj.style){
				//	str += i+": "+obj[i]+"<br>";
				//}
				
			  //obj.innerHTML = str;
			  obj.style.left = mLoc.x +offsetH;
			  obj.style.top = mLoc.y +offsetV;
      }
      else
      {
        obj = document.layers[theLayer];
              
        obj.left = mLoc.x +offsetH;
    	  obj.top  = mLoc.y +offsetV;
      }

      
    } 
    else if (document.all)//IE 
    {      
      getMouseXY();
      obj = document.all[theLayer].style;
      obj.pixelLeft = mLoc.x +offsetH;
      obj.pixelTop  = mLoc.y +offsetV;
    }
    showHideLayers(theLayer,'','show');
  }
}
function isOnMenu(){
  if (!IE){  //NS     	
      document.onMouseMove = getMouseXY;
  } else {
    getMouseXY();
  }
  
  var obj = findObj('xuiteMenu');
  mTop = parseInt(obj.style.top.substring(0, obj.style.top.indexOf('px')));
  mLeft = parseInt(obj.style.left.substring(0, obj.style.left.indexOf('px')));
  
  if ( (mLoc.y > (mTop+1)) && (mLoc.y < (mTop+90-1)) && (mLoc.x > (mLeft+1)) && (mLoc.x < (mLeft+75-1))) {
    return true;
  } else {
    return false;
  }
  
}
function showMenu(){  
  moveLayerToMouseLoc('xuiteMenu', -35, 10);
}

function menuOnMouseOut(){
  if (! isOnMenu()){
    showHideLayers('xuiteMenu', '', 'hide');
  }
}
function mItemOnMouseOver(item){
	item.style.backgroundColor = '#BBE5F0';	
}

function mItemOnMouseOut(item) {
  item.style.backgroundColor = '#ffffff';  
}

//讓IE可以用PNG

function correctPNG() 

{

for(var i=0; i<document.images.length; i++)

{

var img = document.images[i]

var imgName = img.src.toUpperCase()

if (imgName.substring(imgName.length-3, imgName.length) == "PNG")

{

var imgID = (img.id) ? "id='" + img.id + "' " : ""

var imgClass = (img.className) ? "class='" + img.className + "' " : ""

var imgTitle = (img.title) ? "title='" + img.title + "' " : "title='" + img.alt + "' "

var imgStyle = "display:inline-block;" + img.style.cssText 

if (img.align == "left") imgStyle = "float:left;" + imgStyle

if (img.align == "right") imgStyle = "float:right;" + imgStyle

if (img.parentElement.href) imgStyle = "cursor:hand;" + imgStyle

var strNewHTML = "<span " + imgID + imgClass + imgTitle

+ " style=\"" + "width:" + img.width + "px; height:" + img.height + "px;" + imgStyle + ";"

+ "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"

+ "(src=\'" + img.src + "\', sizingMethod='scale');\"></span>" 

img.outerHTML = strNewHTML

i = i-1

}

}

}

//讓IE可以用PNG END


//-->
