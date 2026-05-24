UPDATE economy 
SET 
  currency = printf('%.16f', CAST(currency AS REAL) * 0.0000000000000001),
  bank = printf('%.16f', CAST(bank AS REAL) * 0.0000000000000001)
WHERE CAST(currency AS NUMERIC) > 0 OR CAST(bank AS NUMERIC) > 0;
