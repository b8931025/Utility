/*當一案件被放入案件宁例，由群組多人選取時，FlowStep.Owner就會有一個群組代號
  該群組就是對應到FGRPMember中的GroupID
  如：CaseID : 040140968000202,是由
*/
select caseid,stepid,label,owner,client from flowstep where caseid='040140968000202';
select * from fgrpmember where groupid ='704103';
