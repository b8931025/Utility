USE [EXM_2020]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

DROP FUNCTION [dbo].[uf_indexMakeWord]
GO

CREATE FUNCTION [dbo].[uf_indexMakeWord] (@OriWord	VARChar(max))
RETURNS INT
AS
/**************************************************
1. 程式描述：取得字串中難字index，如果沒有難字則回傳0，用來判斷是否有難字
**************************************************/
BEGIN
	DECLARE	@IndexWord		INT,	-- 
			@IndexResult	INT,  	-- 
			@WLength		INT,  	-- 
			@WInt			INT     --

	-- 取得字串長度
	SET @WLength = len(@OriWord)
	-- 索引起始值
	SET @IndexWord = 1
	-- 難字索引起始值
	SET @IndexResult = 0

	WHILE @IndexWord <= @WLength
	BEGIN
		set @WInt = cast(CAST(substring(@OriWord,@IndexWord,1) AS varbinary ) as int)

		IF @WInt >= 33088 and @WInt <= 41214 
		BEGIN
			set @IndexResult = @IndexWord
			BREAK
		END 
		ELSE IF @WInt >= 50849 and @WInt <= 51454 
		BEGIN
			set @IndexResult = @IndexWord
			BREAK
		END 
		ELSE IF @WInt >= 63958 and @WInt <= 65278 
		BEGIN
			set @IndexResult = @IndexWord
			BREAK
		END 

		set @IndexWord = @IndexWord + 1;
	END		
	
	RETURN @IndexResult
END


  
commit
 