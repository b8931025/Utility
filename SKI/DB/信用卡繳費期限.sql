select c.dauthdate+a.qlimit/*ú�O����*/
from pubm_pn_cred c
inner join Aoip_Taishincard a 
on a.crd_no = substr(c.inum,1,6)
where c.ipolicy='0504FFP6Z00005';
