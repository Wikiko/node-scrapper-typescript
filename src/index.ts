import Scraper from './scraper';
import requestFactory from './requestFactory';
import { Maybe, maybe } from 'folktale';
import {head} from 'ramda';

const requestService = requestFactory({
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
    }
});

const scraper = new Scraper(requestService);

function getDomain(url: string): Maybe<string>{
    if(!hasDomain(url)){
        return maybe.Nothing();
    }
    const regexToGetDomain = /(\w{4,5}\:\/\/)?([A-z]*)(\.[a-z]*)+/g;
    return maybe.fromNullable(regexToGetDomain.exec(url))
    .map<string>(head);
}

function hasDomain(url: string): boolean {
    const regexToGetDomain = /(\w{4,5}\:\/\/)?([A-z]*)(\.[a-z]*)+/g;
    return regexToGetDomain.test(url);
}

function goToNextPage(currentPage: string): Promise<{}> {
    return getDomain(currentPage).map<Promise<{}>>((domain) => {
        return scraper
            .fetchPage({
                url: currentPage
            }, async ($html, result) => {
    
                const currentPageNumber = $html('.pagination .current').text();
    
                console.log(`currentPage: ${currentPageNumber}`)
    
                if (currentPageNumber.includes('8')) {
                    return {
                        feito: 'ok'
                    };
                }

                const nextPage = $html('.pagination a').first().attr('href');

                return goToNextPage(hasDomain(nextPage) ? nextPage : `${domain}${nextPage}`);
            })
            .getResult()
            .then(result => (console.log('Resultado de tudo...', result), result));
    }).getOrElse(Promise.resolve({}));
}

goToNextPage('https://www.tudogostoso.com.br/receitas/')
.catch(error => console.log(error.message));