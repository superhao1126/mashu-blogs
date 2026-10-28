---
description: 记录 Ubuntu 24.04 上 Redis 的安装、配置与业务接入过程，整理本机访问、认证、持久化和服务管理等要点。结合应用侧的连接设置与排查命令，帮助定位部署和使用中的常见问题。
title: Ubuntu 24.04 安装、配置 Redis 并接入业务
sidebarSort: 1
date: 2026-08-24
tags:
  - Ubuntu
  - Redis
  - Linux
  - Spring Boot
categories:
  - Redis
permalink: /02.文档/Redis-安装与业务接入指南
---

# Ubuntu 24.04 安装、配置 Redis 并接入业务

本文记录在 Ubuntu 24.04 LTS 服务器上安装 Redis、完成基本安全配置，并让本机业务接入 Redis 的完整过程。本文使用 Ubuntu 仓库维护的 Redis 7.0.15，适合后续忘记命令时快速查阅。

> 本文场景：Redis 与业务应用运行在同一台服务器，Redis 不需要从公网直接访问。

## 一、安装前检查

检查 Redis 是否已经安装、APT 候选版本、默认端口以及是否存在旧配置：

```bash
echo "===== Redis 是否已安装 ====="
dpkg -l | grep -E '^ii[[:space:]]+(redis|redis-server|redis-tools)[[:space:]]' \
  || echo "未安装 Redis"

echo
echo "===== Redis 命令 ====="
command -v redis-server || echo "redis-server 不存在"
command -v redis-cli || echo "redis-cli 不存在"

echo
echo "===== APT 候选版本 ====="
apt-cache policy redis redis-server redis-tools

echo
echo "===== 6379 端口 ====="
sudo ss -lntup | grep ':6379' || echo "6379 未被占用"

echo
echo "===== Redis 残留目录 ====="
sudo ls -ld /etc/redis /var/lib/redis /var/log/redis 2>/dev/null \
  || echo "没有发现 Redis 残留目录"
```

本次检查结果：

- Redis 尚未安装；
- `6379` 没有被占用；
- 没有旧配置或数据目录；
- Ubuntu 24.04 仓库提供 Redis `7.0.15`。

## 二、安装 Redis

更新软件索引：

```bash
sudo apt update
```

如果某个无关的第三方仓库更新失败，例如 Docker 仓库出现 TLS 握手错误，但 Ubuntu 主仓库和 `noble-updates` 更新成功，一般不会影响从 Ubuntu 仓库安装 Redis。不要因为这类提示直接执行全量系统升级。

安装 Redis：

```bash
sudo apt install -y redis-server
```

启动 Redis，并设置开机自启：

```bash
sudo systemctl enable --now redis-server
```

## 三、验证安装结果

```bash
echo "===== Redis 版本 ====="
redis-server --version
redis-cli --version

echo
echo "===== Redis 服务状态 ====="
sudo systemctl status redis-server --no-pager

echo
echo "===== Redis 连通测试 ====="
redis-cli ping

echo
echo "===== Redis 监听地址 ====="
sudo ss -lntup | grep ':6379'
```

正常结果应满足：

- Redis 服务为 `active (running)`；
- 服务状态显示 `Ready to accept connections`；
- 未设置密码前，`redis-cli ping` 返回 `PONG`；
- 只监听 `127.0.0.1:6379` 和 `[::1]:6379`；
- 不应出现 `0.0.0.0:6379`。

本次最终安装版本：

```text
Redis server v=7.0.15
redis-cli 7.0.15
```

## 四、安全配置

Redis 主配置文件：

```text
/etc/redis/redis.conf
```

### 1. 备份配置

修改前先备份：

```bash
sudo cp /etc/redis/redis.conf \
  /etc/redis/redis.conf.bak-$(date +%Y%m%d-%H%M%S)
```

### 2. 确认只允许本机连接

检查核心配置：

```bash
sudo grep -nE '^[[:space:]]*(bind|protected-mode|port)' \
  /etc/redis/redis.conf
```

推荐配置：

```conf
bind 127.0.0.1 -::1
protected-mode yes
port 6379
```

