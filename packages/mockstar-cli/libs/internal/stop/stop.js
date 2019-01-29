'use strict';

const Promise = require('bluebird');

const colorsLog = require('../../utils/colorsLog');
const starting = require('mockstar-starting');

/**
 *
 * @param {Object} args 参数
 */
module.exports = function (args) {
    // console.log(args);
    const self = this;

    return new Promise((resolve, reject) => {
        starting.stop(function (isPidRunning, config) {
            if (isPidRunning) {
                colorsLog.info(`[i] MockStar@${self.version} is stop failed!`);
                colorsLog.info('\n' + JSON.stringify(config, null, 2));
            } else {
                colorsLog.info(`[i] MockStar@${self.version} is stopped!`);
            }

            resolve();
        });
    });
};
