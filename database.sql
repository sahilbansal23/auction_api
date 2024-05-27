CREATE TABLE public.users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.items (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) DEFAULT 0.00,
    image_url VARCHAR(255),
    user_id VARCHAR(255),
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.bids
(
    id character varying NOT NULL,
    item_id character varying,
    user_id character varying,
    bid_amount double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    CONSTRAINT item_id_fk FOREIGN KEY (item_id)
        REFERENCES public.items (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE public.notifications
(
    id character varying NOT NULL,
    user_id character varying,
    message character varying NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

