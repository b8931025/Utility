select max(char_length)
from all_tab_cols
where 1=1
and virtual_column='NO'
and (data_type = 'NVARCHAR2' 
or data_type = 'VARCHAR2' 
or data_type = 'CHAR')
and owner ='SKERP_DB'
and table_name = 'PUBM_PN_MAIN'


