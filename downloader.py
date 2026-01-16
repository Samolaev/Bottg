<<<<<<< HEAD
import requests
import yt_dlp
import re
from bs4 import BeautifulSoup

def download_video(url):
    # Определяем платформу
    if 'youtube.com' in url or 'youtu.be' in url:
        platform = 'youtube'
    elif 'instagram.com' in url:
        platform = 'instagram'
    elif 'tiktok.com' in url:
        platform = 'tiktok'
    else:
        return None, "Unsupported platform"

    # Попытка через Cobalt
    try:
        response = requests.post('https://api.cobalt.tools/api/json', json={'url': url})
        data = response.json()
        if data.get('status') == 'success':
            download_url = data['url']
            # Скачиваем видео
            video_response = requests.get(download_url)
            if video_response.status_code == 200:
                return video_response.content, None
    except:
        pass

    # Если Cobalt не сработал, yt-dlp
    try:
        ydl_opts = {
            'format': 'best[height<=720]',  # Короткие видео, ограничиваем качество
            'outtmpl': '-',  # Вывод в stdout
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if info:
                # Скачиваем
                result = ydl.download([url])
                # yt-dlp скачивает в файл, но с outtmpl '-', выводит в stdout?
                # Для получения bytes, нужно иначе.
                # yt-dlp может выводить в buffer.
                # Лучше использовать subprocess или найти способ получить bytes.
                # Для простоты, предположим yt-dlp работает, но для Vercel, нужно вернуть bytes.
                # Переделать: использовать ydl.extract_info и затем requests.get(info['url'])
                # Но для прямого скачивания.
                # yt-dlp имеет опцию для получения URL.
                ydl_opts['format'] = 'best[height<=720]/best'
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    if 'formats' in info:
                        format = info['formats'][-1]  # Лучший формат
                        video_url = format['url']
                        video_response = requests.get(video_url)
                        if video_response.status_code == 200:
                            return video_response.content, None
    except:
        pass

    # Для TikTok, если yt-dlp не сработал, ssstik.io
    if platform == 'tiktok':
        try:
            # ssstik.io API или парсинг
            # ssstik имеет endpoint для скачивания
            # POST to https://ssstik.io/abc?url=... но нужно парсить.
            # Для простоты, использовать requests и bs4.
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.post('https://ssstik.io/abc', data={'url': url}, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            download_link = soup.find('a', {'href': re.compile(r'https://.*\.mp4')})
            if download_link:
                video_response = requests.get(download_link['href'], headers=headers)
                if video_response.status_code == 200:
                    return video_response.content, None
        except:
            pass

        # snaptik.app
        try:
            response = requests.post('https://snaptik.app/abc', data={'url': url}, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            download_link = soup.find('a', {'href': re.compile(r'https://.*\.mp4')})
            if download_link:
                video_response = requests.get(download_link['href'], headers=headers)
                if video_response.status_code == 200:
                    return video_response.content, None
        except:
            pass

=======
import requests
import yt_dlp
import re
from bs4 import BeautifulSoup

def download_video(url):
    # Определяем платформу
    if 'youtube.com' in url or 'youtu.be' in url:
        platform = 'youtube'
    elif 'instagram.com' in url:
        platform = 'instagram'
    elif 'tiktok.com' in url:
        platform = 'tiktok'
    else:
        return None, "Unsupported platform"

    # Попытка через Cobalt
    try:
        response = requests.post('https://api.cobalt.tools/api/json', json={'url': url})
        data = response.json()
        if data.get('status') == 'success':
            download_url = data['url']
            # Скачиваем видео
            video_response = requests.get(download_url)
            if video_response.status_code == 200:
                return video_response.content, None
    except:
        pass

    # Если Cobalt не сработал, yt-dlp
    try:
        ydl_opts = {
            'format': 'best[height<=720]',  # Короткие видео, ограничиваем качество
            'outtmpl': '-',  # Вывод в stdout
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if info:
                # Скачиваем
                result = ydl.download([url])
                # yt-dlp скачивает в файл, но с outtmpl '-', выводит в stdout?
                # Для получения bytes, нужно иначе.
                # yt-dlp может выводить в buffer.
                # Лучше использовать subprocess или найти способ получить bytes.
                # Для простоты, предположим yt-dlp работает, но для Vercel, нужно вернуть bytes.
                # Переделать: использовать ydl.extract_info и затем requests.get(info['url'])
                # Но для прямого скачивания.
                # yt-dlp имеет опцию для получения URL.
                ydl_opts['format'] = 'best[height<=720]/best'
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=False)
                    if 'formats' in info:
                        format = info['formats'][-1]  # Лучший формат
                        video_url = format['url']
                        video_response = requests.get(video_url)
                        if video_response.status_code == 200:
                            return video_response.content, None
    except:
        pass

    # Для TikTok, если yt-dlp не сработал, ssstik.io
    if platform == 'tiktok':
        try:
            # ssstik.io API или парсинг
            # ssstik имеет endpoint для скачивания
            # POST to https://ssstik.io/abc?url=... но нужно парсить.
            # Для простоты, использовать requests и bs4.
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.post('https://ssstik.io/abc', data={'url': url}, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            download_link = soup.find('a', {'href': re.compile(r'https://.*\.mp4')})
            if download_link:
                video_response = requests.get(download_link['href'], headers=headers)
                if video_response.status_code == 200:
                    return video_response.content, None
        except:
            pass

        # snaptik.app
        try:
            response = requests.post('https://snaptik.app/abc', data={'url': url}, headers=headers)
            soup = BeautifulSoup(response.text, 'html.parser')
            download_link = soup.find('a', {'href': re.compile(r'https://.*\.mp4')})
            if download_link:
                video_response = requests.get(download_link['href'], headers=headers)
                if video_response.status_code == 200:
                    return video_response.content, None
        except:
            pass

>>>>>>> c32efe91e6e2899318dd65bc9588f00242298925
    return None, "Failed to download video"