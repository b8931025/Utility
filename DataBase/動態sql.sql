declare @cmd varchar(max) = 'select system_user uName';
declare @cmd2 varchar(max) = ',(1+1) iCount;' ;
set @cmd = @cmd + @cmd2;
EXEC(@cmd);

--���U�����~�Ϊk
--EXEC(@cmd + @cmd2);


 