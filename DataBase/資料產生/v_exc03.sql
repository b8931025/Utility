if OBJECT_ID('[dbo].[v_exc03]') is not null drop view [dbo].[v_exc03];
GO

create VIEW [dbo].[v_exc03] AS 
/*�üƪ�A�]function���L�k�ϥ�RAND�禡�A�G�إ߶üƪ�Өϥ�*/
SELECT RAND() AS Value
GO

