export default class Song {
    id: string
    exist: boolean
    name: string
    artist: string
    album
    albumPicUrl
    vip
    flac
    lyrics: string
    mp3Url
    flacUrl
    available

    constructor(id) {
        this.id = id;                 // string
        this.exist = false;            // bool
        this.name = '';             // string
        this.artist = '';           // string
        this.album = '';            // string
        this.albumPicUrl = '';      // string URL
        this.vip = 0;              // int
        this.flac = null;             // bool
        this.lyrics = '';           // string
        this.mp3Url = null;           // string URL
        this.flacUrl = null;          // string URL
        this.available = null;
    }
}