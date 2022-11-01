import Song from '../datatype/Song'

// 常量
const apiUrl = "https://netease.esutg.workers.dev/api";
const audioApiUrl = "https://netease.esutg.workers.dev/audioapi"

// 通過 song.id 查信息然後更新 song 對象
export async function getDetails(song: Song): Promise<Song> {

    let result = await fetch(apiUrl, {
        method: 'POST',
        body: song.id
    })
        .then(function (response) {
            return response.json();
        })
        .then(data => data)

    // 搞 結果
    if (result === null) {
        // 失敗叻
        // TODO: report network error
        console.error('不能🉐️️ details');
        throw('不能🉐️️ details')
    }
    if (result.code !== 200) {
        // 404 力
        song.exist = false;
        throw(`不能🉐️️ details: code ${result.code}`)
    }

    // 整點 details

    song.exist = true;
    song.name = result.name;
    song.artist = result.artist;
    song.album = result.album;
    song.albumPicUrl = result.albumPicUrl;
    song.vip = result.vip;
    song.flac = (song.flacUrl && true);
    song.lyrics = result.lyric;
    song.available = !result.noCopyrightRcmd;
    return song;
}

// 音頻是不同的 API
export async function getAudio(song: Song) {
    let id = song.id;

    let audioLinks = await fetch(audioApiUrl, {
        method: 'POST',
        body: song.id
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonResponse) {
            // console.log(jsonResponse)
            return jsonResponse;
        })
        .catch((error) => {
            console.error('Audio Error:', error);
            return null;
        });

    // 整點 audio link
    try {
        //url = url.replace(/^http:\/\//i, 'https://');
        song.mp3Url = audioLinks.mp3 ? audioLinks.mp3.replace(/^http:\/\//i, 'https://') : null;
        song.flacUrl = audioLinks.flac ? audioLinks.flac.replace(/^http:\/\//i, 'https://') : null;
    } catch (err) {
        console.log('audio link err: ' + err)
        song.mp3Url = 'null';
        song.flacUrl = 'null';
    }
}

export function getIDwithRe(searchStr: String) {
    //let neteaseLinkRe = /https?:\/\/music\.163\.com\/(?:#\/)?song\?id=([0-9]{1,12})/;
    let neteaseLinkRe = /song[A-Za-z?/=#]{0,9}([0-9]{1,12})/;
    let songID = searchStr.match(neteaseLinkRe);
    if (songID !== null) {
      // 匹配 ok
      // console.log('網易雲連結有效！ID：', songID[1])
      return songID[1];
    } else {
      // 匹配🎱️ OK 看看是不是數字
      let intRe = /^([0-9]{1,12})$/
      songID = searchStr.match(intRe);
      if (songID !== null) {
        // 匹配整數 ok
        // console.log('網易雲 ID：', songID[1])
        return songID[1];
      } else {
        // 查詢字符串 過於 惡俗
        // console.log('感覺不像網易雲 ID')
        return null;
      }
    }
  }
  