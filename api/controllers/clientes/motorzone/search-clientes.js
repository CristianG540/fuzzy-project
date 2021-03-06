/* global sails */

/**
 * ClientesMtzController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const Papa = require('papaparse')
const Fuse = require('fuse.js')
const fs = require('fs')
const _ = require('lodash')

module.exports = {

  friendlyName: 'Api Clientes Motozone',

  description: 'Fuzzy search de los clientes para motozone desde archivo csv',

  inputs: {
    keyword: {
      description: 'Texto/valor que se va buscar en el csv de clientes',
      example: 'moto store',
      type: 'string',
      required: true
    },
    asesor: {
      description: 'id del asesor al que se le van a buscar los clientes',
      example: 15,
      type: 'number'
    }
  },

  exits: {
    success: {
      outputExample: {
        clientes: [
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
      description: 'No se pudo encontrar ningun cliente con esa descripcion.',
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
        'id',
        'nombre_cliente'
      ]
    }

    let fileStream = fs.createReadStream(sails.config.custom.clientMtzCsv) // path.resolve(os.tmpdir(), 'fz3temp-3', 'product.txt')
    Papa.parse(fileStream, {
      header: true,
      complete: csvParsed => {
        // Attach an asynchronous callback to read the data at our posts reference
        let fuse
        if (inputs.asesor) {
          fuse = new Fuse(_.filter(csvParsed.data, ['asesor', String(inputs.asesor)]), options)
        } else {
          fuse = new Fuse(csvParsed.data, options)
        }

        const result = fuse.search(inputs.keyword)

        exits.success(result)

        fileStream.destroy()
      },
      error: err => {
        sails.log.error('Ocurrio un error - controllers/clientes/motorzone/search-clients', err)
        fileStream.destroy()
        exits.error(err)
      }
    })
  }

}
