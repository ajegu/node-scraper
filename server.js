const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const Console = require('console').Console;

function scrape(html) {
    var $ = cheerio.load(html);

    var json = [];

    $('.zone-bi').filter(function() {
        var data = $(this);

        json.push({
            name: data.children().find('.denomination-links').text().trim(),
            address: data.children().find('.adresse-container').text().trim(),
            category: data.children().find('.activites').text().trim(),
            phone: data.children().find('.num').text().trim()
        });
    });
    return json;

}

function write(fd, json) {
    fs.write(fd, JSON.stringify(json, null, 4), null, function() {
        Console.log('File successfully writen !');
    });
}

function requestUrl(url, fd) {
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            $('.no-response').filter(function() {
                var data = $(this);
                Console.log(data.children().text().trim())
                if (data.children().text().trim() != '') {
                    //requestUrl(url);
                    error = true;
                    return false;
                }
            });
            if (!error) {
                write(fd, scrape(html));
            }
        }
    });

}

app.get('/scrape', function(req, res) {
    fs.open('output.json', 'w', function(err, fd) {
        var url = 'http://www.pagesjaunes.fr/recherche/avignon-84/commerce-alimentaire?page=' + 2;
        requestUrl(url, fd)
        res.send('end');
    });

});

app.listen('8081')

Console.log('Magic happens on port 8081');

exports = module.exports = app;
