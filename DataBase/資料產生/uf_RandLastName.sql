if OBJECT_ID('[dbo].[uf_RandLastName]') is not null drop function [dbo].[uf_RandLastName];
GO

create function [dbo].[uf_RandLastName]() RETURNS nvarchar(1) 
as
/** �H�����o�ʮa�m���m�� **/
begin
declare @lastName nvarchar(200) = '�����]���P�d�G�������u�ý��H���������׳\��f�I�i�ձ��Y�ت��Q�������¹Q��f���u����Ĭ�︯�O�S�^���|�������]����\���K�h�Z�j�v��O�G�����p�P�ٴ����ù���q੦w�`�֤_�ɳť֤˻��d��E���R�U�s�����M�p����';
declare @idxRand int = dbo.uf_Rand()*len(RTrim(@lastName)) + 1;
--select len(RTrim(@lastName)) leng,SUBSTRING(@lastName,@idxRand,1) lastName;
return SUBSTRING(@lastName,@idxRand,1);
end 
GO


