if OBJECT_ID('[dbo].[uf_RandID]') is not null drop function [dbo].[uf_RandID];
GO

create   FUNCTION [dbo].[uf_RandID]() RETURNS varchar(10)
AS
/**************************************************
�H�����ͨ�����ID
**************************************************/
BEGIN
	declare @check int ;
	declare @Head char(1);
	declare @N1  int = floor(dbo.uf_Rand()*19)+1;--�Ĥ@�ӭ^��r��19�ءA�ҥH����1~19���ü�
	declare @N2  int = floor(dbo.uf_Rand()*2+1);--�ĤG�X�u��1�M2
	declare @N3  int = floor(dbo.uf_Rand()*10);
	declare @N4  int = floor(dbo.uf_Rand()*10);
	declare @N5  int = floor(dbo.uf_Rand()*10);
	declare @N6  int = floor(dbo.uf_Rand()*10);
	declare @N7  int = floor(dbo.uf_Rand()*10);
	declare @N8  int = floor(dbo.uf_Rand()*10);
	declare @N9  int = floor(dbo.uf_Rand()*10);
	declare @N10 int = 0;

	if @N1 = 1	 begin set @Head='A'; set @N1=	10 end else
	if @N1 = 2	 begin set @Head='B'; set @N1=	11 end else
	if @N1 = 3	 begin set @Head='C'; set @N1=	12 end else
	if @N1 = 4	 begin set @Head='D'; set @N1=	13 end else
	if @N1 = 5	 begin set @Head='E'; set @N1=	14 end else
	if @N1 = 6	 begin set @Head='F'; set @N1=	15 end else
	if @N1 = 7	 begin set @Head='G'; set @N1=	16 end else
	if @N1 = 8	 begin set @Head='H'; set @N1=	17 end else
	if @N1 = 9	 begin set @Head='J'; set @N1=	18 end else
	if @N1 = 10	 begin set @Head='K'; set @N1=	19 end else
	if @N1 = 11	 begin set @Head='M'; set @N1=	21 end else
	if @N1 = 12	 begin set @Head='N'; set @N1=	22 end else
	if @N1 = 13	 begin set @Head='P'; set @N1=	23 end else
	if @N1 = 14	 begin set @Head='Q'; set @N1=	24 end else
	if @N1 = 15	 begin set @Head='T'; set @N1=	27 end else
	if @N1 = 16	 begin set @Head='U'; set @N1=	28 end else
	if @N1 = 17	 begin set @Head='V'; set @N1=	29 end else
	if @N1 = 18	 begin set @Head='X'; set @N1=	30 end else
	if @N1 = 19	 begin set @Head='W'; set @N1=	32 end ;
	--select floor(@N1 / 10),floor(@N1 % 10),@N2,@N3,@N4,@N5,@N6,@N7,@N8,@N9,@N10;

	--1/9 �Ĥ@�X�^��r���N��Ʀr�Q��ƭ��H1�A�Ӧ�ƭ��H9
	set @check = (floor(@N1 / 10) * 1) + (floor(@N1 % 10) * 9);
	--�ĤG�X���H8
	set @check += @N2 * 8;
	--�ĤT�X���H7
	set @check += @N3 * 7;
	--�ĥ|�X���H6
	set @check += @N4 * 6;
	--�Ĥ��X���H5
	set @check += @N5 * 5;
	--�Ĥ��X���H4
	set @check += @N6 * 4;
	--�ĤC�X���H3
	set @check += @N7 * 3;
	--�ĤK�X���H2
	set @check += @N8 * 2;
	--�ĤE�X���H1
	set @check += @N9 * 1;
	--��10�X�M�e�����[�`�A�[�_�ӥ��ݬO10������
	set @N10=(10 - (@check % 10)) % 10;

	return @Head + cast(@N2 as char(1)) + cast(@N3 as char(1)) + cast(@N4 as char(1)) + cast(@N5 as char(1))
	 + cast(@N6 as char(1)) + cast(@N7 as char(1)) + cast(@N8 as char(1)) + cast(@N9 as char(1))
	  + cast(@N10 as char(1));
END

GO


