﻿MS_AddEvent(window,"load",addIE6PNGFilter);function addIE6PNGFilter(){var node=document.getElementsByTagName('div');for(var i=0;i<node.length;i++){if(node[i].className.match('gsfx_div_png')&&node[i].hotimg&&node[i].srcimg){MS_AddEvent(node[i],"mouseover",PngFilterMouseOver);MS_AddEvent(node[i],"mouseout",PngFilterMouseOut);}}var nodeinput=document.getElementsByTagName('input');for(var i=0;i<nodeinput.length;i++){if(nodeinput[i].className.match('gsfx_div_png')&&nodeinput[i].hotimg&&nodeinput[i].srcimg){MS_AddEvent(nodeinput[i],"mouseover",PngFilterMouseOver);MS_AddEvent(nodeinput[i],"mouseout",PngFilterMouseOut);}}}function PngFilterMouseOver(e){var el=srcEl(e);el.style['filter']="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+el.hotimg+"', sizingMethod='"+el.sizeMethod+"')";}function PngFilterMouseOut(e){var el=srcEl(e);el.style['filter']="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+el.srcimg+"', sizingMethod='"+el.sizeMethod+"')";}