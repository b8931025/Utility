if OBJECT_ID('[dbo].[v_exc03]') is not null drop view [dbo].[v_exc03];
GO

create VIEW [dbo].[v_exc03] AS 
/*亂數表，因function中無法使用RAND函式，故建立亂數表來使用*/
SELECT RAND() AS Value
GO

