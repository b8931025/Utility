/* ��CaseID���o�@�Ӯץ󪺥ثe�]����Ӭy�{�B�J,ex:040340958000428 */

/*Ap_Flow_Log�O���ץ�g�L���C�Ӭy�{�A�C�@��caseid��max(seq)�N�O�{�b���b�]��Step*/

select o.flowid,o.stepno
  from ap_flow_log o
 where o.caseid = '040340958000428'
   and o.seq = (select max(seq) from ap_flow_log where caseid = o.caseid);
--Result:Flowid='ENFlow_1'  ,StepNo='0400'
 
/* Ap_Flow_Map �y�{�w�q�� */   
   select * from ap_flow_map where flow_name='ENFlow_1' and step_no='0400';
--Result:Step_no='0400', Curr_Step='BrPreChk', Step_Name='����«H��f'

/* FlowInfo �y�{��T�w�q�� */
   select * from flowInfo where flowname='ENFlow_1';
