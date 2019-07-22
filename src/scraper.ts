
import { maybe, Maybe } from 'folktale';
import cheerio from 'cheerio';
import { prop } from 'ramda';
import { AxiosRequestConfig, AxiosInstance } from 'axios';
import autobind from 'autobind-decorator';

const getData = prop('data');

type CallbackHandle = ($html: CheerioStatic, result: {}) => ({});

@autobind
class Scraper {
    private result = {};

    private promise = Promise.resolve();

    private defaultHeaders = {};

    private referer: Maybe<string> = maybe.Nothing<string>();

    constructor(
        private readonly requestService: AxiosInstance
    ) { };



    private doRequestAndExecuteCallback(config: AxiosRequestConfig, callbackHandle: CallbackHandle) {
        return this.requestService({
            url: config.url,
            headers: {
                Referer: this.referer.getOrElse(''),
                ...this.defaultHeaders,
                ...config.headers
            },
            ...config
        })
            .then<string>(getData)
            .then(cheerio.load)
            .then($html => callbackHandle($html, this.result))
            .then(this.setResult);
    }

    private doRequestAndExecuteCallbackWithReferer(config: AxiosRequestConfig, callbackHandle: CallbackHandle) {
        this.doRequestAndExecuteCallback(config, callbackHandle)
            .then(() => {
                this.referer = maybe.fromNullable(config.url);
            });
    }

    private setResult(result = {}) {
        this.result = result;
    }

    public setDefaultHeaders(headers = {}) {
        this.defaultHeaders = headers;
        return this;
    }

    public fetchPage(config: AxiosRequestConfig, callbackHandle: CallbackHandle) {
        this.promise = this.promise
            .then(() => this.doRequestAndExecuteCallback(config, callbackHandle));
        return this;
    }

    public goToPage(config: AxiosRequestConfig, callbackHandle: CallbackHandle) {
        this.promise = this.promise
        .then(() => this.doRequestAndExecuteCallbackWithReferer(config, callbackHandle));
        return this;
    }

    public sendForm(config: AxiosRequestConfig, callbackHandle: CallbackHandle){
        this.promise = this.promise
        .then(() => this.doRequestAndExecuteCallbackWithReferer(config, callbackHandle));
        return this;
    }

    public async getResult(){
        await this.promise;
        return this.result;
    }
}

export default Scraper;