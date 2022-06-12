--列出所有trigger和相依的table
SELECT t.name AS TableName, tr.name AS TriggerName  ,tr.is_disabled isDisabled 
FROM sys.triggers tr
INNER JOIN sys.tables t ON t.object_id = tr.parent_id
WHERE t.name in ('exm01')
and tr.is_disabled = 0;


--停用table上的trigger
disable trigger Trig_m01_u on dbo.exm01;

--啟用table上的trigger
Enable trigger Trig_m01_u on dbo.exm01;


--============停用整批trigger===============
declare @stateOnOff as varchar(7) = 'enable';--disable or enable
declare @tblName as varchar(100),@trgName as varchar(100),@tmpSql as varchar(300);
declare crs cursor for  SELECT t.name , tr.name 
FROM sys.triggers tr
INNER JOIN sys.tables t ON t.object_id = tr.parent_id
WHERE t.name = 'exm01';

open crs 
fetch next from crs into @tblName ,@trgName
while(@@fetch_status != -1)
begin
    set @tmpSql = @stateOnOff + ' trigger ' + @trgName + ' on ' + @tblName + ';';
	exec(@tmpSql);
    fetch next from crs into @tblName ,@trgName
end
close crs        --關閉Cursor
deallocate crs;  --移除Cursor

commit
--============停用整批trigger===============