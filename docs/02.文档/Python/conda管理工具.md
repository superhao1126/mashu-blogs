---
description: 整理 macOS 上的 Python 与 Conda 环境，记录虚拟环境的创建、切换、导出和清理方法。区分系统 Python、Homebrew 与 Conda 的职责，减少版本和路径冲突，让日常开发环境更容易维护。
date: 2026-10-22 10:01:07
title: Conda管理工具
sidebarSort: 1
categories:
  - Python
permalink: /02.文档/conda管理工具
---
# macOS 使用 Conda 管理 Python：环境整理与日常使用手册

> 适用设备：Apple Silicon Mac（当前设备为 Apple M4）  
> Shell：Zsh  
> Conda 安装目录：`/opt/anaconda3`  
> 环境快照日期：2026-08-19

这篇文档用于记录我电脑上的 Python 环境，以及以后使用 Conda 创建、切换、维护和删除 Python 环境的方法。忘记命令时，直接查阅本文即可。

## 一、当前电脑上的 Python 环境

目前可以确认存在以下 Python：

| 来源 | 环境名 | Python 版本 | 路径 | 当前状态 |
| --- | --- | --- | --- | --- |
| Homebrew | 无 | 3.10.20 | `/opt/homebrew/opt/python@3.10/bin/python3.10` | 当前默认命令仍指向这里 |
| Conda | `base` | 3.13.9 | `/opt/anaconda3/bin/python` | 未激活 |
| Conda | `3.10` | 3.10.20 | `/opt/anaconda3/envs/3.10/bin/python` | 未激活 |
| macOS | 系统环境 | 需单独查询 | `/usr/bin/python3` | 系统自带，不修改 |

当前 Conda 版本是 `25.11.1`，使用默认的 `libmamba` 求解器，运行平台为 `osx-arm64`。

当前配置：

```yaml
auto_activate: false
channels:
  - defaults
```

`auto_activate: false` 表示打开新终端时不会自动进入 `base`。这是推荐设置：Conda 可以正常使用，但不会接管每一个终端会话。

### 当前需要注意的问题

`~/.zshrc` 中目前还有这一行：

```bash
export PATH="/opt/homebrew/opt/python@3.10/libexec/bin:$PATH"
```

它把 Homebrew Python 放在 PATH 最前面。因此，在没有激活 Conda 环境时：

```bash
python --version
python3 --version
```

当前都会优先得到 Homebrew 的 Python 3.10.20。

如果已经按照后文删除这行配置，那么未激活 Conda 时，`python` 可能不存在，`python3` 可能指向 `/usr/bin/python3`。这是正常现象；需要运行项目时，先激活对应的 Conda 环境。

## 二、最终采用的管理原则

以后按照下面的规则管理 Python：

1. Conda 负责安装 Python 版本和隔离项目环境。
2. 不在 `base` 环境中开发项目或安装项目依赖。
3. 一个项目尽量对应一个 Conda 环境。
4. 进入项目前先执行 `conda activate 环境名`。
5. 安装 pip 包时使用 `python -m pip`，避免 pip 指错 Python。
6. 不修改、不删除 `/usr/bin/python3`，它属于 macOS。
7. Homebrew Python 不再作为项目 Python；确认无依赖后可卸载。

`base` 环境主要用于运行和维护 Conda 本身。项目环境损坏时，可以删除并重建，而不会影响 Conda。

## 三、Conda 最常用命令

### 1. 查看 Conda 信息

```bash
conda --version
conda info
```

查看 Conda 安装位置：

```bash
conda info --base
```

当前应该输出：

```text
/opt/anaconda3
```

### 2. 查看所有环境

```bash
conda env list
```

或者：

```bash
conda info --envs
```

标有 `*` 的环境是当前激活环境。没有 `*` 时，表示没有激活任何 Conda 环境。

### 3. 查看当前环境

```bash
echo "$CONDA_DEFAULT_ENV"
```

也可以查看 Python 的实际位置：

```bash
which python
python --version
```

### 4. 激活环境

激活现有的 Python 3.10 环境：

```bash
conda activate 3.10
```

激活后检查：

```bash
echo "$CONDA_DEFAULT_ENV"
which python
python --version
python -m pip --version
```

