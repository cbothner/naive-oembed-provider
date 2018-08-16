console.log('Loading function')

const { URL } = require('url')

class Attributes {
  constructor (data) {
    this.data = data
  }

  get pairs () {
    return Object.entries(this.data).map(
      ([key, value]) => `${key}=${JSON.stringify(value)}`
    )
  }

  toString () {
    return this.pairs.join(' ')
  }
}

class Iframe {
  constructor (attrs) {
    this.attrs = attrs
  }

  get attributes () {
    return { ...this.attrs, frameborder: 0 }
  }

  toString () {
    return `<iframe ${new Attributes(this.attributes)}></iframe>`
  }
}

class OembedResponse {
  constructor ({ url, h, w }) {
    this.height = h || 550
    this.width = w || 700
    this.src = new URL(url)
  }
  get html () {
    const { height, width, src } = this
    return `${new Iframe({ src, height, width })}`
  }

  get json () {
    const { html, height, width } = this
    const { host, origin } = new URL(this.src)

    return {
      version: '1.0',
      type: 'rich',
      provider_name: host,
      provider_url: origin,
      html,
      height,
      width
    }
  }
}

exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2))

  const done = (err, res) =>
    callback(null, {
      statusCode: err ? '400' : '200',
      body: err ? err.message : JSON.stringify(res),
      headers: {
        'Content-Type': 'application/json'
      }
    })

  switch (event.httpMethod) {
    case 'GET':
      if (!event.queryStringParameters.url) {
        done(new Error('Invalid request: url parameter is required.'))
        break
      }
      done(null, new OembedResponse(event.queryStringParameters).json)
      break
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`))
  }
}
