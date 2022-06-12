
SET STATISTICS IO, TIME ON; --在訊息視窗顯示sql執行時間

declare @t09_no varchar(90) = '202104201103';
select top 10 * from ext09_h where t09_no like @t09_no + '%';
select top 10 * from ext09 where t09_no like @t09_no  + '%'; 

--或是把sql全部，按右鍵選擇"顯示估計執行計劃"
