# Backend
## Creating a Django Project
Using Docker, you won't need to have Django installed on your computer: we'll use a Dockerfile to create a container with Django, and run everything inside of it. 

First, run `cd ..` to return to the root directory. Then, create a sibling folder to `frontend` titled `backend`, and open that folder. Inside the `backend` folder, create a Dockerfile with the below: 

```dockerfile
# creates a container from a base image with python installed
FROM python:3.11-slim

# sets the working directory of the container
WORKDIR /app

# installs Django
RUN pip install django
```

Make sure that you are in the `backend` folder, and in the terminal, run: 
```bash
docker build -t backend .
```

To build the image for the backend. Then, create the Django project using Docker: 

```bash
docker run --rm -v $(pwd):/app backend django-admin startproject djangobackend .
```

Now we will set up the Dockerfile for actually running this Django project. Create a `requirements.txt` file inside of the `backend` folder and add `Django>=5.1,<6.0`. Then, replace the line installing Django with the lines: 

```dockerfile
# copies the requirements file to the working directory (/app)
COPY requirements.txt .

# installs requirements (currently includes django)
RUN pip install -r requirements.txt

# copies everything else in "backend" to the working directory
COPY . .

# runs a command to create and migrate models to the SQL database and start the Django app on port 8000
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
```

Although we ran `makemigrations`, since we are using the built-in user model this isn't actually necessary for authentication, but will be important later for the custom tasks model. 

Your entire Dockerfile should look like this: 
```dockerfile
# creates a container from a base image with python installed
FROM python:3.11-slim

# sets the working directory of the container
WORKDIR /app

# copies the requirements file to the working directory (/app)
COPY requirements.txt .

# installs requirements (currently includes django)
RUN pip install -r requirements.txt

# copies everything else in "backend" to the working directory
COPY . .

# runs a command to migrate models to the SQL database and start the Django app on port 8000
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
```

The Django application is now configured! To use Django commands, like creating an app, we can just use Docker to create containers from the image (ex. `docker run --rm -v $(pwd):/app backend python manage.py makemigrations` to update the database schema). Note that we now have two Docker images (frontend and backend), so the next section will cover configuring a Docker compose file to run both with a single command. 

## Creating an authentication app
Since this tutorial already assumes knowledge of Django, I won't be explaining what Django apps are or why they are important. If you want a quick refresher, check out [this tutorial](https://www.youtube.com/watch?v=0sMtoedWaf0&t=211s)! 

Before creating an app to handle user authentication, we have to rebuild the backend image for the new Django project. Make sure you are in the `backend` folder and run `docker build -t backend .` in the terminal to re-build the backend image. Now, you can use Docker to execute Django commands without having to install Django locally. Run `docker run --rm -v $(pwd):/app backend python manage.py startapp authentication` to create a new app for authentication. There should now be a new folder in the `backend` directory called "authentication"! Add this app to installed apps in settings.py: 

```python
INSTALLED_APPS = [
    # ...other apps...
    'authentication', 
]
```

If you get any errors, make sure that you have followed every part of this guide. 

## Configuring CORS and CSRF
We already configured the frontend to retrieve and send a CSRF token, but the backend needs CORS configuration to accept requests from the frontend's origin and CSRF configuration to trust tokens from that origin. If you aren't familiar with CORS or CSRF, you can check out [this video](https://www.youtube.com/watch?v=hjTY1Lf21W0) for a quick explanation. Update the backend's requirements.txt to include `django-cors-headers`. After modifying requirements.txt, re-build the image with `docker build -t backend .`. Then, in settings.py, update the installed apps to include CORS headers: 

```python
INSTALLED_APPS = [
    'corsheaders',
    # ...other apps...
]
```

Update the middleware section to include CORS middleware: 
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # this should be placed early in the list! 
    # ...other middleware...
]
```

Also add the following anywhere in `settings.py` (but I would recommend the bottom so that it's easier to find) so that the frontend can send requests to the backend: 

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

Now, the backend is configured to accept requests and CSRF tokens from the frontend! 

## Initializing Authentication URLs
First, go to the `urls.py` file in the `djangobackend` folder (this is the one with `settings.py`, `asgi.py`, `wsgi.py`, and `urls.py`). Add the following URL patterns: 

```python
urlpatterns = [
    # ...other url paths...
    path('authentication/', include('authentication.urls')) # this will allow Django to correctly redirect to URL paths beginning with /authentication/
]
```

In order to use `include`, you need to import it from `django.urls` along with `path`. 

The forms send data to `authentication/login` and `authentication/register`, so let's define those URLs in the authentication app. Create a `urls.py` file in the `authentication` app and add the following: 

```python
from django.urls import path

