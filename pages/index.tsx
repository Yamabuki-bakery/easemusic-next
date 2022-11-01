import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState } from 'react';
import React from 'react';
import { useEffect, useRef } from 'react';
import toast, { Toaster } from "react-hot-toast";
import Song from '../datatype/Song'
import useSWR from 'swr'
import { getDetails, getAudio, getIDwithRe } from '../requests/netease'
import { useRouter } from 'next/router';
import { useStateCallback } from '../datatype/useStateCallback';


export default function Home() {
  const [song, setSong] = useStateCallback(new Song(0))
  const [loading, setLoading] = useState(false)
  const [searchBoxText, setSearchBoxText] = useState("");
  const overLoad = useRef(false)
  const startUp = useRef(true)
  const router = useRouter()

  useEffect(
    () => {
      if (router.isReady && router.query.id && router.query.id !== song.id && !loading) {
        //console.log(`Going to new dest! ${router.asPath}`)
        console.log(
          `檢測到導航 ${router.asPath} `
        )
        clickAoButton(router.query.id, false)
        //startUp.current = false
        //startUp.current = false
      }else if (router.isReady && router.query.id && router.query.id !== song.id && loading) {
        overLoad.current = true
      }
    },
    [router.query]
  )
  useEffect(
    () => {
      //console.log(!router.query)
      if (router.isReady && !router.query.id && startUp.current) {
        let lastSong = localStorage.getItem('last-song')
        console.log(`last song is ${lastSong}`)
        startUp.current = false
        clickAoButton(lastSong)
      }
    }
  )
  useEffect(
    () => {
      if (overLoad.current) {
        console.log(
          `點太多前進後退了，這是最後一個 ${router.asPath} `
        )
        clickAoButton(router.query.id, false)
        overLoad.current = false
      }
    },
    [loading]
  )


  async function clickAoButton(
    searchStr: String = searchBoxText,
    pushHistory = true
    ) {
    //console.log(searchStr);
    console.log(`it is ${searchStr}`)
    let songID = getIDwithRe(searchStr);
    if (!songID) {
      // 輸入的過於惡俗
    toast.error('輸入的 連結 或 ID 過於 惡俗！')

      return;
    } else if (songID === song.id) {
      return;
    }
    let newSong = new Song(songID);
  
    // addState(songID);
    // loadSongData(song)
    setLoading(true)
    const detailTask = getDetails(newSong)
    const audioTask = getAudio(newSong)
    setSearchBoxText(newSong.id)
    try {
      newSong = await detailTask
      await audioTask
      setSong(newSong, function (_) {
        if (pushHistory) {
          router.push(
            {
              pathname: router.pathname,
              query: {
                id: newSong.id
              }
            },
            undefined,
            {
              shallow: false,
            }
          )
        }
        localStorage.setItem('last-song', newSong.id)
        console.log(`last song set ${newSong.id}`)
      })

    } catch (error) {
      console.error(error)
      toast.error(error)
    }
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <PageHead />

      <Header 
        clickAoButton={ clickAoButton }
        isLoading={ loading }
        searchBoxText= {searchBoxText}
        setText = {setSearchBoxText}
      />
      
      <Toaster toastOptions={{ position: "top-center" }} />
      <main className='container'>
        <SongInfo 
          song={ song }
          isLoading={ loading }
        />
      </main>
    </div>
  )
}

function Header({ clickAoButton, isLoading, searchBoxText, setText }) {

  return (
    <div className="container sticky-top bg-dark">
      <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <div className="container my-2">
          {/*<!--頂欄元素-->*/}
          <div className="row">

            <a className="col-lg-2 text-dark text-decoration-none ">
              <span className="fs-4" id="logoText">神必服務</span>
            </a>

            <form className="col-10 col-lg-8" onSubmit={() => false}>
              <input id="searchBox" type="text" className="form-control form-control-dark" placeholder="ID or 網易雲分享 複製連結..." 
                value={searchBoxText}
                onChange={(e) => setText(e.target.value)}
              />
            </form>

            <div className="col-2 col-lg-2 ">
              {
                isLoading ?
                <button id="aoButton" type="button" className="btn btn-primary" onClick={() => clickAoButton()} disabled>Loading</button>
                :
                <button id="aoButton" type="button" className="btn btn-primary" onClick={() => clickAoButton()}>ao</button>
              }
            </div>

          </div>

        </div>
      </header>
    </div>
  )
}

