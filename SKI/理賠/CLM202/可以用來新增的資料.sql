select p.*
  from pubm_pn_main p
  left join firm_pn_main f
    on f.oid_pubm_pn_main = p.oid
 where p.iinscls = 'F'
   and p.dply_bgn > to_date('20100101', 'yyyymmdd')
   and p.dply_end > to_date('20110304', 'yyyymmdd')
