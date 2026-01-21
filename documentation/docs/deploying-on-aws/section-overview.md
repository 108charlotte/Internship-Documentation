# Deploying on AWS: Section Overview
This section will go over deploying a Docker application (that has a GitHub repository) on an AWS (Amazon Web Services) EC2 instance using Docker Compose. 

## Configuring GitHub
If you followed the steps in the [last section](../full-stack-w-docker/section-overview.md), then you will need to create a GitHub repository for it - check out [this stackoverflow article](https://stackoverflow.com/questions/30281872/create-git-repository-for-existing-project). You will need to push to GitHub, so create a repository by following [this tutorial](https://www.youtube.com/watch?v=-RZ03WHqkaY). You can name your project whatever you would like and can choose private or public, although public will be more straightforward when copying the code into the instance. 

If you are using another full-stack project with this tutorial, just make sure that you know the ports for the frontend, backend, and database, understand the permissions that each will need for accessing the internet (AWS security group rules), have a GitHub repository, and have set up your application to launch with Docker Compose. 

## What is an EC2 instance? 
AWS's EC2 stands for elastic compute cloud, which, in Amazon's own words, is "a web service that provides secure, resizable compute capacity in the cloud" (read more [here](https://aws.amazon.com/pm/ec2/)). Essentially, an EC2 instance is a cloud server where you can run your application rather than having to use your own digital infrastructure. 

## Outline
First, we will discuss the constraints associated with the AWS free tier and explain why this tutorial uses an EC2 instance in [considerations](./considerations.md)

Then, we will go over how to create a new EC2 instance through the AWS console in [EC2 creation](./ec2-creation.md). We will cover how to install docker and docker compose on that instance in [EC2 installation](./ec2-installation.md), then upload your code from your GitHub repository into the instance in [Uploading A GitHub Project to EC2](./uploading-files-to-ec2.md). Finally, we will run your application on the instance in [Running Your Application](./running-your-app.md). 