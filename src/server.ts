import Fastify from 'fastify'
import {makeRequest} from "./browser";
import * as cheerio from 'cheerio';
import 'dotenv/config'

const fastify = Fastify();

fastify.get('/', async (request, reply) => {
    const token = request.headers.token || request.query.token;

    if (!token || token !== process.env.API_TOKEN) {
        reply.code(401).send({error: 'Unauthorized'})
        return
    }

    const url: string = request.query.url;

    if (!url) {
        reply.code(400).send({error: 'URL is required'})
        return
    }

    const wait = request.query.wait !== undefined ? Number(request.query.wait) : 200;
    const keepNavigation = request.query.keepNavigation;
    const keepSpace = request.query.keepSpace;

    const result = await makeRequest(url, wait);
    const $ = cheerio.load(result);

    $('script').remove();
    $('noscript').remove();
    $('meta').remove();
    $('style').remove();

    if (!keepNavigation) {
        $('nav').remove();
        $('footer').remove();
        $('#footer').remove();
        $('header').remove();
        $('#header').remove();
        $('[role="navigation"]').remove();
        $('[role="alertdialog"]').remove();
        $('[role="dialog"]').remove();
    }

    if (!keepSpace) {
        $('p, h1, h2, h3, h4, div').after('\n');
        $('a, p').after(' ');

        const content = $('body').text()
            .replace(/ +/g, ' ')
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .replace(/\n{2,}/g, '\n')
            .trim();

        reply.send(content)
    } else {
        reply.send($('body').text().trim())
    }
})

fastify.listen({port: 3999}, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})
