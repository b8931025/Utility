select p.ipolicy,p.iissu,o.iinsdisp from pubm_pn_main p
inner join pubm_pn_prem  o 
on p.oid = o.oid_pubm_pn_main and o.iinsdisp = '21' /*�S�w�ӫO�I��*/
where p.iinscls='I'
and p.dply_end > sysdate