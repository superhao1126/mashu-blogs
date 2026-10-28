---
description: 在 Ubuntu 24.04 上安装 Nginx，配置静态网站和接口反向代理。记录站点目录、配置检查、日志定位与服务管理的完整步骤，为部署个人网站和后端服务留下一份可查阅的操作笔记。
title: Ubuntu 24.04 安装 Nginx 并配置静态站点与反向代理
sidebarSort: 1
date: 2026-10-22
permalink: /nginx/install
categories:
  - Nginx
tags:
  - Ubuntu
  - Nginx
  - 部署
  - 反向代理
---

# Ubuntu 24.04 安装 Nginx 并配置静态站点与反向代理

本文以 Ubuntu 24.04 LTS 为例，通过系统 APT 仓库安装 Nginx，再配置一个静态站点和 `/api/` 反向代理。安装步骤参考 [Ubuntu 官方安装文档](https://ubuntu.com/server/docs/how-to-install-nginx/)。

示例约定：站点域名为 `blog.example.com`，静态文件放在 `/var/www/mashu-blog`，后端监听 `127.0.0.1:8080`。使用时替换为自己的域名与端口。

## 一、检查环境

在 Ubuntu 服务器终端执行：

```bash
cat /etc/os-release
command -v nginx
sudo ss -lntp '( sport = :80 or sport = :443 )'
```

如果 80 或 443 端口已被 Apache、其他 Nginx 或容器占用，先确认现有服务用途，再选择端口。已有站点时，修改配置前先备份：

```bash
sudo cp -a /etc/nginx "/etc/nginx.backup-$(date +%Y%m%d-%H%M%S)"
```

新服务器还没有 `/etc/nginx` 时跳过备份命令。

## 二、安装并验证

```bash
sudo apt update
sudo apt install -y nginx curl
sudo systemctl enable --now nginx
nginx -v
sudo nginx -t
sudo systemctl status nginx --no-pager
curl -I http://127.0.0.1
```

`active (running)` 表示服务正在运行；默认站点通常返回 `200 OK`。APT 安装的是 Ubuntu 仓库维护的版本，不一定与 Nginx 官网最新版本相同，可通过 `apt policy nginx` 查看候选版本。

Ubuntu 软件包的常用路径：

| 路径 | 用途 |
| --- | --- |
| `/etc/nginx/nginx.conf` | 主配置 |
| `/etc/nginx/sites-available/` | 站点配置存放位置 |
| `/etc/nginx/sites-enabled/` | 已启用站点的链接 |
| `/var/www/html/` | 默认站点目录 |
| `/var/log/nginx/access.log` | 访问日志 |
| `/var/log/nginx/error.log` | 错误日志 |

## 三、准备静态文件

先创建一个用于验证部署链路的页面：

```bash
sudo install -d -m 0755 /var/www/mashu-blog
printf '%s\n' '<h1>MaShu Blog</h1>' | sudo tee /var/www/mashu-blog/index.html
sudo chmod 0644 /var/www/mashu-blog/index.html
```

部署本博客时，在项目电脑执行 `pnpm docs:build`，将 `docs/.vitepress/dist/` **内部的全部文件**上传到服务器的 `/var/www/mashu-blog/`。应得到 `/var/www/mashu-blog/index.html`，而不是再套一层 `dist`。上传工具需使用实际服务器地址，确保目录可遍历、文件可被 Nginx 工作进程读取。

## 四、配置静态站点

创建 `/etc/nginx/sites-available/mashu-blog`：

```bash
sudo tee /etc/nginx/sites-available/mashu-blog > /dev/null <<'EOF'
server {
    listen 80;
    server_name blog.example.com;

    root /var/www/mashu-blog;
    index index.html;

    access_log /var/log/nginx/mashu-blog.access.log;
    error_log /var/log/nginx/mashu-blog.error.log;

    location / {
        try_files $uri $uri/ =404;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/mashu-blog /etc/nginx/sites-enabled/mashu-blog
sudo nginx -t && sudo systemctl reload nginx
```

链接命令只需执行一次，提示 `File exists` 时检查 `ls -l /etc/nginx/sites-enabled/mashu-blog`。Nginx 的站点配置结构可参考 [Ubuntu 站点配置文档](https://ubuntu.com/server/docs/how-to/web-services/configure-nginx/)。

这里按静态文件提供服务：本项目使用 `.html` 链接，无需把所有不存在的路径回退到首页。配置原理见 [Nginx 官方入门指南](https://nginx.org/en/docs/beginners_guide.html)。

域名还没解析时，可以用 Host 请求头验证站点匹配：

```bash
curl -I -H 'Host: blog.example.com' http://127.0.0.1/
```

默认站点可以保留。直接访问服务器 IP 时可能显示默认欢迎页，应通过域名或带 Host 的请求验证新站点。

## 五、可选：增加后端反向代理

如果有后端，在上面同一个 `server` 块内增加以下配置，再执行 `sudo nginx -t && sudo systemctl reload nginx`：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

这里 `proxy_pass` 后**没有尾斜杠**，请求 `/api/users` 会保留 `/api/`。如果后端只接受 `/users`，将其改为 `proxy_pass http://127.0.0.1:8080/;`。两种配置不要混用，详见 [proxy_pass 官方说明](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)。

验证时使用后端真实存在的接口路径，并检查返回内容和业务状态。

## 六、外部访问

将域名 A/AAAA 记录指向服务器对应的公网地址，并在云服务器安全组中允许所需的 HTTP 入站访问。如果已启用 UFW，检查状态后放行 HTTP：

```bash
sudo ufw status
sudo ufw allow 'Nginx HTTP'
```

不要为了这个教程直接执行 `ufw enable`，远程服务器启用防火墙前需要先确保 SSH 访问规则完整。上面的站点只监听 HTTP；HTTPS 还需要有效证书、443 监听和相应防火墙规则。

## 七、维护与排查

```bash
# 修改配置后先检查，再平滑重载
sudo nginx -t && sudo systemctl reload nginx

# 查看启动日志与站点错误日志
sudo journalctl -u nginx -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/mashu-blog.error.log
```

| 现象 | 优先检查 |
| --- | --- |
| 启动失败 | `nginx -t` 是否通过、80 端口是否被占用 |
| 看到默认欢迎页 | 域名与 `server_name` 是否匹配 |
| 403 | 文件是否可读、父目录是否可遍历、是否有 index.html |
| 404 | `root` 与上传位置是否一致、构建产物是否包含对应页面 |
| 502 | 后端是否启动、地址端口是否正确、Nginx 能否连接 |
| 本机正常而公网超时 | DNS、安全组、服务器防火墙和 IPv6 配置 |

本文命令用于 Ubuntu 24.04 环境；静态配置示例不等于已经完成服务器部署验收。
