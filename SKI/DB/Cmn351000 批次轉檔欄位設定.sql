SELECT * FROM cmnp_trn_format WHERE icode = '&CODENAME' ;
--BRK336F_IM
SELECT * FROM cmnp_trn_tbl 
WHERE oid_cmnp_trn_format= (select oid FROM cmnp_trn_format WHERE icode = '&CODENAME'  ) 
ORDER BY qseq ;

SELECT d.*,d.rowid FROM cmnp_trn_dtl d 
WHERE oid_cmnp_trn_format= (select oid FROM cmnp_trn_format WHERE icode = '&CODENAME'  ) 
ORDER BY qseq, qrow_cnt, qseq_c ;


insert into cmnp_trn_dtl (oid,oid_cmnp_trn_format,qseq,qrow_cnt,qseq_c,ncolumn,qline,qstart,qend,nalign,if_type ) 
values (seq_cmnp_trn_dtl.nextval,(SELECT oid FROM cmnp_trn_format WHERE icode = '&CODENAME'),1,1,3,'2',1,9,10,'R',1);


