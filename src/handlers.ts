import { WorkerHandlers } from "@watchedcom/sdk";
import { parseList, parseItem } from "./ted-scraper";
import * as qs from "qs";

export const directoryHandler: WorkerHandlers["directory"] = async (
    input,
    ctx
) => {
    console.log("directory", input);
    const { fetch } = ctx;
    const cursor: number = <number>input.cursor || 1;

    const queryString = qs.stringify(
        {
            page: cursor,
            q: input.search || undefined,
            ...input.filter,
        },
        { arrayFormat: "brackets" }
    );

    const results = await fetch(
        "https://www.ted.com/talks?" + queryString
    ).then(async (resp) => {
        return parseList(await resp.text());
    });

    return {
        nextCursor: results.length ? cursor + 1 : null,
        features: {
            filter: [
                {
                    id: "language",
                    name: "Language",
                    values: [
                        { value: "English", key: "en" },
                        { value: "Español", key: "es" },
                        { value: "日本語", key: "ja" },
                        { value: "Português brasileiro", key: "pt-br" },
                        { value: "中文 (繁體)", key: "zh-tw" },
                        { value: "한국어", key: "ko" },
                    ],
                },
                {
                    id: "duration",
                    name: "Duration",
                    values: [
                        { value: "0–6 minutes", key: "0-6" },
                        { value: "6–12 minutes", key: "6-12" },
                        { value: "12–18 minutes", key: "12-18" },
                        { value: "18+ minutes", key: "18+" },
                    ],
                },
                {
                    id: "topics",
                    name: "Topics",
                    multiselect: true,
                    values: [
                        { value: "Technology", key: "Technology" },
                        { value: "Entertainment", key: "Entertainment" },
                        { value: "Design", key: "Design" },
                        { value: "Business", key: "Business" },
                        { value: "Science", key: "Science" },
                        { value: "Global issues", key: "Global issues" },
                    ],
                },
            ],
        },
        items: results.map((item) => {
            const id = item.link;
            return {
                id,
                ids: { id },
                type: "movie",
                name: `${item.title}`,
                images: {
                    poster: item.thumbnail,
                },
            };
        }),
    };
};

export const itemHandler: WorkerHandlers["item"] = async (input, ctx) => {
    console.log("item", input);

    const { fetch } = ctx;

    const url = "https://www.ted.com" + input.ids.id;

    const result = await fetch(url).then(async (resp) =>
        parseItem(await resp.text())
    );

    return {
        type: "movie",
        ids: input.ids,
        name: input.name || result.title,
        description: result.description,
        releaseDate: result.recorded,
        sources: [
            {
                type: "url",
                url: result.downloads.nativeDownloads.high,
            },
        ],
        images: {
            poster: result.thumbnail,
        },
    };
};
