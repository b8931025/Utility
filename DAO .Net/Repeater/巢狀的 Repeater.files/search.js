

var clicked=false;
var mruListCount=0;
var extraOp='';
function arrow_over(mousein){if(mousein){if(clicked){document.getElementById("arrowimg").src=arrowImage["hotup"];}else{document.getElementById("arrowimg").src=arrowImage["hotdown"];}}else{if(clicked){document.getElementById("arrowimg").src=arrowImage["up"];}else{document.getElementById("arrowimg").src=arrowImage["down"];}}}
function showOrHideSearchDetails(fromButton){if(document.getElementById("SearchDetails").style.display=="block"){document.getElementById("showhide").innerHTML=showoptions;if(fromButton){document.getElementById("arrowimg").src=arrowImage["hotdown"];}else{document.getElementById("arrowimg").src=arrowImage["down"];}document.getElementById("SearchDetails").style.display="none";clicked=false;}else{document.getElementById("showhide").innerHTML=hideoptions;if(fromButton){document.getElementById("arrowimg").src=arrowImage["hotup"];}else{document.getElementById("arrowimg").src=arrowImage["up"];}document.getElementById("SearchDetails").style.display="block";clicked=true;
 try{document.frmaSrch.mode.value="a"}catch(e){}}}function submitSimpleSearch(url,query){if(window.encodeURIComponent){query=encodeURIComponent(query);}else{query=OutputEncoder_EncodeUrl(query);}StatsDotNet.OptionCollectionId=SetLogCollectionBit(StatsDotNet.OptionCollectionId,33);document.location.href=url+query;}