function PageHead(){
  return (
    <Head>
      <title>網易雲音 Le</title>
      <meta name="description" content="網易雲音 Le 迫真網頁版" />
      <link rel="apple-touch-icon" sizes="152x152" href="../favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png" />
      <link rel="manifest" href="../favicon/site.webmanifest" />
      <link rel="mask-icon" href="../favicon/safari-pinned-tab.svg" color="#5bbad5" />
      <link rel="shortcut icon" href="../favicon/favicon.ico" />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="msapplication-config" content="../favicon/browserconfig.xml" />
      <meta name="theme-color" content="#000000" />
    </Head>
  )
}

function SongInfo({ song, isLoading }: {song: Song, isLoading: boolean}){

  return (
    <div className="container">
    <div className="row">
      {/*<!--專輯圖片和信息-->*/}
      <div className="col-lg-4 mb-3">

        <div className="row">
          {/*<!--專輯圖片-->*/}
          <div className="col-6 col-lg album-pic" >
            <img id='albumPicArea' src={song.albumPicUrl || "/public/bootstrap-stack.webp"} className="img-fluid" />

          </div>
          {/*<!--換 col 行然後歌曲信息-->*/}
          <div className=""></div>
          <div className="col mb-3">
            <ul className="list-group song-info">
              <li className="list-group-item" id='song-name'>
                {song.name  ? `🎶 ${song.name}` : 'A disabled item' }
              </li>
              <li className="list-group-item" id='song-artist'>
                {song.artist ? `🧑‍🎤 ${song.artist}` : 'A second item'}
              </li>
              <li className="list-group-item" id='song-album'>
                {song.album ? `📀 ${song.album}` : 'A third item'}
              </li>
              <li className="list-group-item" id='song-vip'>
                {song.vip ? '🔐 VIP ✅ yes' : '🔐 VIP ❌ no'}
              </li>
              <li className="list-group-item" id='song-flac'>
                {song.flacUrl ? '🎧 FLAC ✅' : '🎧 FLAC 🈚️'}
              </li>
            </ul>
          </div>
          <div className=""></div>

          <div className="col-4 ms-3 form-check form-switch">
            <input className="form-check-input" type="checkbox" id="flacSwitch" disabled={isLoading||(!song.flacUrl)}  />
              <label className="form-check-label" htmlFor="flacSwitch">FLAC</label>
          </div>

          <div className="col-7 btn-group">

            <button type="button" className="btn btn-primary" id="downButton" disabled={isLoading}>
              {isLoading ? 'Loading' : 'Download'}
            </button>

            <button type="button" className="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
              <span className="visually-hidden">Toggle Dropdown</span>
            </button>

            <ul className="dropdown-menu">
              <li><a className="dropdown-item" id="curlDownButton" >Download via curl</a></li>
              <li><a className="dropdown-item" id="wgetDownButton">Download via wget</a></li>
            </ul>
          </div>{/*<!-- /btn-group -->*/}
          <div className="mb-3"></div>

          <div className="btn-group">

            <button type="button" className="btn btn-danger" id="openAppBtn">🔗Open in App</button>

          </div>

        </div>
      </div>
      {/*<!--歌詞-->*/}
      <div className="col-lg-8">

        <div className="row">

          <div className="col-9" >
            <audio controls className='w-100' preload="auto"
              src={song.mp3Url} id='player'></audio>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-header">
                歌詞
              </div>
              <div className="card-body">
                <button id="lyricButton" type="button" className="btn btn-primary" disabled={!!song.lyrics} >下載歌詞 (.lrc)</button>
                <p className="card-text" id="lyricArea" style={{whiteSpace: 'pre-wrap'}}>
                  {
                    song.lyrics ?
                    song.lyrics
                    :
                    "Some quick example text to build on the card title and make up the bulk of the card's content."
                  }
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>

  )
}

