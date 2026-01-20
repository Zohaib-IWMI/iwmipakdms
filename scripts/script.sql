CREATE DATABASE  IF NOT EXISTS pakdms;
USE `pakdms`;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  f_name varchar(50) NOT NULL,
  l_name varchar(45) NOT NULL,
  username varchar(50) NOT NULL,
  password varchar(250) NOT NULL,
  admin tinyint NOT NULL DEFAULT '0',
  isApproved tinyint NOT NULL DEFAULT '0',
  admin1 tinyint NOT NULL DEFAULT '0',
  admin1Name varchar(45) DEFAULT NULL,
  admin2 tinyint NOT NULL DEFAULT '0',
  admin2Name varchar(45) DEFAULT NULL,
  organization varchar(100) DEFAULT NULL,
  purpose varchar(200) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username_UNIQUE (username)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE users DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Demo','User','user@example.com','$2b$10$DZZFOFbs4JOfVrXewwWrP.J8ThGEueCPkgiwGPK5VLSKYurEjFztC',1,1,0,'',0,'','Levant', 'Full Stack Developer'),(2,'Umair','Rabbani','cto@spatial.levantc.com','$2b$10$xHyBP53yDeL4L6ktDQSPq.ugJHV7MQjzS3RmOLJUFbcxQizirEF6C',1,1,0,NULL,0,NULL,'Levant', 'CTO');
UNLOCK TABLES;
