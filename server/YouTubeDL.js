// const YoutubeDlWrap = require('youtube-dl-wrap');
const YoutubeDlWrap = require('./yt-dlp-wrap');
const fs = require('fs');
const os = require('os');
const path = require('path');

// const ytdl_name = os.platform() == 'win32' ? 'youtube-dl.exe' : 'youtube-dl';
const ytdl_name = os.platform() == 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

const {IS_PYTHON_INSTALLED} = require('./PythonManager');

const YTDL_STATE = {
    NOT_READY: 0,
    READY: 1,
};

class YTDL {
    constructor() {
        this.state = YTDL_STATE.NOT_READY;
    }

    init() {
        console.log('YTDL init...');
        this.ensure_ytdl_exists().then(() => {
            this.youtubeDlWrap = new YoutubeDlWrap(path.resolve(__dirname, "..", ytdl_name));
            this.init_finished();
        });
    }

    init_finished() {
        console.log('YTDL init finished');
        this.state = YTDL_STATE.READY;
    }

    async ensure_ytdl_exists() {
        try {
            if (fs.existsSync(ytdl_name)) {
                const minutes_old =
                    (new Date() - new Date(fs.statSync(ytdl_name).mtime)) /
                    1000 /
                    60;
                const days_old = minutes_old / 60 / 24;

                // Download newest version if more than 6 months old
                if (days_old > 180) {
                    const today = new Date();
                    fs.copyFileSync(
                        ytdl_name,
                        `${ytdl_name}.old-${today.getFullYear()}-${today.getMonth()}`
                    );
                    await this.download_ytdl();
                }
            } else {
                await this.download_ytdl();
            }
        } catch (e) {
            console.log(e);
        }
    }
    
    /**
     * Returns the youtube-dl `--dump-json` metadata as an object. See bottom of file for example.
     * @param {*} url 
     * @returns 
     */
    async get_video_metadata(url) {
        if (!IS_PYTHON_INSTALLED()) {
            throw new Error('Python is not installed');
        }
        
        return await this.youtubeDlWrap.getVideoInfo(url);
    }
    
    /**
     * Downloads a video/audio track from a youtube url.
     * @param {*} url 
     * @param {*} options Object containing:
     *  - `format_id`: The format id of the video/audio to download.
     *  - `output_filename`: The filename to save the video/audio to.
     * @returns An EventEmitter that emits the following events from:  https://www.npmjs.com/package/youtube-dl-wrap
     */
    download_video(url, options) {
        if (!IS_PYTHON_INSTALLED()) {
            throw new Error('Python is not installed');
        }
        
        return this.youtubeDlWrap.exec([url,"-f", `${options.format_id}`, "-o", options.output_filename])
    }

    async download_ytdl() {
        await YoutubeDlWrap.downloadFromGithub();
    }
}

const ytdl_instance = new YTDL();

module.exports = {
    YTDL: ytdl_instance,
    YTDL_STATE,
};



