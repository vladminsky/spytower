'use strict';

var fs = require('fs');
var mongoose = require('mongoose');

/**
 * Get awesome things
 */
exports.awesomeThings = function (req, res) {
    return mongoose
        .model('Thing')
        .find(function (err, things) {
            if (!err) {
                return res.json(things);
            } else {
                return res.send(err);
            }
        });
};

exports.reports = function (req, res) {

    var DIR_NAME = './reports';
    var COLLECTION = 'saved_reports';

    var fileReports = [];

    /*
    var fileReports = fs
        .readdirSync(DIR_NAME)
        .map(function (fileName) {
            return {
                _id: fileName,
                persistent: true,
                report: fs.readFileSync(DIR_NAME + '/' + fileName).toString()
            };
        });
    */

    mongoose
        .connection
        .db
        .collection(COLLECTION)
        .find()
        .sort({ _id: 1 })
        .toArray(function (err, r) {

            if (!err) {
                return res.json(r.concat(fileReports));
            }
            else {
                return res.send(err);
            }
        });
};