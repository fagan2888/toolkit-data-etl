'use strict'

const CivilNuclearProcessor = require('./lib/processors/civil_nuclear_processor')
const EnvironmentalSolutionsProcessor = require('./lib/processors/environmental_solutions_processor')
const NextGenProcessor = require('./lib/processors/next_gen_processor')
const OilAndGasProcessor = require('./lib/processors/oil_and_gas_processor')
const RenewableProcessor = require('./lib/processors/renewable_energy_processor')
const SmartGridProcessor = require('./lib/processors/smart_grid_processor')

module.exports = {
  handler: (_event, _context, callback) => {
    Promise.all(
      [
        new CivilNuclearProcessor('a31t0000000CyDB').process(),
        new EnvironmentalSolutionsProcessor('a31t0000000CyD6').process(),
        new NextGenProcessor('a31t0000000CyDG').process(),
        new OilAndGasProcessor('a31t0000000CyDL').process(),
        new RenewableProcessor('a31t0000000CyDQ').process(),
        new SmartGridProcessor('a31t0000000CyDV').process()
      ])
      .then((results) => {
        callback(null, results)
      })
      .catch(err => callback(err))
  }
}
