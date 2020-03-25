import * as cheerio from "cheerio";

interface TedItem {
    title: string;
    speaker: string;
    thumbnail: string;
    link: string;
}

export const scrape = async (html: string): Promise<TedItem[]> => {
    const results: TedItem[] = [];

    const $ = cheerio.load(html);

    $("div.talk-link").each((index, elem) => {
        const mediaMessageNode = $(elem).find(".media__message").first();
        const thumbnail = ($(elem)
            .find("img.thumb__image")
            .first()
            .attr("src") as string)
            .split("?")
            .shift();

        const item: TedItem = {
            speaker: mediaMessageNode.children().first().text(),
            title: mediaMessageNode.children().eq(1).text().trim(),
            thumbnail: thumbnail || "",
            link: $(elem).find("a").first().attr("href") as string,
        };

        results.push(item);
    });

    return results;
};
