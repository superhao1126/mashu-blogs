---
description: 从安装前检查开始，在 Ubuntu 24.04 上安装 Docker Engine 与 Compose。记录镜像和容器的基本操作、服务编排及常见问题，方便从开发环境逐步搭建可重复部署的服务。
title: Ubuntu 24.04 安装 Docker Engine 与 Compose
sidebarSort: 1
date: 2026-10-22
permalink: /docker/install
categories:
  - Docker
tags:
  - Ubuntu
  - Docker
  - Docker Compose
  - 容器
---

# Ubuntu 24.04 安装 Docker Engine 与 Compose

本文面向使用 systemd 的 Ubuntu 24.04 LTS 服务器，通过 Docker 官方 APT 仓库安装 Engine 和 Compose 插件。macOS 应使用适合本机的 Docker Desktop 或其他容器运行环境，不要在 Mac 终端执行这里的 APT 命令。

仓库与软件包配置依据 [Docker 官方 Ubuntu 安装文档](https://docs.docker.com/engine/install/ubuntu/)。示例以新服务器为主，已有 Docker 或 Kubernetes 环境时先确认现有容器、数据卷和运行时依赖。

## 一、安装前检查

```bash
cat /etc/os-release
dpkg --print-architecture
command -v docker
command -v containerd
```

若已安装 Docker，先查看当前版本和容器：

```bash
sudo docker version
sudo docker ps -a
sudo docker volume ls
```

系统自带的 `docker.io`、旧版 `docker-compose` 和独立安装的 `containerd`、`runc` 等可能与官方软件包冲突。已有安装时按官方安装文档逐项处理，尤其不要直接卸载其他服务正在使用的容器运行时。本文不提供清空容器或数据目录的命令。

## 二、添加官方软件源

```bash
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

仓库地址使用 HTTPS，签名密钥限定给该软件源。下载失败时先检查 DNS、代理和服务器出网，不要通过关闭签名校验解决。

## 三、安装 Engine 和 Compose

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo systemctl status docker --no-pager
sudo docker version
sudo docker compose version
sudo docker run --rm hello-world
```

`docker version` 应包含 Client 和 Server 信息；`hello-world` 能成功运行，才说明镜像下载和容器执行链路都走通。镜像拉取超时不一定是安装失败，应单独检查 Docker Hub 的网络可达性。

本文使用 `docker compose` 子命令，而不是旧的 `docker-compose` 独立命令。

## 四、可选：普通用户运行 Docker

默认使用 `sudo docker`。个人开发机如果希望省略 sudo，可以把当前登录用户加入 docker 组：

```bash
sudo usermod -aG docker "$USER"
```

退出登录并重新连接服务器后执行 `docker version` 验证。该组具有接近 root 的权限，只应授予可信账号，详见 [Docker 安装后配置文档](https://docs.docker.com/engine/install/linux-postinstall/)。不要使用 `chmod 666 /var/run/docker.sock` 放宽所有用户的访问权限。

## 五、运行一个 Nginx 容器

先做只允许服务器本机访问的实验，避免与宿主机的 80 端口冲突：

```bash
sudo docker run -d \
  --name nginx-demo \
  --restart unless-stopped \
  -p 127.0.0.1:8081:80 \
  nginx:stable-alpine

sudo docker ps
curl -I http://127.0.0.1:8081
sudo docker logs --tail 50 nginx-demo
```

端口映射含义是：宿主机 `127.0.0.1:8081` 转发到容器的 `80`。因此从其他电脑直接访问服务器的 `8081` 端口不会成功，这是本例的预期行为。

`stable-alpine` 是会更新的标签；正式部署需要在验证后固定版本或镜像摘要。容器名称已存在时，先用 `docker ps -a` 确认用途，再决定复用还是改名。

## 六、通过 Compose 管理服务

下面是另一套独立示例，使用 `8082` 端口。在当前用户可写的位置创建目录：

```bash
mkdir -p ~/docker-demo/nginx/html
cd ~/docker-demo/nginx
printf '%s\n' '<h1>Hello from Docker Compose</h1>' > html/index.html
```

创建 `compose.yaml`：

```yaml
services:
  web:
    image: nginx:stable-alpine
    restart: unless-stopped
    ports:
      - "127.0.0.1:8082:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

`./html` 是宿主机保存页面的位置，`:ro` 表示容器只读挂载。日志按文件大小轮转，避免这个演示服务的日志持续占满磁盘。

在 `compose.yaml` 所在目录执行：

```bash
sudo docker compose config
sudo docker compose up -d
sudo docker compose ps
curl http://127.0.0.1:8082
sudo docker compose logs --tail 50 web
```

请求应返回 `Hello from Docker Compose`。更多服务编排示例见 [Docker Compose 官方入门教程](https://docs.docker.com/compose/gettingstarted/)。

停止这套 Compose 示例：

```bash
sudo docker compose down
```

这会移除本示例的容器和默认网络，宿主机 `html` 文件仍保留。不要随意添加 `-v`，它会同时删除所声明的命名卷以及附属匿名卷。

## 七、常用维护命令

```bash
# 查看容器、镜像和空间使用
sudo docker ps -a
sudo docker images
sudo docker system df

# 查看 Engine 服务日志
sudo journalctl -u docker -n 100 --no-pager

# 停止和重新启动前面的单容器示例
sudo docker stop nginx-demo
sudo docker start nginx-demo
```

升级前先确认业务数据已备份、镜像版本可回退，并安排维护时间。不要把 `docker system prune -a --volumes` 当成常规清理命令。

## 八、常见问题

| 现象 | 检查方向 |
| --- | --- |
| `Cannot connect to the Docker daemon` | `systemctl status docker`、Docker context、服务日志 |
| `permission denied` 访问 docker.sock | 使用 sudo，或确认组成员身份已在新登录会话生效 |
| `docker compose` 不存在 | 是否安装了 `docker-compose-plugin` |
| 镜像下载超时 | DNS、代理、出网策略和镜像仓库可达性 |
| `port is already allocated` | `sudo ss -lntp`，检查宿主机端口占用 |
| 容器启动后立即退出 | `docker ps -a` 和对应容器的 `docker logs` |

发布容器端口到公网前，需要同时理解 Docker 的转发规则和云安全组。官方明确提醒，Docker 发布端口可能绕过 UFW 的常规规则，不能仅凭 `ufw status` 判断暴露范围，参见 [Docker 防火墙说明](https://docs.docker.com/engine/network/packet-filtering-firewalls/)。

本文为安装与演示步骤，是否适用于实际业务还需在目标服务器验证。
