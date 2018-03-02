# Nodejs Classifields
This is sources of nodejs training online by Dung Vu. it uploading on youtube

## Install

First, you must have mongoDB Server (localhost for dev or cloud mongodb for production).
On localhost for dev tutorial at [Install MongoDB for development](https://www.youtube.com/watch?v=1taGqA7q5nI)

```
$ git clone https://github.com/2pay/Nodejs-classifields.git
$ cd Nodejs-classifields
$ npm install
$ npm start
```

## Config Database
* Edit database file: app/config/database.js

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

## Config Auth
* Edit database file: app/config/auth.js

## Youtube Part
* Link Playlist: [《Full List》](https://www.youtube.com/watch?v=1taGqA7q5nI&list=PLR5xIopirT8onY-b1eyVsa6E8y2_yYNmi)
