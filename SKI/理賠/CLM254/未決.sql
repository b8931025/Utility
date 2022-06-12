--期初未決
 select a.IINSKIND29, sum(NVL(a.MAPP,0)) FSum1 
 from CLMM_CM_APPHIST a
 WHERE a.ICLAIM= '0099FBF0033200' 
AND a.DAPP < TO_DATE('2011/01/01','YYYY/MM/DD')
 /*AND a.IINSKIND29  = '" & dr("iinskind29").ToString & "'*/
 GROUP BY a.IINSKIND29;
 
--期初未決自留
 select ICLAIM,sum(NVL(b.mret,0)) as MRET,count(b.OID) as ChkRIN 
 From CLMM_CM_APPHIST_RIN b
 WHERE b.ICLAIM= '0099FBF0033200' 
 AND b.DAPP < TO_DATE('2011/01/01','YYYY/MM/DD')
 GROUP BY b.ICLAIM ;
 
--期末未決
 select a.IINSKIND29, sum(NVL(a.MAPP,0)) FSum1 
 from CLMM_CM_APPHIST a
 WHERE a.ICLAIM= '0099FBF0033200' 
AND trunc(a.DAPP) <= TO_DATE('2011/03/31','YYYY/MM/DD')
 /*AND a.IINSKIND29  = '" & dr("iinskind29").ToString & "'*/
 GROUP BY a.IINSKIND29 ;
 
--期末未決自留
 select ICLAIM,sum(NVL(b.mret,0)) as MRET,count(b.OID) as ChkRIN 
 From CLMM_CM_APPHIST_RIN b
 WHERE b.ICLAIM= '0099FBF0033200' 
 AND trunc(b.DAPP) <= TO_DATE('2011/03/31','YYYY/MM/DD')
 GROUP BY b.ICLAIM  ;
