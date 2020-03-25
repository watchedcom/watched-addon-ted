import { WorkerHandlers } from "@watchedcom/sdk";
import { scrape } from "./ted-scraper";

export const directoryHandler: WorkerHandlers["directory"] = async (
    input,
    ctx
) => {
    console.log("directory", input);
    const { fetch } = ctx;

    const results = await fetch("https://www.ted.com/talks").then(
        async (resp) => {
            return scrape(await resp.text());
        }
    );

    return {
        nextCursor: null,
        items: results.map((item) => {
            const id = item.link;
            return {
                id,
                ids: { id },
                type: "movie",
                name: item.title,
                images: {
                    poster: item.thumbnail,
                },
            };
        }),
    };
};

export const itemHandler: WorkerHandlers["item"] = async (input, ctx) => {
    console.log("item", input);

    throw new Error("Not implemented");
};
