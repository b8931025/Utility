/*
        '自留:FMODE=R 
        '中再:FMODE=C 
        'Q\S :FMODE=Q 
        '臨分:FTREATY=F
*/
SELECT SUM(NVL(F.PRI_SHARE,0))     
  FROM RINM_OSTD_SHARES F          
  where 1=1 
        AND FMODE = 'R'   
   AND FTREATY = 'T'
   AND IINSTYP =                   
  (SELECT DISTINCT IINSTYP         
   FROM RINM_OSTD_SHARES           
   WHERE ICLAIM = '1700CBC0000099'
     AND ROWNUM = 1)               
   AND ICLAIM = '1700CBC0000099'  
