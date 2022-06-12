--可查詢identify中是否有沒在用的空號
declare @SeqMax int;
declare @List varchar(max) = '';
declare @SeqInit int = 1;
declare @SeqFinish int = 100;--要取得幾個空號

select @SeqMax = max(m14_seq) from exm14;
select m14_seq seq into #seq_tmp from exm14 order by m14_seq asc;

WHILE (@SeqInit < @SeqMax and @SeqFinish <> 0)
BEGIN
   if (select seq from #seq_tmp where seq = @SeqInit) is null begin
       set @List = @List + cast(@SeqInit as varchar(10)) + ',';
	   set @SeqFinish = @SeqFinish - 1;
	   print @SeqInit;
   end

   set @SeqInit = @SeqInit + 1;
END;

--刪除暫存檔
drop table #seq_tmp;

select @List;

