# Database
By default, the Django app will use a SQLite database for storing its data, but PostgreSQL is used by many organizations for their databases since it is scalable and suitable for deployment in production. This section will describe how to set up a PostgreSQL database for your full-stack application. 

## Django Settings: Database Configuration
Open the `settings.py` file of your Django project (in the `djangobackend` folder), and at the top add `import os` (this will be used to retrieve environmental variables set by the Docker Compose file). Then, find the section which looks like this: 

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

Update the `ENGINE` to `'django.db.backends.postgresql'`, update the name to `os.environ.get('DB_NAME')`, and set the following variables: 

```python
'USER': os.environ.get('DB_USER'),
'PASSWORD': os.environ.get('DB_PASS'), 
'HOST': os.environ.get('DB_HOST'), 
'PORT': os.environ.get('DB_PORT')
```

Once this is added, the full DATABASES entry should look like this: 
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql', 
        'NAME': os.environ.get('DB_NAME'), 
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASS'), 
        'HOST': os.environ.get('DB_HOST'), 
        'PORT': os.environ.get('DB_PORT')
    }
}
```

Now, rather than using the default SQLite database (`'django.db.backends.sqlite3'`), Django will use a PostgreSQL database which we will initialize with the Docker Compose file. 


## Docker Compose
The Docker compose file can be used to create this new database, set up periodic data migrations, and check for database health. First, add another service titled `db` to your `docker-compose.yaml` file. Set its image to `postgres:17.1`. Now, we need to add a volume for persistent data storage when the container restarts. On the same level as "services", add a section titled "volumes", and include "db-data:" inside of it. This will define a named volume which we will link the database to. 

Right now, your Docker compose file should look like this: 
```dockerfile
services: 
  backend: 
    build: ./backend
    ports: 
      - "8000:8000"
    volumes:
      - ./backend:/app

  frontend: 
    build: ./frontend
    ports: 
      - "5173:5173"

  db: 
    # TODO (next step): initialize a Postgres database from a pre-defined image

volumes: 
  db-data:
```

Now, set up the Postgres database, defining a base image and linking it to the volume by adding the following lines to your `db` service: 

```dockerfile
image: postgres:17.1
volumes: 
    - db-data:/var/lib/postgresql/data
ports: 
    - "5432:5432"
```

Port 5432 is the default port for Postgres, so that's why I'm using it here. 

To review, your `db` service should look like this: 
```dockerfile
db: 
    image: postgres:17.1
    volumes: 
      - db-data:/var/lib/postgresql/data
    ports: 
    - "5432:5432"
```

### Environmental Variables
The Django backend also needs the credentials to access and edit the Postgres database. So, we will use a local `.env` file. Create a .gitignore file as a sibling to `docker-compose.yaml` at the root of your repository. Add `.env` to the gitignore. Then create another file that is a sibling to `docker-compose.yaml`: `.env`. This is where all of the Postgres database information will be set. You will need to define the following variables: 

```env
DB_HOST=db
DB_NAME=db
DB_USER=user
DB_PASS=tutorial_password
POSTGRES_DB=db
POSTGRES_USER=user
POSTGRES_PASSWORD=tutorial_password
```

You should set your database password and Postgres password to a randomly generated string of characters rather than something easily guessable like "tutorial_password", "development_password", "temp", etc. Now, set the Docker Compose to use these variables: 

The backend should load the .env so that Django has the database credentials, so add the following in the "backend" service: 
```dockerfile
env_file:
    - .env
```

Postgres also needs access to the environmental variables so it can initialize the database with the correct information. Link the .env file in the "db" service also: 
```dockerfile
env_file:
    - .env
```

### Postgres Database Health Check
Now, let's add a health check for the Postgres database so that we can ensure it is responding correctly. Add the following lines to the "db" service: 

```dockerfile
healthcheck: 
    # these values are defined in the .env along with more sensitive information. since 5432 is the default port for postgres, you don't have to set it in this command
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
    interval: 5s
    timeout: 5s
    retries: 20
```

These lines tell Docker to run a test every 5 seconds to determine if the Postgres server is accepting connections, giving each test 5 seconds to complete before considered "failed" and retrying up to 20 times if necessary. If it fails every time, Docker will mark the service as unhealthy. 

Now, we need to use this diagnostic to tell the backend to only start up if the database is health, which can be done with the following lines of code in the "backend" service: 
```
depends_on: 
    db: 
        condition: service_healthy
```

### Backend connection to Database
Finally, we need the backend to migrate its data over to the Postgres database and then start up a server. This can be done with the following command in the "backend" service: 
```
command: sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"
```

### Final Docker Compose
That's it for setting up a Docker compose file! Just to review, your docker-compose.yaml should contain the following:  
```dockerfile
services: 
  backend: 
    build: ./backend
    ports: 
      - "8000:8000"
    volumes:
      - ./backend:/app
    env_file:
      - .env
    depends_on: 
      db: 
        condition: service_healthy

  frontend: 
    build: ./frontend
    ports: 
      - "5173:5173"

  db: 
    image: postgres:17.1
    volumes: 
      - db-data:/var/lib/postgresql/data
    ports: 
    - "5432:5432"
    env_file:
      - .env
    healthcheck: 
      test: ["CMD", "pg_isready", "-U", "user", "-d", "db", "-h", "localhost", "-p", "5432"]
      interval: 5s
      timeout: 5s
      retries: 20

volumes: 
  db-data:
```

## Initializing the Postgres Database
Now, we have to install the adapter which allows Django to communicate with PostgreSQL. Open the requirements.txt file for the backend. As a reminder, it should look like this: 

```
Django>=5.1,<6.0
django-cors-headers
```

Now, add the following line to require psycopg, the Postgres adapter for Python. 
```
psycopg==3.2.3
```

We're almost done! Now, we just need to temporarily install the packages necessary for installing `psycopg`. You can do that by adding the below code in place of the `RUN pip install -r requirements.txt` line: 

```dockerfile
RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client libpq-dev && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get purge -y libpq-dev && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*
```

The first line updates the available package list, then the second line installs necessary Postgres tools. The third line installs requirements.txt without saving pip's download cache, which saves space. The next lines remove `libpq-dev` (which is only needed during installation) but keeps `postgresql-client` (which supplies the `pg_isready` tool we are using in the health check). Deleting unnecessary installations saves more space in the Docker container. 

## Testing
That's it! Now, make sure you are in the root directory (the directory with `docker-compose.yaml`) and try spinning up the Docker containers with `docker compose up`. If you need to force a re-build, you can use the `--build` flag. Then, go to `http://localhost:5173/register`. You should see your page just as you could after running all those Docker commands. Check your Docker desktop interface, and you should see three services running, all nested under the name of your local repository: db, frontend, and backend (see below for what mine looks like!). 

![A green running service titled after my repository name, with three services for the database, backend, and frontend listed beneath it](./img/docker-desktop-compose.png)