SELECT COLUMN_NAME,DATA_TYPE,IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
WHERE 1=1 
AND TABLE_NAME = 'exm01' 
--AND  COLUMN_NAME = 'SchoolInfoID'
order by ORDINAL_POSITION;

--property
SELECT 'public ' + case DATA_TYPE when 'int' then 'int' when 'datetime' then 'DateTime' else 'String' end + ' ' + COLUMN_NAME + ' { get; set; }'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'exm01' 
order by ORDINAL_POSITION;

--get
SELECT 'if (idx == ' + CAST((ORDINAL_POSITION-1) AS varchar(2)) + ') {return this.' + COLUMN_NAME + ';}'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'exm01' 
order by ORDINAL_POSITION;

--set
SELECT 'if (idx == ' + CAST((ORDINAL_POSITION-1) AS varchar(2)) + '){ this.' + COLUMN_NAME + 
case DATA_TYPE when 'int' then ' = int.Parse(value.ToString())' when 'datetime' then ' = DateTime.Parse(value.ToString())'  else ' = value.ToString()' end  + '; return; }'
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'exm01' 
order by ORDINAL_POSITION;

--insert 
SELECT COLUMN_NAME + ',','@' + COLUMN_NAME + ','
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'exm01' 
order by ORDINAL_POSITION; 
