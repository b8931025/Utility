
SET STATISTICS IO, TIME ON; --�b�T���������sql����ɶ�

declare @t09_no varchar(90) = '202104201103';
select top 10 * from ext09_h where t09_no like @t09_no + '%';
select top 10 * from ext09 where t09_no like @t09_no  + '%'; 

--�άO��sql�����A���k����"��ܦ��p����p��"
