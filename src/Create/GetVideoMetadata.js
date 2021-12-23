import YouTubePlayer from 'youtube-player';
import { sleep } from '../utils';

let temp_id = 0;

function GetVideoIdFromUrl(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

export const GetVideoMetadataFromYouTube = async (video_link) => {
    return new Promise(async (resolve, reject) => {
        const video_id = GetVideoIdFromUrl(video_link);

        // Use a container because the YouTube player replaces the other temp div
        const temp_div_container = document.createElement('div');
        temp_div_container.style.display = 'none';
        document.body.appendChild(temp_div_container);

        const temp_div_yt = document.createElement('div')
        temp_div_yt.id = `temp_div_yt_${temp_id++}`;
        temp_div_container.appendChild(temp_div_yt);

        const player = YouTubePlayer(temp_div_yt.id, {
            playerVars: {
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                modestbranding: 1,
                origin: document.domain,
                rel: 0,
                showinfo: 0,
                autoplay: 0,
                frameborder: 0,
                iv_load_policy: 3
            }
        });

        function Cleanup () {
            player.stopVideo();
            player.destroy();
            temp_div_container.remove();
        }

        player.mute();
        player.loadVideoById(video_id);

        player.on('ready', async (event) => {
            // Wait for player to fully load, then get metadata
            while (await event.target.getDuration() == 0) {
                await sleep(200);
            }

            const duration = await event.target.getDuration();
            const video_data = await event.target.getVideoData();

            const metadata = video_data;
            metadata.duration = duration;

            // event.target.hideVideoInfo ??

            // metadata includes:
            // author: "MYLEE DANCE"
            // title: "[Dance Workout] Dua Lipa - Levitating (ft. DaBaby) | MYLEE Cardio Dance Workout, Dance Fitness"
            // video_id: "pdsGv5B9OSQ"
            // video_quality: "medium"
            // video_quality_features: Array []
            // duration: 382.23

            Cleanup();
            resolve(metadata);
        })

        player.on('error', (event) => {
            Cleanup();
            reject(event);
        })
    })
}