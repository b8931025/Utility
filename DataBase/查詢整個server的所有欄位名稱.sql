
declare @colName varchar(100) = 'm01_id';--���w�n�d�ߪ����W��
declare @pattern varchar(300) = 'select TABLE_CATALOG,TABLE_NAME,COLUMN_NAME 
from {0}.INFORMATION_SCHEMA.COLUMNS where COLUMN_NAME=''{1}'' ';
declare @result varchar(max),@sqlcmd varchar(max);

set @pattern = replace(@pattern,'{1}',@colName);

declare crs cursor for 
select replace(@pattern,'{0}',name) sqlCmd from master.sys.databases 
where owner_sid <> 1 ;--�ư�master�������t��schema

open crs 
fetch next from crs into @sqlcmd
while(@@fetch_status != -1)
begin
--�N�Ҧ�schema���d��column�����O��_��
    if @result is not null begin 
	   set @result = @result + char(13) + 'union' + char(13) + @sqlcmd;
	end
	else begin 
	   set @result = @sqlcmd;
	end
    fetch next from crs into @sqlcmd
end
close crs        --����Cursor
deallocate crs;  --����Cursor

exec(@result);
--print @result;



