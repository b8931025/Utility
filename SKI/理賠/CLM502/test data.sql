select p.iissu,p.ipolicy,p.iinscls from pubm_pn_main p
where 1=1
and p.iinscls='I'
and p.dply_end > sysdate;

select p.iissu,p.ipolicy,p.iinscls from pubm_pn_main p
where 1=1
and p.iinscls='H'
and p.dply_end > sysdate;


