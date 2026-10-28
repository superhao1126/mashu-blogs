---
description: 记录 macOS 上使用 jenv 管理多个 Java 版本的方法，涵盖 JDK 安装、Shell 配置，以及全局、项目与终端三级切换。整理常见的路径冲突和排查步骤，方便不同项目之间切换环境。
date: 2026-10-22 10:01:07
title: Jenv java多版本管理
sidebarSort: 1
categories:
  - Java
permalink: /02.文档/Jenv java多版本管理
---
# 在 macOS 上使用 jenv 管理和切换多个 Java 版本

在开发过程中，不同项目经常依赖不同的 Java 版本。例如，老项目可能仍然需要 Java 8，新项目则通常使用 Java 21。如果长期通过手动修改 `JAVA_HOME` 和 `PATH` 来切换，不仅操作麻烦，也很容易出现路径残留和版本冲突。

本文记录如何在 macOS 上使用 jenv 管理 Java 8 和 Java 21，并介绍全局切换、项目级切换和当前终端临时切换三种使用方式。

## 一、当前环境

本文使用的环境如下：

| 项目 | 版本或路径 |
| --- | --- |
| 系统架构 | Apple Silicon / arm64 |
| jenv | 0.6.0 |
| Java 8 | Amazon Corretto 1.8.0_482 |
| Java 21 | BellSoft Liberica JDK 21.0.12 LTS |
| 默认 Java | Java 21 |

两个 JDK 的实际安装目录分别是：

```text
Java 8:
~/Library/Java/JavaVirtualMachines/corretto-1.8.0_482/Contents/Home

Java 21:
/Library/Java/JavaVirtualMachines/liberica-jdk-21.jdk/Contents/Home
```

查看 macOS 能识别的全部 JDK：

```bash
/usr/libexec/java_home -V
```

## 二、jenv 的作用

jenv 本身不负责下载或安装 JDK，它主要负责：

- 管理已经安装在电脑上的多个 JDK
- 根据全局、项目或当前终端配置选择 Java 版本
- 通过 shim 接管 `java`、`javac` 等命令
- 切换版本时自动更新 `JAVA_HOME`

配置正确后，下面两个命令应该指向 jenv：

```bash
which java
which javac
```

正常输出类似：

```text
/Users/zenghao/.jenv/shims/java
/Users/zenghao/.jenv/shims/javac
```

这表示终端执行 `java` 时会先经过 jenv，再由 jenv 决定实际调用哪个 JDK。

## 三、查看当前 Java 环境

### 查看 jenv 管理的所有版本

```bash
jenv versions
```

示例：

```text
  system
  1.8
  1.8.0.482
  21
  21.0
* 21.0.12
  corretto64-1.8.0.482
  openjdk64-21.0.12
```

星号表示当前正在使用的版本。

同一个 JDK 可能显示多个名称，例如 `21`、`21.0` 和 `21.0.12`。它们通常是 jenv 为同一个 JDK 创建的不同版本别名，并不代表电脑安装了三份 JDK。

### 查看当前版本及其来源

```bash
jenv version
```

输出不仅会显示版本，还会说明版本由哪一级配置决定：

```text
21.0.12 (set by /Users/zenghao/.jenv/version)
```

### 查看实际运行版本

```bash
java -version
javac -version
echo "$JAVA_HOME"
```

jenv 管理时，`JAVA_HOME` 可能显示为：

```text
/Users/zenghao/.jenv/versions/21.0.12
```

这是 jenv 创建的软链接，不是重复安装了一份 JDK。

## 四、三种 Java 切换方式

jenv 提供三种常用切换方式：

| 方式 | 命令 | 生效范围 | 常见用途 |
| --- | --- | --- | --- |
| 全局版本 | `jenv global` | 所有未单独指定版本的终端和项目 | 设置日常默认 Java |
| 项目版本 | `jenv local` | 当前目录及其子目录 | 为某个项目固定 Java |
| 临时版本 | `jenv shell` | 当前终端会话 | 临时测试或执行一次命令 |

### 1. 设置全局默认版本

将 Java 21 设置为全局默认版本：

```bash
jenv global 21
```

也可以固定到具体补丁版本：

```bash
jenv global 21.0.12
```

通常建议使用主版本别名 `21`。这样 Java 21 的补丁版本升级后，不必让每个项目都绑定到旧的补丁号。

验证：

```bash
jenv version
java -version
```

全局配置保存在：

```text
~/.jenv/version
```

### 2. 为项目固定 Java 版本

假设某个老项目需要 Java 8：

```bash
cd /path/to/legacy-project
jenv local 1.8
```

jenv 会在项目目录中创建一个 `.java-version` 文件：

```text
1.8
```

以后每次进入该项目目录，jenv 都会自动切换到 Java 8：

```bash
cd /path/to/legacy-project
java -version
```

离开项目目录后，会自动恢复上一级目录或全局配置指定的版本：

```bash
cd ~
java -version
```

如果新项目明确要求 Java 21，可以执行：

```bash
cd /path/to/new-project
jenv local 21
```

取消当前项目的版本限制：

```bash
jenv local --unset
```

也可以直接删除项目中的 `.java-version` 文件，但优先使用 jenv 命令更清晰。

是否把 `.java-version` 提交到 Git，需要根据团队约定决定。如果团队所有成员都使用 jenv、SDKMAN 或其他支持该文件的工具，通常可以提交；否则应先和团队确认。

### 3. 当前终端临时切换

临时切换到 Java 8：

```bash
jenv shell 1.8
```

验证：

```bash
java -version
javac -version
echo "$JAVA_HOME"
jenv version
```

此时 `jenv version` 通常会显示：

