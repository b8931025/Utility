//mouseover --> mouseenter;
//mouseout  --> mouseleave;
function ie_css_fix(foo)
{
	foo.runtimeStyle.behavior="none";
	if(window.navigator.userAgent.indexOf("MSIE XP")<0)
	{
		foo.onmouseenter = ie_css_mouseenter;	
		foo.onmouseleave = ie_css_mouseleave;
	}	
}

function ie_css_mouseenter()
{
	this.all.tags("span")[0].className="block";
	return false;
}

function ie_css_mouseleave()
{
	this.all.tags("span")[0].className="";
	return false;
}// JavaScript Document
