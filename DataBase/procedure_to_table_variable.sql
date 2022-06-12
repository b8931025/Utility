declare @yyymm varchar(90) = '10812';
--drop table #dt;
create table #dt (
[考試名稱] varchar(90)
,[等別] varchar(90)
,[1月]  int
,[2月]  int
,[3月]  int
,[4月]  int
,[5月]  int
,[6月]  int
,[7月]  int
,[8月]  int
,[9月]  int
,[10月] int
,[11月] int
,[12月] int
,[序號] int
);
insert into #dt exec [dbo].[u_sp_r04] @yyymm;  --<<<   key point
select substring(@yyymm,1,3) [年]
,substring([考試名稱],3,100) [考試名稱]
,[等別] 
,[1月]  
,[2月]  
,[3月]  
,[4月]  
,[5月]  
,[6月]  
,[7月]  
,[8月]  
,[9月]  
,[10月] 
,[11月] 
,[12月] 
,[序號]  
from #dt;