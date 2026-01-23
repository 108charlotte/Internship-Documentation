# Full Stack with Docker and AWS Tutorial
A web-based tutorial on creating a three-container full-stack application with Django, React, and PostgreSQL and deploying on an Amazon EC2 instance, created with Docusarus and available [here](https://108charlotte.github.io/Full-Stack-with-Docker-and-AWS-Tutorial/). 

This readme may be updated in the future to be more detailed! 

## Motivations
This tutorial was created as a final project for my two-week internship for the development team at Georgia's Administrative Office of the Courts (AOC) in January 2026. After spending the majority of the internship gaining familiarity with Docker and AWS, I wanted to shorten the onboarding time for new employees. Since the AOC frequently takes on summer college student interns, they often have new employees which need training with their technologies but only have a short stay at the company (which can be as short as several months). New employees need to be able to get started developing and maintaining the AOC's applications as quickly as possible, so I created this tutorial to give them hands-on experience with the technologies most commonly used in AOC applications so they can better understand the applications they will be working on. This is especially important because software documentation typically assumes knowledge of the foundational technologies an application uses, which new employees - especially college students - may not have. 

## Overview
The tutorial starts with an overview, then discusses Docker and Docker desktop installation. There are two main sections of the tutorial, both of which include a section overview: "Full Stack with Docker" and "Deploying on AWS". 

### Full Stack with Docker
"Full Stack with Docker" has two sections within it, both of which have their own overviews: "Authentication" and "Tasks". 
- Authentication: Focuses on setting up a login and signup flow for a user, along with creating a Docker Compose file and PostgreSQL database
- Tasks: Create the dashboard once a user is authenticated, where they can search for any user's tasks but can only add and remove tasks which are assigned to them.

Both the "Authentication" and "Tasks" sections start with a section overview (named "Authentication" and "Tasks" respectively), then describe the frontend setup and then the backend setup (after this, "Authentication" goes further into other categories, but these two are shared by both). The frontend tutorial is included before the backend tutorial so that issues with running Docker containers can be troubleshooted visually as early on as possible. 

### Deploying on AWS
"Deploying on AWS" includes a section overview, then a considerations page discussing the limitations of a free AWS account and the tutorial's choice to deploy on an Amazon EC2 instance, then a section on EC2 setup in the AWS developer console which ends with successfully deploying the full-stack containerized application from the last section on AWS. 

The tutorial ends with a review and congrats, where users can provide feedback for course improvement through [this form](https://docs.google.com/forms/d/e/1FAIpQLScqApoTfJlzjlRdm3h1OhkbRPy4CSp657Oe0xI5fljNYGRljw/viewform)! 
