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
1. �{���y�z�G���o�r�ꤤ���rindex�A�p�G�S�����r�h�^��0�A�ΨӧP�_�O�_�����r
**************************************************/
BEGIN
	DECLARE	@IndexWord		INT,	-- 
			@IndexResult	INT,  	-- 
			@WLength		INT,  	-- 
			@WInt			INT     --

	-- ���o�r�����
	SET @WLength = len(@OriWord)
	-- ���ް_�l��
	SET @IndexWord = 1
	-- ���r���ް_�l��
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
 