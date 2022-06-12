select x.iclaim from (   
 select c.iclaim,
 (select count(1) from pubm_pn_main mpn where mpn.ipolicy = c.ipolicy) as mpn,
 (select count(1) from pubm_ph_main mph where mph.ipolicy = c.ipolicy) as mph
   FROM clmm_cm_claim c
  WHERE iinscls = 'F'
     AND trunc(TCLAIM) >= TO_DATE('2010/09/01', 'YYYY/MM/DD')
     AND trunc(TCLAIM) <= TO_DATE('2010/09/30', 'YYYY/MM/DD')    
) x where x.mpn > 0 and x.mph > 0   ;

select IINSCLS,
       IINSKIND,
       ICLAIM,
       IPOLICY,
       IENDORS,
       IISSUE,
       NISSUE,
       IADJER,
       IPLYSEQ,
       IEDRSEQ,
       FRIAUD,
       FFLOW,
       TCLAIM,
       TACDENT,
       DECODE(FCLOSE, '0', '0:���M', '1:�w�M') AS FCLOSE
  FROM clmm_cm_claim c
 WHERE iinscls = 'F'
 /*���M/�w�M*/
   AND FCLOSE = '0'
 /*�߮׸�*/
   /*AND ICLAIM LIKE '0799FBF0000800'*/
 /*�߮פ��*/
   AND trunc(TCLAIM) >= TO_DATE('2010/09/01', 'YYYY/MM/DD')
   AND trunc(TCLAIM) <= TO_DATE('2010/09/30', 'YYYY/MM/DD')
   AND rownum <= '101' 
