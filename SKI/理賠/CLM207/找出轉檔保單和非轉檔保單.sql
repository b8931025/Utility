--轉檔保單，有理賠計錄，並理賠後還有做過批單的資料
 select c.ipolicy,c.iclaim,c.iplyseq ,p.iplyseq,p.fep
 from clmm_cm_claim c,pubm_pn_main p 
 where c.ipolicy = p.ipolicy 
 and c.iinscls='F'
 and c.iplyseq <> p.iplyseq
 and p.fep = 'X'; /*FEP=X轉檔  FEP=N電子保單*/
