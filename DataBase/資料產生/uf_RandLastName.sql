if OBJECT_ID('[dbo].[uf_RandLastName]') is not null drop function [dbo].[uf_RandLastName];
GO

create function [dbo].[uf_RandLastName]() RETURNS nvarchar(1) 
as
/** ÀH¾÷¨ú±o¦Ê®a©mªº©m¤ó **/
begin
declare @lastName nvarchar(200) = '»¯¿ú®]§õ©P§d¾G¤ý¶¾³¯»u½Ã½±¨HÁú·¨¦¶¯³¤×³\¦ó§f¬I±i¤Õ±äÄYµØª÷ÃQ³³«¸±­ÁÂ¹Q³ë¬f¤ôÄu³¹¶³Ä¬¼ï¸¯®O­S´^­¦¾|­³©÷°¨­]»ñªá¤è«\¥ô°K¬höZÀj¥v­ð¶O·G§ÂÁ§¹p¶P­Ù´ö¼ð®ïÃ¹²¦°qà©¦w±`¼Ö¤_®É³Å¥Ö¤Ë»ô±d¥î§E¤¸¤RÅU©s¥­¶À©M¿p¿½¤¨';
declare @idxRand int = dbo.uf_Rand()*len(RTrim(@lastName)) + 1;
--select len(RTrim(@lastName)) leng,SUBSTRING(@lastName,@idxRand,1) lastName;
return SUBSTRING(@lastName,@idxRand,1);
end 
GO


