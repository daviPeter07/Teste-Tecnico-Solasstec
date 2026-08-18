BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
    IF EXISTS (
        SELECT nivel_prioridade FROM desafio.tipo_prioridade
        GROUP BY nivel_prioridade HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem níveis de prioridade duplicados; resolva-os antes da migration.';
    END IF;

    IF EXISTS (
        SELECT descricao FROM desafio.tipo_prioridade
        GROUP BY descricao HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem descrições de prioridade duplicadas; resolva-as antes da migration.';
    END IF;

    IF EXISTS (SELECT 1 FROM desafio.sala_responsavel WHERE sala_id IS NULL) THEN
        RAISE EXCEPTION 'Existem responsáveis sem sala; associe-os antes da migration.';
    END IF;

    IF EXISTS (SELECT 1 FROM desafio.agendamento WHERE sala_id IS NULL) THEN
        RAISE EXCEPTION 'Existem agendamentos sem sala; associe-os antes da migration.';
    END IF;

    IF EXISTS (
        SELECT sala_id FROM desafio.sala_responsavel
        WHERE ativo IS DISTINCT FROM false AND valido_ate IS NULL
        GROUP BY sala_id HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem múltiplos responsáveis atuais para uma sala.';
    END IF;

    IF EXISTS (
        SELECT room.id
        FROM desafio.sala room
        LEFT JOIN desafio.sala_responsavel responsible
          ON responsible.sala_id = room.id
         AND responsible.ativo IS DISTINCT FROM false
         AND responsible.valido_ate IS NULL
        WHERE room.ativo IS DISTINCT FROM false
        GROUP BY room.id
        HAVING count(responsible.id) <> 1
    ) THEN
        RAISE EXCEPTION 'Toda sala ativa deve possuir exatamente um responsável atual.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM desafio.sala room
        WHERE jsonb_typeof(room.disponibilidade) <> 'array'
           OR jsonb_array_length(room.disponibilidade) = 0
           OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements(room.disponibilidade) period
               WHERE jsonb_typeof(period) <> 'object'
                  OR NOT period ?& ARRAY['dayOfWeek', 'opensAt', 'closesAt']
                  OR jsonb_typeof(period->'dayOfWeek') <> 'number'
                  OR (period->>'dayOfWeek') !~ '^[0-6]$'
                  OR (period->>'opensAt') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
                  OR (period->>'closesAt') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
                  OR period->>'opensAt' >= period->>'closesAt'
           )
    ) THEN
        RAISE EXCEPTION 'Existem horários legados fora do formato dayOfWeek/opensAt/closesAt.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM desafio.agendamento first_appointment
        JOIN desafio.agendamento second_appointment
          ON first_appointment.id < second_appointment.id
         AND (first_appointment.sala_id = second_appointment.sala_id
              OR first_appointment.visitante_id = second_appointment.visitante_id)
         AND first_appointment.data_agendada < second_appointment.data_agendada + interval '1 hour'
         AND second_appointment.data_agendada < first_appointment.data_agendada + interval '1 hour'
        WHERE COALESCE(first_appointment.ativo, true)
          AND COALESCE(second_appointment.ativo, true)
          AND COALESCE(first_appointment.status, 1) IN (1, 2)
          AND COALESCE(second_appointment.status, 1) IN (1, 2)
    ) THEN
        RAISE EXCEPTION 'Existem agendamentos legados conflitantes no intervalo padrão de uma hora.';
    END IF;
END $$;

INSERT INTO desafio.tipo_prioridade (descricao, nivel_prioridade, ativo)
SELECT seed.description, seed.priority_level, true
FROM (
    VALUES
        ('Visitante sem critério de prioridade.', 0),
        ('Visitante com idade igual ou superior a 60 anos.', 1),
        ('Visitante que informou possuir deficiência.', 2),
        ('Visitante que atende aos dois critérios de prioridade.', 3)
) AS seed(description, priority_level)
WHERE NOT EXISTS (
    SELECT 1
    FROM desafio.tipo_prioridade existing
    WHERE existing.nivel_prioridade = seed.priority_level
);

ALTER TABLE desafio.visitante
    ADD COLUMN tipo_documento varchar(3),
    ADD COLUMN possui_deficiencia boolean NOT NULL DEFAULT false;

