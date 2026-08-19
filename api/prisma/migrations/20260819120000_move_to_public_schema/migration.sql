-- Move tables from desafio schema to public schema
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'desafio') THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'tipo_prioridade') THEN
            ALTER TABLE desafio.tipo_prioridade SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'visitante') THEN
            ALTER TABLE desafio.visitante SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'sala') THEN
            ALTER TABLE desafio.sala SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'sala_responsavel') THEN
            ALTER TABLE desafio.sala_responsavel SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'sala_disponibilidade_historico') THEN
            ALTER TABLE desafio.sala_disponibilidade_historico SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'feriado') THEN
            ALTER TABLE desafio.feriado SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'agendamento') THEN
            ALTER TABLE desafio.agendamento SET SCHEMA public;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'desafio' AND table_name = 'acesso') THEN
            ALTER TABLE desafio.acesso SET SCHEMA public;
        END IF;
        DROP SCHEMA IF EXISTS desafio CASCADE;
    END IF;
END $$;
