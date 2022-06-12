   declare @m12_no varchar(90) = '1101001110602k_1';
   declare @memo varchar(90) = '';
   declare @Status varchar(90) = '';
   declare @ip varchar(90) = '';
   declare @unit varchar(90) = '';

   --用if exists
   if exists (select * from exh12 with (updlock) where m12_no = @m12_no) begin
        update exh12 set m12_memo = @memo, m12_status=@Status where m12_no = @m12_no
   end
   else begin
	    insert into exh12 (m12_user_unit,m12_user_name,m12_otime,m12_no,m12_ip,m12_status,m12_memo)　
	    values ('司法院',dbo.AESEncrypt(@unit),getdate(),@m12_no,@ip,@Status,@memo)
   end


	--另一種寫法@@rowcount
   update exh12 set m12_status = '1' where m12_no = @m12_no;

   if @@rowcount = 0 begin
      insert into exh12 (m12_no,m12_user_unit) values (@m12_no,'');
   end