function SubmitSearch(frm){
 if(frm.spidbox&&frm.spidbox.selectedIndex<mruListCount){logOptionId(34);}elem=document.frmaSrch.query;srch_setcookieval("lquery",UnicodeFixup(escape(elem.value.trim())));var pName="";prdelem=frm.spidbox;if(prdelem&&prdelem.options){var pvalue=prdelem.options[prdelem.selectedIndex].value;if(pvalue!=""&&pvalue!="global"&&pvalue!="myprod"){pName=" "+prdelem.options[prdelem.selectedIndex].text;srch_setcookieval("gssSPID",pvalue);}}if(frm.catalog!=null){for(s=0;s<frm.catalog.length;s++){if(frm.catalog.type!="select-one"){if(frm.catalog[s].checked){var msurl;var qry=frm.query.value+pName;qry=qry.trim();if(window.encodeURIComponent){qry=encodeURIComponent(qry);}else{qry=OutputEncoder_EncodeUrl(qry);}if(frm.catalog[s].value=='msc'){StatsDotNet.OptionCollectionId=SetLogCollectionBit(StatsDotNet.OptionCollectionId,33);msurl=mscomurl+qry;document.location.href=msurl;return false;}else if(frm.catalog[s].value=='msn'){StatsDotNet.OptionCollectionId=SetLogCollectionBit(StatsDotNet.OptionCollectionId,33);msurl=msnurl+qry;document.location.href=msurl;return false;}else{srch_setcookieval('adcatalog',escape(frm.catalog[s].value));}}}else{var catalogList=frm.catalog;if(catalogList&&catalogList.options){var pvalue=catalogList.options[catalogList.selectedIndex].value;if(pvalue!=""){srch_setcookieval('adcatalog',pvalue);}}}}}else{
 var catalogList=document.getElementById('catalog');if(catalogList&&catalogList.options){var pvalue=catalogList.options[catalogList.selectedIndex].value;if(pvalue!=""){srch_setcookieval('adcatalog',pvalue);}}}SaveSrchState();StatsDotNet.eventCollectionId=SetLogCollectionBit(StatsDotNet.eventCollectionId,7);PageSubmit=1;}function SaveSrchState(){if(PageSubmit=='1'){return;}var elem;
elem=document.frmaSrch.query;srch_setcookieval("lquery",UnicodeFixup(escape(elem.value.trim())));
elem=document.frmaSrch.catalog;
if(elem&&elem.length&&elem.type!="select-one"){SaveRadioState(elem,"catalog");}
elem=document.frmaSrch.res;SaveSelectState(elem,"res");var optcookie="";var optresource="";
if(document.getElementsByName){elem=document.getElementsByName("ast");for(i=0;i<elem.length;i++){var optrow=MS_GetEl(elem[i].value+"row");if(optrow&&(optrow.style.display=="block"||optrow.style.display=="")){if(elem[i].checked){optcookie+="ad"+elem[i].value+"=1|";optresource+=elem[i].value+",";}else{optcookie+="ad"+elem[i].value+"=0|";}}else{elem[i].value="";}}}if(optElems){options=optElems.split('|');if(options!=null){for(i=0;i<options.length;i++){elem=document.getElementById(options[i].toString());if(elem){var radioCatalog=document.getElementById(elem.attributes['_parentid'].value);if(radioCatalog.checked){if(elem.checked){optcookie+="ad"+options[i]+"=1|";optresource+=options[i]+",";}else{optcookie+="ad"+options[i]+"=0|";}}}}}}srch_setcookieval("adresource",optresource);srch_setcookieval("adopt",optcookie);}function InitSrch(){if(null==document.getElementById('catalog')){
 
 var el=document.createElement('span');el.innerHTML="<input type='hidden' id='catalog' name='catalog' />";var frm=document.getElementById('frmsrch');frm.appendChild(el);}
var el=document.getElementById('gsfx_bsrch_query');tval=fetchcookieval("lquery");if(tval!='blank'&&tval!=''){el.value=unescape(UnicodeFixup(tval.trim()));setKeyBit(el);}else{
 MS_AddEvent(el,"keypress",setKeyBit);MS_AddEvent(el,"paste",setKeyBit);}
 var div=document.getElementById('gsfx_bsrch_catsel');var cats=div.getElementsByTagName('a');tval=fetchcookieval("adcatalog");if(tval!='blank'&&tval!=null&&tval!=''){
 tval=unescape(tval);for(var i=0;i<cats.length;i++){if(cats[i].catalog==tval){cats[i].onclick();break;}}}else{
 for(var i=0;i<cats.length;i++){if(cats[i].className.trim()=='gsfx_bsrch_highlight'){document.getElementById('catalog').value=cats[i].attributes['catalog'].value;break;}}}}function SaveSimpleSearch(){StatsDotNet.eventCollectionId=SetLogCollectionBit(StatsDotNet.eventCollectionId,6);var f=document.getElementById('frmsrch');
var el=f.query;srch_setcookieval("lquery",UnicodeFixup(escape(el.value.trim())));}
function FillProductList(lcidprodlist,lcidmyprodlist,myprod){var elem=MS_GetEl("productfilter");if(elem){var producthtml='<select name="spid" id="spidbox" onchange="ProductChanged(this);">';if(myprod=='false'||myprod=='False'){if(extraOp&&extraOp!='')producthtml+=extraOp;if(lcidprodlist&&lcidprodlist!='')producthtml+=lcidprodlist;}else{if(lcidmyprodlist&&lcidmyprodlist!='')producthtml+=lcidmyprodlist;}producthtml+="</select>";elem.innerHTML=producthtml;}var prd=document.frmaSrch.spidbox;if(!prd){var advforms=document.forms["frmaSrch"];if(advforms.length>=2){InitSelect(advforms[1].spidbox,"SPID","gss");}}if(prd&&prd.options&&prd.options.length>0){InitSelect(prd,"SPID","gss");var value=prd.options[prd.selectedIndex].value
DisplayProductFilter(value);}}function InitASrch(){var el;var f=document.frmaSrch;var qstr=(queryString['query'])? queryString['query'] : '';if(qstr==''){
 el=f.query;
 if((el.value=="")&&(navigator.userAgent.indexOf("Netscape6")>0)){el.value=" ";el.value="";}var tval=fetchcookieval("lquery");if(tval!='blank'&&tval!=''){el.value=unescape(UnicodeFixup(tval.trim()));setKeyBit(el);}else{MS_AddEvent(el,"keypress",setKeyBit);MS_AddEvent(el,"paste",setKeyBit);}}
multicatalog=false;el=f.catalog;if(el!=null){if(el.length&&el.type!="select-one"){InitRadio(el,"catalog");multicatalog=true;}else{InitSelect(el,"catalog","ad");}var alreadyChecked=false;for(i=0;i<el.length;i++){if(el[i].checked){alreadyChecked=true;}}if(!alreadyChecked){el[0].checked=true;}}
InitSelect(f.res,"res","ad");
var optcookie=new OptionCookie();if(document.getElementsByName){el=document.getElementsByName("ast");for(j=0;j<el.length;j++){tval=optcookie["ad"+el[j].value];if(tval&&tval!='blank'&&tval!=''){if(tval=='0')el[j].checked=false;else el[j].checked=true;}}}if(optElems){opt=optElems.split('|');for(j=0;j<opt.length;j++){el=document.getElementById(opt[j].toString());if(el){el._prevvalue=null;tval=optcookie["ad"+opt[j]];if(tval&&tval!='blank'&&tval!=''){if(tval=='0')el.checked=false;else el.checked=true;}}}}}function InitSelect(elem,name,prefix,isScanned){if(elem!=null){tval=fetchcookieval(prefix+name);if(name=="SPID"){if(tval=='blank'||tval=='')tval="global";}if(tval!='blank'&&tval!=''){for(i=0;i<elem.options.length;i++){if(elem.options[i].value==unescape(tval)){elem.selectedIndex=i;break;}}}}}
function ProductChanged(elem){var value=elem.options[elem.selectedIndex].value;DisplayProductFilter(value);if(value.indexOf("more_")>-1){var url="/selectindex/default.aspx?target=search&sreg="+value.substr(5)+"&adv=1";var fr=queryString['fr'];if(fr==null)
 fr=queryString['FR'];if(fr=='1')
 url+='&fr=1';document.location.href=url;}}
