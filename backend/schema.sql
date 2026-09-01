--
-- PostgreSQL database dump
--

\restrict PdkKeki3tc1zg6xvVizftRcp2wfRBfF47bXRuFtI6NPhRkYp98Qhee27XZLdM6C

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_memory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agent_memory (
    memory_id integer NOT NULL,
    transaction_id character varying(100) NOT NULL,
    agent character varying(100) NOT NULL,
    memory_type character varying(100) NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: agent_memory_memory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agent_memory_memory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: agent_memory_memory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agent_memory_memory_id_seq OWNED BY public.agent_memory.memory_id;


--
-- Name: ai_decisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_decisions (
    decision_id integer NOT NULL,
    transaction_id character varying(50),
    failure_category character varying(50),
    reasoning text,
    confidence numeric(5,2),
    recommended_action character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    recovery_probability numeric(5,4)
);



--
-- Name: ai_decisions_decision_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_decisions_decision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: ai_decisions_decision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_decisions_decision_id_seq OWNED BY public.ai_decisions.decision_id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    transaction_id character varying(50),
    agent character varying(100),
    action character varying(100),
    input jsonb,
    output jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    customer_id character varying(50) NOT NULL,
    name character varying(100),
    age integer,
    total_transactions integer DEFAULT 0,
    successful_transactions integer DEFAULT 0,
    failed_transactions integer DEFAULT 0,
    preferred_payment_method character varying(30),
    total_spend numeric(12,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: human_review_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.human_review_queue (
    review_id integer NOT NULL,
    transaction_id character varying(50) NOT NULL,
    reason text NOT NULL,
    risk_score numeric(5,2),
    recovery_probability numeric(5,4),
    decision character varying(100),
    status character varying(20) DEFAULT 'PENDING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_at timestamp without time zone
);



--
-- Name: human_review_queue_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.human_review_queue_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: human_review_queue_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.human_review_queue_review_id_seq OWNED BY public.human_review_queue.review_id;


--
-- Name: human_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.human_reviews (
    review_id integer NOT NULL,
    transaction_id character varying(100) NOT NULL,
    risk_score integer NOT NULL,
    reason text NOT NULL,
    recommended_action character varying(100),
    status character varying(50) DEFAULT 'PENDING'::character varying,
    reviewer_action character varying(100),
    reviewer_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp without time zone
);



--
-- Name: human_reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.human_reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: human_reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.human_reviews_review_id_seq OWNED BY public.human_reviews.review_id;


--
-- Name: processed_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.processed_events (
    event_id character varying(150) NOT NULL,
    event_type character varying(100) NOT NULL,
    transaction_id character varying(100),
    processed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: recovery_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recovery_attempts (
    attempt_id integer NOT NULL,
    transaction_id character varying(50),
    strategy character varying(100),
    action character varying(100),
    result character varying(30),
    recovery_probability numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    attempt_number integer DEFAULT 1,
    failure_reason text,
    metadata jsonb
);



--
-- Name: recovery_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recovery_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: recovery_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recovery_attempts_attempt_id_seq OWNED BY public.recovery_attempts.attempt_id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    transaction_id character varying(50) NOT NULL,
    customer_id character varying(50),
    amount numeric(12,2) NOT NULL,
    payment_method character varying(30) NOT NULL,
    status character varying(20) NOT NULL,
    failure_reason character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: agent_memory memory_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_memory ALTER COLUMN memory_id SET DEFAULT nextval('public.agent_memory_memory_id_seq'::regclass);


--
-- Name: ai_decisions decision_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_decisions ALTER COLUMN decision_id SET DEFAULT nextval('public.ai_decisions_decision_id_seq'::regclass);


--
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- Name: human_review_queue review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.human_review_queue ALTER COLUMN review_id SET DEFAULT nextval('public.human_review_queue_review_id_seq'::regclass);


--
-- Name: human_reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.human_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.human_reviews_review_id_seq'::regclass);


--
-- Name: recovery_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recovery_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.recovery_attempts_attempt_id_seq'::regclass);


--
-- Name: agent_memory agent_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agent_memory
    ADD CONSTRAINT agent_memory_pkey PRIMARY KEY (memory_id);


--
-- Name: ai_decisions ai_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_decisions
    ADD CONSTRAINT ai_decisions_pkey PRIMARY KEY (decision_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: human_review_queue human_review_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.human_review_queue
    ADD CONSTRAINT human_review_queue_pkey PRIMARY KEY (review_id);


--
-- Name: human_reviews human_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.human_reviews
    ADD CONSTRAINT human_reviews_pkey PRIMARY KEY (review_id);


--
-- Name: processed_events processed_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.processed_events
    ADD CONSTRAINT processed_events_pkey PRIMARY KEY (event_id);


--
-- Name: recovery_attempts recovery_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recovery_attempts
    ADD CONSTRAINT recovery_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: ai_decisions ai_decisions_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_decisions
    ADD CONSTRAINT ai_decisions_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id);


--
-- Name: recovery_attempts recovery_attempts_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recovery_attempts
    ADD CONSTRAINT recovery_attempts_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id);


--
-- Name: transactions transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id);


--
-- PostgreSQL database dump complete
--

\unrestrict PdkKeki3tc1zg6xvVizftRcp2wfRBfF47bXRuFtI6NPhRkYp98Qhee27XZLdM6C