这种配置适用于 Redis 和业务应用位于同一台服务器的情况。云防火墙或安全组不需要开放 `6379`。

### 3. 设置密码

生成一个只包含十六进制字符的随机密码：

```bash
openssl rand -hex 32
```

将密码保存到密码管理器，不要提交到 Git，也不要粘贴到公开日志或聊天记录中。

编辑配置：

```bash
sudo nano /etc/redis/redis.conf
```

搜索 `requirepass`，设置为：

```conf
requirepass <你的Redis密码>
```

重启并检查服务：

```bash
sudo systemctl restart redis-server
sudo systemctl status redis-server --no-pager
```

不带密码连接时：

```bash
redis-cli ping
```

预期返回：

```text
NOAUTH Authentication required.
```

使用交互模式认证，避免把密码直接写到命令历史中：

```bash
redis-cli
```

```redis
AUTH <你的Redis密码>
PING
EXIT
```

预期依次返回 `OK` 和 `PONG`。

> 不推荐使用 `redis-cli -a <密码>`，因为密码可能出现在 Shell 历史或进程参数中。

## 五、业务读写测试

进入 Redis 并完成认证：

```bash
redis-cli
```

```redis
AUTH <你的Redis密码>
SET business:redis:test "ok" EX 60
GET business:redis:test
TTL business:redis:test
EXIT
```

`GET` 返回 `"ok"` 表示 Redis 已经能够正常供业务使用。测试 key 会在 60 秒后自动过期。

本机业务的连接参数：

```text
Host: 127.0.0.1
Port: 6379
Username: default
Password: <你的Redis密码>
Database: 0
```

## 六、Spring Boot 接入 Redis

### 1. Maven 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

### 2. Spring Boot 3 配置

在 `application-prod.yml` 中配置：

```yaml
spring:
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      username: default
      password: ${REDIS_PASSWORD}
      database: 0
      timeout: 3s
```

### 3. Spring Boot 2 配置

Spring Boot 2 通常使用 `spring.redis` 前缀：

```yaml
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    password: ${REDIS_PASSWORD}
    database: 0
    timeout: 3s
```

密码通过环境变量传入：

```bash
export REDIS_PASSWORD='<你的Redis密码>'
java -jar ai-robot-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod
```

生产环境更推荐通过 systemd 的环境文件、容器 Secret 或专用密钥管理服务保存密码，不要把真实密码写进 `application-prod.yml`。

### 4. Docker 应用注意事项

如果业务运行在 Docker 容器中，容器内的 `127.0.0.1` 指向容器自身，而不是宿主机，因此不能直接照搬上面的地址。

常见解决方案：

- 把 Redis 也放入同一个 Docker 网络，通过服务名连接；
- 为容器配置宿主机网关，然后连接宿主机网关地址；
- 不建议为了方便而把 Redis 直接暴露到公网。

## 七、持久化配置说明

查看持久化状态：

```bash
redis-cli
```

认证后执行：

```redis
AUTH <你的Redis密码>
CONFIG GET save
CONFIG GET appendonly
INFO persistence
EXIT
```

本次默认配置：

```text
save = 3600 1 300 100 60 10000
appendonly = no
dir = /var/lib/redis
dbfilename = dump.rdb
```

对应的 RDB 文件为：

```text
/var/lib/redis/dump.rdb
```

RDB 快照触发条件：

- 1 小时内至少修改 1 个 key；
- 5 分钟内至少修改 100 个 key；
- 1 分钟内至少修改 10,000 个 key。

如果 Redis 只用于缓存，默认 RDB 配置通常够用。如果用于消息队列、关键会话或不可重建的业务数据，应评估开启 AOF，例如 `appendonly yes` 和 `appendfsync everysec`。开启前需要评估磁盘、内存以及业务可接受的数据丢失范围。

## 八、内存和系统参数

查看 Redis 内存策略：

```redis
CONFIG GET maxmemory
CONFIG GET maxmemory-policy
```

默认结果通常为：

```text
maxmemory = 0
maxmemory-policy = noeviction
```