function SelectRadio(elem,tval){if(tval!='blank'&&tval!=''){for(i=0;i<elem.length;i++){if(elem[i].value==unescape(tval)){elem[i].checked=true;elem[i].click();break;}}}}
function GetSelectedValue(elem){for(i=0;i<elem.length;i++){if(elem[i].checked){return escape(elem[i].value);}}return '';}
function InitRadioEx(elem,name){tval=fetchcookieval("ad"+name);if(tval!='blank'&&tval!=''){for(i=0;i<elem.length;i++){if(elem[i].value==unescape(tval)){if(!elem[i].disabled){elem[i].checked=true;elem[i].click();break;}}}}}var personalizelink='';
function EnableSrchOptions(enable){if(enable){enableAll(document.getElementById('divResourceItems'));document.getElementById('res').disabled=false;}else{disableAll(document.getElementById('divResourceItems'));document.getElementById('res').disabled=true;}}
function disableAll(elem){if(elem==null||elem=='undefined'||elem.tagName==null||elem.tagName=='undefined')
 return;elem.disabled=true;for(var i=0;i<elem.childNodes.length;i++){disableAll(elem.childNodes[i]);}}
function enableAll(elem){if(elem==null||elem=='undefined'||elem.tagName==null||elem.tagName=='undefined')
 return;elem.disabled=false;for(var i=0;i<elem.childNodes.length;i++){enableAll(elem.childNodes[i]);}}
function SearchLiveCatalog(frm,catalog){if(catalog==1)
 StatsDotNet.OptionCollectionId=SetLogCollectionBit(StatsDotNet.OptionCollectionId,53);if(catalog==2)
 StatsDotNet.OptionCollectionId=SetLogCollectionBit(StatsDotNet.OptionCollectionId,54);document.getElementById('lsc').value=catalog;if(catalog==2){
 var catalogList=document.getElementById('catalog');if(catalogList&&catalogList.options){var pvalue=catalogList.options[catalogList.selectedIndex].value;if(pvalue!=""){srch_setcookieval('adcatalog',pvalue);}}var msurl,qry;var elem=document.frmaSrch.query;qry=document.frmaSrch.query.value;qry=qry.trim();if(window.encodeURIComponent){qry=encodeURIComponent(qry);}else{qry=OutputEncoder_EncodeUrl(qry);}msurl=msnurl+qry;document.location.href=msurl;return false;}SubmitSearch(frm);document.frmaSrch.submit();}
function ddlCatalog_change(ddlCatalog,acEnabled){var changeCatalogSel=false;var divVisibleCatalog=null;for(var i=0;i<ddlCatalog.length;i++){var lcid=ddlCatalog[i].value.substring(5);var div=document.getElementById('div'+lcid);if(div!=null){if(ddlCatalog.value==ddlCatalog[i].value){divVisibleCatalog=div;div.style.display='block';var inputs=div.getElementsByTagName('input');for(var j=0;j<inputs.length;j++){if(inputs[j].type=='checkbox'){if(inputs[j]._prevvalue!=null)
 inputs[j].checked=(inputs[j]._prevvalue=='true');}}}else{var inputs=div.getElementsByTagName('input');for(var j=0;j<inputs.length;j++){if(inputs[j].type=='radio'){if(inputs[j].checked)
 changeCatalogSel=true;}else if((inputs[j].type=='checkbox')&&(div.style.display=='block')){
 
 inputs[j]._prevvalue=(inputs[j].checked ? 'true' : 'false');inputs[j].checked=false;}}div.style.display='none';}}}if(acEnabled){
 changeLcidForSelect(ddlCatalog,'query',ddlCatalog.value,ddlCatalog.selectedIndex+'');}if((divVisibleCatalog!=null)&&changeCatalogSel){
 var radio=divVisibleCatalog.getElementsByTagName('input')[0];radio.checked=true;radio.onclick();}}function gsfx_bsrch_changeCatSelection(e,catValue){var catcon=document.getElementById('gsfx_bsrch_catsel');for(var i=0;i<catcon.childNodes.length;i++){var el=catcon.childNodes[i];if(el.tagName){el.className=el.className.replace(/( ?|^)gsfx_bsrch_highlight\b/gi,'');if(el==e){el.className+=' gsfx_bsrch_highlight';}}}srch_setcookieval('adcatalog',escape(catValue));document.getElementById('catalog').value=catValue;}function selectDropDownItem(ddl,value,func){for(var ii=0;ii<ddl.length;ii++){if(ddl[ii].value==value){ddl[ii].selected=true;if(func!=null)
 func(ddl);return ii;}}return -1;}
