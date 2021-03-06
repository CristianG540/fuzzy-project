/* global sails */

const Papa = require('papaparse')
const Fuse = require('fuse.js')
const fs = require('fs')
const _ = require('lodash')

module.exports = {
  friendlyName: 'Api Productos IGB',

  description: 'Fuzzy search de los productos para IGB desde archivo csv',

  inputs: {
    keyword: {
      description: 'Texto/valor que se va buscar en el csv de productos',
      example: 'filtro aire',
      type: 'string',
      required: true
    }
  },

  exits: {
    success: {
      outputExample: {
        productos: [
          {
            '_id': 'AC23713',
            'titulo': 'CHAQUETA MUJER AZUL M',
            'aplicacion': 'DEA',
            'imagen': 'https://www.igbcolombia.com/img_app/AC23713.jpg',
            'marcas': 'A-PRO',
            'unidad': 'UND',
            'existencias': 1,
            'precio': 277100
          },
          {
            '_id': 'AC23744',
            'titulo': 'CHAQUETA MUJER AZUL XS',
            'aplicacion': 'DEA',
            'imagen': 'https://www.igbcolombia.com/img_app/AC23744.jpg',
            'marcas': 'A-PRO',
            'unidad': 'UND',
            'existencias': 4,
            'precio': 277100
          }
        ]
      },
      outputType: 'json'
    },
    notFound: {
      description: 'No se pudo encontrar ningun producto con esa descripcion.',
      statusCode: 404
    }
  },

  fn: async function (inputs, exits) {
    const options = {
      shouldSort: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'codigo',
        'descripcion'
      ]
    }

    const fileStream = fs.createReadStream(sails.config.custom.prodsIgbCsv) // path.resolve(os.tmpdir(), 'fz3temp-3', 'product.txt')
    Papa.parse(fileStream, {
      header: true,
      complete: csvParsed => {
        const filteredProducts = _.filter(csvParsed.data, ['_delete', 'false'])
        // Attach an asynchronous callback to read the data at our posts reference
        const fuse = new Fuse(filteredProducts, options)

        const result = _.map(fuse.search(inputs.keyword), producto => {
          const tituloApli = producto.descripcion.split('.')
          const aplMarca = tituloApli[1] ? tituloApli[1].split('/') : tituloApli[0].split('/')
          const marcaUnd = aplMarca[1] ? aplMarca[1].split('_') : aplMarca[0].split('_')
          return {
            '_id': producto.codigo,
            'titulo': tituloApli[0],
            'aplicacion': aplMarca[0],
            'imagen': 'https://www.igbcolombia.com/img_app/' + producto.codigo + '.jpg',
            'marcas': marcaUnd[0],
            'unidad': marcaUnd[1],
            'existencias': parseInt(producto.cantInventario),
            'precio': parseInt(producto.precio1)
          }
        })

        exits.success(result)

        fileStream.destroy()
      },
      error: err => {
        sails.log.error('Ocurrio un error - controllers/productos/igb/search-prods', err)
        fileStream.destroy()
        exits.error(err)
      }
    })
  }

}
