declare @cmd varchar(max) = 'select system_user uName';
declare @cmd2 varchar(max) = ',(1+1) iCount;' ;
set @cmd = @cmd + @cmd2;
EXEC(@cmd);

--底下為錯誤用法
--EXEC(@cmd + @cmd2);


 