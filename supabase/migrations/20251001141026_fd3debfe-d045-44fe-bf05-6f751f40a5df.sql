-- Enable realtime for financial tables
-- This will allow automatic updates when data changes

-- Enable replica identity for realtime updates
ALTER TABLE aplicacoes_financeiras REPLICA IDENTITY FULL;
ALTER TABLE analises_financeiras REPLICA IDENTITY FULL;
ALTER TABLE extratos_bancarios REPLICA IDENTITY FULL;
ALTER TABLE prestacao_contas REPLICA IDENTITY FULL;
ALTER TABLE duvidas_sindico REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE aplicacoes_financeiras;
ALTER PUBLICATION supabase_realtime ADD TABLE analises_financeiras;
ALTER PUBLICATION supabase_realtime ADD TABLE extratos_bancarios;
ALTER PUBLICATION supabase_realtime ADD TABLE prestacao_contas;
ALTER PUBLICATION supabase_realtime ADD TABLE duvidas_sindico;