```text
1.8 (set by JENV_VERSION environment variable)
```

这说明版本由当前终端中的 `JENV_VERSION` 环境变量决定。

取消临时版本：

```bash
jenv shell --unset
```

取消后会重新使用项目级配置；如果项目没有配置，则恢复全局版本。

临时切换只对当前终端窗口或标签页有效，不会影响其他已经打开的终端。

## 五、jenv 的版本优先级

当多个地方都设置了 Java 版本时，优先级从高到低通常是：

1. `jenv shell` 设置的当前终端版本
2. 当前目录或上级目录中的 `.java-version`
3. `jenv global` 设置的全局版本
4. 系统默认 Java

例如：

- 全局版本为 Java 21
- 当前项目通过 `jenv local 1.8` 固定为 Java 8
- 当前终端又执行了 `jenv shell 21`

那么当前终端最终使用 Java 21。执行 `jenv shell --unset` 后，会恢复项目配置的 Java 8；离开项目目录后，再恢复全局 Java 21。

遇到“为什么没有使用预期版本”的问题时，首先执行：

```bash
jenv version
```

它会直接告诉你当前版本由哪一项配置决定。

## 六、常用操作速查

### 查看所有版本

```bash
jenv versions
```

### 查看当前版本和配置来源

```bash
jenv version
```

### 全局使用 Java 21

```bash
jenv global 21
```

### 当前项目使用 Java 8

```bash
jenv local 1.8
```

### 取消项目版本

```bash
jenv local --unset
```

### 当前终端临时使用 Java 8

```bash
jenv shell 1.8
```

### 取消临时版本

```bash
jenv shell --unset
```

### 刷新 shim

```bash
jenv rehash
```

### 检查 jenv 配置

```bash
jenv doctor
```

## 七、向 jenv 添加新安装的 JDK

安装新 JDK 后，先让 macOS 查到对应的 `JAVA_HOME`，再添加给 jenv。

添加 Java 21：

```bash
jenv add "$(/usr/libexec/java_home -v 21)"
```

添加 Java 8：

```bash
jenv add "$(/usr/libexec/java_home -v 1.8)"
```

添加后检查：

```bash
jenv versions
jenv rehash
```

如果 JDK 位于非标准目录，也可以直接传入真实的 JDK Home：

```bash
jenv add "/完整的/JDK/Contents/Home"
```

不过在 macOS 上，优先使用标准目录下的 JDK，可以让终端、IDE 和 `/usr/libexec/java_home` 更容易识别。

## 八、升级 Java 21

本文中的 Liberica JDK 21 通过 Homebrew 安装，可以使用下面的命令升级同一主版本的安全补丁：

```bash
brew update
brew upgrade --cask bell-sw/liberica/liberica-jdk21
```

升级后检查实际版本：

```bash
/usr/libexec/java_home -V
"$(/usr/libexec/java_home -v 21)/bin/java" -version
```

重新加入 jenv 并刷新：

```bash
jenv add "$(/usr/libexec/java_home -v 21)"
jenv rehash
jenv global 21
java -version
```

如果 jenv 中仍保留旧补丁版本名称，可以确认新版本工作正常后再清理旧条目。不要在新版本验证完成前删除旧 JDK。

## 九、常见问题排查

### 1. `java -version` 与预期不一致

依次执行：

```bash
jenv version
which java
echo "$JAVA_HOME"
```

`which java` 应该指向：

```text
~/.jenv/shims/java
```

如果直接指向某个 JDK 的 `bin/java`，说明 PATH 中可能还残留手动配置。

### 2. 修改配置后 VS Code 集成终端没有变化

VS Code 集成终端会继承 VS Code 主进程启动时的环境变量。修改 `~/.zshrc` 或 jenv 配置后，应完全退出并重新启动 VS Code，而不只是关闭一个集成终端标签页。

### 3. `JAVA_HOME` 没有随版本变化

确认启用了 jenv 的 export 插件：

```bash
jenv enable-plugin export
exec zsh -l
```

同时检查 `~/.zshrc` 中是否包含：

```bash
export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"
```

不要再在 `~/.zprofile` 或 `~/.zshrc` 中硬编码某个 JDK：

```bash
# 不推荐
export JAVA_HOME="/某个固定的/JDK/路径"
export PATH="$JAVA_HOME/bin:$PATH"
```

否则固定配置可能和 jenv 冲突。

### 4. 项目总是使用 Java 8，离开后才恢复 Java 21

这通常说明项目目录或上级目录中存在 `.java-version`：

```bash
jenv version
```

如果不再需要项目级配置，在对应目录执行：

```bash
jenv local --unset
```

### 5. 临时切换后一直没有恢复

检查输出中是否出现：

```text
set by JENV_VERSION environment variable
```

如果存在，执行：

```bash
jenv shell --unset
```

## 十、推荐的日常使用方式

推荐采用下面的策略：

- 将 Java 21 设置为全局默认版本
- 只有老项目通过 `jenv local 1.8` 固定 Java 8
- 临时测试时使用 `jenv shell`
- 不再手动修改 `JAVA_HOME`
- 每次切换后通过 `jenv version` 和 `java -version` 验证

日常最常用的命令实际上只有下面几条：

```bash
# 查看当前版本及来源
jenv version

# 默认使用 Java 21
jenv global 21

# 老项目固定 Java 8
jenv local 1.8

# 当前终端临时切到 Java 8
jenv shell 1.8

# 取消临时切换
jenv shell --unset
```

通过这种方式，可以同时保留 Java 8 的老项目兼容性和 Java 21 的现代开发环境，又不会让多个 JDK 路径互相污染。
