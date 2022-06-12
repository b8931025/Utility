/* 由CaseID取得一個案件的目前跑到哪個流程步驟,ex:040340958000428 */

/*Ap_Flow_Log記錄案件經過的每個流程，每一筆caseid的max(seq)就是現在正在跑的Step*/

select o.flowid,o.stepno
  from ap_flow_log o
 where o.caseid = '040340958000428'
   and o.seq = (select max(seq) from ap_flow_log where caseid = o.caseid);
--Result:Flowid='ENFlow_1'  ,StepNo='0400'
 
/* Ap_Flow_Map 流程定義檔 */   
   select * from ap_flow_map where flow_name='ENFlow_1' and step_no='0400';
--Result:Step_no='0400', Curr_Step='BrPreChk', Step_Name='分行授信初審'

/* FlowInfo 流程資訊定義檔 */
   select * from flowInfo where flowname='ENFlow_1';
