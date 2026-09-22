-- The JPA entity maps day_of_week as a plain Java int, which Hibernate expects as SQL
-- INTEGER. The original SMALLINT column caused a schema-validation failure at startup;
-- INTEGER is fine for a value that only ever ranges 1-7.
ALTER TABLE business_hours ALTER COLUMN day_of_week TYPE INTEGER;