`maxmemory 0` 表示 Redis 没有应用层内存上限。共享服务器还运行 Java、MySQL、PostgreSQL 或 Docker 时，建议根据整机内存和 Redis 用途设置明确上限，例如：

```conf
maxmemory 128mb
maxmemory-policy noeviction
```

策略选择：

- 纯缓存：可考虑 `allkeys-lru`；
- 会话或带过期时间的数据：根据业务评估 `volatile-ttl`；
- 不允许自动丢数据：使用 `noeviction`，达到上限后写入会报错。

Redis 执行 RDB 保存或 AOF 重写时需要创建子进程，Linux 通常建议设置：

```bash
echo 'vm.overcommit_memory = 1' \
  | sudo tee /etc/sysctl.d/99-redis.conf

sudo sysctl -w vm.overcommit_memory=1
```

验证：

```bash
sysctl vm.overcommit_memory
```

预期返回：

```text
vm.overcommit_memory = 1
```

## 九、常用运维命令

```bash
# 查看状态
sudo systemctl status redis-server --no-pager

# 启动、停止、重启
sudo systemctl start redis-server
sudo systemctl stop redis-server
sudo systemctl restart redis-server

# 查看最近日志
sudo journalctl -u redis-server -n 100 --no-pager

# 持续查看日志
sudo journalctl -u redis-server -f

# 查看监听端口
sudo ss -lntup | grep ':6379'

# 查看版本
redis-server --version
redis-cli --version

# 查看 Redis 信息，需要先认证
redis-cli
```

进入交互模式后：

```redis
AUTH <你的Redis密码>
INFO server
INFO memory
INFO persistence
DBSIZE
EXIT
```

## 十、常见问题

### 1. `redis-cli ping` 返回 NOAUTH

这是设置密码后的正常现象。进入交互模式执行 `AUTH`，或让业务客户端配置密码。

### 2. Redis 服务启动失败

查看日志：

```bash
sudo journalctl -u redis-server -n 100 --no-pager
```

如果是修改配置后失败，可以对比备份文件，修复 `/etc/redis/redis.conf` 后重新启动。

### 3. `--test-memory` 报配置指令错误

下面的写法是错误的：

```bash
sudo redis-server /etc/redis/redis.conf --test-memory 2
```

Redis 会把 `test-memory` 当作配置指令，从而出现：

```text
Bad directive or wrong number of arguments
```

`--test-memory` 只能单独用于内存测试：

```bash
sudo redis-server --test-memory 2
```

它不是配置文件语法检查命令。配置是否能正确加载，可通过重启服务并查看状态和日志确认：

```bash
sudo systemctl restart redis-server
sudo systemctl status redis-server --no-pager
sudo journalctl -u redis-server -n 50 --no-pager
```

### 4. `apt update` 中 Docker 仓库握手失败

如果 Ubuntu 主仓库正常，而只有 `download.docker.com` 出现握手错误，通常仍可安装 Ubuntu 仓库里的 Redis。该问题应与 Redis 分开排查，不会影响正在运行的 Docker 容器。

### 5. 是否需要开放 6379

本机业务访问 Redis 时不需要开放。推荐始终保持：

```conf
bind 127.0.0.1 -::1
protected-mode yes
```

不要将 `6379` 直接暴露给全部公网地址。

## 十一、最终检查清单

- [x] Redis 已安装并设置开机自启
- [x] 服务状态为 `active (running)`
- [x] 只监听本机 `6379`
- [x] 云防火墙没有开放 `6379`
- [x] 已启用密码认证
- [x] 业务可以完成 `SET`、`GET` 测试
- [ ] 根据业务用途设置合理的 `maxmemory`
- [ ] 根据数据重要性决定是否启用 AOF
- [ ] 将业务密码放入环境变量或 Secret 管理系统

## 总结

对于 Redis 和业务运行在同一台 Ubuntu 服务器的场景，最重要的原则是：只监听本机地址、不开放公网端口、启用认证，并根据服务器资源限制 Redis 内存。完成这些基础配置后，再根据 Redis 是缓存、会话还是关键业务存储，选择合适的淘汰和持久化策略。
