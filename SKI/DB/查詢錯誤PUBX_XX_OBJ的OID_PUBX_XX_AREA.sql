select o.ipolicy,o.iareaseq,o.oid_pubm_pn_area as errorOID,a.oid as okOID
from pubm_pn_obj o
inner join pubm_pn_area a 
on o.ipolicy = a.ipolicy 
and o.iareaseq =a.iareaseq
and o.iadrseq = a.iadrseq
where 1=1
and o.iinscls = 'F'
and o.oid_pubm_pn_area <> a.oid
and substr(o.ipolicy,3,2)='02'


select o.iadrseq,o.iareaseq,o.oid_pubm_pn_area ERROR_OID,
(select oid from pubm_pn_area r 
where r.ipolicy = o.ipolicy 
and r.iplyseq = o.iplyseq 
and r.iedrseq = o.iedrseq
and r.iareaseq= o.iareaseq) right_oid
  from pubm_pn_obj o
 where 1=1
 and o.ipolicy = 
 (select x.ipolicy from pubm_pn_area x where oid=1000356153);
