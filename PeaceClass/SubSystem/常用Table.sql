/*流程中每一工作步驟之流程細項資料*/
/*待處理工作就是從此撈出*/
select * from FlowStep where  caseid='041490979000011' for update;
/*流程案件主檔*/
select * from Flowincident;
/*記錄每個流程現在的流程代號，(不是讀這個)*/
select * from ap_flow_log_temp;
/*系統通知資料表*/
select * from NOTIFICATION where owner='S081714';
/*員工流程權限資料表*/
select staffid,count(staffid) cnt from FGRPMEMBER where staffid='S062285' group by staffid order by cnt desc;
/*左側列表清單*/
select * from function_code;
/*跑馬燈*/
select * from AP_Marquee;
/*台銀各分行資料*/
select * from branch;
/*用於記錄流程系統中所有使用者之基本資料*/
select * from USERINFO;

select * from authmember;
select * from authgroup;
select * from authitem;
select * from forminfo where flowname='TmpRpt_Flow';
