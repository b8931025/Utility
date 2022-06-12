select a.oid,
       b.iclaim,
       b.iclaim_type,
       b.freject,
       a.ipolicy,
       a.nissue,
       a.tclaim,
       a.tacdent,
       a.nacdresn,
       Case b.fstl When '1' then 'Ωﬂ•I'
                   When '2' then '∞l¿v'
                   else ' ' End FSTL
  from clmm_cm_claim a
 right join clmm_cm_settle b
    on a.oid = b.iclaim_oid
 WHERE a.iinscls = 'F'
   /*AND b.ICLAIM like '0599FBF0001100'*/
   AND b.FSTL = '2'
   AND rownum <= '101'
 order by a.oid;
