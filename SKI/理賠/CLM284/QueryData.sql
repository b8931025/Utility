SELECT DISTINCT A.OID AS ICLAIM_OID,
                A.ICLAIM,
                A.IPOLICY,
                A.IPLYSEQ,
                A.IACDRESN,
                A.NACDRESN,
                A.TACDENT,
                A.TCLAIM,
                A.FCLOSE,
                A.INOTARY,
                A.IACDRESN,
                A.NACDRESN,
                A.TACDENT,
                A.TCLAIM,
                A.FCLOSE,
                B.OID AS SETTLE_OID,
                NVL(B.ICLAIM_TYPE, 0) AS ICLAIM_TYPE,
                B.DVOUCH,
                NVL2(B.DVOUCH, 1, 0) AS SETTLE_CLOSE,
                C.IPROCESS,
                B.FSTL,
                B.FSETTLE
  FROM CLMM_CM_CLAIM A
  LEFT JOIN CLMM_FI_CLAIM C
    ON A.OID = C.CLMM_CM_CLAIM_OID
   AND A.ICLAIM = C.ICLAIM
   AND A.IINSCLS = 'F'
  LEFT JOIN CLMM_CM_SETTLE B
    ON A.OID = B.ICLAIM_OID
   AND b.dvouch IS NOT NULL
   AND B.DVOUCH <= TO_DATE('2010/12/31', 'YYYY/MM/DD')/*迄日*/
 WHERE 'CLM284000_085001' = 'CLM284000_085001'
   AND A.IINSCLS = 'F'
   AND A.TACDENT BETWEEN TO_DATE('2010/01/01', 'YYYY/MM/DD') /*起日*/
   AND TO_DATE('2010/12/31', 'YYYY/MM/DD') /*迄日*/
     
