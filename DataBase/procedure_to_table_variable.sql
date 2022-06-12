declare @yyymm varchar(90) = '10812';
--drop table #dt;
create table #dt (
[┮먼쫁붙] varchar(90)
,[데쬜] varchar(90)
,[1ㅻ]  int
,[2ㅻ]  int
,[3ㅻ]  int
,[4ㅻ]  int
,[5ㅻ]  int
,[6ㅻ]  int
,[7ㅻ]  int
,[8ㅻ]  int
,[9ㅻ]  int
,[10ㅻ] int
,[11ㅻ] int
,[12ㅻ] int
,[㎸많] int
);
insert into #dt exec [dbo].[u_sp_r04] @yyymm;  --<<<   key point
select substring(@yyymm,1,3) [�~]
,substring([┮먼쫁붙],3,100) [┮먼쫁붙]
,[데쬜] 
,[1ㅻ]  
,[2ㅻ]  
,[3ㅻ]  
,[4ㅻ]  
,[5ㅻ]  
,[6ㅻ]  
,[7ㅻ]  
,[8ㅻ]  
,[9ㅻ]  
,[10ㅻ] 
,[11ㅻ] 
,[12ㅻ] 
,[㎸많]  
from #dt;