select * from (
select ROW_NUMBER() over (order by dbo.AESDecrypt(m01_id)) RowNo,dbo.AESDecrypt(m01_id) m01_id,m01_cerw,m01_cerno
from exm01 where m01_cerw = '(106)¤½¤É©x' 
) t where t.RowNo between 1 and 10;


select ROW_NUMBER() over (order by dbo.AESDecrypt(m01_id)) RowNo,dbo.AESDecrypt(m01_id) m01_id,m01_cerw,m01_cerno
from exm01 where m01_cerw = '(106)¤½¤É©x' 
order by dbo.AESDecrypt(m01_id) asc 
offset 10 row fetch next 10 row only;

