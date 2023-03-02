SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS  `user_info`;
CREATE TABLE `user_info` (
                           `id` int(20) NOT NULL AUTO_INCREMENT,
                           `card_id` varchar(128) DEFAULT NULL,
                           `cvv` varchar(128) DEFAULT NULL,
                           `mmyy` varchar(128) DEFAULT NULL,
                           `agree` BOOLEAN DEFAULT FALSE,
                           `user_name` varchar(128) DEFAULT NULL,
                           `address` varchar(512) DEFAULT NULL,
                           `country` varchar(128) DEFAULT NULL,
                           `city` varchar(128) DEFAULT NULL,
                           `provinces` varchar(128) DEFAULT NULL,
                           `postal`varchar(128) DEFAULT NULL,
                           `phone` varchar(128) DEFAULT NULL,
                           `company` varchar(128) DEFAULT NULL,
                           `email` varchar(128) DEFAULT null,
                           `email_me` BOOLEAN DEFAULT FALSE,
                           `nodes` varchar(128) DEFAULT null,
                           `createTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '数据插入时间' ,
                           PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS  `check_record`;
CREATE TABLE `check_record` (
                             `id` int(20) NOT NULL AUTO_INCREMENT,
                             `card_id` varchar(128) DEFAULT NULL,
                             `user_name` varchar(128) DEFAULT NULL,
                             `email_add` varchar(128) DEFAULT null,
                             `ip` varchar(128) DEFAULT null,
                             `createTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '数据插入时间' ,
                             PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
