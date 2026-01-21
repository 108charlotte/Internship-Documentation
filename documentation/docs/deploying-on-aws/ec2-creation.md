# Creating a New EC2 Instance
First, make sure you have an AWS account (it can be free tier). If you don't, create a free account [here](https://aws.amazon.com/free/). Then, in the search bar look for "EC2" and [click it](https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Overview:) when it shows up. Then click "launch instance" and set the name to whatever you would like. For the quick start, select **"Amazon Linux"** and for instance type you can use **"t3.micro"**. You don't need to create a key pair since we will be using the in-browser SSH for this tutorial. For network settings, click the "Edit" button on the right at the top of the "Network Settings" window. From here, you can add custom security groups. 

Please note that the way we will be configuring these security groups is solely for learning/development purposes, and in a production-ready application you wouldn't want to expose the frontend and backend to the internet without additional protections. 

A security group controls which IP addresses are able to interact with your EC2 instance and which ones it is able to interact with. 

Keep the existing SSH security group rule using the TCP protocol, but update the source type to "My IP" for better security. Now, we will add two more security group rules with "anywhere" source types: one for the frontend (5173) and one for the backend (8000). When you're done, everything should look like this: 

![Three security group rules, one is type ssh and the other two are custom TCP](./img/security_rules.png)

Note that there is no security rule for the database. This is because we only want the backend to communicate with the database over Docker's internal network, not the public internet - omitting a security group rule restricts database access from the outside internet. 

For storage, click "Advanced" and switch "Not encrypted" to "Encrypted". Everything else can remain on the default settings. If this is done correctly, it should look like the below: 

![Storage configuration described above, 1x8 GiB gp3 Root volume, 3000 IOPS, Encrypted](./img/storage.png)

Now you're ready to launch your instance. The summary should look like this: 

![Amazon Linux software image, t3.micro virtual server, new security group for firewall, 1 storage volume](./img/ec2_instance_summary.png)

Then click launch! Click the next button on this tutorial once the instance finishes starting up - you will see a "success" message and a grid of different actions you can take with your newly configured EC2 instance. 