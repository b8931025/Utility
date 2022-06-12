select a.TABLE_NAME,a.COLUMN_NAME 
,a.DATA_TYPE + case when a.CHARACTER_MAXIMUM_LENGTH is null then '' else '(' + case a.CHARACTER_MAXIMUM_LENGTH when -1 then 'max' else cast(a.CHARACTER_MAXIMUM_LENGTH as varchar) end + ')' end DATA_TYPE
,case when a.IS_NULLABLE = 'YES' then 'Y' else 'N' end IS_NULL
,(select case count(1) when 1 then 'Y' else '' end from INFORMATION_SCHEMA.KEY_COLUMN_USAGE x
where x.TABLE_NAME = a.TABLE_NAME and x.COLUMN_NAME = a.COLUMN_NAME) PK
from INFORMATION_SCHEMA.COLUMNS a
where a.TABLE_NAME in ('exc41','exc42','exc43')
order by a.TABLE_NAME,a.ORDINAL_POSITION  asc;

 