function CatalogOption_click(src,scopeLCID,enableScopeOptions){try{DisplayScopeOptions('adv',scopeLCID);EnableSrchOptions(enableScopeOptions);
 var catalogOptions=document.getElementsByTagName('input');for(var i=0;i<catalogOptions.length;i++){var parentid=catalogOptions[i].attributes["_parentid"];
 if((parentid!=null)&&(parentid!='undefined')&&(parentid!='')){if(parentid.value==src.id){
 catalogOptions[i].disabled=false;var hrefs=catalogOptions[i].parentNode.getElementsByTagName('a');for(var index=0;index<hrefs.length;index++)
 enable_link(hrefs[index]);}else{
 catalogOptions[i].disabled=true;var hrefs=catalogOptions[i].parentNode.getElementsByTagName('a');for(var index=0;index<hrefs.length;index++)
 disable_link(hrefs[index]);}}}}catch(e){}}function DisplayScopeOptions(mode,lcid){if(mode=="adv"){var cat=document.frmaSrch.catalog;var selected=0;for(i=0;i<cat.length;i++){if(cat[i].checked){selected=i;break;}}var exclude=cat[selected].getAttribute("exclude");if(optElems){var x=optElems.split('|');for(i=0;i<x.length;i++){var optionrow=MS_GetEl(x[i]+"row");if(optionrow){optionrow.style.display="block";}}}if(exclude!=null&&exclude!='undefined'){x=exclude.split('|');for(i=0;i<x.length;i++){var optionrow=MS_GetEl(x[i]+"row");if(optionrow){optionrow.style.display="none";}}}}if((lcid!='')&&(lcid!=null)){FillProductList(lcid,null,'false');}
 var show=false;var divs=document.getElementById('divResourceItems').getElementsByTagName('div');for(i=0;i<divs.length;i++){if('none'!=divs[i].style.display){show=true;break;}}document.getElementById('divresources').style.display=(show ? 'block' : 'none');}

function disable_link(elem){if((elem.style.visibility=='visible')||(elem.style.visibility=='')){var span=document.createElement('span');span.name="span_placeholder";span.innerHTML=elem.innerHTML;span.style.color="gray";elem.parentNode.insertBefore(span,elem);elem.style.visibility='hidden';}}function enable_link(elem){if(elem.style.visibility=='hidden'){var spans=elem.parentNode.getElementsByTagName('span');for(var i=0;i<spans.length;i++)
 if(spans[i].name='span_placeholder')
 elem.parentNode.removeChild(spans[i]);elem.style.visibility='visible';}}function SaveRadioState(elem,name){for(i=0;i<elem.length;i++){if(elem[i].checked){srch_setcookieval('ad'+name,escape(elem[i].value));}}}function SaveSelectState(elem,name){if(elem&&elem.options){srch_setcookieval('ad'+name,escape(elem.options[elem.selectedIndex].value));}}
function DisplayProductFilter(value){var prdcol=MS_GetEl("pwtcol");var prdcol1=MS_GetEl("pwtcol1");var prdimg=MS_GetEl("pwtimg");if(prdcol&&prdcol1&&prdimg){if(value==""||value=="global"){prdcol.style.display="none";prdcol1.style.display="none";prdimg.style.display="none";}else{if(prdcol.style.display!="block"&&prdcol.style.display!=""){prdcol.style.display="";prdcol1.style.display="";prdimg.style.display="";}}}
var elem=document.getElementById('spidbox');document.getElementById('topbarvalue').innerHTML=elem[elem.selectedIndex].innerHTML;}