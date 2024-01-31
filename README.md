# Nodejs Classifieds
This is sources of nodejs training online by Dung Vu. it uploading on youtube.

# Nodejs Modules
Modules in source:
- Nodejs (JavaScript runtime)
- Express (Framwork)
- Mongodb (database)
- Mongoose (Object Data Mapping)
- Express-handlebars (template enginee)
- i18n (multi languages)
- Passportjs (Authentication)
- CSRF (Protected Cross Site Request Forgery)
- ....

## Install

First, you must have mongoDB Server (localhost for dev or cloud mongodb for production).
On localhost for dev

```
$ git clone https://github.com/2pay/Nodejs-classifields.git
$ cd Nodejs-classifields
$ npm install
$ npm start
```

## Config Database
* Edit database file: config/database.js

On localhost with auth of MongoDB

```
dbStr: 'mongodb://mongo_username:mongo_password@mongo_host:mongo_port/mongo_dataname'
```

+ **mongo_username:** your username mongodb
+ **mongo_password:** your password of username mongodb
+ **mongo_host:** your host address or ip address mongodb
+ **mongo_port:** your port mongodb (27017)
+ **mongo_dataname:** your name of databse mongo

On localhost not auth of MongoDB

```
dbStr: 'mongodb://mongo_host:mongo_port/mongo_dataname'
```

+ **mongo_host:** your host address or ip address mongodb
+ **mongo_port:** your port mongodb (27017)
+ **mongo_dataname:** your name of databse mongo

## Youtube Part
* First Part: ((https://www.youtube.com/watch?v=iQmAGjs91Lo)https://www.youtube.com/watch?v=iQmAGjs91Lo)
