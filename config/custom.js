/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

const os = require('os')
const path = require('path')

module.exports.custom = {

  /***************************************************************************
  *                                                                          *
  * Any other custom config this Sails app should use during development.    *
  *                                                                          *
  ***************************************************************************/
  // mailgunDomain: 'transactional-mail.example.com',
  // mailgunSecret: 'key-testkeyb183848139913858e8abd9a3',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',
  // …

  clientMtzCsv: path.resolve(os.tmpdir(), 'fz3temp-2', 'client_motozone.txt'),
  clientIgbCsv: path.resolve(os.tmpdir(), 'fz3temp-2', 'client.txt'),
  prodsMtzCsv: path.resolve(os.tmpdir(), 'fz3temp-3', 'product_motozone.txt'),
  prodsIgbCsv: path.resolve(os.tmpdir(), 'fz3temp-3', 'product.txt')

}
