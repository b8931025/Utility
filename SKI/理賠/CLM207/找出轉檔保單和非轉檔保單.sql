--���ɫO��A���z�߭p���A�òz�߫��٦����L��檺���
 select c.ipolicy,c.iclaim,c.iplyseq ,p.iplyseq,p.fep
 from clmm_cm_claim c,pubm_pn_main p 
 where c.ipolicy = p.ipolicy 
 and c.iinscls='F'
 and c.iplyseq <> p.iplyseq
 and p.fep = 'X'; /*FEP=X����  FEP=N�q�l�O��*/
