import * as cheerio from "cheerio";
import * as fs from "fs";

interface TedItem {
    title: string;
    speaker: string;
    thumbnail: string;
    link: string;
}

interface ExtendedTedItem {
    description: string;
    downloads: {
        nativeDownloads: {
            high: string;
            low: string;
            medium: string;
        };
    };
}

export const parseList = async (html: string): Promise<TedItem[]> => {
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

export const parseItem = async (
    html: string
): Promise<TedItem & ExtendedTedItem> => {
    const $ = cheerio.load(html);

    const scriptData = $("script[data-spec=q]").first().html();

    const dataObj = /{.*}/.exec(<string>scriptData);
    const parsed = JSON.parse((dataObj || [])[0]);
    const initialData = parsed?.__INITIAL_DATA__;

    if (!initialData) {
        throw new Error("Unable to extract data object");
    }

    const firstTalk = initialData.talks[0];

    return {
        title: firstTalk.title,
        description: firstTalk.description,
        speaker: ["firstname", "lastname"]
            .map((_) => firstTalk.speakers[0][_])
            .filter((_) => _)
            .join(" "),
        link: initialData.url,
        thumbnail: firstTalk.hero,
        downloads: firstTalk.downloads,
    };
};
