import Fastify from 'fastify'
import {makeRequest} from "./browser";
import * as cheerio from 'cheerio';

const fastify = Fastify({
    logger: true
})

fastify.get('/', async(request, reply) => {
    const url: string = request.query?.url;

    if (!url) {
        reply.code(400).send({ error: 'URL is required' })
        return
    }

    const result = await makeRequest(url);
    const $ = cheerio.load(result);

    $('script').remove();
    $('noscript').remove();
    $('meta').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    $('#footer').remove();
    $('header').remove();
    $('#header').remove();
    $('[role="navigation"]').remove();
    $('[role="alertdialog"]').remove();
    $('[role="dialog"]').remove();

    $('p, h1, h2, h3, h4, li').after('\n');

    const content = $('body').text()
        .replace(/ +/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\n{2,}/g, '\n')
        .trim();

    reply.send(content)
})

fastify.listen({ port: 3999 }, function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
})
