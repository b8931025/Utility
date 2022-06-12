/* Mojolingo */
var d2d_oldHost;

function d2d_11D1_OldUrl( host ) {
 var curURL = window.top.location.href;
 var curURL2 = "";
 var prefix1 = "/http%3A%2F%2F/";
 var prefix2 = "/m2m-0000/";
 var prefix3 = "gb."+ host + "/";
 var prefix4 = "b5."+ host + "/";
 var idx = curURL.indexOf(prefix1);
 if (idx >= 0) {
  idx += prefix1.length;
  return curURL.substring(idx, curURL.length);  }  idx = curURL.indexOf(prefix2);  if (idx >= 0) {
  idx += prefix2.length;
  return curURL.substring(idx, curURL.length);  }  idx=curURL.indexOf(prefix3);  if (idx >= 0) {  idx += prefix3.length;  curURL =  host + "/" + curURL.substring(idx, curURL.length);  return curURL;  }  idx=curURL.indexOf(prefix4);  if(idx >= 0){  idx += prefix4.length;  curURL =  host + "/" + curURL.substring(idx, curURL.length);  return curURL;  }

 return curURL.substring("http://".length, curURL.length); }

function d2d_11D1_b5gb( ToChar ) {
         var oldurl = "";
         var host = "blog.xuite.net";
         var d2d_oldUrl = d2d_11D1_OldUrl( host  );
         var gw_table=new Array();

         gw_table[1]="b5." + host;
         gw_table[2]="gb." + host;

        if (ToChar == -1)
            oldurl = "http"+"://" + d2d_oldUrl;
        else {
            var idx1 = d2d_oldUrl.indexOf( host );
            if (idx1 < 0) {
              oldurl = "http"+"://" + gw_table[ToChar] + "/m2m-0000/" + d2d_oldUrl;
            } else {         
              // still buggy
              oldurl = "http"+"://" + gw_table[ToChar] + "/m2m-0000/" + host +"/" + d2d_oldUrl.substring( host.length+1, d2d_oldUrl.length);
            }
       }
       if (d2d_oldHost == null)
            window.open(oldurl, "_self");
       else
            window.oldopen(oldurl, "_self");
       
}
