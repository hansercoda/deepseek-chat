#!/bin/bash
# filename: node-manager.sh
# 使用方法: ./node-manager.sh [start|stop|restart|status]

APP_NAME="server.js"
LOG_FILE="server.log"
PID_FILE="server.pid"
MAX_RETRY=3
PORT=3003  # 修改为你的实际端口

# 获取进程ID函数
get_pid() {
    pgrep -f "node.*$APP_NAME"
}

# 启动服务函数
start_server() {
    if [ -f "$PID_FILE" ]; then
        echo "服务可能正在运行 (PID文件存在). 请先执行 stop 操作."
        return 1
    fi

    nohup node "$APP_NAME" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"

    # 等待服务启动
    local retry=0
    while [ $retry -lt $MAX_RETRY ]; do
        if nc -z localhost $PORT >/dev/null 2>&1; then
            echo "服务启动成功! PID: $(cat $PID_FILE)"
            return 0
        fi
        sleep 1
        ((retry++))
    done

    echo "启动失败，请检查日志: $LOG_FILE"
    return 1
}

# 停止服务函数
stop_server() {
    local pid=$(get_pid)
    if [ -z "$pid" ]; then
        echo "服务未运行"
        rm -f "$PID_FILE" 2>/dev/null
        return 0
    fi

    echo "正在停止服务 (PID: $pid)..."
    kill $pid

    # 等待进程退出
    local retry=0
    while [ $retry -lt $MAX_RETRY ]; do
        if ! kill -0 $pid 2>/dev/null; then
            rm -f "$PID_FILE"
            echo "服务已停止"
            return 0
        fi
        sleep 1
        ((retry++))
    done

    echo "正常停止失败，尝试强制终止..."
    kill -9 $pid
    rm -f "$PID_FILE"
    return 0
}

# 状态检查函数
check_status() {
    if pid=$(get_pid); then
        echo "服务运行中 ➔ PID: $pid"
        echo "端口 $PORT 状态: $(nc -z localhost $PORT && echo "开放" || echo "关闭")"
        echo "内存使用: $(ps -p $pid -o rss= | awk '{printf "%.2f MB\n", $1/1024}')"
        return 0
    else
        echo "服务未运行"
        return 1
    fi
}

# 主逻辑
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 1  # 等待资源释放
        start_server
        ;;
    status)
        check_status
        ;;
    *)
        echo "使用方法: $0 {start|stop|restart|status}"
        exit 1
esac

exit $?