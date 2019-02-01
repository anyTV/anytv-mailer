


import moment from 'moment';
/**
 * https://github.com/winstonjs/winston/issues/801
 * import default from winston fails
 * Preferred using cjs require instead of doing:
 *   import * as winston from 'winston';
 * Winston already has a new major version coming that might change the behavior for `import`.
 */
const winston = require('winston');

const timestamp = () => moment.utc().format('YYYY-MM-DD HH:mm:ss:SSS[ms]');


export default new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'silly',
            colorize: true,
            prettyPrint: true,
            timestamp
        })
    ]
});
