# What is Docker? 
Docker is a **containerization platform**, similar to a virtual machine (VM) except that it is lighter-weight by **sharing the kernel of its host computer's operating system**. 

:::info
A **kernel** is the part of the operating system which delegates resources and manages the execution of applications, and manages the communication between different processes. It also controls file system management and networking. 
:::

To understand this, let's first look at how virtual machines operate on a computer. 

<figure>
![Virtual machines running without Docker](./full-stack-w-docker/authentication/img/virtual-machines-docker.avif)
<figcaption>Each application runs in a virtual machine which has its own "Guest Operating System," which is **computationally expensive** (image from [this Docker tutorial](https://www.docker.com/resources/what-container/) on containers and VMs)</figcaption>
</figure>

Now, compare that to how containerized applications run on Docker: 

<figure>
![Separate containerized applications running on Docker](./img/containerization-with-docker.avif)
<figcaption>Docker allows containers to use the host OS's Linux kernel rather than their own guest OS (image from [this Docker tutorial](https://www.docker.com/resources/what-container/) on containers and VMs)</figcaption>
</figure>

Giving containers access to the kernel provides the functionality for applications to set up **only the configurations they need**, making containerization with Docker much more lightweight than creating separate virtual machines for each application. 

## Containers and Images
The official Docker website defines a container as: 

:::info
A container is a standard unit of software that packages up code and all its dependencies so the application runs quickly and reliably from one computing environment to another ([article link](https://www.docker.com/resources/what-container/))
:::

Essentially, a container holds everything necessary to run an application <u>except for a kernel</u>, which it shares with the host computer. 

It also defines container images: 

:::info
A Docker container image is a lightweight, standalone, executable application that includes everything needed to run an application: code, runtime, system tools, system libraries, and settings ([article link](https://www.docker.com/resources/what-container/))
:::

Essentially, this means that container images allow you to create containers on your local machine when you execute them. 

<figure>
![The process going from a dockerfile to a docker container](./img/dockerfile-to-image-to-container.png)
    <figcaption>
        A docker container image is created from a dockerfile (more about this [here](./dockerfiles.md)). Running an image produces a container! (image from [this CTO.ai article](https://cto.ai/blog/docker-image-vs-container-vs-dockerfile/))
    </figcaption>
</figure>

:::tip
You use a container image to create a container on your local machine. You can get images from various online libraries, including [Docker Hub](./docker-hub.md) and [Amazon ECR](https://gallery.ecr.aws/), or create your own! 
:::