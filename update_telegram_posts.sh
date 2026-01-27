#!/bin/bash
#
# Скрипт автоматического обновления постов из Telegram
# Парсит канал → Генерирует JSON → Пушит в GitHub → Автоматически обновляется на сайте
#
# Использование:
#   ./update_telegram_posts.sh
#
# Для автоматического запуска добавьте в crontab:
#   0 */3 * * * /home/roman/mafclub.biz/update_telegram_posts.sh >> /home/roman/mafclub.biz/telegram-update.log 2>&1
#

set -e  # Остановка при ошибке

PROJECT_DIR="/home/roman/mafclub.biz"
LOG_PREFIX="[Telegram Import]"

echo "=================================================="
echo "$LOG_PREFIX $(date '+%Y-%m-%d %H:%M:%S')"
echo "=================================================="

# Переходим в директорию проекта
cd "$PROJECT_DIR" || exit 1

# Проверяем наличие Python скрипта
if [ ! -f "generate_telegram_posts.py" ]; then
    echo "❌ Ошибка: generate_telegram_posts.py не найден"
    exit 1
fi

# Проверяем наличие зависимостей Python
if ! python3 -c "import requests, bs4" 2>/dev/null; then
    echo "📦 Установка зависимостей..."
    pip3 install requests beautifulsoup4 --user
fi

# Запускаем парсинг канала
echo "🔄 Парсинг Telegram канала @sellersmafia..."
python3 generate_telegram_posts.py

if [ $? -ne 0 ]; then
    echo "❌ Ошибка парсинга"
    exit 1
fi

# Проверяем, создан ли JSON файл
if [ ! -f "telegram-posts.json" ]; then
    echo "❌ JSON файл не был создан"
    exit 1
fi

# Проверяем, есть ли изменения в Git
if git diff --quiet telegram-posts.json 2>/dev/null; then
    echo "ℹ️  Изменений нет, обновление не требуется"
    echo "=================================================="
    exit 0
fi

# Есть изменения - коммитим и пушим
echo "📝 Обнаружены изменения, коммитим..."

# Получаем количество постов из JSON
POSTS_COUNT=$(python3 -c "import json; data=json.load(open('telegram-posts.json')); print(data.get('count', 0))")

# Добавляем файл
git add telegram-posts.json

# Коммитим
git commit -m "chore(blog): обновление постов из Telegram (${POSTS_COUNT} постов) - $(date '+%Y-%m-%d %H:%M')"

# Пушим в GitHub
echo "🚀 Отправка в GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Успешно обновлено!"
    echo "📊 Постов в блоге: $POSTS_COUNT"
    echo "🌐 Сайт обновится автоматически через 2-5 минут"
else
    echo "❌ Ошибка при отправке в GitHub"
    exit 1
fi

echo "=================================================="
echo "$LOG_PREFIX Завершено: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=================================================="
