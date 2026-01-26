# Backend
Let's start by creating a new Django project for task management. This can be accomplished by running the below command: 

```bash
docker compose run --rm backend sh -c "python manage.py startapp tasks"
```

Now that we have docker compose up, we can use Django commands through the backend container. Go to the main `urls.py` file in the `djangobackend` folder (this is the folder for the main app) - you will know you are in the right folder if you see `settings.py`! Now, add a new path for the tasks app. `urlpatterns` should now look like this: 

```python
urlpatterns = [
    path('authentication/', include('authentication.urls')),
    path('', include('tasks.urls'))
]
```

Now, go back into the `tasks` app and create a `urls.py`. On the frontend, we used paths for `/tasks` (for retrieving a user's tasks), `/addtask`, and `/deletetask`. Since the main urls.py file doesn't add any prefix before `tasks` paths, the full paths for these new urls will be `http://localhost:8000/tasks`, `http://localhost:8000/addtask`, and `http://localhost:8000/deletetask`, which is what we are fetching from the frontend. The rest of this section will all be in the `tasks` app, so make sure to navigate there. The `urls.py` file in `tasks` should look like this: 

```python
from django.urls import path
from .views import getUserTasks, addTaskForUser, deleteTask

urlpatterns = [
    path('tasks', getUserTasks, name='tasks'),
    path('addtask', addTaskForUser, name='addtask'), 
    path('deletetask', deleteTask, name='deletetask')
]
```

Make sure to include the new tasks app in `settings.py`: 

```python
INSTALLED_APPS = [
    # from past sections
    'authentication', 
    'corsheaders', 
    
    'tasks', # add this! 

    # ...other installed apps...
]
```

## The Task Model
We will be storing tasks in the Postgres database configured in the [database](../authentication/database.md) section, so we need a Django model to store a task's name, description, and the user object associated with it. Here's code for a simple Django model to do that, which you should add to the `models.py` file: 

```python
from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Task(models.Model): 
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, null=True, blank=True)
```

## Retrieving User Tasks
Navigate to the `views.py` file (still in the `tasks` app). Here, we will define the `addTaskForUser`, `deleteTask`, and `getUserTasks` functions referenced in `urls.py`. Let's create the `getUserTasks` function, along with the necessary imports, at the top of the `views.py` file: 

```python
from django.shortcuts import render
from .models import Task
from django.views.decorators.csrf import ensure_csrf_cookie
import json
from django.http import JsonResponse
from django.contrib.auth.models import User

# Create your views here.
@ensure_csrf_cookie
def getUserTasks(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        username = data.get("username")
        user = User.objects.filter(username=username).first() # uses the username passed from the body of the request from the frontend to find the associated user (if any); this works because when registering new users it doesn't allow duplicate usernames
        if not user: 
            return JsonResponse({"error": "User " + username + " could not be found"})
        return getTasks(user)
    return JsonResponse({"error": "Needs a post request to retrieve user's tasks"})
```

In a moment, we'll define the `getTasks(user)` function, but if you are confused about any other part of this function, please reference the similar functions created for [authentication](../authentication/backend.md). 

The `getTasks(user)` function takes a user object and filters all `Task` model instances whose foreign keys match that user, then returns a JSON response of those tasks. 

```python
def getTasks(user): 
    user_tasks = list(Task.objects.filter(user=user).values("name", "description"))
    return JsonResponse(user_tasks, safe=False)
```

The `safe=False` section is to allow non-dictionaries to be JSON-ified (since lists aren't dictionaries). 

## Adding New Tasks
Now, we'll define the `addTaskForUser` method. First, it will extract the username, task name, and task description sent from the frontend in the body of the `fetch` request. Then, it will filter the user objects to find the user associated with that username, and then find the current user (part of Django's built-in user management functionality). Then, it uses `.exists()` to check if there is a duplicate task to the one described for the given user, and if there is, returns an error. It will then compare the two users, and ensure that a user can only assign tasks to themselves - if they try to assign a task to another user, the backend will return an error. Finally, it creates the task with the specified name and description, and uses `.save()` to save it to the Postgres database. 

```python
@ensure_csrf_cookie
def addTaskForUser(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        username = data.get("username")
        task_name = data.get("taskname")
        task_desc = data.get("taskdesc")

        user = User.objects.filter(username=username).first()
        is_duplicate = Task.objects.filter(user=user, name=task_name).exists() # each task name can only exist once per user. descriptions can be duplicated

        if is_duplicate: 
            return JsonResponse({"error": "A task with this name already exists for this user"})

        current_user = request.user
        if user != current_user: 
            return JsonResponse({"error": "You do not have permission to add tasks for other users"})

        user_task = Task(user=user, name=task_name, description=task_desc).save()
        return JsonResponse({"error": "None, successfully added task"})
    return JsonResponse({"error": "Needs a post request to get a user's tasks"})
```

If, after reading the above description, you are confused by any part of this function please refer back to the [authentication](../authentication/backend.md) section. 

The frontend will process the successful JSON response (`{"error": "None, successfully added task"}`) and retrieve the user's tasks, or it will throw an error defined by the backend (ex. `"A task with this name already exists for this user"`). 

## Deleting Tasks
Finally, we'll define the `deleteTask` method. Like previous methods, it will retrieve the data passed from the frontend, determine if the user has permission to delete the task, find the task based on the name and username (this works since each task name can only be used once per user), and delete the task. This is the method: 

```python
@ensure_csrf_cookie
def deleteTask(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        task_name = data.get("clickedtaskname")
        username_for_task = data.get("usernamefortask")
        
        user = User.objects.filter(username=username_for_task).first()
        current_user = request.user

        if user != current_user: 
            return JsonResponse({"error": "You cannot delete another user's tasks"})
        delete_task_entry = Task.objects.filter(user=user, name=task_name).first()

        if not delete_task_entry: 
            return JsonResponse({"error": "Task attempted to be deleted does not exist"})

        delete_task_entry.delete()
        return JsonResponse({"error": "None, successfully deleted task"})
    return JsonResponse({"error": "Needs a post request to update the status of the user's tasks"})
```

## Review
And that's it! To recap, the views.py file should look like this: 

```python
from django.shortcuts import render
from .models import Task
from django.views.decorators.csrf import ensure_csrf_cookie
import json
from django.http import JsonResponse
from django.contrib.auth.models import User

def getTasks(user): 
    user_tasks = list(Task.objects.filter(user=user).values("name", "description"))
    return JsonResponse(user_tasks, safe=False)

# Create your views here.
@ensure_csrf_cookie
def getUserTasks(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        username = data.get("username")

        user = User.objects.filter(username=username).first()
        if not user: 
            return JsonResponse({"error": "User " + username + " could not be found"})

        return getTasks(user)
    return JsonResponse({"error": "Needs a post request to retrieve user's tasks"})

@ensure_csrf_cookie
def addTaskForUser(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        username = data.get("username")
        task_name = data.get("taskname")
        task_desc = data.get("taskdesc")

        user = User.objects.filter(username=username).first()
        is_duplicate = Task.objects.filter(user=user, name=task_name).exists()

        if is_duplicate: 
            return JsonResponse({"error": "A task with this name already exists for this user"})

        current_user = request.user
        if user != current_user: 
            return JsonResponse({"error": "You do not have permission to add tasks for other users"})

        user_task = Task(user=user, name=task_name, description=task_desc).save()
        return JsonResponse({"error": "None, successfully added task"})
    return JsonResponse({"error": "Needs a post request to get a user's tasks"})

@ensure_csrf_cookie
def deleteTask(request): 
    if request.method == "POST": 
        data = json.loads(request.body)
        task_name = data.get("clickedtaskname")
        username_for_task = data.get("usernamefortask")
        
        user = User.objects.filter(username=username_for_task).first()
        current_user = request.user

        if user != current_user: 
            return JsonResponse({"error": "You cannot delete another user's tasks"})
        delete_task_entry = Task.objects.filter(user=user, name=task_name).first()

        if not delete_task_entry: 
            return JsonResponse({"error": "Task attempted to be deleted does not exist"})

        delete_task_entry.delete()
        return JsonResponse({"error": "None, successfully deleted task"})
    return JsonResponse({"error": "Needs a post request to update the status of the user's tasks"})
```

Now, run `docker compose up --build`! The application is now fully configured on Docker, so you can add, delete, and search tasks, create different accounts, log in, log out, and experiment! Also, feel free to change the page styling to better suit your tastes :)

To test all of the functionality, I would recommend doing the following: 
1. creating two accounts, testing login/logout functionality
2. adding tasks to both accounts
3. deleting tasks from your own account and trying to delete tasks from the account you aren't logged into

Next, we will deploy this containerized application on AWS! Click [next](../../deploying-on-aws/section-overview.md) to learn about what AWS is, and why you should learn how to use it. 