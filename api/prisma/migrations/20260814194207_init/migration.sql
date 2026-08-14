CREATE SCHEMA IF NOT EXISTS desafio;

CREATE TABLE desafio.acesso (
    id integer NOT NULL,
    visitante_id integer NOT NULL,
    sala_id integer,
    agendamento_id integer,
    entrada_em timestamp(6) without time zone,
    saida_em timestamp(6) without time zone,
    ativo boolean DEFAULT true,
    criado_em timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE desafio.acesso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.acesso_id_seq OWNED BY desafio.acesso.id;

CREATE TABLE desafio.agendamento (
    id integer NOT NULL,
    visitante_id integer NOT NULL,
    sala_id integer,
    data_agendada timestamp(6) without time zone NOT NULL,
    status smallint DEFAULT 1,
    ativo boolean DEFAULT true,
    criado_em timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN desafio.agendamento.status IS '1=PENDENTE, 2=CONFIRMADO, 3=CANCELADO, 4=FINALIZADO';

CREATE SEQUENCE desafio.agendamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.agendamento_id_seq OWNED BY desafio.agendamento.id;

CREATE TABLE desafio.feriado (
    id integer NOT NULL,
    data date NOT NULL,
    descricao text NOT NULL,
    tipo smallint,
    ativo boolean DEFAULT true,
    criado_em timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN desafio.feriado.tipo IS '1=NACIONAL, 2=ESTADUAL, 3=MUNICIPAL';

CREATE SEQUENCE desafio.feriado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.feriado_id_seq OWNED BY desafio.feriado.id;

CREATE TABLE desafio.sala (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    disponibilidade jsonb NOT NULL,
    capacidade integer NOT NULL,
    variacao_capacidade smallint DEFAULT 2,
    ativo boolean DEFAULT true,
    criado_em timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN desafio.sala.disponibilidade IS 'dia_semana (Padrão Days of The Week), variação de hora_abertura e hora_fechamento por dia_semana';
COMMENT ON COLUMN desafio.sala.variacao_capacidade IS '1 - Hora, 2 - Dia, 3 - Semana, 4 - Mês';

CREATE SEQUENCE desafio.sala_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.sala_id_seq OWNED BY desafio.sala.id;

CREATE TABLE desafio.sala_responsavel (
    id integer NOT NULL,
    sala_id integer,
    nome text NOT NULL,
    valido_de date NOT NULL,
    valido_ate date,
    ativo boolean DEFAULT true,
    criado_em timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE desafio.sala_responsavel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.sala_responsavel_id_seq OWNED BY desafio.sala_responsavel.id;

CREATE TABLE desafio.tipo_prioridade (
    id integer NOT NULL,
    descricao character varying(100) NOT NULL,
    nivel_prioridade smallint NOT NULL,
    ativo boolean DEFAULT true,
    criado_em timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE desafio.tipo_prioridade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.tipo_prioridade_id_seq OWNED BY desafio.tipo_prioridade.id;

CREATE TABLE desafio.visitante (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    documento character varying(50) NOT NULL,
    data_nascimento date NOT NULL,
    tipo_prioridade_id integer,
    foto character varying(255),
    ativo boolean DEFAULT true,
    criado_em timestamp(2) without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE desafio.visitante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE desafio.visitante_id_seq OWNED BY desafio.visitante.id;

ALTER TABLE ONLY desafio.acesso ALTER COLUMN id SET DEFAULT nextval('desafio.acesso_id_seq'::regclass);
ALTER TABLE ONLY desafio.agendamento ALTER COLUMN id SET DEFAULT nextval('desafio.agendamento_id_seq'::regclass);
ALTER TABLE ONLY desafio.feriado ALTER COLUMN id SET DEFAULT nextval('desafio.feriado_id_seq'::regclass);
ALTER TABLE ONLY desafio.sala ALTER COLUMN id SET DEFAULT nextval('desafio.sala_id_seq'::regclass);
ALTER TABLE ONLY desafio.sala_responsavel ALTER COLUMN id SET DEFAULT nextval('desafio.sala_responsavel_id_seq'::regclass);
ALTER TABLE ONLY desafio.tipo_prioridade ALTER COLUMN id SET DEFAULT nextval('desafio.tipo_prioridade_id_seq'::regclass);
ALTER TABLE ONLY desafio.visitante ALTER COLUMN id SET DEFAULT nextval('desafio.visitante_id_seq'::regclass);

ALTER TABLE ONLY desafio.acesso ADD CONSTRAINT acesso_pkey PRIMARY KEY (id);
ALTER TABLE ONLY desafio.agendamento ADD CONSTRAINT agendamento_pkey PRIMARY KEY (id);
ALTER TABLE ONLY desafio.feriado ADD CONSTRAINT feriado_pkey PRIMARY KEY (id);
ALTER TABLE ONLY desafio.sala ADD CONSTRAINT sala_pkey PRIMARY KEY (id);
ALTER TABLE ONLY desafio.sala_responsavel ADD CONSTRAINT sala_responsavel_pkey PRIMARY KEY (id);
ALTER TABLE ONLY desafio.tipo_prioridade ADD CONSTRAINT tipo_prioridade_pkey PRIMARY KEY (id);
ALTER TABLE ONLY desafio.visitante ADD CONSTRAINT visitante_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX idx_agendamento_data ON desafio.agendamento USING btree (data_agendada);
CREATE UNIQUE INDEX idx_feriado_data ON desafio.feriado USING btree (data);
CREATE UNIQUE INDEX idx_visitante_documento ON desafio.visitante USING btree (documento);

ALTER TABLE ONLY desafio.acesso
    ADD CONSTRAINT acesso_agendamento_id_fkey FOREIGN KEY (agendamento_id) REFERENCES desafio.agendamento(id);
ALTER TABLE ONLY desafio.acesso
    ADD CONSTRAINT acesso_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES desafio.sala(id);
ALTER TABLE ONLY desafio.acesso
    ADD CONSTRAINT acesso_visitante_id_fkey FOREIGN KEY (visitante_id) REFERENCES desafio.visitante(id);
ALTER TABLE ONLY desafio.agendamento
    ADD CONSTRAINT agendamento_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES desafio.sala(id) ON DELETE CASCADE;
ALTER TABLE ONLY desafio.agendamento
    ADD CONSTRAINT agendamento_visitante_id_fkey FOREIGN KEY (visitante_id) REFERENCES desafio.visitante(id) ON DELETE CASCADE;
ALTER TABLE ONLY desafio.sala_responsavel
    ADD CONSTRAINT sala_responsavel_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES desafio.sala(id) ON DELETE CASCADE;
ALTER TABLE ONLY desafio.visitante
    ADD CONSTRAINT visitante_tipo_prioridade_id_fkey FOREIGN KEY (tipo_prioridade_id) REFERENCES desafio.tipo_prioridade(id);
