import React, { Component } from "react";

export default class SongDisplay extends Component<{ levelId: string | undefined }, Beatmap & { hash: string }> {
    constructor(props: any) {
        super(props);
        this.state = {
            automapper: false,
            description: "",
            id: 0,
            metadata: { bpm: 0, duration: 0, levelAuthorName: "", songAuthorName: "", songName: "", songSubName: "" },
            name: "",
            qualified: false,
            ranked: false,
            stats: { downloads: 0, downvotes: 0, plays: 0, score: 0, upvotes: 0 },
            uploaded: new Date(Date.now()),
            uploader: { avatar: "", name: "", id: 0, hash: "" },
            versions: [],
            hash: props.levelId ? props.levelId.substring(props.levelId.lastIndexOf("_") + 1).toLocaleLowerCase() : ""
        }
    }

    componentDidMount() {
        if (this.state.hash)
            fetch("https://api.beatsaver.com/maps/hash/" + this.state.hash).then(res => res.json() as Promise<Beatmap>).then(resp => this.setState({ ...resp }));
    }

    render() {
        if (this.state.versions.length === 0) return (<div></div>);
        return (<div style={{ position: "absolute", bottom: 0 }}>
            <img src={this.state.versions.find(t => t.hash.toLocaleLowerCase() === this.state.hash)?.coverURL} alt="" style={{ height: "96px" }}></img>
            <span style={{ position: "absolute", top: 0, whiteSpace: "nowrap", fontSize: "20px" }}>{this.state.name}</span>
        </div>);
    }
}

interface Metadata {
    bpm: number;
    duration: number;
    songName: string;
    songSubName: string;
    songAuthorName: string;
    levelAuthorName: string;
}

interface Stats {
    plays: number;
    downloads: number;
    upvotes: number;
    downvotes: number;
    score: number;
}

interface Version {
    hash: string;
    key: string;
    state: string;
    createdAt: Date;
    sageScore: number;
    diffs: Diff[];
    downloadURL: string;
    coverURL: string;
    previewURL: string;
}

interface Beatmap {
    id: number;
    name: string;
    description: string;
    uploader: Uploader;
    metadata: Metadata;
    stats: Stats;
    uploaded: Date;
    automapper: boolean;
    ranked: boolean;
    qualified: boolean;
    versions: Version[];
}

interface Uploader {
    id: number;
    name: string;
    hash: string;
    avatar: string;
}

interface Diff {
    njs: number;
    offset: number;
    notes: number;
    bombs: number;
    obstacles: number;
    nps: number;
    length: number;
    characteristic: Characteristics;
    difficulty: Difficulties;
    events: number;
    chroma: boolean;
    me: boolean;
    ne: boolean;
    cinema: boolean;
    seconds: number;
    paritySummary: ParitySummary;
    stars?: number;
}

type Difficulties = "Easy" | "Normal" | "Hard" | "Expert" | "ExpertPlus";

type Characteristics = "Standard" | "OneSaber" | "NoArrows" | "_90Degree" | "_360Degree" | "Lightshow" | "Lawless";

interface ParitySummary {
    errors: number;
    warns: number;
    resets: number;
}