预期 Python 路径是：

```text
/opt/anaconda3/envs/3.10/bin/python
```

### 5. 退出环境

```bash
conda deactivate
```

如果嵌套激活过多个环境，可以多执行几次，直到终端前面不再显示环境名。

## 四、创建新的 Python 环境

### 按 Python 版本创建

```bash
conda create -n py312 python=3.12 pip
```

参数含义：

- `-n py312`：环境名为 `py312`；
- `python=3.12`：安装 Python 3.12；
- `pip`：同时安装 pip。

创建后激活：

```bash
conda activate py312
```

### 按项目创建（更推荐）

假设项目叫 `my-agent`：

```bash
conda create -n my-agent python=3.12 pip
conda activate my-agent
```

环境名直接使用项目名，更容易知道它属于哪个项目。

### 创建时不需要指定 Python 的完整小版本

通常写：

```bash
python=3.12
```

Conda 会选择仓库中兼容的最新 3.12.x 版本。只有项目明确要求时，才锁定完整版本：

```bash
conda create -n legacy-project python=3.10.20 pip
```

## 五、安装和管理项目依赖

### 优先使用 Conda 安装

激活项目环境后：

```bash
conda install requests
```

指定安装某个版本：

```bash
conda install requests=2.32
```

### Conda 中没有时再使用 pip

```bash
python -m pip install 包名
```

例如：

```bash
python -m pip install fastapi uvicorn
```

不要优先写：

```bash
pip install 包名
```

`python -m pip` 能明确保证 pip 属于当前 `python`。

### 查看已安装的包

查看当前环境：

```bash
conda list
```

不激活环境，直接查看指定环境：

```bash
conda list -n 3.10
conda list -n base
```

查看 pip 安装的包：

```bash
python -m pip list
```

### 更新包

使用 Conda 安装的包：

```bash
conda update 包名
```

使用 pip 安装的包：

```bash
python -m pip install --upgrade 包名
```

不建议无目的执行 `conda update --all`，因为它可能一次改变大量依赖版本。

### 卸载包

```bash
conda remove 包名
```

或者：

```bash
python -m pip uninstall 包名
```

谁安装的就优先用谁卸载。

## 六、项目的标准使用流程

每天开始开发：

```bash
cd 项目目录
conda activate 项目环境名
python --version
```

安装依赖：

```bash
python -m pip install -r requirements.txt
```

运行项目：

```bash
python main.py
```

开发结束：

```bash
conda deactivate
```

在 VS Code 中，还需要执行：

1. 打开命令面板；
2. 搜索 `Python: Select Interpreter`；
3. 选择 `/opt/anaconda3/envs/环境名/bin/python`。

终端激活环境与 VS Code 选择解释器是两件事，两边都要确认。

## 七、导出、复制和恢复环境

### 导出适合跨电脑恢复的环境文件

先激活环境：

```bash
conda activate my-agent
conda env export --from-history > environment.yml
```

`--from-history` 只记录主动安装的主要依赖，通常比导出全部底层依赖更容易跨平台恢复。

恢复环境：

```bash
conda env create -f environment.yml
```

更新已有环境：

```bash
conda env update -n my-agent -f environment.yml --prune
```

### 精确复制本机环境

```bash
conda create -n my-agent-copy --clone my-agent
```

克隆适合在同一台电脑快速备份，但不适合作为跨平台项目配置。

## 八、重命名和删除环境

### 重命名环境

当前已有环境名 `3.10`。如果以后希望名称更统一，可以改成 `py310`：

```bash
conda deactivate
conda rename -n 3.10 py310
```

重命名前先确认没有终端正在使用该环境。

### 删除环境

先退出环境：

```bash
conda deactivate
```

然后删除：

```bash
conda remove -n 环境名 --all
```

例如：

```bash
conda remove -n my-agent --all
```

删除前务必执行 `conda env list`，核对环境名和路径。不要删除 `base`。

## 九、让 Conda 成为唯一的项目 Python 管理方式

### 1. 备份 Zsh 配置

```bash
cp ~/.zshrc ~/.zshrc.backup-before-conda-cleanup
```

