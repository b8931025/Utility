if OBJECT_ID('[dbo].[uf_Rand2CWord]') is not null drop function [dbo].[uf_Rand2CWord];
GO

create function [dbo].[uf_Rand2CWord]() RETURNS nvarchar(2) 
as
/** �H�����o2�Ӥ���r **/
--'���������������������@�G�T�|�����C�K�E�Q���L�Ѹv��m�èh�B�ҤA���B���w�����ЬѤl���G�f���x�ȥ��Ө����谮�[�����_�S��I�եa�U�����D�G�G�f�I�����E�̭W���n�����Ͻު��������ߪ��γD�భ�����]�ϢТѢҢӢԢբ֢עآ٢ڢۢܢݢޢߢ��������';
begin
declare @cword nvarchar(200) = '���������������������@�G�T�|�����C�K�E�Q���L�Ѹv��m�èh�B�ҤA���B���w�����ЬѤl���G�f���x�ȥ��Ө�����ϢТѢҢӢԢբ֢עآ٢ڢۢܢݢޢߢ�����������������������������������������@�A�B�C';
declare @idxRandX int = dbo.uf_Rand()*len(RTrim(@cword)) + 1;
declare @idxRandY int = dbo.uf_Rand()*len(RTrim(@cword)) + 1;
--����r����  1~5:XX 6~10:X�J 11~15:�pX 16~20:��X 21~25:�Ѣ� 26~100:XY
declare @iType int = (dbo.uf_Rand() * 100) + 1;

if @iType <= 5 begin 
	return SUBSTRING(@cword,@idxRandX,1) + SUBSTRING(@cword,@idxRandX,1);
end if @iType <= 10 begin 
	return SUBSTRING(@cword,@idxRandX,1) + '�J';
end if @iType <= 15 begin 
	return '�p' + SUBSTRING(@cword,@idxRandX,1);
end if @iType <= 20 begin 
	return '��' + SUBSTRING(@cword,@idxRandX,1);
end if @iType <= 25 begin 
	return '��' + SUBSTRING(@cword,@idxRandX,1);
end

--21~100 XY
return SUBSTRING(@cword,@idxRandY,1) + SUBSTRING(@cword,@idxRandX,1);
end 
GO