DO $$
BEGIN
    IF EXISTS (
        SELECT normalized_document
        FROM (
            SELECT upper(regexp_replace(documento, '[^A-Za-z0-9]', '', 'g')) AS normalized_document
            FROM desafio.visitante
        ) normalized
        GROUP BY normalized_document
        HAVING count(*) > 1
    ) THEN
        RAISE EXCEPTION 'Existem documentos de visitantes logicamente duplicados.';
    END IF;
END $$;

UPDATE desafio.visitante
SET tipo_documento = CASE
    -- O dump não possui tipo; documentos legados com 11 dígitos seguem a convenção CPF.
    WHEN length(regexp_replace(documento, '[^0-9]', '', 'g')) = 11
      AND documento !~ '[A-Za-z]' THEN 'CPF'
    ELSE 'RG'
END,
documento = upper(regexp_replace(documento, '[^A-Za-z0-9]', '', 'g'));

UPDATE desafio.visitante visitor
SET possui_deficiencia = priority.nivel_prioridade IN (2, 3)
FROM desafio.tipo_prioridade priority
WHERE visitor.tipo_prioridade_id = priority.id;

UPDATE desafio.visitante
SET tipo_prioridade_id = (
    SELECT id FROM desafio.tipo_prioridade WHERE nivel_prioridade = 0 LIMIT 1
)
WHERE tipo_prioridade_id IS NULL;

UPDATE desafio.visitante
SET ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP);

UPDATE desafio.tipo_prioridade
SET ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP);

ALTER TABLE desafio.visitante
    ALTER COLUMN tipo_documento SET NOT NULL,
    ALTER COLUMN tipo_prioridade_id SET NOT NULL,
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(2) with time zone USING criado_em AT TIME ZONE 'UTC';

ALTER TABLE desafio.tipo_prioridade
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(6) with time zone USING criado_em AT TIME ZONE 'UTC';

CREATE UNIQUE INDEX idx_tipo_prioridade_descricao ON desafio.tipo_prioridade (descricao);
CREATE UNIQUE INDEX idx_tipo_prioridade_nivel ON desafio.tipo_prioridade (nivel_prioridade);
CREATE INDEX idx_visitante_nome ON desafio.visitante (nome);
CREATE INDEX idx_visitante_ativo ON desafio.visitante (ativo);

UPDATE desafio.feriado
SET ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP);

ALTER TABLE desafio.feriado
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(6) with time zone USING criado_em AT TIME ZONE 'UTC',
    ADD CONSTRAINT feriado_tipo_valido CHECK (tipo IS NULL OR tipo BETWEEN 1 AND 3);

UPDATE desafio.sala
SET ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP),
    variacao_capacidade = COALESCE(variacao_capacidade, 2);

ALTER TABLE desafio.sala
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(6) with time zone USING criado_em AT TIME ZONE 'UTC',
    ADD CONSTRAINT sala_capacidade_positiva CHECK (capacidade > 0),
    ADD CONSTRAINT sala_variacao_capacidade_valida CHECK (variacao_capacidade BETWEEN 1 AND 4);

UPDATE desafio.sala_responsavel
SET ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP);

ALTER TABLE desafio.sala_responsavel
    ALTER COLUMN sala_id SET NOT NULL,
    ALTER COLUMN valido_de TYPE timestamp(6) with time zone USING valido_de::timestamp AT TIME ZONE 'UTC',
    ALTER COLUMN valido_ate TYPE timestamp(6) with time zone USING valido_ate::timestamp AT TIME ZONE 'UTC',
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(6) with time zone USING criado_em AT TIME ZONE 'UTC',
    ADD CONSTRAINT sala_responsavel_periodo_valido CHECK (valido_ate IS NULL OR valido_ate >= valido_de);

ALTER TABLE desafio.sala_responsavel DROP CONSTRAINT sala_responsavel_sala_id_fkey;
ALTER TABLE desafio.sala_responsavel
    ADD CONSTRAINT sala_responsavel_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES desafio.sala(id) ON DELETE RESTRICT;

CREATE INDEX idx_sala_responsavel_historico ON desafio.sala_responsavel (sala_id, valido_de);
CREATE UNIQUE INDEX idx_sala_responsavel_atual ON desafio.sala_responsavel (sala_id) WHERE ativo = true AND valido_ate IS NULL;