# these will cause an error right now because they aren't yet defined
from .views import verify_login, save_register, logout_user

urlpatterns = [
    # creates authentication/login, authentication/register, and authentication/logout paths (the last of which isn't part of the frontend auth form but will be used to create logout functionality on the main dashboard)
    path('login', verify_login, name='login'),
    path('register', save_register, name='register'), 
    path('logout', logout_user, name='logout')
]
```

Right now, the functions from views will cause an error since we haven't defined them yet. We'll do this in the next step! 

## Backend Authentication Processing Functions
Now, let's update the `views.py` file. This file is where functions which receive the authentication requests from the frontend will be received and processed. They will also return a status and an error if necessary. Here's the skeleton for the `views.py` file, before the authentication logic is added, including all necessary imports: 

```python
from django.shortcuts import render
from django.http import JsonResponse
import json
from django.views.decorators.csrf import ensure_csrf_cookie
# Django's built-in user model, which includes authentication functionality
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout

# Create your views here.

# ensures the user receives a CSRF token
@ensure_csrf_cookie
def verify_login(request): 
    # only processes request if it is a POST (more secure than GET for authentication)
    if request.method == "POST": 
        # TODO: add authentication logic, will return early if credentials are incorrect
        # the frontend checks for this success response and will redirect if it receives it
        return JsonResponse({"error": "None, login successful"})
    # return an error if not POST
    return JsonResponse({"error": "Needs a post request to log user in"})

@ensure_csrf_cookie
def save_register(request): 
    if request.method == "POST": 
        # TODO: add register logic
        return JsonResponse({"error": "None, user creation successful"})
    return JsonResponse({"error": "Needs a post request to register new user"})

@ensure_csrf_cookie
def logout_user(request): 
    if request.method == "POST": 
        # TODO: add logout logic
        return JsonResponse({"error": "None, logged out successfully"})
    return JsonResponse({"error": "Needs a post request to log out current user"})
```

If you want to learn more about why these methods only run authentication logic with POST (otherwise return an error), check out [this article](https://medium.com/@brockmrohloff_12324/auth-why-http-post-7c4da662cfa2). 


### Logging in
First, let's write the `verify_login` function referenced in the authentication app's urls.py. Add the following code inside of the conditional: 

```python
data = json.loads(request.body) # retrieves all data from the body of the request (sent with fetch)
username = data.get("username") # gets specific username data from request
password = data.get("password") # gets specific password data from request
user = authenticate(request, username=username, password=password) # uses Django's built-in user authentication functionality to confirm if the credentials are valid
if user is not None: 
    login(request, user) # Django's built-in function to log in a user
    return JsonResponse({"error": "None, login successful"}) # returns a successful response
