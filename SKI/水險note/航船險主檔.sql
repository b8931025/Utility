select a.*,b.*,c.* from pubt_pe_main a                  /*主檔*/
left join mart_pe_main b on b.oid_pubt_pe_main = a.oid  /*航船險主檔*/
left join pubt_pe_main2 c on c.oid_pubt_pe_main = a.oid /*外幣主檔*/
; 

select c.oid,a.oid_pubt_pe_main,d.nholder from PUBT_PE_ADDR a          /*地址明細*/
left join Pubt_Pe_Area b on a.oid = b.oid_pubt_pe_addr           /*地址區明細*/
left join pubt_pe_obj c on b.oid = c.oid_pubt_pe_area            /*標的物*/
left join MART_PE_OBJ1 d on a.oid = d.oid_pubt_pe_obj            /*航船險標的物*/
where a.oid_pubt_pe_main=1000048210
;

select c.Mskf_Amt from pubt_pe_obj p
left join pubt_pe_prem a on p.oid = a.oid_pubt_pe_obj            /*險種*/
left join mart_pe_deduct1 b on a.oid = b.oid_pubt_pe_prem        /*自負額*/
left join pubt_pe_prem2 c on p.oid = c.oid_pubt_pe_obj           /*外幣險種*/
where p.oid =1000063573
;

select * from cmnt_delete_num t; --保批單刪單Log檔
select * from PUBT_PE_CONTENT;   --附件檔
select * from PUBT_PE_MEMO;
select * from PUBT_PE_RECV;      --收據檔
select * from PUBT_PE_SHAR;      --共保明細
select * from PUBT_PE_TERMID;    --條款代碼檔
select * from PUBT_PE_PRT;
select * from PUBT_PE_TERMTXT;

