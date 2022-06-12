select * from pubt_pn_main         where oid = 1000658071;
select * from PUBt_pn_SHAR         where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_CONTENT      where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_RECV         where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_TERMID       where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_TERMTXT      where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_MEMO         where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_RCHG         where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_PRT          where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_CRED         where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_OBJ          where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_PREM         where oid_pubt_pn_main = 1000658071;
select * from FIRt_pn_MAIN         where oid_pubt_pn_main = 1000658071;
select * from FIRt_pn_OBJ          where oid_pubt_pn_main = 1000658071;
select * from FIRt_pn_INSTYPE      where oid_pubt_pn_main = 1000658071;
select * from FIRt_pn_DEDUCT       where oid_pubt_pn_main = 1000658071;
select * from FIRt_pn_FLT          where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_ADDR         where oid_pubt_pn_main = 1000658071;
select * from PUBt_pn_AREA         where oid_pubt_pn_main = 1000658071;
select * from HASt_pn_ISSU         where oid_pubt_pn_main = 1000658071;
select * from HASt_pn_BENE         where oid_pubt_pn_main = 1000658071;

/*
SELECT COUNT(*),'PUBT_PN_MAIN   ' AS TNAME  FROM PUBT_PN_MAIN         WHERE OID = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_SHAR   ' AS TNAME  FROM PUBT_PN_SHAR         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_CONTENT' AS TNAME  FROM PUBT_PN_CONTENT      WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_RECV   ' AS TNAME  FROM PUBT_PN_RECV         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_TERMID ' AS TNAME  FROM PUBT_PN_TERMID       WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_TERMTXT' AS TNAME  FROM PUBT_PN_TERMTXT      WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_MEMO   ' AS TNAME  FROM PUBT_PN_MEMO         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_RCHG   ' AS TNAME  FROM PUBT_PN_RCHG         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_PRT    ' AS TNAME  FROM PUBT_PN_PRT          WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_CRED   ' AS TNAME  FROM PUBT_PN_CRED         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_OBJ    ' AS TNAME  FROM PUBT_PN_OBJ          WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_PREM   ' AS TNAME  FROM PUBT_PN_PREM         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'FIRT_PN_MAIN   ' AS TNAME  FROM FIRT_PN_MAIN         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'FIRT_PN_OBJ    ' AS TNAME  FROM FIRT_PN_OBJ          WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'FIRT_PN_INSTYPE' AS TNAME  FROM FIRT_PN_INSTYPE      WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'FIRT_PN_DEDUCT ' AS TNAME  FROM FIRT_PN_DEDUCT       WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'FIRT_PN_FLT    ' AS TNAME  FROM FIRT_PN_FLT          WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_ADDR   ' AS TNAME  FROM PUBT_PN_ADDR         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'PUBT_PN_AREA   ' AS TNAME  FROM PUBT_PN_AREA         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'HAST_PN_ISSU   ' AS TNAME  FROM HAST_PN_ISSU         WHERE OID_PUBT_PN_MAIN = 1000658071 union 
SELECT COUNT(*),'HAST_PN_BENE   ' AS TNAME  FROM HAST_PN_BENE         WHERE OID_PUBT_PN_MAIN = 1000658071 ; 

*/

/*
delete pubt_pn_main         where oid = 1000022283;
delete PUBt_pn_SHAR         where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_CONTENT      where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_RECV         where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_TERMID       where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_TERMTXT      where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_MEMO         where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_RCHG         where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_PRT          where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_CRED         where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_OBJ          where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_PREM         where oid_pubt_pn_main = 1000022283;
delete FIRt_pn_MAIN         where oid_pubt_pn_main = 1000022283;
delete FIRt_pn_OBJ          where oid_pubt_pn_main = 1000022283;
delete FIRt_pn_INSTYPE      where oid_pubt_pn_main = 1000022283;
delete FIRt_pn_DEDUCT       where oid_pubt_pn_main = 1000022283;
delete FIRt_pn_FLT          where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_ADDR         where oid_pubt_pn_main = 1000022283;
delete PUBt_pn_AREA         where oid_pubt_pn_main = 1000022283;
delete HASt_pn_ISSU         where oid_pubt_pn_main = 1000022283;
delete HASt_pn_BENE         where oid_pubt_pn_main = 1000022283;
*/