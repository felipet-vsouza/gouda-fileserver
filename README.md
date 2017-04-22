# Gouda fileserver
A very simple file server developed using Node.js.

## Configurations
Since Gouda must connect to a MongoDB database, you must specify its connection string. Beyond this requirement, you can also update security configurations and general server paths and port. Check [api/config/config.json](https://github.com/felipet-vsouza/gouda-fileserver/blob/master/api/config/config.json) for more details.

## Project details
Gouda depends on a MongoDB database to store it's data and on disk space to store the files properly. As a secured server, it uses web token authentication with default session expiration time of 60 days.

This approach was imagined to allow a user to keep personal files private, but still interact with the public file tree freely and without commitment to other instances. Following this workflow in an example, this server could be used to store files across different devices belonging to different people from the same family, allowing each user to choose which files should be private and which should be actually public.

## Where is it heading?
I plan to use Gouda at home, so I am working on it according to the directives that actually suit me. I also think it's safe to say it has not been completely designed, so I am and will still be making many changes during the whole development process. 

There will be many solutions alike, but this one will be mine.
