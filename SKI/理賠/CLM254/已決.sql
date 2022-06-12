--期初已決
SELECT t2.iinskind29
     ,SUM (NVL(t2.mstl,0)+NVL(t2.MNOTARY,0)+NVL(t2.MFEE,0)) fsum1
              FROM clmm_cm_settle t1
        INNER JOIN clmm_cm_stldtl t2 ON t1.OID = t2.settle_oid
 WHERE t1.iclaim ='0099FBF0033200'
AND t1.dvouch < TO_DATE ('2011/01/01', 'YYYY/MM/DD')
 AND t1.fsettle IN ('0', '1', '2')
/* AND t2.IINSKIND29  = '" & dr("iinskind29").ToString & "'*/
          GROUP BY t2.iinskind29;
          
--期初已決自留
SELECT t1.ICLAIM 
		 ,sum(nvl(t3.mret,0)) AS mret,count(t3.OID) as ChkRIN
              FROM clmm_cm_settle t1
			  LEFT join clmm_cm_stldtl_rin t3 ON t1.iclaim = t3.iclaim and t1.ICLAIM_TYPE = t3.ICLAIM_TYPE 
 WHERE t1.iclaim ='0099FBF0033200'
AND t1.dvouch < TO_DATE ('2011/01/01', 'YYYY/MM/DD')
               AND t1.fsettle IN ('0', '1', '2')
          GROUP BY t1.ICLAIM;
          
--期未已決
SELECT t2.iinskind29
		 ,SUM (NVL(t2.mstl,0)+NVL(t2.MNOTARY,0)+NVL(t2.MFEE,0)) fsum1
              FROM clmm_cm_settle t1
			  INNER JOIN clmm_cm_stldtl t2 ON t1.OID = t2.settle_oid
 WHERE t1.iclaim ='0099FBF0033200'
AND trunc(t1.dvouch) <= TO_DATE ('2011/03/31', 'YYYY/MM/DD')
 AND t1.fsettle IN ('0', '1', '2')
/* AND t2.IINSKIND29  = '" & dr("iinskind29").ToString & "'*/
          GROUP BY t2.iinskind29;  
          
--期末已決自留
SELECT t1.ICLAIM 
		 ,sum(nvl(t3.mret,0)) AS mret,count(t3.OID) as ChkRIN
              FROM clmm_cm_settle t1
			  LEFT join clmm_cm_stldtl_rin t3 ON t1.iclaim = t3.iclaim and t1.ICLAIM_TYPE = t3.ICLAIM_TYPE 
 WHERE t1.iclaim ='0099FBF0033200'
AND trunc(t1.dvouch) <= TO_DATE ('2011/03/31', 'YYYY/MM/DD')
               AND t1.fsettle IN ('0', '1', '2')
          GROUP BY t1.ICLAIM     ;             
