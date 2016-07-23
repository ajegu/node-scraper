var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

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
    fs.write(fd, JSON.stringify(json, null, 4), null, function(err) {
        console.log('File successfully writen !');
    });
}

function requestUrl(url, fd) {
    request(url, function(error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);
            var error = false;
            $('.no-response').filter(function() {
                var data = $(this);
                console.log(data.children().text().trim())
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

console.log('Magic happens on port 8081');

exports = module.exports = app;