return JsonResponse({"error": "Username and/or password incorrect"}) # returns a failure if no user with the provided username and/or password is found
```

The full `verify_login` function should now look like this: 
```python
@ensure_csrf_cookie
def verify_login(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None: 
            login(request, user)
            return JsonResponse({"error": "None, login successful"})
        return JsonResponse({"error": "Username and/or password incorrect"})
    return JsonResponse({"error": "Needs a post request to log user in"})
```

### Registering
Without a way to register new users, only users manually added by a project admin will be able to log in. So, to create the user registration logic, put the code below inside of the conditional of the `save_register` function. The order of these checks also matters: checking if all required fields have been entered is the cheapest, so it should happen first. Next, we should check if the passwords match, since comparing strings for equality is a relatively cheap operation. Finally, we'll query the database to determine if the user with the defined username already exists - this database query is the most expensive operation we'll perform, so it should only happen if all other requirements for creating a new user have been met. 

```python
# same as login
data = json.loads(request.body)
username = data.get("username")
password = data.get("password")
# protects against typos in primary password field
confirm_password = data.get("confirm_password")

# user needs to have submitted a username, a password, and a confirm_password
if not username or not password or not confirm_password:
      return JsonResponse({"error": "Username and password required"})

# check if two passwords are equal, also checked on frontend
if confirm_password != password:
    return JsonResponse({"error": "Passwords don't match"})

# filter all user objects to check that there isn't an existing user with this username
username_exists = User.objects.filter(username=username).exists()
if username_exists: 
    return JsonResponse({"error": "Username already taken"})

# creates a new user with the provided username and password only if all checks have passed
new_user = User.objects.create_user(username=username, password=password)
login(request, new_user) # Django's built-in login function

return JsonResponse({"error": "None, user creation successful"}) # returns a successful response - when the frontend receives this, it will redirect
```

The full `save_register` function should now look like this: 

```python
@ensure_csrf_cookie
def save_register(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not username or not password or not confirm_password:
            return JsonResponse({"error": "Username and password required"})

        if confirm_password != password:
            return JsonResponse({"error": "Passwords don't match"})

        username_exists = User.objects.filter(username=username).exists()
        if username_exists: 
            return JsonResponse({"error": "Username already taken"})

        new_user = User.objects.create_user(username=username, password=password)
        login(request, new_user)

        return JsonResponse({"error": "None, user creation successful"})
    return JsonResponse({"error": "Needs a post request to register new user"})
```

### Logging out
Compared to logging in and registering, logging out is very simple with Django's built-in user functionality. Add the below code to the `logout_user` function's conditional: 

```python
logout(request) # built-in Django functionality for user session management
return JsonResponse({"error": "None, logged out successfully"})
```

The full function should look like this: 
```python
@ensure_csrf_cookie
def logout_user(request): 
    if request.method == "POST": 
        logout(request)
        return JsonResponse({"error": "None, logged out successfully"})
    return JsonResponse({"error": "Needs a post request to log out current user"})
```

:::note
You may have noticed that, so far, we have only called the `login` and `register` paths from the frontend. The request to the `logout` path will be added on the main dashboard page in the [frontend](../tasks/frontend.md) section of tasks, since users can only log out when they are logged in. 
:::

Congratulations, you've finished the backend for the [authentication](./authentication.md) section! Now, try running your app. In the `frontend` folder, run `docker build -t frontend .`, then `docker run -d -p 5173:5173 frontend`. Now, open a new terminal window and navigate to the `backend` folder, then run `docker build -t backend .` and `docker run -d -p 8000:8000 backend` (if you are getting module not found errors make sure `django-cors-headers` and `Django>=5.1,<6.0`). 

If you check Docker desktop, you should see two running containers. Now, go to `http://localhost:5173/register`. When you create a new account, it should redirect you to the main path (`/`), which currently still has the `Vite + React` heading and logos. Then, go to `http://localhost:5173/login` and confirm that logging in to your new account works (it should also redirect you to the `/` path)! In the [next section](../tasks/frontend.md) we'll update `App.jsx` so that this page displays a todo list interface, but before that we'll [set up a `docker-compose.yaml` file](./docker-compose.md) so that you can start up all of your containers with a single command, and then we'll [set up a PostgreSQL database](./database.md). 