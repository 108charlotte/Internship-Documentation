# Frontend
Go into the `frontend` folder, then into `src` and find `App.jsx`. It will have some placeholder content, including a vite logo and React logo. Delete this content and replace it with the below code, which creates a base to work from, including the imports we will be using and the custom URL (see [authentication frontend](../authentication/frontend.md) and [database setup](../authentication/database.md) if confused): 

```jsx
import { useState, useEffect } from 'react'; 
import './App.css'; 
import { useLocation } from 'react-router-dom'; // this is the only difference from the authentication pages; it will be used to get the current user's username, which is passed from login and registration
import { getCookie } from './csrftoken.jsx'; 
import { useNavigate } from 'react-router-dom'; 

const url = import.meta.env.VITE_FETCH_URL ? import.meta.env.VITE_FETCH_URL : "http://localhost:8000";

function App() {

  return (
    <>
        <h1>Tasks Manager</h1>
      
    </>
  )
}

export default App; 
```

## Setting Variables
Let's define the different variables we will need. 
In order to search for a user via username and retrieve their tasks, it will be necessary to have a variable to store `tasks` and one to store `usernames`. We also need to store if the tasks for a particular user, once searched, have been loaded to allow a special message for empty task lists (`tasksLoaded`). 

There is also some task-addition specific data to store: the name (`namefortask`) and description (`descfortask`) for a task entered in the form. 

For deleting tasks when a task is clicked, we need a `clickedTaskName` and a variable to store if a request to delete a certain task should be sent to the backend (`sendDeleteRequest`). 

For displaying user error messages, we need `errorForUser`, for retrieving the username of the currently active user sent from logging in/registering we will need to set a `location` variable using `useLocation()`, and in order to redirect to other pages we will need to define a `navigate` variable with `useNavigate()`

Now, define all of these at the top of the `App()` function with `useState` and their defaults, along with `location` and `navigate`: 
```jsx
const location = useLocation();

const [tasks, setTasks] = useState([]); // defaults to an empty list
const [username, setUsername] = useState(location.state?.username || ""); // defaults to the username of the logged-in user or an empty string if not available
const [namefortask, setnamefortask] = useState(""); // defaults to an empty string before the user has typed anything
const [descfortask, setdescfortask] = useState(""); // defaults to an empty string before the user has typed anything
const [tasksLoaded, setTasksLoaded] = useState(false); // defaults to false since tasks are loaded when the user submits a name, and no name has been submitted initially
const [clickedTaskName, setClickedTaskName] = useState(""); // no task has been clicked yet, so sets clicked task name to an empty string
const [sendDeleteRequest, setSendDeleteRequest] = useState(false); // no task has been clicked so no request to delete a task should be sent to the backend by default
const [errorForUser, setErrorForUser] = useState(""); // no error initially

const navigate = useNavigate(); 

```

To review, the `App.jsx` file should look like this now: 
```jsx
import { useState, useEffect } from 'react'; 
import './App.css'; 
import { useLocation } from 'react-router-dom';
import { getCookie } from './csrftoken.jsx'; 
import { useNavigate } from 'react-router-dom'; 

const url = import.meta.env.VITE_FETCH_URL ? import.meta.env.VITE_FETCH_URL : "http://localhost:8000"; 

function App() {
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(location.state?.username || "");
    const [namefortask, setnamefortask] = useState("");
    const [descfortask, setdescfortask] = useState("");
    const [tasksLoaded, setTasksLoaded] = useState(false);
    const [clickedTaskName, setClickedTaskName] = useState("");
    const [sendDeleteRequest, setSendDeleteRequest] = useState(false);
    const [errorForUser, setErrorForUser] = useState("");

    const navigate = useNavigate(); 

    return (
        <>
            <h1>Tasks Manager</h1>
        
        </>
    )
}

export default App; 
```

