export interface Packet {
    Size: number;
    SpecificPacketSize: number;
    Id: string;
    From: string;
    Type: PacketTypes;
    SpecificPacket: EventPacket | ForwardingPacket | object;
}

export enum PacketTypes {
    Acknowledgement = 0,
    Command = 1,
    Connect = 2,
    ConnectResponse = 3,
    Event = 4, // score updates sent in here with type 1
    File = 5,
    ForwardingPacket = 6, // score updates sent in here with packet type 4
    LoadedSong = 7,
    LoadSong = 8,
    PlaySong = 9,
    Response = 10,
    ScoreRequest = 11,
    ScoreRequestResponse = 12,
    SongFinished = 13, // final score
    SongList = 14,
    SubmitScore = 15
}

export enum EventType {
    PlayerAdded,
    PlayerUpdated,
    PlayerLeft,
    CoordinatorAdded,
    CoordinatorLeft,
    MatchCreated,
    MatchUpdated,
    MatchDeleted,
    QualifierEventCreated,
    QualifierEventUpdated,
    QualifierEventDeleted,
    HostAdded,
    HostRemoved
}

export enum BeatmapDifficulty {
    Easy,
    Normal,
    Hard,
    Expert,
    ExpertPlus
}

export enum CompletionType {
    Passed,
    Failed,
    Quit
}

export enum ConnectTypes {
    Player,
    Coordinator,
    TemporaryConnection
}

export interface Team {
    Id: string;
    Name: string;
}

export interface StreamScreenCoordinates {
    x: number;
    y: number;
}

export interface User {
    Id: string;
    Name: string;
}

export interface Player extends User {
    UserId: string;
    Team: Team;
    PlayState: number;
    DownloadState: number;
    Score: number;
    Combo: number;
    Accuracy: number;
    SongPosition: number;
    SongList?: any;
    ModList: string[];
    StreamScreenCoordinates: StreamScreenCoordinates;
    StreamDelayMs: number;
    StreamSyncStartMs: number;
}

export interface Characteristic {
    SerializedName: string;
    Difficulties: BeatmapDifficulty[];
}

export interface Beatmap {
    Name?: any;
    LevelId: string;
    Characteristic: Characteristic;
    Difficulty: number;
}

export interface MatchPacket {
    Guid: string;
    Players: Player[];
    Leader: User;
    SelectedLevel: any;
    SelectedCharacteristic: Characteristic;
    SelectedDifficulty: BeatmapDifficulty;
}

export interface SongFinishedPacket {
    User: Player;
    Beatmap: Beatmap;
    Type: CompletionType;
    Score: number;
}

export interface CordinatorPacket extends User {
    GetIcon: string,
    UserId: string
}

export interface EventPacket {
    Type: EventType;
    ChangedObject: object | Player;
}

export interface ForwardingPacket {
    ForwardTo: string[];
    Type: number;
    SpecificPacket: EventPacket | object;
}

export interface ConnectPacket {
    ClientType: ConnectTypes;
    Name: string;
    Password: string;
    UserId: string;
    ClientVersion: number;
}