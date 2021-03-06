import axios from 'axios'

const googleKey = process.env.GOOGLE_KEY && process.env.GOOGLE_KEY.replace(/"/g, '') || require('../../secrets.js').googleKey

/* -----------------    ACTIONS     ------------------ */

const SET_CURRENT = 'SET_CURRENT'
const SET_TOKEN = 'SET_TOKEN'
const SET_CORPUS = 'SET_CORPUS'
const SET_CHART_DATA = 'SET_CHART_DATA'


/* ------------   ACTION CREATORS     ------------------ */

const setCurr = (artist, song) => {
  song = song.indexOf(' - ') > -1 ?
    song.slice(0, song.indexOf(' - ')) :
    song
  return {
    type: SET_CURRENT,
    artist,
    song
  }
}

const setToken = token => ({ type: SET_TOKEN, token })

const setCorpus = corpus => {
  return {
    type: SET_CORPUS,
    corpus: corpus.replace(/\n\n/g, '\n')
    .replace(/\n/g, '.\n'),
    corpusHTML: corpus.replace(/\n\n/g, '\n').replace(/\n/g, '<br />')
  }
}

const parseSentences = arr => {
  return arr.map(obj => {
    return {
      x: obj.text.beginOffset,
      y: obj.sentiment.score,
      sentence: obj.text.content || 'No text'
    }
  })
}

const setChartData = serverResponse => {
  return {
    type: SET_CHART_DATA,
    data: {
      documentSentiment: serverResponse.documentSentiment,
      sentences: parseSentences(serverResponse.sentences)
    }
  }
}

/* ------------       REDUCER     ------------------ */

export default (state = {
  data: {},
  isLoading: false,
  isLoggedIntoSpotify: false,
  currSong: '',
  currArtist: '',
  corpus: '',
  corpusHTML: '',
  access_token: ''
}, action) => {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case SET_CURRENT:
      newState.currSong = action.song
      newState.currArtist = action.artist
      break

    case SET_TOKEN:
      newState.isLoggedIntoSpotify = true
      newState.access_token = action.token
      break

    case SET_CORPUS:
      newState.corpus = action.corpus
      newState.corpusHTML = action.corpusHTML
      break

    case SET_CHART_DATA:
      newState.data = action.data
      break

    default:
      return state
  }
  return newState
}

/* ------------       DISPATCHERS     ------------------ */

export const storeToken = token => (dispatch) => {
  return dispatch(setToken(token))
}

export const passCorpusToChart = () => (dispatch, getState) => {
  const postBody = {
    "document": {
      "content": getState().corpus,
      "language": "EN",
      "type": "PLAIN_TEXT"
    },
    "encodingType": "UTF8"
  }
  return axios.post(`https://language.googleapis.com/v1/documents:analyzeSentiment?key=${googleKey}`, postBody)
    .then(res => {
      dispatch(setChartData(res.data))
    })
    .catch(err => console.error(err))
}

export const grabLyrics = () => (dispatch, getState) => {
  return axios.get(`/api/lyrics/${encodeURIComponent(getState().currArtist)}/${encodeURIComponent(getState().currSong)}`)
    .then(res => {
      dispatch(setCorpus(res.data.lyric))
    })
    .then(() => {
      dispatch(passCorpusToChart())
    })
    .catch(err => {
      dispatch(setCorpus('Oh no! We can\'t find your song. Try another!'))
    })
}

export const grabCurrSong = token => (dispatch, getState) => {
  return axios.get('https://api.spotify.com/v1/me/player/currently-playing', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(res => {
      const apiArtist = res.data.item.artists[0].name,
        apiSong = res.data.item.name
      if (apiArtist !== getState().currArtist || apiSong !== getState().currSong) {
        dispatch(setCurr(apiArtist, apiSong))
        dispatch(grabLyrics())
      }
    })
}
