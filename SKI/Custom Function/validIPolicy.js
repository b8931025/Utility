
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
							Format = "" + Format;//�ϥΪ̦��i���J�r��榡�M�Ʀr�榡�A�ҥH�@�ߧ⥦�ܦ��r��
							Format = Format.replace(/^\s+|\s+$/g,"");
							if ((Format.match(/^\d+$/) != null)&&(Format.length > 0)&&(Format.length <= 3)){
								head = parseInt(Format.substr(0,1),10);
								mid  = parseInt(Format.substr(1,1),10);
								tail = parseInt(Format.substr(2),10);
								//alert("head=" + head + " mid=" + mid + " tail=" + tail);
							}else{return "Format�榡���~";}
						}
		
						if ((IINSKIND != undefined)&&(IINSKIND != null)){
							if (IINSKIND.length > mid)return "�ˮ֨禡��IINSKIND�L���I";
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
						
						//�ˮ֪��׬O�_�ŦX
						total = head + midBefore + mid + tail;
						if (IPolicy.length != total)return "�п�J" + total + "�X�O�渹";

						//�ˮ�IINSKIND���]�w
						if (midBefore > 0){
							if (IPolicy.substr(head,midBefore) != IINSKIND){
								return "�O�渹�榡���~�I�I�إ��ݬO[" + IINSKIND + "]" ;
								}							
						}
		
						if (IPolicy.match(regex)==null)return "�O�渹�榡���~�I";
						return "";
				  
				  }
				catch(err){return err.description;}	
			}		

