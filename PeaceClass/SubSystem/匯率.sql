select * from AP_DXCRT;
select * from AP_DATE_DEF where ap_ecn_id='050330958000649';

/*�qEn_CaseDetailCond��CaseID,LoanCurrType�a�X�YCaseID���ײv*/
select nvl(at.endeval, 1) curr
  from ap_date_def af
  left join ap_dxcrt at on at.yyyymmdd = af.ap_cur_date
 where af.ap_ecn_id = '050330958000649'  /*En_CaseDetailCond.CaseID*/
   and at.currtype = '01'/*En_CaseDetailCond.LoanCurrType*/;
