/*
 WebSnapr - Preview Bubble Javascript
 Written by Juan Xavier Larrea 
 http://www.websnapr.com - xavier@websnapr.com   
 */
var xuite_mouse_x = 0;
var xuite_mouse_y = 0;
$(document).ready(function(){
        $().mousemove(function(e){
                xuite_mouse_x= e.pageX;
                xuite_mouse_y= e.pageY;
        }); 
})
if (xuite_preview_jsonp == undefined) {

        var xuite_preview_jsonp = '0.1';

        function xuite_preview_jsonp_enabler(url)
        {                
                url = url + '&rnd=' +new Date().getTime().toString();      
                var myScript = document.createElement("script");        
                myScript.setAttribute("src",url);
                myScript.setAttribute("type","text/javascript");                
                document.getElementsByTagName("body")[0].appendChild(myScript);
        }
}
// DO NOT EDIT BENEATH THIS
if(typeof Array.prototype.push!="function"){
        Array.prototype.push=ArrayPush;
        function ArrayPush(_1){
                this[this.length]=_1;
        }
}
function mmmm(xx){
        console.log('xxxx');
        var str = '';
        for( mm in xx) 
                str += mm+ "=" + xx[mm] + "\n";
        console.log(str);
}
function bindBubbles(e){
        $("a.previewlink").each(function(){
                $(this).mouseover(function(_b){
                        detachBubble();

                        var _c;
                        if(_b["srcElement"]){
                                _c=_b["srcElement"];
                        }else{
                                _c=_b["target"];
                        }
                        if( $.browser.msie ){
                                if( _c.tagName == 'IMG' )
                                        _c = _c.parentNode;
                        }
                        if (_c.href == undefined){
                                _c=_c.parentNode;
                        }
                        var link = _c.id;
                        var _d=_c.href;

                        var _d=_c.href;

                        var _10=document.createElement("div");
                        _10.id="myPreviewBubble";
                        document.getElementsByTagName("body")[0].appendChild(_10);
                        _10.className="previewbubble";
                        if ($.browser.msie) {
                                _10.style.width="240px";
                                _10.style.position="absolute";
                                _10.style.top=xuite_mouse_y;
                                _10.style.zIndex=99999;
                                _10.style.left=xuite_mouse_x;
                                _10.style.textAlign="left";
                                _10.style.height="190px";
                                _10.style.paddingTop="0";
                                _10.style.paddingLeft="0";
                                _10.style.paddingBottom="0";
                                _10.style.paddingRight="0";
                                _10.style.marginTop="0";
                                _10.style.marginLeft="0";
                                _10.style.marginBottom="0";
                                _10.style.marginRight="0";
                        } else {
                                _10.setAttribute("style","text-align: center; z-index: 99999; position: absolute; top: "+xuite_mouse_y+"px ; left: "+xuite_mouse_x+"px ; width: 240px; height: 190px; padding: 0; margin: 0;");
                        }
                        if ( $.browser.msie ) {
                                var _height = xuite_mouse_y;
                        }
                        xuite_preview_jsonp_enabler(link);
                });
        });
}

function assignBubbleData(json){
        var tmpBubble = document.getElementById('myPreviewBubble');
        if(tmpBubble != null)
        tmpBubble.innerHTML = json['data'];
        $(".personaltitle").click(function(e){
                detachBubble(); 
        });
}

function detachBubble(){
        var xuite_mouse_x = 0
        var xuite_mouse_y = 0
        $("div.previewbubble").each(function(){
                $(this).remove();
        });
}
if(window.addEventListener){
        addEventListener("load",bindBubbles,false);
}else{
        attachEvent("onload",bindBubbles);
}