// get_video_metadata returns something like this:
/*
         {
            extractor_key: 'Youtube',
            thumbnail: 'https://i.ytimg.com/vi_webp/DWIH4BZV1x4/maxresdefault.webp?v=617c14b6',
            webpage_url_basename: 'watch',
            is_live: null,
            thumbnails: [{
                height: 94,
                id: '0',
                resolution: '168x94',
                url: 'https://i.ytimg.com/vi/DWIH4BZV1x4/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLC0VlOwIbnkJ5N-h3ZbwH8MkTgThw',   
                width: 168
            }],
            filesize: 9358519,
            playlist: null,
            uploader_url: 'http://www.youtube.com/channel/UCp8OOssjSjGZRVYK6zWbNLg',
            playlist_index: null,
            fulltitle: 'Bishu & Juneau - Behind Your Eyes [Monstercat Release]',
            width: 640,
            height: 360,
            webpage_url: 'https://www.youtube.com/watch?v=DWIH4BZV1x4',
            dislike_count: 18,
            format_note: '360p',
            ext: 'mp4',
            view_count: 6464,
            display_id: 'DWIH4BZV1x4', 
            quality: 2,
            uploader_id: 'UCp8OOssjSjGZRVYK6zWbNLg',
            id: 'DWIH4BZV1x4',
            extractor: 'youtube',
            channel_id: 'UCp8OOssjSjGZRVYK6zWbNLg',
            upload_date: '20211029',
            age_limit: 0,
            title: 'Bishu & Juneau - Behind Your Eyes [Monstercat Release]',
            http_headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-us,en;q=0.5',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.118 Safari/537.36',
                    'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7'
            },
            vcodec: 'avc1.42001E',
            duration: 146,
            categories: [ 'Music' ],
            tags: [
                'Bishu & Juneau Behind Your Eyes',
                'Behind Your Eyes Bishu & Juneau',
                'Bishu & Juneau Instinct',
                'Instinct Bishu & Juneau',
                'Behind Your Eyes Instinct',
                'Instinct Behind Your Eyes',
                'Bishu & Juneau',
                'Behind Your Eyes',
                'Instinct',
                'Instinct Monstercat',
                'best Dance',
                'Instinct Dance',
                'Dance Instinct',
                'Dance 2021',
                'monstercat release',
                'Electronic',
                'Bishu',
                'Bishu Monstercat',
                'Juneau',
                'Juneau Monstercat'
            ],
            channel_url: 'https://www.youtube.com/channel/UCp8OOssjSjGZRVYK6zWbNLg',
            like_count: 854,
            formats: [
                {
                    format_note: 'tiny',
                    acodec: 'opus',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=249&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=audio%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=925362&dur=146.421&lmt=1635529247062005&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgNBlp4wuGECAALZunJnKfah_EbzanN_SHN3UgMNSBopYCIQC3oPXU6_o1SlbQSNF_uzUrzxIuoDMPd0YuSGhsJMH_uA%3D%3D&sig=AOq0QJ8wRQIgU638C6Y3SMoV7evf-TZYrqgxHIBSc8K2uR6hc8ScHVgCIQDN6W66o28Ur1cE39b3s6gDYPb3G3JgfxlQxmx_wAbtNg==',
                    ext: 'webm',
                    tbr: 50.558,
                    format: '249 - audio only (tiny)',
                    abr: 50.558,
                    filesize: 925362,
                    vcodec: 'none',
                    quality: 0,
                    asr: 48000,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    height: null,
                    http_headers: [Object],
                    width: null,
                    format_id: '249',
                    protocol: 'https',
                    fps: null
                },
                {
                    format_note: 'tiny',
                    acodec: 'opus',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=250&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=audio%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=1223957&dur=146.421&lmt=1635529247426292&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAKt8VuTSTo0-fKDoDjAqlJcjlTthbadcYDxwCqeoxnTnAiBql9A9Pm79HcnlWq6P1JZql6ou58aRzm6FIbxW6fAS-g%3D%3D&sig=AOq0QJ8wRgIhALO3omWcj5ru2lekulb7raBSyyhdFW6wdbylNpTUFmyxAiEA6YYXM9i7E7gn3_21l2N8l7oeRCMk45H_tPGk_Q21dfo=',
                    ext: 'webm',
                    tbr: 66.873,
                    format: '250 - audio only (tiny)',
                    abr: 66.873,
                    filesize: 1223957,
                    vcodec: 'none',
                    quality: 0,
                    asr: 48000,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    height: null,
                    http_headers: [Object],
                    width: null,
                    format_id: '250',
                    protocol: 'https',
                    fps: null
                },
                {
                    format_note: 'tiny',
                    acodec: 'mp4a.40.2',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=140&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=audio%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=2371094&dur=146.448&lmt=1635529268938805&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAMJ70ETbSkOM--Fg7cROuvhvu9ZjBdhyfJfIG-_dmy_LAiBIhWMov84xi4KP6ZC_3WLsa0Csg844PyauvjOoQ4g2ew%3D%3D&sig=AOq0QJ8wRgIhALPnbYjOOFsT4ZgRCpQY8H2QxgBaJvRS8IvH1c0m9cZGAiEAzFKU3mBUHOu9SqjN76BqSXBylesaWW7QO0Ox1eTTcVc=',
                    ext: 'm4a',
                    tbr: 129.525,
                    format: '140 - audio only (tiny)',
                    abr: 129.525,
                    filesize: 2371094,
                    vcodec: 'none',
                    quality: 0,
                    asr: 44100,
                    container: 'm4a_dash',
                    downloader_options: [Object],
                    height: null,
                    http_headers: [Object],
                    width: null,
                    format_id: '140',
                    protocol: 'https',
                    fps: null
                },
                {
                    format_note: 'tiny',
                    acodec: 'opus',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=251&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=audio%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=2421055&dur=146.421&lmt=1635529246767009&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAJ-hz4CAuPymhjfgW7eEjBEbPiRA82_B_SYdFI_VMgi4AiAvNi_KQAowsCqF_7204JMwPa4ltsGR9CfWX8agQsDzHw%3D%3D&sig=AOq0QJ8wRQIgDbN28flRTdBNEUggnF_Ugyb36vdL6rK6elHGqZgFtxECIQDVK3jcy_XVY55oljc6K1CocLufttxezRFqD0OMJWK3QA==',
                    ext: 'webm',
                    tbr: 132.279,
                    format: '251 - audio only (tiny)',
                    abr: 132.279,
                    filesize: 2421055,
                    vcodec: 'none',
                    quality: 0,
                    asr: 48000,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    height: null,
                    http_headers: [Object],
                    width: null,
                    format_id: '251',
                    protocol: 'https',
                    fps: null
                },
                {
                    format_note: '144p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=160&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=878675&dur=146.399&lmt=1635529606872908&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAI7fK-KML6N9UCrPGZvt8def4vb1unRqu9277qqBQ6vPAiA77EHI3RJpHrwOgkX9VC2uOwLgkNm9OZIS3KfPKts71Q%3D%3D&sig=AOq0QJ8wRAIgRz71SEUH2kQl0mx9I4SuzFeG3BW05n84TDrt2VCgIdECIGExsnr4didSg0IRB2o0Etw2Xz6Yo37lQcLzmtPOnsz1',
                    ext: 'mp4',
                    tbr: 48.015,
                    format: '160 - 256x144 (144p)',
                    filesize: 878675,
                    vcodec: 'avc1.4d400c',
                    quality: 0,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 48.015,
                    height: 144,
                    http_headers: [Object],
                    width: 256,
                    format_id: '160',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '144p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=278&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=1571197&dur=146.400&lmt=1635530128441087&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgVmiuQwsSuJY1b-XLafbEj6DRz7T33nTU1WJFMKgqSbACIQCS0WY00KSQZu2oDb6mSIYPIu725iyRxtmNTvMBOqx8tg%3D%3D&sig=AOq0QJ8wRgIhAISyeGVMVdfuJtqDPOx9be1tLTSJOGJsAy-pTU29IGBaAiEAm2rJBnliwAeoFVO1jebVmMTP-7agX-Figvrf3cP2CSM=',
                    ext: 'webm',
                    tbr: 85.857,
                    format: '278 - 256x144 (144p)',
                    filesize: 1571197,
                    vcodec: 'vp9',
                    quality: 0,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 85.857,
                    height: 144,
                    http_headers: [Object],
                    width: 256,
                    format_id: '278',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '240p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=133&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=1755454&dur=146.399&lmt=1635529614371337&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgQElbcp2EzibpqfherLFlUvNjGrrhDkqAhYwpG3xsBRACIQCjjxPpJNjcBYi9UbQl0wpJO4-lZr86SlIIbv3aF_WHqQ%3D%3D&sig=AOq0QJ8wRQIgQ4bcoSR8POtpOjCcKTprtJ3HgSzm0R7au40LhPldTeQCIQDl-WS_dOmze65LbB-yKvoiHUIduKkwJxC03cloum_qcQ==',
                    ext: 'mp4',
                    tbr: 95.927,
                    format: '133 - 426x240 (240p)',
                    filesize: 1755454,
                    vcodec: 'avc1.4d4015',
                    quality: 1,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 95.927,
                    height: 240,
                    http_headers: [Object],
                    width: 426,
                    format_id: '133',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '240p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=242&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=2332537&dur=146.400&lmt=1635530127334680&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgE6JdRpOnaM4KayRZtr93tBmBN3Na5Ja4_LZBNmzxCWoCIQDbBy85ZD2kRn3h0dYY-AHzI1OUo4fTo7PuGwzuXKHZBQ%3D%3D&sig=AOq0QJ8wRQIhAM1ZwnhuPCV0hR7oADHwm6Yk63ZPVw_OH4SaOnU2aXcbAiB5aJfm4W1XLc1CypJIGcmRwmBpdSd3meeoLjK_kzK9Qw==',
                    ext: 'webm',
                    tbr: 127.461,
                    format: '242 - 426x240 (240p)',
                    filesize: 2332537,
                    vcodec: 'vp9',
                    quality: 1,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 127.461,
                    height: 240,
                    http_headers: [Object],
                    width: 426,
                    format_id: '242',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '360p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=134&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=3244599&dur=146.399&lmt=1635529606416112&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhALlud_L3UJzI9w1NSwSwkeQD_ZGufoBCMoSeRkfNCN-kAiBSKs-7N-u9njAOCrwGfxufNN5FovNBNR3mz3TxZzmQIg%3D%3D&sig=AOq0QJ8wRAIgd6xofr_d52-HlS4mVEfUiVx97TMogsTpZX0E80BwRb4CIGFikHEfYqEiRjJ2QO3xfJpEw9TP62vLRjHmlS6eMZ7w',
                    ext: 'mp4',
                    tbr: 177.301,
                    format: '134 - 640x360 (360p)',
                    filesize: 3244599,
                    vcodec: 'avc1.4d401e',
                    quality: 2,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 177.301,
                    height: 360,
                    http_headers: [Object],
                    width: 640,
                    format_id: '134',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '360p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=243&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=4823426&dur=146.400&lmt=1635530053985434&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgUXmyQlqe_NpHgxsIRasQKS9WC7dKno-AvuWKZz-J27wCIQDzNAVKUq3Jv4QgH59cu9Jivw6I5pXghXpy1n_Qa6qcxA%3D%3D&sig=AOq0QJ8wRQIhAMD8dqqSBb8TWSztq8n78c9YCFCUXPzQXFEymYgSvmiIAiBRb_mwmoP7wEodCP0IY9dXbBa3DTLlYvvUEayPuvcJUQ==',
                    ext: 'webm',
                    tbr: 263.575,
                    format: '243 - 640x360 (360p)',
                    filesize: 4823426,
                    vcodec: 'vp9',
                    quality: 2,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 263.575,
                    height: 360,
                    http_headers: [Object],
                    width: 640,
                    format_id: '243',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '480p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=135&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=5023232&dur=146.399&lmt=1635529607046394&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgG6TAM9mv7UWU2Oy-44IXgqNNFoBeVDkL4pRAyFftZT4CIQDJtWaylI1zSyZShTBz-SbD-BKk0c2vhO7ctX__EP2zWg%3D%3D&sig=AOq0QJ8wRQIhAKLOyGTta6vt0nq961sTTSfyrjki9ivTXJ4itLw-8KcQAiA01-qpcoBuQhNiTp75GoYEJiBRSxRR2JLkjdIaF7nxHQ==',
                    ext: 'mp4',
                    tbr: 274.495,
                    format: '135 - 854x480 (480p)',
                    filesize: 5023232,
                    vcodec: 'avc1.4d401f',
                    quality: 3,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 274.495,
                    height: 480,
                    http_headers: [Object],
                    width: 854,
                    format_id: '135',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '480p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=244&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=7955648&dur=146.400&lmt=1635530348711131&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgX4MwmOsSWsFPteoXVXBMdOm2xydeo04HAXKorTIe32oCIQDRm-wbNG_ro6RZ0LMdLqWo102EB4rejPsHx4im1IF9rg%3D%3D&sig=AOq0QJ8wRQIhAPHQqkY6A5o6Tzo4X-4bxCic2nk15zlYTeq2x_VSrRU2AiBLHkoC-4BYUlZXa0sMig-NYwGVgpsyOVHiqAsKDCb-6A==',
                    ext: 'webm',
                    tbr: 434.734,
                    format: '244 - 854x480 (480p)',
                    filesize: 7955648,
                    vcodec: 'vp9',
                    quality: 3,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 434.734,
                    height: 480,
                    http_headers: [Object],
                    width: 854,
                    format_id: '244',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '720p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=247&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=14642837&dur=146.400&lmt=1635530127067283&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgA7eE9aATFM7aLG_bxZNvUZVwy_u2-ctu5__H0uFpKXYCIQD-csM2Qb1DmKfs6QdoO7ZoOtLDaGdnyAOKMXq5QdVsSQ%3D%3D&sig=AOq0QJ8wRAIgd_nQ9vUhMsZmVbsXaZspuuB5G8-cpVMbo0wuTvu_RZwCIEMq70H7-78houyHr9YvdtB4R_K2mKPop1v2wm4vxuM2',
                    ext: 'webm',
                    tbr: 800.155,
                    format: '247 - 1280x720 (720p)',
                    filesize: 14642837,
                    vcodec: 'vp9',
                    quality: 4,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 800.155,
                    height: 720,
                    http_headers: [Object],
                    width: 1280,
                    format_id: '247',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '720p',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=136&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=14842554&dur=146.399&lmt=1635529614441375&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgbQYeVhDPHiaalB2PcA6oLtCfPQ6KbkABhi_4empoy9ACIQD0b72sBO4C-7GQSydV2RyYsO3PEUE9MiMRWsWKOsFMJg%3D%3D&sig=AOq0QJ8wRQIhAKJbveZn8xagVKuYLJ_1tNOBW9jbvnOagKHzW6y6Du9mAiAvQCkS5dMHwXHQ-gD60Tr9dVHAbooW_cryLSv8YHke7w==',
                    ext: 'mp4',
                    tbr: 811.074,
                    format: '136 - 1280x720 (720p)',
                    filesize: 14842554,
                    vcodec: 'avc1.4d401f',
                    quality: 4,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 811.074,
                    height: 720,
                    http_headers: [Object],
                    width: 1280,
                    format_id: '136',
                    protocol: 'https',
                    fps: 30
                },
                {
                    format_note: '720p60',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=302&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=20529236&dur=146.399&lmt=1635529839957486&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAMh957akziinJ5Fjed5Mkv3fkulSTWy8eiepCteSSC1vAiB0CKuBjVAlZWuCHtRanrja46AbrMU1N-PR3IaQ8EeOTQ%3D%3D&sig=AOq0QJ8wRgIhAN-mVD_RtkJaIhIdhQ3iix9N_KUm8WUnnftVfhgpbwnRAiEA-6YOB2enmA2oeseDFKqi9uLtTNV4QvmW33Kw-b9KWpY=',
                    ext: 'webm',
                    tbr: 1121.823,
                    format: '302 - 1280x720 (720p60)',
                    filesize: 20529236,
                    vcodec: 'vp9',
                    quality: 4,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 1121.823,
                    height: 720,
                    http_headers: [Object],
                    width: 1280,
                    format_id: '302',
                    protocol: 'https',
                    fps: 60
                },
                {
                    format_note: '720p60',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=298&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=26763840&dur=146.399&lmt=1635529623440498&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgasbxH8tAercHE6UApVgtMVIfzoGmqj_QBAkD6mG-9TkCIQDBGXuAAS3gdOdsOD1KcvZiaDGvguWHCE2IQpg-E0akxg%3D%3D&sig=AOq0QJ8wRgIhAL_ge0PD09w6h1E_R2n-5GGPPXvjb8lvDe-GOTGvMxddAiEA1jEOOXHU8s_9XFpAyLOvx7iDhkGxXXO23DOGhUofTOI=',
                    ext: 'mp4',
                    tbr: 1462.514,
                    format: '298 - 1280x720 (720p60)',
                    filesize: 26763840,
                    vcodec: 'avc1.4d4020',
                    quality: 4,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 1462.514,
                    height: 720,
                    http_headers: [Object],
                    width: 1280,
                    format_id: '298',
                    protocol: 'https',
                    fps: 60
                },
                {
                    format_note: '1080p60',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=303&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fwebm&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=37172850&dur=146.399&lmt=1635529921856581&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhANiEilQujQ0ZeGAeG8JWGhcGRu6_F_QJH-6r21X-Ker-AiAi-_qTVb0a0iFhREz-5GYoicTFHTlJjeOPsP-1GNevaA%3D%3D&sig=AOq0QJ8wRgIhAPmovd9yMurTmMKQV4URmUC66uN39Kcsmajpx2Z3Nql0AiEAq50LKNGvowWowSmBIW-h2dS_UixMHqTjl20Ccpj-DuE=',
                    ext: 'webm',
                    tbr: 2031.317,
                    format: '303 - 1920x1080 (1080p60)',
                    filesize: 37172850,
                    vcodec: 'vp9',
                    quality: 5,
                    asr: null,
                    container: 'webm_dash',
                    downloader_options: [Object],
                    vbr: 2031.317,
                    height: 1080,
                    http_headers: [Object],
                    width: 1920,
                    format_id: '303',
                    protocol: 'https',
                    fps: 60
                },
                {
                    format_note: '1080p60',
                    acodec: 'none',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=299&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=X0W887VrxcspFRlA7NGVFa0G&gir=yes&clen=52099330&dur=146.399&lmt=1635530396200003&mt=1635559487&fvip=3&keepalive=yes&fexp=24001373%2C24007246&c=WEB&txp=5432434&n=gS-QJ33bn6cUVR_U&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIgK7MHV43tb39DLbgMszaSsy87QTD3YrdgdVmmiF7ZxJ4CIQCj5Dw-505xQYHYT8qzFuEHBxYbKYGY9MZoUygzvkPGTA%3D%3D&sig=AOq0QJ8wRQIhAKQe95AD0_GmFkoyelpf2f0Zv26S_3k_xZKGcEYw8Sd2AiA7Kfiik9VW9Moy5jmqrHzszi4Qn4IXI54TiFTMdbpLFg==',
                    ext: 'mp4',
                    tbr: 2846.977,
                    format: '299 - 1920x1080 (1080p60)',
                    filesize: 52099330,
                    vcodec: 'avc1.64002a',
                    quality: 5,
                    asr: null,
                    container: 'mp4_dash',
                    downloader_options: [Object],
                    vbr: 2846.977,
                    height: 1080,
                    http_headers: [Object],
                    width: 1920,
                    format_id: '299',
                    protocol: 'https',
                    fps: 60
                },
                {
                    format_note: '360p',
                    acodec: 'mp4a.40.2',
                    url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=18&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=ZMnylWWiKX1LHgT_jnkKWS0G&gir=yes&clen=9358519&ratebypass=yes&dur=146.448&lmt=1635529514334465&mt=1635559487&fvip=3&fexp=24001373%2C24007246&c=WEB&txp=5430434&n=Eb3a26_vaXiqcKNE&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgPOyaywhRxTlAh9XjSZa4_pJuo3HWLUcXsG1GL1EtxlQCIDPIaAqT6ayou9DeQoyB9uOgHuz4HkbLOaz829JnV5Ga&sig=AOq0QJ8wRgIhAMYXJbx-cIAdHDL9TZKfAHfDbi1UrVnFSjm1MOl-CvOxAiEA8uJAy3UHZz-953pMSZn1QU2xrvO1-Od23Z-rKXV6x9w=',
                    ext: 'mp4',
                    tbr: 511.226,
                    format: '18 - 640x360 (360p)',
                    filesize: 9358519,
                    vcodec: 'avc1.42001E',
                    quality: 2,
                    asr: 44100,
                    height: 360,
                    http_headers: [Object],
                    width: 640,
                    format_id: '18',
                    protocol: 'https',
                    fps: 30
                }
            ],
            format_id: '18',
            url: 'https://r3---sn-nx5e6nez.googlevideo.com/videoplayback?expire=1635581379&ei=Y6l8YcPFDIiTkgbpi7WgDQ&ip=2604%3A4080%3A1181%3A8520%3A29f8%3A413b%3Ab71a%3Aa0f9&id=o-ADIYDxa-Mqib_Idurcx-I4FyyAi8klwxmELZHWaovG9E&itag=18&source=youtube&requiressl=yes&mh=x0&mm=31%2C29&mn=sn-nx5e6nez%2Csn-nx5s7n7d&ms=au%2Crdu&mv=m&mvi=3&pl=32&initcwndbps=2027500&vprv=1&mime=video%2Fmp4&ns=ZMnylWWiKX1LHgT_jnkKWS0G&gir=yes&clen=9358519&ratebypass=yes&dur=146.448&lmt=1635529514334465&mt=1635559487&fvip=3&fexp=24001373%2C24007246&c=WEB&txp=5430434&n=Eb3a26_vaXiqcKNE&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgPOyaywhRxTlAh9XjSZa4_pJuo3HWLUcXsG1GL1EtxlQCIDPIaAqT6ayou9DeQoyB9uOgHuz4HkbLOaz829JnV5Ga&sig=AOq0QJ8wRgIhAMYXJbx-cIAdHDL9TZKfAHfDbi1UrVnFSjm1MOl-CvOxAiEA8uJAy3UHZz-953pMSZn1QU2xrvO1-Od23Z-rKXV6x9w=',
            requested_subtitles: null,
            acodec: 'mp4a.40.2',
            uploader: 'Monstercat Instinct',
            protocol: 'https',
            channel: 'Monstercat Instinct',
            tbr: 511.226,
            asr: 44100,
            description: '🎧  Support on all platforms: https://monster.cat/behindyoureyes\n',
            _filename: 'Bishu & Juneau - Behind Your Eyes [Monstercat Release]-DWIH4BZV1x4.mp4',
            average_rating: 4.9174314,
            format: '18 - 640x360 (360p)',
            fps: 30
        }
        */