### 2. 删除 Homebrew Python 的强制 PATH

从 `~/.zshrc` 删除：

```bash
export PATH="/opt/homebrew/opt/python@3.10/libexec/bin:$PATH"
```

可以执行：

```bash
sed -i '' '\|/opt/homebrew/opt/python@3.10/libexec/bin|d' ~/.zshrc
```

重新启动登录 Shell：

```bash
exec zsh -l
```

### 3. 保留 Conda 初始化代码

`~/.zshrc` 中下面这一段由 `conda init` 管理，不要手动删除内部内容：

```text
# >>> conda initialize >>>
...
# <<< conda initialize <<<
```

检查初始化是否正常：

```bash
type conda
conda info --base
```

### 4. 保持 base 不自动激活

```bash
conda config --set auto_activate_base false
```

不同 Conda 版本显示的配置键可能是 `auto_activate`，效果相同。当前电脑已经是关闭状态，不需要重复修改。

### 5. 卸载 Homebrew Python（可选）

当前执行以下命令没有输出，表示没有已安装的 Homebrew formula 直接依赖 `python@3.10`：

```bash
brew uses --installed python@3.10
```

完成 PATH 清理并验证 Conda 环境正常后，可以卸载：

```bash
brew uninstall python@3.10
```

不要手动删除 macOS 的 `/usr/bin/python3`，也不要直接删除 `/opt/anaconda3`。

## 十、快速诊断：Python 到底来自哪里

遇到版本不对、包装错位置或命令找不到时，先运行：

```bash
echo "当前 Conda 环境：$CONDA_DEFAULT_ENV"
type -a python python3 pip pip3 conda
which python
python --version
python -c 'import sys; print(sys.executable); print(sys.prefix)'
python -m pip --version
```

激活 Conda 环境后，正确结果应该满足：

- `CONDA_DEFAULT_ENV` 是预期的环境名；
- `sys.executable` 位于 `/opt/anaconda3/envs/环境名/bin/python`；
- pip 路径同样位于该环境目录；
- Python 和 pip 显示的 Python 版本一致。

### 修改配置后命令仍指向旧位置

先启动新 Shell：

```bash
exec zsh -l
```

仍然不正确时清除 Zsh 命令缓存：

```bash
rehash
```

然后重新执行 `type -a python python3`。

### `conda activate` 无法使用

重新初始化 Zsh：

```bash
/opt/anaconda3/bin/conda init zsh
exec zsh -l
```

### pip 安装到了错误环境

不要继续安装，先检查：

```bash
which python
python -m pip --version
```

确认路径后再运行：

```bash
python -m pip install 包名
```

## 十一、常用命令速查表

| 目的 | 命令 |
| --- | --- |
| 查看 Conda 版本 | `conda --version` |
| 查看所有环境 | `conda env list` |
| 查看当前环境 | `echo "$CONDA_DEFAULT_ENV"` |
| 创建环境 | `conda create -n 项目名 python=3.12 pip` |
| 激活环境 | `conda activate 项目名` |
| 退出环境 | `conda deactivate` |
| 查看 Python 来源 | `python -c 'import sys; print(sys.executable)'` |
| 查看 Python 版本 | `python --version` |
| 查看当前环境的包 | `conda list` |
| 安装 Conda 包 | `conda install 包名` |
| 安装 pip 包 | `python -m pip install 包名` |
| 导出主要依赖 | `conda env export --from-history > environment.yml` |
| 从文件创建环境 | `conda env create -f environment.yml` |
| 克隆环境 | `conda create -n 新环境 --clone 旧环境` |
| 删除环境 | `conda remove -n 环境名 --all` |

## 十二、我自己的日常模板

创建项目环境：

```bash
conda create -n 项目名 python=3.12 pip
conda activate 项目名
```

进入已有项目：

```bash
cd 项目目录
conda activate 项目名
python --version
```

安装依赖：

```bash
python -m pip install -r requirements.txt
```

保存环境配置：

```bash
conda env export --from-history > environment.yml
```

结束工作：

```bash
conda deactivate
```

最重要的一条：**使用 Python 项目前先激活对应的 Conda 环境，再运行 Python 或安装依赖。**
