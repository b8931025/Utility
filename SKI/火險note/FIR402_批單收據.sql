--住宅
Service:
bsFIR402000Print
報表:
/FIRReport/FIR402000_Main

--商業
Service:
bsFIR402000MA1
報表:(第一張)
/FIRReport/FIR402000MA1_Main
報表:(第一張以後)
/FIRReport/FIR402000MA1_Main1

--條碼
--住宅
SELECT DISTINCT A.IPOLICY,
                A.IPLYSEQ,
                A.IEDRSEQ,
                A.IENDORS
  FROM PUBT_PE_MAIN A, PSNV_ORG_INFO B, PUBT_PE_RECV R
 WHERE 1 = 1
   AND A.oid = R.oid_pubt_pe_main
   AND A.FCLOSE <> 'Y'
   AND A.IEDRSEQ = 0
   AND B.KORG = '1'
   AND B.IUNITNO = A.IISSBRCH
   AND A.IPLYSEQ > 0
   AND A.IINSKIND = 'FR'
   AND A.DPLYISSU = TO_DATE('2010/12/01', 'YYYY/MM/DD')
   AND R.frecv = '0'
UNION ALL
SELECT DISTINCT A.IPOLICY,
                A.IPLYSEQ,
                A.IEDRSEQ,
                A.IENDORS
  FROM PUBM_PE_MAIN A, PSNV_ORG_INFO B, PUBM_PE_RECV R
 WHERE 1 = 1
   AND A.oid = R.oid_pubM_pe_main
   AND A.IEDRSEQ = 0
   AND B.KORG = '1'
   AND B.IUNITNO = A.IISSBRCH
   AND A.IPLYSEQ > 0
   AND A.IINSKIND = 'FR'
   AND A.DPLYISSU = TO_DATE('2010/12/01', 'YYYY/MM/DD')
   AND R.frecv = '0';
--商業
SELECT DISTINCT A.IPOLICY,
                A.IPLYSEQ,
                A.IEDRSEQ,
                A.IENDORS
  FROM PUBT_PE_MAIN A, PSNV_ORG_INFO B, PUBT_PE_RECV R
 WHERE 1 = 1
   AND A.oid = R.oid_pubt_pe_main
   AND A.FCLOSE <> 'Y'
   AND A.IEDRSEQ = 0
   AND B.KORG = '1'
   AND B.IUNITNO = A.IISSBRCH
   AND A.IPLYSEQ > 0
   AND A.IINSKIND = 'FC'
   AND A.DPLYISSU = TO_DATE('2010/12/01', 'YYYY/MM/DD')
   AND R.frecv = '0'
UNION ALL
SELECT DISTINCT A.IPOLICY,
                A.IPLYSEQ,
                A.IEDRSEQ,
                A.IENDORS
  FROM PUBM_PE_MAIN A, PSNV_ORG_INFO B, PUBM_PE_RECV R
 WHERE 1 = 1
   AND A.oid = R.oid_pubM_pe_main
   AND A.IEDRSEQ = 0
   AND B.KORG = '1'
   AND B.IUNITNO = A.IISSBRCH
   AND A.IPLYSEQ > 0
   AND A.IINSKIND = 'FC'
   AND A.DPLYISSU = TO_DATE('2010/12/01', 'YYYY/MM/DD')
   AND R.frecv = '0';
   
--商業批單
SELECT DISTINCT m.OID,
                m.IINSCLS,
                m.IPOLICY,
                m.IPLYSEQ,
                'T' AS TABLEKIND,
                m.NISSU,
                m.IENDORS,
                m.AISSU,
                m.DEDR_BGN,
                m.DEDR_END,
                m.MTOT_AMT,
                m.MTOT_PRM,
                m.DPLYISSU,
                m.IISSBRCH,
                m.IISSU,
                m.IISSU_ZIP,
                m.MSKT_PRM,
                m.IBANK,
                NBANK,
                m.NISSU_TEL,
                m.DPLY_BGN,
                m.DPLY_END,
                m.FEP,
                m.QPLYPRT1,
                m.QPLYPRT2,
                nvl(f.QPLYEAR, 0) as QPLYEAR,
                m.FCOINS,
                m.QRMK1
  FROM PUBT_PE_MAIN m, FIRT_PE_MAIN f
 WHERE 1 = 1
   AND m.OID = f.OID_PUBT_PE_MAIN
   AND m.FCLOSE = 'N'
   and m.IINSKIND = 'FC'
   AND m.IINSCLS = 'F'
   AND m.IPLYSEQ > 0
/*   AND m.IENDORS >= '0099FXP0000767'
   AND m.IENDORS <= '0099FXP0000767'*/
UNION ALL
SELECT DISTINCT m.OID,
                m.IINSCLS,
                m.IPOLICY,
                m.IPLYSEQ,
                'M' AS TABLEKIND,
                m.NISSU,
                m.IENDORS,
                m.AISSU,
                m.DEDR_BGN,
                m.DEDR_END,
                m.MTOT_AMT,
                m.MTOT_PRM,
                m.DPLYISSU,
                m.IISSBRCH,
                m.IISSU,
                m.IISSU_ZIP,
                m.MSKT_PRM,
                m.IBANK,
                NBANK,
                m.NISSU_TEL,
                m.DPLY_BGN,
                m.DPLY_END,
                m.FEP,
                m.QPLYPRT1,
                m.QPLYPRT2,
                nvl(f.QPLYEAR, 0) as QPLYEAR,
                m.FCOINS,
                m.QRMK1
  FROM PUBM_PE_MAIN m, FIRM_PE_MAIN f
 WHERE 1 = 1
   AND m.OID = f.OID_PUBM_PE_MAIN
   AND m.IINSKIND = 'FC'
   AND m.IINSCLS = 'F'
   AND m.IPLYSEQ > 0;
/*   AND m.IENDORS >= '0099FXP0000767'
   AND m.IENDORS <= '0099FXP0000767'*/   

   
