UPDATE economy 
SET 
  currency = currency * 1.0e-16,
  bank = bank * 1.0e-16
WHERE currency > 0 OR bank > 0;
