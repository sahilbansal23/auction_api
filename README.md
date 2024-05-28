
# AUCTION API

RESTful API for a real-time bidding platform using Node.js, Express, Websocket and a PostgreSQL . These API  support advanced CRUD operations, user authentication,  role-based access control, real-time bidding, and notifications. 




## Tech Stack

**Server:** Node, Express

**Database:** postgreSQL



## Dependecies

**Multer:** To upload the image 

**pino-pretty:** For better logging and error logging

**ulid:** To generate the unique ids

**jsonwebtoken:** To create the signed authentication token 

**express-rate-limit:** To limit the api request per minute





## Run Locally

To deploy this project run

- STEP 1
```bash
  git clone https://github.com/sahilbansal23/auction_api.git
```

- STEP 2
Install the Dependencies
```bash
  npm install
```
- STEP 3
create environment file
```bash
touch .env
vi .env 

#add variable 

DBUSER= [YOUR DATABASE USER]
DBHOST = [YOUR HOST URL]
DB = [YOUR DATABASE NAME]
DBPASSWORD =[YOUR DATABASE PASSWORD]
DBPORT = [YOUR DATABASE PORT]
max: 25,
PORT = [YOUR SERVER PORT]
JWT_SECRET = [YOUR JWT SECRET KEY]
SOCKET_URL = [WEBSOCKET URL]
```

- STEP 4
Crate your database
```bash
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


```

## Screenshot
 ERD Diagram
[App Screenshot](https://drive.google.com/file/d/1i-BhJd2o6xAodEYpYJT3GFJ2AYs9HSAu/view?usp=sharing)


- STEP 5
Start your Backend Server
```bash
npm start
```

- STEP 6
Start your Websocket
```bash
cd Websocket
node socket.js
```




## Features

- Implemented a rate limiting middleware to prevent abuse of the API.
- Implemented logging for API requests and errors.
- Get item api will work with the pagincation.
- Implemented pagination for the GET /items endpoint. 
- Implemented search functionality for auction items by name initial letters. 
- Allow filtering items by status (active= true,false). 
- Implemented image upload functionality for auction items using a library like multer.
- Use JWT (JSON Web Tokens) for authentication. 
- Implement role-based access control to restrict access to certain endpoints based on user roles. 
- update - Notify all connected clients about a new bid on an item. 




## API Reference

#### Detailed Api Documentation can be found in the Swagger link below

```bash
https://app.swaggerhub.com/apis-docs/BANSAL2210SAHIL/Auction-API/1.0.0-oas3
```

## Author

- [@sahilbansal23](https://www.linkedin.com/in/sahilbansal23/)

