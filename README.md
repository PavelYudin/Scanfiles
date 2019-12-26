# Scanfiles
The program for copying files, parsing, as well as finding duplicates in NDR files
files, as well as logging, for convenient monitoring of the program. Server.log file is created in the project folder, in which information is written about running threads. In the log_threads folder, log files are created with the name of the thread, which displays information about the thread. The program implements a console that duplicates the console of the machine on which the web service is running.
It is also possible through the console to view log files and download.
To do this, enter the command "logs". In the list that appears, select the file of interest, and enter its number or name. To download, enter the name or file number and add the word "download".
The console opens by typing the command “console”.
The program also implements finding duplicate identifiers in NDR files. To start this functionality, you must enter the word "duplicate" on the keyboard.
The transition to the main page (with displayed streams) occurs through the command - "main".
Logging into the program is through authentication.
This software uses a lightweight DB - NeDB, which stores the login and password for authentication, and the login and password for sending messages when an error occurs in the program when streams are running.
