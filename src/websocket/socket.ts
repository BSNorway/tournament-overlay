import EventEmitter from "events";
import WebSocket from "isomorphic-ws";

import { EventType, ForwardingPacket, Packet, PacketTypes, EventPacket, CordinatorPacket } from "./packet";

export class TASocket extends EventEmitter {
    socket: WebSocket;
    coordinators: Map<string, string>;
    mainCoordinator?: string;

    constructor() {
        super();
        this.coordinators = new Map();
        this.socket = new WebSocket("ws://ta.wildwolf.dev:10157");
        this.socket.on('open', this.socketOpened);
        this.socket.on('close', this.socketClosed);
        this.socket.on('message', this.socketMessage);
        setTimeout(() => {
            console.log(this.socket.readyState);
        }, 1000);
    }

    setMainCoordinator(key: string) {
        this.mainCoordinator = key;
        this.emit("coordinatorChanged", this.mainCoordinator);
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
        console.log(packet);
        switch (packet.Type) {
            case PacketTypes.Event:
                var eventPacket = packet.SpecificPacket as EventPacket;
                switch (eventPacket.Type) {
                    case EventType.CoordinatorAdded:
                        var cordinator = eventPacket.ChangedObject as CordinatorPacket;
                        this.coordinators.set(cordinator.Id, cordinator.Name)
                        break;
                    case EventType.CoordinatorLeft:
                        var cordinator = eventPacket.ChangedObject as CordinatorPacket;
                        this.coordinators.delete(cordinator.Id);
                        if (cordinator.Id == this.mainCoordinator)
                            this.emit("coordinatorChanged", this.mainCoordinator);
                        break;
                    case EventType.MatchCreated:

                    default:
                        break;
                }
                break;
            case PacketTypes.ForwardingPacket:
                var forwardPacket = packet.SpecificPacket as ForwardingPacket;
                switch (forwardPacket.Type) {
                    case EventType.PlayerUpdated:
                        var scoreUpdateUserPacket = forwardPacket.SpecificPacket as EventPacket;
                        this.emit("scoreUpdate", scoreUpdateUserPacket);
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
    on(event: "scoreUpdate", callback: (data: EventPacket) => void): this;
    on(event: "coordinatorChanged", callback: (data: string | undefined) => void): this;
    on(event: string, callback: (data: any) => void): this;
}

new TASocket();