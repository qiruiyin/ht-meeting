#video
视频会议项目 (服务器时间快了一个小时零1分左右)

# 环境

采用nodejs做为服务器，sqlite做为数据库，前端采用vue渲染数据

需安装node.js

# 项目运行

## 页面服务器

页面为静态页面数据来自ajax请求，目前采用nodejs http-server 也可以用其他的服务器

## 数据服务启动

	npm install // 安装依赖组件
	
	node server // 启动后台数据服务，地址为IP+端口号

	(http-server) // 如果使用node作为静态页面的服务器，可执行该命令（请先执行 npm install http-server -g），否则不需要

## 重点文件介绍

server.js 为接受前端页面的数据接口，此处使用的接口（9000）可以配置