## Not Signed In Screen
When no user is logged in, the `/` path will currently display this page, but we want to force users to authenticate before they can see their or others tasks. When a user is authenticated, two values are passed through the location state: an initial value for the `username` (what is displayed in the search bar when looking for a user's tasks) and an `activeUserUsername` (which represents the username of the active user). The difference between these two variables is that `username` will change every time the user searches for another user's tasks, while `activeUserUsername` only changes when a new user is authenticated. 

So, to verify that a user is currently logged in, we can use `activeUserUsername` from `location.state`. Let's set up a conditional in jsx beneath `<h1>Tasks Manager</h1>` to render different pages depending on whether or not there is an authenticated user: 

```jsx
{/* checks if there is an active username from the location state */}
{location.state?.activeUserUsername ? (
    <>
        <p>Welcome {location.state?.activeUserUsername}! </p>
        {/* TODO in next step: add task search bar via username */}
    </>
    ) : 
    <p>Log in <a href="/login">here</a>, or if you don't have an account, register <a href="/register">here</a>! </p>
}
```

To recap, your `App.jsx` file should now look like this: 
```jsx
import { useState, useEffect } from 'react'; 
import './App.css'; 
import { useLocation } from 'react-router-dom';
import { getCookie } from './csrftoken.jsx'; 
import { useNavigate } from 'react-router-dom'; 

const url = import.meta.env.VITE_FETCH_URL ? import.meta.env.VITE_FETCH_URL : "http://localhost:8000"; 

function App() {
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(location.state?.username || "");
    const [namefortask, setnamefortask] = useState("");
    const [descfortask, setdescfortask] = useState("");
    const [tasksLoaded, setTasksLoaded] = useState(false);
    const [clickedTaskName, setClickedTaskName] = useState("");
    const [sendDeleteRequest, setSendDeleteRequest] = useState(false);
    const [errorForUser, setErrorForUser] = useState("");

    const navigate = useNavigate(); 

    return (
        <>
            <h1>Tasks Manager</h1>
            {location.state?.activeUserUsername ? (
                <>
                    <p>Welcome {location.state?.activeUserUsername}! </p>
                    {/* TODO in next step: add task search bar via username */}
                </>
                ) : 
                <p>Log in <a href="/login">here</a>, or if you don't have an account, register <a href="/register">here</a>! </p>
            }
        </>
    )
}

export default App; 
```


## Retrieving Tasks
First, the application should allow users to display the tasks of any other user with an account by searching their username. When a user is first logged in, their name should be auto-populated in the search bar so they can see their own tasks. The HTML form to do this can be found below. This should be added beneath `<p>Welcome {location.state?.activeUserUsername}!</p>`. 

```jsx
<div className="username-form">
    <form onSubmit={searchUsername}>
        <label>Enter a username to see their tasks (case-sensitive)</label><br/><br/>
        <input type="text" id="username" name="username" value={username} onChange={(e) => {setUsername(e.target.value); setTasksLoaded(false); }}/><br/>
        <br/>
        <button type="submit">See this user's tasks</button>
    </form>
</div>
```

Let's break down what each part of this does. The entire `form` is wrapped in a `div` tag for easy styling. The form itself has an `onSubmit` attribute which calls the `searchUsername` function which we are about to write. Inside, there is a `label` which explains the `input`, and a `button` which submits the form (`type="submit"`). The `input` takes text input (since it is for a username), has an id and name of username, is pre-set to the value of `username` (remember how this is pre-set as `activeUserUsername` from authentication), and when it is updated automatically updates the value of `username` to the value in the input box with `setUsername`, which is defined by `useState`. 

Now, let's look at the `searchUsername` arrow function. The code can be found below: 

```jsx
const searchUsername = (event) => {
    event.preventDefault(); // stops the page from re-loading when the form is submitted
    getTasksForUsername();
}
```

The reason why this function is calling another function rather than retrieving the tasks from the backend itself is because when a task is added or deleted we will also need to retrieve a user's tasks, so the separate function helps reduce duplication. Now, let's look at the `getTasksForUsername` function. 
```jsx
function getTasksForUsername() {
    fetch(url + "tasks", {
        method: "POST",
        headers: {
        "Content-Type": "application/json", 
        "X-CSRFToken": getCookie('csrftoken'),
        },
        credentials: "include", 
        body: JSON.stringify({"username": username})
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.error) {
            setErrorForUser(data.error);
            setTasks([]);
            setTasksLoaded(false);
        } else {
            setTasks(data);
            setTasksLoaded(true);
            setErrorForUser("");
        }
    })
    .catch((error) => {
        console.error("Error:", error); 
        setErrorForUser("Error retrieving tasks for " + username);
        setTasksLoaded(false);
    })
};
```

The function starts with a fetch request to the backend, similar to those in user authentication, but with a different URL target: `/tasks` rather than `/authentication/login` or `/authentication/register`. It sends a post request with the same methodology as found in authentication (if you want to review the CSRF token or any other part of the POST request, check out the page on the [authentication frontend](../authentication/frontend.md)). Then, it converts the response to JSON format (to ensure all data is standardized) and checks for errors. The tasks endpoint for retrieving tasks will either return the JSON of the user's (determined by username) tasks or an error. If there's an error which the backend didn't anticipate and return a custom error message for, there's also a `.catch((error) => {...})` which defines the application's response in case of an unexpected error, along with entering it into the developer console so that you can debug. 

But in order to get this CSRF token, we should generate one like we did for the [Login and Register pages](../authentication/frontend.md) by sending a fetch request to a CSRF enforced backend endpoint: 

```jsx
useEffect(() => {
    fetch(url + "/authentication/login", {
        method: "GET",
        credentials: "include",
    }).catch((error) => console.error("CSRF token retrieval error:", error));
}, []);
```

Now, let's display the tasks after they've been retrieved from the backend. We can also dynamically render a visual block for tasks using the `tasksLoaded` variable and some styling. We already linked the CSS, so let's create the `App.css` file and add the following minimalistic styling: 

```css
* {
    font-family: "Nunito", sans-serif; 
}

form {
    margin-left: 10px; 
}

button {
    margin-bottom: 10px; 
}

h1 {
    margin: 10px; 
}

.task-list-ul {
    text-align: left
}

.username-form {
    background: rgb(243, 243, 243); 
    box-shadow: rgb(92, 92, 92); 
    padding: 15px; 
    border-radius: 10px; 
    margin: 10px; 
    width: 500px; 
}

.task-list {
    background: rgb(243, 243, 243); 
    box-shadow: rgb(92, 92, 92); 
    padding: 15px; 
    border-radius: 10px; 
    border-radius: 10px; 
    margin: 10px; 
    width: 500px; 
}

.add-task {
    background: rgb(243, 243, 243); 
    box-shadow: rgb(92, 92, 92); 
    padding: 15px; 
    border-radius: 10px; 
    border-radius: 10px; 
    margin: 10px; 
    width: 500px; 
}

.error {
    color: red; 
    margin-left: 10px; 
}

button {
    background-color: rgb(185, 185, 185); 
    border: 2px solid rgb(79, 79, 79); 
    border-radius: 5px; 
}

input {
    border: 2px solid rgb(158, 158, 163); 
    border-radius: 5px; 
    padding: 5px; 
    width: 200px; 
    margin: 10px 10px; 
}
```

Now, let's use a jsx conditional combining `tasksLoaded` and `tasks.length` to only display the tasks block when tasks have been retrieved, and to display a custom message when a user has no tasks. Add this conditional within the `location.state?activeUserUsername` conditional so that it only runs when there is an authenticated user. 

```jsx
{tasks.length == 0 && tasksLoaded ? (
    <div className="task-list"><p>This user doesn't have any tasks right now! </p></div>
    ) : tasksLoaded && 
    <div className="task-list">
        <p>Tasks: </p>
        <ul className="task-list-ul">
        {tasks.map((task, index) => (
            <li key={index} id={task.name}>{task.name}: {task.description}</li>
        ))}
        </ul>
    </div>
}
```

We've updated the `errorForUser` variable but haven't actually displayed it yet, so let's do that at the top of the `location.state?activeUserUsername` conditional (outside of the one we just defined): 

```jsx
<div className="error">
    <p>{errorForUser}</p>
</div>
```

To review, the `App.jsx` file should now look like this: 
```jsx
import { useState, useEffect } from 'react'; 
import './App.css'; 
import { useLocation } from 'react-router-dom';
import { getCookie } from './csrftoken.jsx'; 
import { useNavigate } from 'react-router-dom'; 

const url = import.meta.env.VITE_FETCH_URL ? import.meta.env.VITE_FETCH_URL : "http://localhost:8000"; 

function App() {
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(location.state?.username || "");
    const [namefortask, setnamefortask] = useState("");
    const [descfortask, setdescfortask] = useState("");
    const [tasksLoaded, setTasksLoaded] = useState(false);
    const [clickedTaskName, setClickedTaskName] = useState("");
    const [sendDeleteRequest, setSendDeleteRequest] = useState(false);
    const [errorForUser, setErrorForUser] = useState("");

    const navigate = useNavigate(); 

    useEffect(() => {
        fetch(url + "/authentication/login", {
            method: "GET",
            credentials: "include",
        }).catch((error) => console.error("CSRF token retrieval error:", error));
    }, []);

    function getTasksForUsername() {
        fetch(url + "/tasks", {
            method: "POST",
            headers: {
            "Content-Type": "application/json", 
            "X-CSRFToken": getCookie('csrftoken'),
            },
            credentials: "include", 
            body: JSON.stringify({"username": username})
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                setErrorForUser(data.error);
                setTasks([]);
                setTasksLoaded(false);
            } else {
                setTasks(data);
                setTasksLoaded(true);
                setErrorForUser("");
            }
        })
        .catch((error) => {
            console.error("Error:", error); 
            setErrorForUser("Error retrieving tasks for " + username);
            setTasksLoaded(false);
        })
    };

    const searchUsername = (event) => {
        event.preventDefault();
        getTasksForUsername();
    }

    return (
        <>
            <h1>Tasks Manager</h1>
            {location.state?.activeUserUsername ? (
                <>
                    <p>Welcome {location.state?.activeUserUsername}! </p>

                    <div className="error">
                        <p>{errorForUser}</p>
                    </div>

                    <div className="username-form">
                        <form onSubmit={searchUsername}>
                            <label>Enter a username to see their tasks (case-sensitive)</label><br/><br/>
                            <input type="text" id="username" name="username" value={username} onChange={(e) => {setUsername(e.target.value); setTasksLoaded(false); }}/><br/>
                            <br/>
                            <button type="submit">See this user's tasks</button>
                        </form>
                    </div>

                    {tasks.length == 0 && tasksLoaded ? (
                        <div className="task-list"><p>This user doesn't have any tasks right now! </p></div>
                        ) : tasksLoaded && 
                        <div className="task-list">
                            <p>Tasks: </p>
                            <ul className="task-list-ul">
                            {tasks.map((task, index) => (
                                <li key={index} id={task.name}>{task.name}: {task.description}</li>
                            ))}
                            </ul>
                        </div>
                    }
                </>
                ) : 
                <p>Log in <a href="/login">here</a>, or if you don't have an account, register <a href="/register">here</a>! </p>
            }
        </>
    )
}

export default App; 
```

Once this is set, spin up your Docker container with `docker compose up --build` and go to `http://localhost:5173`. Click "register", then create a new account. You should be redirected to the new screen we just created! However, clicking submit won't display any tasks for your username until we allow the user to add tasks (up next!) and set up the [backend](./backend.md). 

## Adding Tasks
Now, users should be able to see their tasks, but they can't add any new ones. This will require another HTML form, but this form should display conditionally: a user should only be able to add tasks with verification that the username whose tasks they are viewing matches their own (`location.state?.activeUserUsername == username`). This is only frontend verification for now and in the [backend](./backend.md) section we will add backend safegaurds against users adding and deleting tasks that aren't their own. We also only want the form to display once the user has loaded the tasks for a username (they shouldn't be able to add tasks blindly, otherwise they might duplicate existing ones). Add the below jsx conditional and form beneath the block displaying tasks, but still inside of the conditional which checks that a user is logged in, to allow users to enter new tasks on the frontend: 

```jsx
{tasksLoaded && location.state?.activeUserUsername == username && (
    <div className="add-task">
        <form onSubmit={addTask}>
            <label>Write the name and (optionally) a short description of a task for this user: </label><br /><br />
            <input type="text" id="namefortask" name="namefortask" value={namefortask} onChange={(e) => {setnamefortask(e.target.value); setErrorForUser("");}}/><br/>
            <input type="text" id="descfortask" name="descfortask" value={descfortask} onChange={(e) => {setdescfortask(e.target.value); setErrorForUser("");}}/><br/>
            <br />
            <button type="submit">Add a new task</button>
        </form>
    </div>
)}
```

The `div` allows for easy styling of the form, and the form itself has an `onSubmit` attribute which calls a function to add a task. Values for the new task's name (`namefortask`) and description (`descfortask`) are set using their respective methods from `useState`, and updated whenever the input is changed (although the add task function is **only** called when the form is actually submitted). Typing in either `input` box will also set the error for the user to an empty string, so that they don't see ghost errors from previous submissions. 

Now, let's look at the `addTask` arrow function: 

```jsx
const addTask = (event) => {
    event.preventDefault(); 
    setErrorForUser("");
    fetch(url + "/addtask", {
        method: "POST", 
        headers: {
        "Content-Type": "application/json", 
        "X-CSRFToken": getCookie('csrftoken'),
        }, 
        credentials: "include", 
        body: JSON.stringify({"taskname": namefortask, "taskdesc": descfortask, "username": username})
    })
    .then(response => response.json())
    .then((error) => {
        if (error.error == "None, successfully added task") {
            getTasksForUsername();
            setnamefortask("");
            setdescfortask("");
        } else {
            setErrorForUser(error.error); 
        }
    })
    .catch((error) => {console.error("Error:", error); setErrorForUser("Error adding task")}); 
}
```

Like previous `onSubmit` functions, this function prevents the page from reloading on form submission and sends a `fetch` request to the Django backend with the appropriate CSRF token in the header, and necessary new task information (name and description) in the body in JSON format. It then standardizes the response to JSON. When it receives a custom error from the backend, it will set an error for the user, but when it doesn't (the backend returns `"None, successfully added ask"`), it will retrieve the tasks for that username (when adding tasks, this will always be the current user - otherwise, an error is thrown by the backend) and wipe the name and description from the add task form. If an unexpected error occurs, it will provide a message for the user and a debug console message for the developer. 

That's it for adding tasks! To review, your `App.jsx` file should look like this: 

```jsx
import { useState, useEffect } from 'react'; 
import './App.css'; 
import { useLocation } from 'react-router-dom';
import { getCookie } from './csrftoken.jsx'; 
import { useNavigate } from 'react-router-dom'; 

const url = import.meta.env.VITE_FETCH_URL ? import.meta.env.VITE_FETCH_URL : "http://localhost:8000"; 

function App() {
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(location.state?.username || "");
    const [namefortask, setnamefortask] = useState("");
    const [descfortask, setdescfortask] = useState("");
    const [tasksLoaded, setTasksLoaded] = useState(false);
    const [clickedTaskName, setClickedTaskName] = useState("");
    const [sendDeleteRequest, setSendDeleteRequest] = useState(false);
    const [errorForUser, setErrorForUser] = useState("");

    const navigate = useNavigate(); 

    useEffect(() => {
        fetch(url + "/authentication/login", {
            method: "GET",
            credentials: "include",
        }).catch((error) => console.error("CSRF token retrieval error:", error));
    }, []);

    function getTasksForUsername() {
        fetch(url + "/tasks", {
            method: "POST",
            headers: {
            "Content-Type": "application/json", 
            "X-CSRFToken": getCookie('csrftoken'),
            },
            credentials: "include", 
            body: JSON.stringify({"username": username})
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                setErrorForUser(data.error);
                setTasks([]);
                setTasksLoaded(false);
            } else {
                setTasks(data);
                setTasksLoaded(true);
                setErrorForUser("");
            }
        })
        .catch((error) => {
            console.error("Error:", error); 
            setErrorForUser("Error retrieving tasks for " + username);
            setTasksLoaded(false);
        })
    };

    const searchUsername = (event) => {
        event.preventDefault();
        getTasksForUsername();
    }

    const addTask = (event) => {
        event.preventDefault(); 
        setErrorForUser("");
        fetch(url + "/addtask", {
            method: "POST", 
            headers: {
            "Content-Type": "application/json", 
            "X-CSRFToken": getCookie('csrftoken'),
            }, 
            credentials: "include", 
            body: JSON.stringify({"taskname": namefortask, "taskdesc": descfortask, "username": username})
        })
        .then(response => response.json())
        .then((error) => {
            if (error.error == "None, successfully added task") {
                getTasksForUsername();
                setnamefortask("");
                setdescfortask("");
            } else {
                setErrorForUser(error.error); 
            }
        })
        .catch((error) => {console.error("Error:", error); setErrorForUser("Error adding task")}); 
    }

    return (
        <>
            <h1>Tasks Manager</h1>
            {location.state?.activeUserUsername ? (
                <>
                    <p>Welcome {location.state?.activeUserUsername}! </p>

                    <div className="error">
                        <p>{errorForUser}</p>
                    </div>

                    <div className="username-form">
                        <form onSubmit={searchUsername}>
                            <label>Enter a username to see their tasks (case-sensitive)</label><br/><br/>
                            <input type="text" id="username" name="username" value={username} onChange={(e) => {setUsername(e.target.value); setTasksLoaded(false); }}/><br/>
                            <br/>
                            <button type="submit">See this user's tasks</button>
                        </form>
                    </div>

                    {tasks.length == 0 && tasksLoaded ? (
                        <div className="task-list"><p>This user doesn't have any tasks right now! </p></div>
                        ) : tasksLoaded && 
                        <div className="task-list">
                            <p>Tasks: </p>
                            <ul className="task-list-ul">
                            {tasks.map((task, index) => (
                                <li key={index} id={task.name}>{task.name}: {task.description}</li>
                            ))}
                            </ul>
                        </div>
                    }
                    {tasksLoaded && location.state?.activeUserUsername == username && (
                        <div className="add-task">
                            <form onSubmit={addTask}>
                                <label>Write the name and (optionally) a short description of a task for this user: </label><br /><br />
                                <input type="text" id="namefortask" name="namefortask" value={namefortask} onChange={(e) => {setnamefortask(e.target.value); setErrorForUser("");}}/><br/>
                                <input type="text" id="descfortask" name="descfortask" value={descfortask} onChange={(e) => {setdescfortask(e.target.value); setErrorForUser("");}}/><br/>
                                <br />
                                <button type="submit">Add a new task</button>
                            </form>
                        </div>
                    )}
                </>
                ) : 
                <p>Log in <a href="/login">here</a>, or if you don't have an account, register <a href="/register">here</a>! </p>
            }
        </>
    )
}

export default App; 
```

When you run `docker compose up --build` you won't yet be able to see the form for submitting new tasks or the list of tasks we just added since both rely on a successful response being returned from the backend when retrieving a user's tasks. If not, make sure the username entered into the search bar is your own! However, if you enter task names and descriptions, they will not yet be added because the [backend](./backend.md) has not been configured to respond to these requests. Now, let's allow users to delete their own tasks also by clicking on them. 


## Deleting Tasks
When a user clicks a task on their task list, it should be deleted! The first step to implementing this is adding an `onClick` attribute to each task list item, so that it now looks like this (inside of the `tasks.map((task, index) => (...)))`): 

```jsx
<li onClick={deleteTask} key={index} id={task.name}>{task.name}: {task.description}</li>
```

Now, let's define the `deleteTask` function: 

```jsx
const deleteTask = (event) => {
    event.preventDefault(); 
    setClickedTaskName(event.currentTarget.id); 
    setErrorForUser("");
    setSendDeleteRequest(true);
}
```

You may be wondering why this function isn't making the `fetch` request directly. The reason is that, since `clickedTaskName` is defined by `useState`, in order to make sure that the value is updated in `clickedTaskName` before the `fetch` request is sent. It will also set the error for the user back to an empty string, so that the user doesn't see any ghost errors from past requests. Finally, it updates the `sendDeleteRequest` variable to true. When this variable is updated, we know that `clickedTaskName` has also been updated since both use `useState`. 

Now, let's define a `useEffect` block which checks if `sendDeleteRequest` is true. We'll configure this block to run whenever `sendDeleteRequest` updates, and it will send a fetch request to the `/deletetask` endpoint, then follow a similar logic flow to adding a task to either set an error for the user or get the tasks for a user if the operation was successful. Here's the code for the `useEffect` block: 

```jsx
useEffect(() => {
    if (sendDeleteRequest) {
        fetch(url + "/deletetask", {
            method: "POST", 
            headers: {
                "Content-Type": "application/json", 
                "X-CSRFToken": getCookie('csrftoken'),
            }, 
            credentials: "include", 
            body: JSON.stringify({"clickedtaskname": clickedTaskName, "usernamefortask": username})
        })
        .then(response => response.json())
        .then((error) => {
            if (error.error == "None, successfully deleted task") {
                getTasksForUsername();
            } else {
                setErrorForUser(error.error);  
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            setErrorForUser("Error deleting task");
        });  
        setSendDeleteRequest(false); 
    }
}, [sendDeleteRequest])
```


## Bonus: Logging Out
We've already built the backend for logging out a user, so let's add a button to allow the user to log out. Beneath the "Welcome" p tag and above the "username-form" div, add the following HTML: 

```jsx
<form onSubmit={logout}><button type="submit">Log out</button></form>
```

This creates a button for the user to log out which calls the `logout` arrow function. Here's the code for that function: 

```jsx
const logout = (event) => {
    event.preventDefault(); 
    setErrorForUser("");
    fetch(url + "/authentication/logout", {
        method: "POST", 
        headers: {
        "Content-Type": "application/json", 
        "X-CSRFToken": getCookie('csrftoken'),
        }, 
        credentials: "include", 
        body: JSON.stringify({"username": location.state?.activeUserUsername})
    }).then((response) => response.json())
    .then((error) => {
        if (error.error == "None, logged out successfully") {
            navigate("/"); 
        } else {
            console.error("Error:", error.error); 
            setErrorForUser(error.error); 
        }
    })
}
```

Since this is very similar to the other fetch request functions we've been using, I won't explain all of it in detail. However, there are two points to clarify. First, the username which is sent to the backend is the username of the active user, retrieved from the location state - this because the actual `username` variable is just storing the username entered in the search bar. Additionally, the backend is returning a JSON with a single key called "error", which is why this code references `error.error` (since the second `.then` renames the JSON-ified response as "error"). 


## Review
At the end of this section, your code should look like this: 

```jsx
import { useState, useEffect } from 'react'; 
import './App.css'; 
import { useLocation } from 'react-router-dom';
import { getCookie } from './csrftoken.jsx'; 
import { useNavigate } from 'react-router-dom'; 

const url = import.meta.env.VITE_FETCH_URL ? import.meta.env.VITE_FETCH_URL : "http://localhost:8000"; 

function App() {
    const location = useLocation();

    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState(location.state?.username || "");
    const [namefortask, setnamefortask] = useState("");
    const [descfortask, setdescfortask] = useState("");
    const [tasksLoaded, setTasksLoaded] = useState(false);
    const [clickedTaskName, setClickedTaskName] = useState("");
    const [sendDeleteRequest, setSendDeleteRequest] = useState(false);
    const [errorForUser, setErrorForUser] = useState("");

    const navigate = useNavigate(); 

    useEffect(() => {
        fetch(url + "/authentication/login", {
            method: "GET",
            credentials: "include",
        }).catch((error) => console.error("CSRF token retrieval error:", error));
    }, []);

    useEffect(() => {
      if (sendDeleteRequest) {
          fetch(url + "/deletetask", {
              method: "POST", 
              headers: {
                  "Content-Type": "application/json", 
                  "X-CSRFToken": getCookie('csrftoken'),
              }, 
              credentials: "include", 
              body: JSON.stringify({"clickedtaskname": clickedTaskName, "usernamefortask": username})
          })
          .then(response => response.json())
          .then((error) => {
              if (error.error == "None, successfully deleted task") {
                  getTasksForUsername();
              } else {
                  setErrorForUser(error.error);  
              }
          })
          .catch((error) => {
              console.log("Error:", error);
              setErrorForUser("Error deleting task");
          });  
          setSendDeleteRequest(false); 
      }
    }, [sendDeleteRequest])

    const deleteTask = (event) => {
        event.preventDefault(); 
        setClickedTaskName(event.currentTarget.id); 
        setErrorForUser("");
        setSendDeleteRequest(true);
    }

    const logout = (event) => {
        event.preventDefault(); 
        setErrorForUser("");
        fetch(url + "/authentication/logout", {
            method: "POST", 
            headers: {
            "Content-Type": "application/json", 
            "X-CSRFToken": getCookie('csrftoken'),
            }, 
            credentials: "include", 
            body: JSON.stringify({"username": location.state?.activeUserUsername})
        }).then((response) => response.json())
        .then((error) => {
            if (error.error == "None, logged out successfully") {
                navigate("/"); 
            } else {
                console.error("Error:", error.error); 
                setErrorForUser(error.error); 
            }
        })
    }

    function getTasksForUsername() {
        fetch(url + "/tasks", {
            method: "POST",
            headers: {
            "Content-Type": "application/json", 
            "X-CSRFToken": getCookie('csrftoken'),
            },
            credentials: "include", 
            body: JSON.stringify({"username": username})
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                setErrorForUser(data.error);
                setTasks([]);
                setTasksLoaded(false);
            } else {
                setTasks(data);
                setTasksLoaded(true);
                setErrorForUser("");
            }
        })
        .catch((error) => {
            console.error("Error:", error); 
            setErrorForUser("Error retrieving tasks for " + username);
            setTasksLoaded(false);
        })
    };

    const searchUsername = (event) => {
        event.preventDefault();
        getTasksForUsername();
    }

    const addTask = (event) => {
        event.preventDefault(); 
        setErrorForUser("");
        fetch(url + "/addtask", {
            method: "POST", 
            headers: {
            "Content-Type": "application/json", 
            "X-CSRFToken": getCookie('csrftoken'),
            }, 
            credentials: "include", 
            body: JSON.stringify({"taskname": namefortask, "taskdesc": descfortask, "username": username})
        })
        .then(response => response.json())
        .then((error) => {
            if (error.error == "None, successfully added task") {
                getTasksForUsername();
                setnamefortask("");
                setdescfortask("");
            } else {
                setErrorForUser(error.error); 
            }
        })
        .catch((error) => {console.error("Error:", error); setErrorForUser("Error adding task")}); 
    }

    return (
        <>
            <h1>Tasks Manager</h1>
            {location.state?.activeUserUsername ? (
                <>
                    <p>Welcome {location.state?.activeUserUsername}! </p>
                    <form onSubmit={logout}><button type="submit">Log out</button></form>

                    <div className="error">
                        <p>{errorForUser}</p>
                    </div>

                    <div className="username-form">
                        <form onSubmit={searchUsername}>
                            <label>Enter a username to see their tasks (case-sensitive)</label><br/><br/>
                            <input type="text" id="username" name="username" value={username} onChange={(e) => {setUsername(e.target.value); setTasksLoaded(false); }}/><br/>
                            <br/>
                            <button type="submit">See this user's tasks</button>
                        </form>
                    </div>

                    {tasks.length == 0 && tasksLoaded ? (
                        <div className="task-list"><p>This user doesn't have any tasks right now! </p></div>
                        ) : tasksLoaded && 
                        <div className="task-list">
                            <p>Tasks: </p>
                            <ul className="task-list-ul">
                            {tasks.map((task, index) => (
                                <li onClick={deleteTask} key={index} id={task.name}>{task.name}: {task.description}</li>
                            ))}
                            </ul>
                        </div>
                    }
                    {tasksLoaded && location.state?.activeUserUsername == username && (
                        <div className="add-task">
                            <form onSubmit={addTask}>
                                <label>Write the name and (optionally) a short description of a task for this user: </label><br /><br />
                                <input type="text" id="namefortask" name="namefortask" value={namefortask} onChange={(e) => {setnamefortask(e.target.value); setErrorForUser("");}}/><br/>
                                <input type="text" id="descfortask" name="descfortask" value={descfortask} onChange={(e) => {setdescfortask(e.target.value); setErrorForUser("");}}/><br/>
                                <br />
                                <button type="submit">Add a new task</button>
                            </form>
                        </div>
                    )}
                </>
                ) : 
                <p>Log in <a href="/login">here</a>, or if you don't have an account, register <a href="/register">here</a>! </p>
            }
        </>
    )
}

export default App; 
```

That's it for setting up the frontend! Click next to configure the Django methods which will respond to these `fetch` requests. 