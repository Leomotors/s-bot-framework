import { trim } from "../utils/string";
import { Loader } from "../data/loader";
import { MessageResponse } from "../client";

export interface TriggerOptions {
    prefixes?: string[];
    mention?: boolean;
    keywords: string[] | Loader;
    keywords_exact_check?: boolean;
}

export interface responseOptions {
    loader: Loader;
    reply?: boolean;
    react?: string;
}

export interface ResponseOptions {
    trigger: TriggerOptions;
    response: responseOptions;
}

export class Response {
    private clientID: () => string = () => "";
    private trigger: TriggerOptions;
    private response: responseOptions;

    private triggeredKeyword?: string;
    get triggered() {
        return this.triggeredKeyword;
    }

    private returnedItem?: { index: number; data: string };
    get lastReturned() {
        return this.returnedItem;
    }

    constructor(Options: ResponseOptions) {
        const { trigger, response } = Options;

        this.trigger = trigger;
        this.response = response;
    }

    isTrigger(message: string) {
        const {
            prefixes = [],
            mention = false,
            keywords,
            keywords_exact_check = false,
        } = this.trigger;
        if (mention && !message.includes(this.clientID())) return false;

        if (
            prefixes.length &&
            !(() => {
                for (const prefix of prefixes)
                    if (message.startsWith(prefix)) return true;
                return false;
            })()
        )
            return false;

        const keyword_check = keywords_exact_check
            ? (msg: string, kw: string) => msg.includes(kw)
            : (msg: string, kw: string) => trim(msg).includes(trim(kw));

        let data: string[] = [];

        if (keywords instanceof Loader) {
            data = keywords.getData();
        } else {
            data = keywords;
        }
        for (const keyword of data)
            if (keyword_check(message, keyword)) {
                this.triggeredKeyword = keyword;
                return true;
            }

        return false;
    }

    getReply(): MessageResponse {
        const data = this.response.loader.getData();
        const selectedIndex = Math.floor(
            this.response.loader.getData().length * Math.random()
        );
        let selectedData = data[selectedIndex];

        this.returnedItem = {
            index: selectedIndex,
            data: selectedData,
        };

        return {
            message: selectedData,
            react: this.response.react,
            reply: this.response.reply,
        };
    }
}