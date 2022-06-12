if OBJECT_ID('[dbo].[uf_Rand]') is not null drop function [dbo].[uf_Rand];
GO

create function [dbo].[uf_Rand]() RETURNS float as
/** ²£¥Í¶Ã¼Æ **/
begin
   declare @f float = (select * from v_exc03);
   return @f;
end 
GO


