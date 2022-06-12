if OBJECT_ID('[dbo].[uf_RandCWord]') is not null drop function [dbo].[uf_RandCWord];
GO

create    FUNCTION [dbo].[uf_RandCWord] ()
RETURNS varchar(2) as 
/**隨機產生常用字**/
--常用共8,766字  次常用共12,437
--0xA140-0xA3BF 標點符號、希臘字母及特殊符號
--0xA440-0xC67E 常用漢字 (42048-50814)
--0xC940-0xF9D5 次常用漢字 (51520-63957)
begin
	declare @codeBgn int = 42048;--編碼起
	declare @codeEnd int = 50814;--編碼迄
	declare @RandNum float ;
	declare @WordNum int ;
	declare @iCnt int = 0;
	declare @sOut varchar(2)='X' ;

	set @RandNum = dbo.uf_Rand(); 
	set @RandNum = @RandNum * 100000;
	set @RandNum = Abs(@RandNum - Round(@RandNum,0)); 
	set @WordNum = (@codeBgn-1) + @RandNum * (@codeEnd-@codeBgn);

	while @iCnt <= 50 begin
	   SELECT @sOut = cast(cast(@WordNum+(@iCnt*30) as varbinary(2)) as varchar(2));--10進位轉中文  
	   if @sOut <> '?' begin --不是問號就離開，是問號就再找下一個字
		  break;
	   end
	   set @iCnt += 1;
	end 

	return @sOut;
end
GO


