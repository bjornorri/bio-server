const moment = require('moment')
const API = require('./api')


class Middleware {

  async processMovies(data) {
    let movies = data
    movies = this.modifyStructure(movies)
    movies = this.filter(movies)
    movies = this.fixNullImages(movies)
    movies = await this.addBackdrops(movies)
    movies = this.extractTrailers(movies)
    movies = this.fixCinemaNames(movies)
    movies = this.fixPlots(movies)
    movies = this.fixDurations(movies)
    movies = this.pruneGenres(movies)
    return movies
  }

  async processShowtimes(data) {
    let movies = await this.processMovies(data)
    movies = this.parseScreenings(movies)
    movies = this.sortShowtimes(movies)
    return movies
  }

  async processUpcoming(data) {
    let movies = await this.processMovies(data)
    movies = this.extractReleaseDate(movies)
    movies = this.sortByReleaseDate(movies)
    return movies
  }

  modifyStructure(movies) {
    movies.forEach(m => {
      m.imdb_id = m.ids.imdb
      m.genres = m.genres.map(g => g.Name)
      m.directors = m.directors_abridged.map(d => d.name)
      m.actors = m.actors_abridged.map(a => a.name)
    })
    return movies
  }

  filter(movies) {
    return movies.filter(m => m.imdb_id)
  }

  fixNullImages(movies) {
    movies.filter(m => m.poster === 'https://kvikmyndir.is/images/poster/').forEach(m => {
      m.poster = null
    })
    return movies
  }


  async addBackdrops(movies) {
    const data = await (Promise.all(movies.map(m => API.getBackdrops(m.imdb_id))))
    const backdrops = data.map((d => Array.isArray(d) ? d[0].results.backdrops[0] : null))
    const urls = backdrops.map(e => e ? `http://image.tmdb.org/t/p/w1280${e.file_path}` : null)
    movies.forEach((m, i) => m.backdrop = urls[i] || m.poster)
    return movies
  }

  extractTrailers(movies) {
    movies.forEach(m => {
      if (m.trailers.length === 0) {
        m.trailer = null
        return
      }
      // Find YouTube trailers.
      let trailers = m.trailers[0].results.filter(t => t.type === 'Trailer' && t.site === 'YouTube')
      const filters = [
        t => !t.name.toLowerCase().includes('teaser'), // No teasers
        t => t.name.toLowerCase().includes('trailer'), // Includes "trailer"
        t => !t.name.toLowerCase().includes('trailer 2') && !t.name.toLowerCase().includes('trailer #2'), // Primary trailers
        t => t.name.toLowerCase().includes('official') // Official trailers
      ]
      // Pick the one that passes most filters.
      let trailer = trailers[0] || null
      for (const f of filters) {
        trailers = trailers.filter(f)
        if (trailers.length === 0) break
        trailer = trailers[0]
      }
      m.trailer = trailer
    })
    return movies
  }

  fixCinemaNames(movies) {
    movies.filter(m => m.showtimes).forEach(m => {
      m.showtimes.forEach(s => {
        s.cinema.name = s.cinema.name
          .replace(',', '')
          .replace('Kringlubíó', 'Sambíóin Kringlunni')
          .replace('Álfabakki', 'Sambíóin Álfabakka')
      })
    })
    return movies
  }

  fixPlots(movies) {
    movies.filter(m => m.plot).forEach(m => {
      m.plot = m.plot.replace(/\n/g, ' ')
    })
    return movies
  }

  fixDurations(movies) {
    movies.forEach(m => {
      if (m.durationMinutes === 0) {
        m.durationMinutes = null
      }
    })
    return movies
  }

  pruneGenres(movies) {
    movies.forEach(m => {
      if (m.genres.length > 2) {
        m.genres = m.genres.slice(0, 2)
      }
    })
    return movies
  }

  parseScreenings(movies) {
    movies.forEach(m => {
      m.showtimes = m.showtimes.map(s => {
        return {
          cinema_name: s.cinema.name,
          schedule: s.schedule.map(screening => {

            const input = screening.time
            const roomString = input
              .replace('VIP P', 'VIP')
              .replace('3D', '')
              .replace('2D', '')
              .replace('ÍSL TAL', '')
            const matches = roomString.match(/\((.*?)\)/)
            const room = matches ? matches[1].trim() : null

            return {
              time: moment(input.substring(0, 5), 'HH:mm'),
              purchase_url: screening.purchase_url,
              three_d: input.includes('3D'),
              icelandic: input.includes('ÍSL TAL'),
              room: room
            }
          })
        }
      })
    })
    return movies
  }

  extractReleaseDate(movies) {
    movies.forEach(m => {
      m.release_date = m["release-dateIS"] || null
      delete m["release-dateIS"]
    })
    return movies
  }

  sortShowtimes(movies) {
    const score = m => {
      let score = m.showtimes.map(s => s.schedule.length).reduce((a, b) => a + b, 0) // Number of screenings.
      score += m.ratings.imdb / 10 // Break ties with rating.
      return score
    }
    return movies.sort((a, b) => score(b) - score(a))
  }

  sortByReleaseDate(movies) {
    movies.sort((a, b) => moment(a.release_date) - moment(b.release_date))
    return movies
  }
}

module.exports = new Middleware()

