import Scraper from './scraper';
import requestFactory from './requestFactory';

const requestService = requestFactory({
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36',
    }
});

const scraper = new Scraper(requestService);

scraper
    .fetchPage({
        url: 'https://www.tudogostoso.com.br/receitas/'
    }, ($html, result) => {
        return {
            qtdAncoras: $html('a').length,
        };
    })
    .fetchPage({
        url: 'https://www.tudogostoso.com.br'
    }, ($html, result: any) => {
        return {
            qtdAncoras: $html('a').length,
            qtdAncorasAntiga: result['qtdAncoras'],
        }
    })
    .getResult()
    .then(result => console.log('Resultado de tudo...', result))
    .catch(error => console.log(error.message));