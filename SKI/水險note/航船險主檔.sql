select a.*,b.*,c.* from pubt_pe_main a                  /*�D��*/
left join mart_pe_main b on b.oid_pubt_pe_main = a.oid  /*����I�D��*/
left join pubt_pe_main2 c on c.oid_pubt_pe_main = a.oid /*�~���D��*/
; 

select c.oid,a.oid_pubt_pe_main,d.nholder from PUBT_PE_ADDR a          /*�a�}����*/
left join Pubt_Pe_Area b on a.oid = b.oid_pubt_pe_addr           /*�a�}�ϩ���*/
left join pubt_pe_obj c on b.oid = c.oid_pubt_pe_area            /*�Ъ���*/
left join MART_PE_OBJ1 d on a.oid = d.oid_pubt_pe_obj            /*����I�Ъ���*/
where a.oid_pubt_pe_main=1000048210
;

select c.Mskf_Amt from pubt_pe_obj p
left join pubt_pe_prem a on p.oid = a.oid_pubt_pe_obj            /*�I��*/
left join mart_pe_deduct1 b on a.oid = b.oid_pubt_pe_prem        /*�ۭt�B*/
left join pubt_pe_prem2 c on p.oid = c.oid_pubt_pe_obj           /*�~���I��*/
where p.oid =1000063573
;

select * from cmnt_delete_num t; --�O���R��Log��
select * from PUBT_PE_CONTENT;   --������
select * from PUBT_PE_MEMO;
select * from PUBT_PE_RECV;      --������
select * from PUBT_PE_SHAR;      --�@�O����
select * from PUBT_PE_TERMID;    --���ڥN�X��
select * from PUBT_PE_PRT;
select * from PUBT_PE_TERMTXT;

