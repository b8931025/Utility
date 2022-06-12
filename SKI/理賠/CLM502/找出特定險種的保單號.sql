select p.ipolicy,p.iissu,o.iinsdisp from pubm_pn_main p
inner join pubm_pn_prem  o 
on p.oid = o.oid_pubm_pn_main and o.iinsdisp = '21' /*特定承保險種*/
where p.iinscls='I'
and p.dply_end > sysdate