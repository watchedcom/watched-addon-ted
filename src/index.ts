import { createWorkerAddon } from "@watchedcom/sdk";
import { directoryHandler, itemHandler } from "./handlers";

export const tedAddon = createWorkerAddon({
    id: "ted",
    name: "TED",
    description: "Ideas worth spreading",
    version: "0.0.0",
    itemTypes: ["movie"],
    defaultDirectoryFeatures: {
        search: { enabled: true },
    },
    defaultDirectoryOptions: {
        imageShape: "landscape",
        displayName: true,
    },
});

tedAddon.registerActionHandler("directory", directoryHandler);

tedAddon.registerActionHandler("item", itemHandler);
