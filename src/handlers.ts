import { WorkerHandlers } from "@watchedcom/sdk";
import { parseList, parseItem } from "./ted-scraper";

export const directoryHandler: WorkerHandlers["directory"] = async (
    input,
    ctx
) => {
    console.log("directory", input);
    const { fetch } = ctx;
    const cursor: number = <number>input.cursor || 1;

    const results = await fetch(
        "https://www.ted.com/talks?page=" + cursor
    ).then(async (resp) => {
        return parseList(await resp.text());
    });

    return {
        nextCursor: results.length ? cursor + 1 : null,
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
