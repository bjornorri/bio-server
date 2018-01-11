const API = require('./api')


class Middleware {

  async process(data) {
    let movies = data
    movies = this.modifyStructure(movies)
    movies = this.filter(movies)
    movies = await this.addBackdrops(movies)
    movies = this.extractTrailers(movies)
    movies = this.fixCinemaNames(movies)
    movies = this.fixPlots(movies)
    return movies
  }

  modifyStructure(movies) {
    movies.forEach(m => m.imdb_id = m.ids.imdb)
    return movies
  }

  filter(movies) {
    return movies.filter(m => m.imdb_id)
  }

  async addBackdrops(movies) {
    const data = await (Promise.all(movies.map(m => API.getBackdrops(m.imdb_id))))
    const backdrops = data.map((d => Array.isArray(d) ? d[0].results.backdrops[0] : null))
    const urls = backdrops.map(e => e ? `http://image.tmdb.org/t/p/w500${e.file_path}` : null)
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
}

module.exports = new Middleware()

