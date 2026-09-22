-- Same class of issue as V6: the JPA entity maps rating as a plain Java int, which
-- Hibernate expects as SQL INTEGER, not the original SMALLINT.
ALTER TABLE reviews ALTER COLUMN rating TYPE INTEGER;
