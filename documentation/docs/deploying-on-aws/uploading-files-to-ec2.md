# Uploading A GitHub Project to EC2
It is easy to upload your files to the EC2 if they are in a [GitHub repository](../full-stack-w-docker/authentication/github-project.md). Your repository doesn't have to be public to do this either, but its a little more complicated with private repositories.  

Check out the first minute of [this tutorial](https://www.youtube.com/watch?v=LITy_6FoY-w) for getting the HTTPS URL of your GitHub repository. Once you've copied the URL, run the following command (make sure to replace the URL in the git clone command with the actual HTTPS address of your repository):

```bash
sudo yum install git -y # this will install Git so that you can use git clone in the instance

git clone https://github.com/yourusername/your-repo.git # replace with actual URL (from clipboard)
```

This does work for private repositories too, but you will be prompted for a username and password. For the password, don't use your actual password - use a personal access token. Check out [this video](https://www.youtube.com/watch?v=IuiH6cBtc58) for an explanation of why this is and how to get and use your personal access token to authenticate! 

## Adding the .env
Remember how for the database credentials and information we used a `.env` file? Well, that was in `.gitignore` so it wasn't saved to our GitHub repository, which means it also wasn't cloned when we cloned the GitHub repository just then. 

You can create the `.env` file with the `nano` command. First, `cd` into your repository (you can check its name using `ls` if you need to since you just cloned it), then run: 

```bash
nano .env
```

Check your `.env` from your local repository and paste that information. Here's a quick guide on how to use [nano](https://www.youtube.com/watch?v=g2PU--TctAM)! 