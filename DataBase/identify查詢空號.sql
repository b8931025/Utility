--�i�d��identify���O�_���S�b�Ϊ��Ÿ�
declare @SeqMax int;
declare @List varchar(max) = '';
declare @SeqInit int = 1;
declare @SeqFinish int = 100;--�n���o�X�ӪŸ�

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

--�R���Ȧs��
drop table #seq_tmp;

select @List;

