/* FORMATTED ON 2012/09/12 09:12 (FORMATTER PLUS V4.8.7) */
SELECT O1.IOFFICER AS O1_IOFFICER,
       OFF_NAME(O1.IOFFICER || '00') AS O1_NAME /*科長*/,
       O2.IOFFICER AS O2_IOFFICER,
       OFF_NAME(O2.IOFFICER || '00') AS O2_NAME /*經理*/,
       MM.*
  FROM (SELECT M.IEMPCRE,
               OFF_NAME(M.IEMPCRE || '00') AS M_NAME/*k打單人員*/,
               M.OID,
               M.MSKT_PRM,
               M.DPLYISSU,
               M.NISSU,
               M.IOFFICER,
               M.IPOLICY,
               M.IENDORS,
               M.IINSKIND,
               M.IPLYSEQ,
               M.IINSCLS,
               OFF_UNIT(M.IEMPCRE || '00') AS OFFBRCH,
               OFF_DEPT(M.IEMPCRE || '00') AS OFFUNIT,
               OFF_SUBJ(M.IEMPCRE || '00') AS OFFSUBJ
          FROM PUBT_PE_MAIN M, PSNV_OFFICER_ALL B
         WHERE ('DailyCheck' = 'DailyCheck')
           AND M.IINSCLS = 'F'
           AND M.IEMPCRE = B.IOFFICER
           AND M.DPLYISSU BETWEEN TO_DATE('2012/08/12', 'YYYY/MM/DD') AND
               TO_DATE('2012/09/11', 'YYYY/MM/DD')
           AND M.FCLOSE = 'N'
           AND (M.FRIAUD IS NULL OR M.FRIAUD = 'Y')
           AND (M.FAUDIT IS NULL OR M.FAUDIT = 'Y')
           AND ((LENGTH(M.IPOLICY) = '14' AND M.IPLYSEQ = 0) OR
               (LENGTH(M.IENDORS) = '14' AND M.IPLYSEQ > 0))) MM
 INNER JOIN PSNV_ORG O1
    ON MM.OFFBRCH = O1.UNITNO
   AND MM.OFFUNIT = O1.DEPTNO
   AND MM.OFFSUBJ = O1.SUBJNO
   AND O1.KORG IN ('3', '4')
 INNER JOIN PSNV_ORG O2
    ON MM.OFFBRCH = O2.UNITNO
   AND MM.OFFUNIT = O2.DEPTNO
   AND O2.KORG = '2'
 ORDER BY MM.OFFBRCH, MM.IPOLICY
