import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function VideoMeet() {
    const serverUrl = "http://localhost:3000";
    let connections = useRef({});
    let userNames = useRef({});
    const peerConnectionConfig = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
        ],
    };

    let socketRef = useRef();
    let socketID = useRef();
    let localVideoRef = useRef();
    const [videoPermission, setVideoPermission] = useState(false);
    const [audioPermission, setAudioPermission] = useState(false);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);
    const [screenShare, setScreenShare] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [screenShareAvailable, setScreenShareAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [userName, setUserName] = useState("");
    let videoRef = useRef([]);
    const [videos, setVideos] = useState([]);

    const getPermissions = async () => {
        try {
            const videoPermissionGranted =
                await navigator.mediaDevices.getUserMedia({ video: true });
            const videoAvailable = videoPermissionGranted ? true : false;
            setVideoPermission(videoAvailable);

            const audioPermissionGranted =
                await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioAvailable = audioPermissionGranted ? true : false;
            setAudioPermission(audioAvailable);

            setScreenShareAvailable(
                navigator.mediaDevices.getDisplayMedia ? true : false
            );

            if (audioAvailable || videoAvailable) {
                const userMediaStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: videoAvailable,
                        audio: audioAvailable,
                    });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current)
                        localVideoRef.current.srcObject = userMediaStream;
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addTracksToConnection = (connection, stream) => {
        if (!connection || !stream) return;

        const existingSenders = connection.getSenders();
        const existingTracks = existingSenders
            .map((sender) => sender.track)
            .filter((track) => track !== null);

        stream.getTracks().forEach((track) => {
            const trackAlreadyExists = existingTracks.find(
                (existingTrack) =>
                    existingTrack === track ||
                    (existingTrack &&
                        existingTrack.kind === track.kind &&
                        existingTrack.id === track.id)
            );

            if (!trackAlreadyExists) {
                try {
                    connection.addTrack(track, stream);
                } catch (err) {
                    console.log(err);
                }
            }
        });
    };

    const replaceTracksInConnection = (connection, newStream) => {
        if (!connection || !newStream) return;

        const senders = connection.getSenders();
        senders.forEach((sender) => {
            if (sender.track) {
                connection.removeTrack(sender);
            }
        });

        addTracksToConnection(connection, newStream);
    };

    useEffect(() => {
        getPermissions();
    }, []);

    const getUserMediaSuccess = (stream) => {
        try {
            if (window.localStream)
                window.localStream.getTracks().forEach((track) => {
                    track.stop();
                });
        } catch (err) {
            console.error(err);
        }

        window.localStream = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        for (let id in connections.current) {
            if (id === socketID.current) continue;
            replaceTracksInConnection(connections.current[id], stream);

            connections.current[id]
                .createOffer()
                .then((description) => {
                    connections.current[id]
                        .setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit(
                                "signal",
                                id,
                                JSON.stringify({
                                    sdp: connections.current[id]
                                        .localDescription,
                                })
                            );
                        })
                        .catch((err) => console.error(err));
                })
                .catch((err) => console.error(err));
        }

        stream.getTracks().forEach((track) => {
            track.onended = () => {
                setVideo(false);
                setAudio(false);
                try {
                    if (
                        localVideoRef.current &&
                        localVideoRef.current.srcObject
                    ) {
                        let tracks =
                            localVideoRef.current.srcObject.getTracks();
                        tracks.forEach((track) => track.stop());
                    }
                } catch (err) {
                    console.error(err);
                }

                // window.localStream = blackSilence();
                if (localVideoRef.current)
                    localVideoRef.current.srcObject = window.localStream;

                for (let id in connections.current) {
                    replaceTracksInConnection(
                        connections.current[id],
                        window.localStream
                    );

                    connections.current[id]
                        .createOffer()
                        .then((description) => {
                            connections.current[id]
                                .setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit(
                                        "signal",
                                        id,
                                        JSON.stringify({
                                            sdp: connections.current[id]
                                                .localDescription,
                                        })
                                    );
                                })
                                .catch((err) => console.error(err));
                        })
                        .catch((err) => console.error(err));
                }
            };
        });
    };

    // ✅ Fixed WebRTC signaling with proper state management
    const gotMessageFromServer = (fromId, message) => {
        try {
            let signal = JSON.parse(message);

            if (fromId !== socketID.current && connections.current[fromId]) {
                const connection = connections.current[fromId];

                if (signal.sdp) {
                    const { type } = signal.sdp;
                    const currentState = connection.signalingState;

                    // ✅ Check if we can safely set remote description
                    if (type === "offer") {
                        // Handle incoming offer
                        if (
                            currentState === "stable" ||
                            currentState === "have-local-offer"
                        ) {
                            connection
                                .setRemoteDescription(
                                    new RTCSessionDescription(signal.sdp)
                                )
                                .then(() => {
                                    return connection.createAnswer();
                                })
                                .then((description) => {
                                    return connection.setLocalDescription(
                                        description
                                    );
                                })
                                .then(() => {
                                    socketRef.current.emit(
                                        "signal",
                                        fromId,
                                        JSON.stringify({
                                            sdp: connection.localDescription,
                                        })
                                    );
                                })
                                .catch((err) => console.log(err));
                        }
                    } else if (type === "answer") {
                        if (currentState === "have-local-offer") {
                            connection
                                .setRemoteDescription(
                                    new RTCSessionDescription(signal.sdp)
                                )
                                .then(() => {})
                                .catch((err) => console.log(err));
                        }
                    }
                }

                if (signal.ice) {
                    if (connection.remoteDescription) {
                        connection
                            .addIceCandidate(new RTCIceCandidate(signal.ice))
                            .then(() => {})
                            .catch((err) => console.log(err));
                    } else {
                        if (!connection.pendingIceCandidates) {
                            connection.pendingIceCandidates = [];
                        }
                        connection.pendingIceCandidates.push(signal.ice);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const addMessage = () => {};

    const connectToSocketServer = () => {
        socketRef.current = io.connect(serverUrl, { secure: false });

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href, userName);
            socketID.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                if (connections.current[id]) {
                    connections.current[id].close();
                    delete connections.current[id];
                }

                setVideos((prevVideos) => {
                    const updatedVideos = prevVideos.filter(
                        (video) => video.socketId !== id
                    );
                    videoRef.current = updatedVideos;
                    return updatedVideos;
                });
            });

            socketRef.current.on(
                "user-joined",
                (joinedUserId, joinedUserName, allClients) => {
                    userNames.current[joinedUserId] = joinedUserName;

                    const clientsToConnect = allClients.filter(
                        (clientId) =>
                            clientId !== socketID.current &&
                            !connections.current[clientId]
                    );

                    clientsToConnect.forEach((clientSocketId) => {
                        connections.current[clientSocketId] =
                            new RTCPeerConnection(peerConnectionConfig);

                        connections.current[clientSocketId].onicecandidate = (
                            event
                        ) => {
                            if (event.candidate !== null) {
                                socketRef.current.emit(
                                    "signal",
                                    clientSocketId,
                                    JSON.stringify({ ice: event.candidate })
                                );
                            }
                        };

                        connections.current[
                            clientSocketId
                        ].onsignalingstatechange = () => {
                            const state =
                                connections.current[clientSocketId]
                                    ?.signalingState;

                            if (
                                state === "stable" &&
                                connections.current[clientSocketId]
                                    .pendingIceCandidates
                            ) {
                                connections.current[
                                    clientSocketId
                                ].pendingIceCandidates.forEach((ice) => {
                                    connections.current[clientSocketId]
                                        .addIceCandidate(
                                            new RTCIceCandidate(ice)
                                        )
                                        .catch((err) => console.log(err));
                                });
                                connections.current[
                                    clientSocketId
                                ].pendingIceCandidates = [];
                            }
                        };

                        connections.current[clientSocketId].ontrack = (
                            event
                        ) => {
                            setVideos((prevVideos) => {
                                const existingVideoIndex = prevVideos.findIndex(
                                    (v) => v.socketId === clientSocketId
                                );

                                if (existingVideoIndex !== -1) {
                                    const updatedVideos = [...prevVideos];
                                    updatedVideos[existingVideoIndex] = {
                                        ...updatedVideos[existingVideoIndex],
                                        stream: event.streams[0],
                                    };
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                } else {
                                    const newVideo = {
                                        socketId: clientSocketId,
                                        stream: event.streams[0],
                                        autoPlay: true,
                                        playsInline: true,
                                    };
                                    const updatedVideos = [
                                        ...prevVideos,
                                        newVideo,
                                    ];
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                }
                            });
                        };

                        if (
                            window.localStream !== undefined &&
                            window.localStream !== null
                        ) {
                            addTracksToConnection(
                                connections.current[clientSocketId],
                                window.localStream
                            );
                        } else {
                            // window.localStream = blackSilence();
                            addTracksToConnection(
                                connections.current[clientSocketId],
                                window.localStream
                            );
                        }
                    });

                    if (joinedUserId === socketID.current) {
                        setTimeout(() => {
                            const existingUsers = allClients.filter(
                                (clientId) =>
                                    clientId !== socketID.current &&
                                    connections.current[clientId]
                            );

                            existingUsers.forEach((id2) => {
                                if (connections.current[id2]) {
                                    // ✅ Ensure connection is in stable state before creating offer
                                    const connection = connections.current[id2];
                                    if (
                                        connection.signalingState === "stable"
                                    ) {
                                        connection
                                            .createOffer()
                                            .then((description) => {
                                                return connection.setLocalDescription(
                                                    description
                                                );
                                            })
                                            .then(() => {
                                                socketRef.current.emit(
                                                    "signal",
                                                    id2,
                                                    JSON.stringify({
                                                        sdp: connection.localDescription,
                                                    })
                                                );
                                            })
                                            .catch((err) => console.log(err));
                                    }
                                }
                            });
                        }, 100);
                    }
                }
            );
        });
    };

    // let blackSilence = (...args) => new MediaStream([blackScreen(...args), silence()]);

    // let silence = () => {
    //     let audioContext = new AudioContext();
    //     let oscillator = audioContext.createOscillator();
    //     let destination = audioContext.createMediaStreamDestination();
    //     oscillator.connect(destination);
    //     oscillator.start();
    //     audioContext.resume();
    //     return Object.assign(destination.stream.getAudioTracks()[0], {
    //         enabled: false,
    //     });
    // };

    // let blackScreen = ({ width = 640, height = 480 } = {}) => {
    //     let canvas = Object.assign(document.createElement("canvas"), {
    //         width,
    //         height,
    //     });
    //     canvas.getContext("2d").fillRect(0, 0, width, height);
    //     let stream = canvas.captureStream();
    //     return Object.assign(stream.getVideoTracks()[0], {
    //         enabled: false,
    //     });
    // };

    const getUserMedia = async () => {
        if ((video && videoPermission) || (audio && audioPermission)) {
            try {
                navigator.mediaDevices
                    .getUserMedia({
                        video: video && videoPermission,
                        audio: audio && audioPermission,
                    })
                    .then((stream) => {
                        getUserMediaSuccess(stream);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (err) {
                console.error(err);
            }
        } else {
            try {
                if (localVideoRef.current && localVideoRef.current.srcObject) {
                    const tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach((track) => track.stop());
                    // localVideoRef.current.srcObject = blackSilence();
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) getUserMedia();
    }, [video, audio, askForUsername]);

    const getMedia = () => {
        setVideo(true);
        setAudio(true);
        connectToSocketServer();
    };

    const connect = () => {
        if (!userName.trim()) {
            alert("Please enter a username");
            return;
        }
        setAskForUsername(false);
        getMedia();
    };

    return (
        <div className="p-4">
            {askForUsername ? (
                <div className="flex flex-col items-center justify-center">
                    <label htmlFor="username">Enter your username</label>
                    <input
                        type="text"
                        id="username"
                        placeholder="Username"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="border p-2 rounded w-50 mb-4"
                    />
                    <button
                        onClick={connect}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Join
                    </button>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                    ></video>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="relative">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className=" h-64 object-cover border rounded bg-gray-900"
                                style={{ transform: "scaleX(-1)" }}
                            />
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                You ({userName})
                            </div>
                        </div>

                        {videos.map((video) => (
                            <div key={video.socketId} className="relative">
                                <video
                                    ref={(videoElement) => {
                                        if (videoElement && video.stream) {
                                            videoElement.srcObject =
                                                video.stream;
                                            videoElement.load();

                                            const playPromise =
                                                videoElement.play();
                                            if (playPromise !== undefined) {
                                                playPromise
                                                    .then(() => {})
                                                    .catch((error) => {
                                                        setTimeout(() => {
                                                            videoElement
                                                                .play()
                                                                .catch((e) =>
                                                                    console.log(
                                                                        e
                                                                    )
                                                                );
                                                        }, 1000);
                                                    });
                                            }
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    controls={false}
                                    className=" h-64 object-cover border rounded bg-gray-900"
                                />
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {userNames.current[video.socketId]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
