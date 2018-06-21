/* global sails */

const Papa = require('papaparse')
const Fuse = require('fuse.js')
const fs = require('fs')
const _ = require('lodash')

module.exports = {
  friendlyName: 'Api Productos Motorzone',

  description: 'Fuzzy search de los productos para motozone desde archivo csv',

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
            'id': 'C73155701',
            'asesor': '213',
            'ciudad': 'GALAPA',
            'direccion': 'CL 8 A 61 76 BRR VILLA OLIMPICA',
            'nombre_cliente': 'MOTO LUJOS Y ALGO MAS Y/O BELLO VERGARA JUAN CARLOS',
            'transportadora': '40',
            'asesor_nombre': 'HUMBERTO CERPA ESCOBAR',
            'telefono': '3162947287 JUAN'
          },
          {
            'id': 'C5110901',
            'asesor': '191',
            'ciudad': 'PIJI\ufffdO DEL CARMEN',
            'direccion': 'CL 7 A 2 76',
            'nombre_cliente': 'MOTO REPUESTOS Y VARIEDADES VIRGINIA Y/O NAVARRO HERRERA EDINSON',
            'transportadora': '01',
            'asesor_nombre': 'COBRO JURIDICO',
            'telefono': '3135295532'
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
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        'codigo',
        'descripcion'
      ]
    }

    const fileStream = fs.createReadStream(sails.config.custom.prodsMtzCsv) // path.resolve(os.tmpdir(), 'fz3temp-3', 'product.txt')
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
            'imagen': 'https://www.igbcolombia.com/img_app_motozone/' + producto.codigo + '.jpg',
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
        sails.log.error('Ocurrio un error - controllers/productos/motorzone/search-prods', err)
        fileStream.destroy()
        exits.error(err)
      }
    })
  }

}
