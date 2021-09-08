import EventEmitter from "events";
import WebSocket from "isomorphic-ws";

import { EventType, ForwardingPacket, Packet, PacketTypes, ScoreUpdateEventPacket } from "./packet";

export class TASocket extends EventEmitter {
    socket: WebSocket;

    constructor() {
        super();
        this.socket = new WebSocket("ws://ta.wildwolf.dev:10157");
        this.socket.on('open', this.socketOpened);
        this.socket.on('close', this.socketClosed);
        this.socket.on('message', this.socketMessage);
        setTimeout(() => {
            console.log(this.socket.readyState);
        }, 1000);
    }

    socketOpened(event: WebSocket.OpenEvent) {
        console.log(`---------------------------------------------------------`);
        console.log(`WebSocket connection Opened.`);
        console.log(`---------------------------------------------------------`);
    }

    socketClosed(event: WebSocket.CloseEvent) {
        console.log(`---------------------------------------------------------`);
        console.log(`WebSocket connection closed.\nReason: ${event.reason}\nCode: ${event.code}`);
        console.log(`---------------------------------------------------------`);
    }

    socketMessage(data: WebSocket.Data) {
        var packet = JSON.parse(data as string) as Packet;
        switch (packet.Type) {
            case PacketTypes.ForwardingPacket:
                var forwardPacket = packet.SpecificPacket as ForwardingPacket;
                switch (forwardPacket.Type) {
                    case EventType.PlayerUpdated:
                        var scoreUpdateUserPacket = forwardPacket.SpecificPacket as ScoreUpdateEventPacket;
                        emit
                        break;

                    default:
                        break;
                }
                break;

            default:
                console.warn("Packet type: " + packet.Type + " not handled");
                break;
        }
    }
}

export interface TASocket {
    on(event: string,)
}

new TASocket();