if OBJECT_ID('[dbo].[uf_RandCWord]') is not null drop function [dbo].[uf_RandCWord];
GO

create    FUNCTION [dbo].[uf_RandCWord] ()
RETURNS varchar(2) as 
/**�H�����ͱ`�Φr**/
--�`�Φ@8,766�r  ���`�Φ@12,437
--0xA140-0xA3BF ���I�Ÿ��B��þ�r���ίS��Ÿ�
--0xA440-0xC67E �`�κ~�r (42048-50814)
--0xC940-0xF9D5 ���`�κ~�r (51520-63957)
begin
	declare @codeBgn int = 42048;--�s�X�_
	declare @codeEnd int = 50814;--�s�X��
	declare @RandNum float ;
	declare @WordNum int ;
	declare @iCnt int = 0;
	declare @sOut varchar(2)='X' ;

	set @RandNum = dbo.uf_Rand(); 
	set @RandNum = @RandNum * 100000;
	set @RandNum = Abs(@RandNum - Round(@RandNum,0)); 
	set @WordNum = (@codeBgn-1) + @RandNum * (@codeEnd-@codeBgn);

	while @iCnt <= 50 begin
	   SELECT @sOut = cast(cast(@WordNum+(@iCnt*30) as varbinary(2)) as varchar(2));--10�i���त��  
	   if @sOut <> '?' begin --���O�ݸ��N���}�A�O�ݸ��N�A��U�@�Ӧr
		  break;
	   end
	   set @iCnt += 1;
	end 

	return @sOut;
end
GO


