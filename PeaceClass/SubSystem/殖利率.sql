SELECT T.CO_ID, 
       T.CO_NAME, 
       T.PROFIT, 
       M.PRICE,
      to_number( decode(M.PRICE,0,0,round((T.PROFIT/M.PRICE)*100,3))) result
  FROM STOCK T
  LEFT JOIN MARKETDAY M ON T.CO_ID = M.CO_ID order by result desc;


