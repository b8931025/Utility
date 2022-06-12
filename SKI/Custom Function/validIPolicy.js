
			function validIPolicy(sender, args){
				var IPolicy = args.Value.replace(/^\s+|\s+$/g,"");
				var error = "" + isIPolicy(IPolicy);
				args.IsValid = (error.length <= 0 );
				sender.errormessage = error;
			}

			function isIPolicy(IPolicy,IINSKIND,Format){
				var head = 4;
				var midBefore = 0;
				var mid  = 3;
				var tail = 7;
				var total;
				var regex;

				try
				  {
						if ((Format != undefined)&&(Format != null)){
							Format = "" + Format;//使用者有可能輸入字串格式和數字格式，所以一律把它變成字串
							Format = Format.replace(/^\s+|\s+$/g,"");
							if ((Format.match(/^\d+$/) != null)&&(Format.length > 0)&&(Format.length <= 3)){
								head = parseInt(Format.substr(0,1),10);
								mid  = parseInt(Format.substr(1,1),10);
								tail = parseInt(Format.substr(2),10);
								//alert("head=" + head + " mid=" + mid + " tail=" + tail);
							}else{return "Format格式錯誤";}
						}
		
						if ((IINSKIND != undefined)&&(IINSKIND != null)){
							if (IINSKIND.length > mid)return "檢核函式中IINSKIND過長！";
							midBefore = IINSKIND.length;
							mid -= midBefore;
		
							if (mid == 0){
								regex = new RegExp("^\\d{" + head + "}" + IINSKIND + "\\d{" + tail + "}$");
							}else{
								regex = new RegExp("^\\d{" + head + "}" + IINSKIND + "[A-Z0-9]{" + mid + "}\\d{" + tail + "}$");
							}
						}else{
							regex = new RegExp("^\\d{" + head + "}[A-Z0-9]{" + mid + "}\\d{" + tail + "}$");
						}
						
						//檢核長度是否符合
						total = head + midBefore + mid + tail;
						if (IPolicy.length != total)return "請輸入" + total + "碼保單號";

						//檢核IINSKIND的設定
						if (midBefore > 0){
							if (IPolicy.substr(head,midBefore) != IINSKIND){
								return "保單號格式錯誤！險種必需是[" + IINSKIND + "]" ;
								}							
						}
		
						if (IPolicy.match(regex)==null)return "保單號格式錯誤！";
						return "";
				  
				  }
				catch(err){return err.description;}	
			}		