CREATE TABLE desafio.sala_disponibilidade_historico (
    id integer GENERATED BY DEFAULT AS IDENTITY,
    sala_id integer NOT NULL,
    disponibilidade jsonb NOT NULL,
    valido_de timestamp(6) with time zone NOT NULL,
    valido_ate timestamp(6) with time zone,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamp(6) with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sala_disponibilidade_historico_pkey PRIMARY KEY (id),
    CONSTRAINT sala_disponibilidade_historico_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES desafio.sala(id) ON DELETE RESTRICT,
    CONSTRAINT sala_disponibilidade_historico_periodo_valido CHECK (valido_ate IS NULL OR valido_ate >= valido_de)
);

INSERT INTO desafio.sala_disponibilidade_historico (sala_id, disponibilidade, valido_de)
SELECT id, disponibilidade, COALESCE(criado_em, CURRENT_TIMESTAMP)
FROM desafio.sala;

CREATE INDEX idx_sala_disponibilidade_historico ON desafio.sala_disponibilidade_historico (sala_id, valido_de);
CREATE UNIQUE INDEX idx_sala_disponibilidade_atual ON desafio.sala_disponibilidade_historico (sala_id) WHERE ativo = true AND valido_ate IS NULL;

DROP INDEX desafio.idx_agendamento_data;

ALTER TABLE desafio.agendamento RENAME COLUMN data_agendada TO inicio_em;
ALTER TABLE desafio.agendamento
    ALTER COLUMN inicio_em TYPE timestamp(6) with time zone USING inicio_em AT TIME ZONE 'UTC',
    ADD COLUMN fim_em timestamp(6) with time zone;

UPDATE desafio.agendamento
SET fim_em = inicio_em + interval '1 hour',
    status = COALESCE(status, 1),
    ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP);

ALTER TABLE desafio.agendamento
    ALTER COLUMN sala_id SET NOT NULL,
    ALTER COLUMN fim_em SET NOT NULL,
    ALTER COLUMN status SET DEFAULT 1,
    ALTER COLUMN status SET NOT NULL,
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(6) with time zone USING criado_em AT TIME ZONE 'UTC',
    ADD CONSTRAINT agendamento_periodo_valido CHECK (fim_em > inicio_em),
    ADD CONSTRAINT agendamento_status_valido CHECK (status BETWEEN 1 AND 4);

ALTER TABLE desafio.agendamento DROP CONSTRAINT agendamento_sala_id_fkey;
ALTER TABLE desafio.agendamento DROP CONSTRAINT agendamento_visitante_id_fkey;
ALTER TABLE desafio.agendamento
    ADD CONSTRAINT agendamento_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES desafio.sala(id) ON DELETE RESTRICT,
    ADD CONSTRAINT agendamento_visitante_id_fkey FOREIGN KEY (visitante_id) REFERENCES desafio.visitante(id) ON DELETE RESTRICT;

CREATE INDEX idx_agendamento_visitante_periodo ON desafio.agendamento (visitante_id, inicio_em, fim_em);
CREATE INDEX idx_agendamento_sala_periodo ON desafio.agendamento (sala_id, inicio_em, fim_em);

ALTER TABLE desafio.agendamento
    ADD CONSTRAINT agendamento_sala_sem_conflito
    EXCLUDE USING gist (
        sala_id WITH =,
        tstzrange(inicio_em, fim_em, '[)') WITH &&
    ) WHERE (ativo = true AND status IN (1, 2));

ALTER TABLE desafio.agendamento
    ADD CONSTRAINT agendamento_visitante_sem_conflito
    EXCLUDE USING gist (
        visitante_id WITH =,
        tstzrange(inicio_em, fim_em, '[)') WITH &&
    ) WHERE (ativo = true AND status IN (1, 2));

UPDATE desafio.acesso
SET ativo = COALESCE(ativo, true),
    criado_em = COALESCE(criado_em, CURRENT_TIMESTAMP);

ALTER TABLE desafio.acesso
    ALTER COLUMN entrada_em TYPE timestamp(6) with time zone USING entrada_em AT TIME ZONE 'UTC',
    ALTER COLUMN saida_em TYPE timestamp(6) with time zone USING saida_em AT TIME ZONE 'UTC',
    ALTER COLUMN ativo SET DEFAULT true,
    ALTER COLUMN ativo SET NOT NULL,
    ALTER COLUMN criado_em SET DEFAULT CURRENT_TIMESTAMP,
    ALTER COLUMN criado_em SET NOT NULL,
    ALTER COLUMN criado_em TYPE timestamp(6) with time zone USING criado_em AT TIME ZONE 'UTC',
    ADD CONSTRAINT acesso_periodo_valido CHECK (saida_em IS NULL OR entrada_em IS NULL OR saida_em >= entrada_em);

COMMIT;
