declare @yyymm varchar(90) = '10812';
--drop table #dt;
create table #dt (
[�ҸզW��] varchar(90)
,[���O] varchar(90)
,[1��]  int
,[2��]  int
,[3��]  int
,[4��]  int
,[5��]  int
,[6��]  int
,[7��]  int
,[8��]  int
,[9��]  int
,[10��] int
,[11��] int
,[12��] int
,[�Ǹ�] int
);
insert into #dt exec [dbo].[u_sp_r04] @yyymm;  --<<<   key point
select substring(@yyymm,1,3) [�~]
,substring([�ҸզW��],3,100) [�ҸզW��]
,[���O] 
,[1��]  
,[2��]  
,[3��]  
,[4��]  
,[5��]  
,[6��]  
,[7��]  
,[8��]  
,[9��]  
,[10��] 
,[11��] 
,[12��] 
,[�Ǹ�]  
from #dt;