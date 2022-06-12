Declare @dt1 datetime = convert(datetime,'2019/01/01',111);
Declare @dt2 datetime = convert(datetime,'2019/01/03',111);
Declare @payno4 nvarchar(6) = N'3305';
EXEC dbo.u_sp_c0905 @data_dt_from=@dt1, @data_dt_To=@dt2, @payno4=@payno4;
