import websocket from "ws";

var ws = new websocket.Server({
    port: 8080
});
ws.on('connection', (client, message) => {
    var params = (message.url?.split('?')[1] as string).split('&').map(t => t.split('=')).reduce<{ [id: string]: string }>((pv, cv) => { pv[cv[0]] = cv[1]; return pv; }, {});
    var webs = new websocket("ws://" + params.host + ":" + params.port);
    webs.on("open", () => {
        console.log("openend connection to: " + "ws://" + params.host + ":" + params.port);
    })
    webs.on("message", (data) => {
        client.send(data);
        console.log(JSON.stringify(JSON.parse(data as string)));
    });
    webs.on("close", client.close);
    client.on("close", webs.close);
})