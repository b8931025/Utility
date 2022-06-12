select count(*) from en_link_tab;
select count(*) from en_prog_ver;

select * from en_04_rpt_casemain where caseid='051490988000348';--for update;
select * from flowlog where caseid='051490988000348' ;--for update;
select * from ap_flow_log where caseid='051490988000348' ;--for update;
select * from flowincident  where caseid='041490988000348';--for update;
select * from flowstep where caseid='041490988000348';--for update;
select * from ap_flow_map where flow_name ='EN04HO095';
select * from en_link_tab t where t.step_no = '9720000.5' for update;
select * from forminfo where flowname='EN04HO095' and stepid='9720000.5';
select * from en_prog_ver where prog_no in 
('rep1209','rep1101','rep1101_02','BrList','rep1205','rep1206','rep1207','HO1208_02','HO1208_03','HO1208_04','HO1208_05','HO1210','rep1302','HO1600','99-3');
