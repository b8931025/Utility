/*�y�{���C�@�u�@�B�J���y�{�Ӷ����*/
/*�ݳB�z�u�@�N�O�q�����X*/
select * from FlowStep where  caseid='041490979000011' for update;
/*�y�{�ץ�D��*/
select * from Flowincident;
/*�O���C�Ӭy�{�{�b���y�{�N���A(���OŪ�o��)*/
select * from ap_flow_log_temp;
/*�t�γq����ƪ�*/
select * from NOTIFICATION where owner='S081714';
/*���u�y�{�v����ƪ�*/
select staffid,count(staffid) cnt from FGRPMEMBER where staffid='S062285' group by staffid order by cnt desc;
/*�����C��M��*/
select * from function_code;
/*�]���O*/
select * from AP_Marquee;
/*�x�ȦU������*/
select * from branch;
/*�Ω�O���y�{�t�Τ��Ҧ��ϥΪ̤��򥻸��*/
select * from USERINFO;

select * from authmember;
select * from authgroup;
select * from authitem;
select * from forminfo where flowname='TmpRpt_Flow';
