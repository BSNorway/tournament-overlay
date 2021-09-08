import { readFileSync, writeFileSync } from "fs";
import { firstBy } from "thenby";
import { Packet } from "./src/websocket/packet";

var f = JSON.parse(readFileSync("./tajson.json", "utf-8")) as Packet[];
writeFileSync("./tacleaned.json", JSON.stringify(
    f.sort(firstBy<Packet>((a, b) => a.Type - b.Type).thenBy((a, b) => a.Size - b.Size))
))